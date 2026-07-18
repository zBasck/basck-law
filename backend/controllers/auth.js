// backend/controllers/auth.js
// Hash de senha: usa bcryptjs puro (sem dependência nativa).
// Implementação PBKDF2-SHA512 para manter zero dependências nativas.

const crypto = require('node:crypto');
const { getDb } = require('../db/init');
const { signToken } = require('../middleware/auth');
const { isEmail, isNonEmptyString } = require('../middleware/validacoes');
const { HttpError } = require('../middleware/erros');

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = 'sha512';
const SALT_LEN = 16;

function hashPassword(plain) {
  const salt = crypto.randomBytes(SALT_LEN).toString('hex');
  const hash = crypto.pbkdf2Sync(plain, salt, ITERATIONS, KEYLEN, DIGEST).toString('hex');
  return `pbkdf2$${ITERATIONS}$${salt}$${hash}`;
}

function verifyPassword(plain, stored) {
  try {
    const [scheme, iterStr, salt, expected] = stored.split('$');
    if (scheme !== 'pbkdf2') return false;
    const iter = parseInt(iterStr, 10);
    const actual = crypto.pbkdf2Sync(plain, salt, iter, expected.length / 2, DIGEST).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
  } catch (e) {
    return false;
  }
}

function sanitizeUsuario(u) {
  if (!u) return null;
  const { senha_hash, ...rest } = u;
  return rest;
}

async function cadastrar(req, res) {
  const { nome, email, senha, oab, telefone } = req.body || {};
  if (!isNonEmptyString(nome)) throw new HttpError(400, 'Nome é obrigatório');
  if (!isEmail(email)) throw new HttpError(400, 'E-mail inválido');
  if (!isNonEmptyString(senha) || senha.length < 6) throw new HttpError(400, 'Senha deve ter ao menos 6 caracteres');

  const db = getDb();
  const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email.trim().toLowerCase());
  if (existe) throw new HttpError(409, 'E-mail já cadastrado');

  const senha_hash = hashPassword(senha);
  const r = db.prepare(`
    INSERT INTO usuarios (nome, email, senha_hash, oab, telefone)
    VALUES (?, ?, ?, ?, ?)
  `).run(nome.trim(), email.trim().toLowerCase(), senha_hash, oab || null, telefone || null);

  const usuario = db.prepare('SELECT * FROM usuarios WHERE id = ?').get(r.lastInsertRowid);
  const token = signToken({ id: usuario.id, email: usuario.email, nome: usuario.nome });
  res.status(201).json({ token, usuario: sanitizeUsuario(usuario) });
}

async function login(req, res) {
  const { email, senha } = req.body || {};
  if (!isEmail(email) || !isNonEmptyString(senha)) throw new HttpError(400, 'E-mail e senha são obrigatórios');

  const usuario = getDb().prepare('SELECT * FROM usuarios WHERE email = ?').get(email.trim().toLowerCase());
  if (!usuario) throw new HttpError(401, 'Credenciais inválidas');

  if (!verifyPassword(senha, usuario.senha_hash)) throw new HttpError(401, 'Credenciais inválidas');

  const token = signToken({ id: usuario.id, email: usuario.email, nome: usuario.nome });
  res.json({ token, usuario: sanitizeUsuario(usuario) });
}

async function perfil(req, res) {
  const usuario = getDb().prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  res.json({ usuario: sanitizeUsuario(usuario) });
}

async function atualizarPerfil(req, res) {
  const { nome, email, oab, telefone, plano } = req.body || {};
  if (!isNonEmptyString(nome)) throw new HttpError(400, 'Nome é obrigatório');
  if (!isEmail(email)) throw new HttpError(400, 'E-mail inválido');
  getDb().prepare(`
    UPDATE usuarios SET nome = ?, email = ?, oab = ?, telefone = ?, plano = ?, atualizado_em = datetime('now')
    WHERE id = ?
  `).run(nome.trim(), email.trim().toLowerCase(), oab || null, telefone || null, plano || 'autonomo', req.usuario.id);
  const usuario = getDb().prepare('SELECT * FROM usuarios WHERE id = ?').get(req.usuario.id);
  res.json({ usuario: sanitizeUsuario(usuario) });
}

module.exports = { cadastrar, login, perfil, atualizarPerfil, hashPassword, verifyPassword };
