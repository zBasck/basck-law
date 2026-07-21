// backend/controllers/clientes.js
const ClienteModel = require('../models/cliente');
const { HttpError } = require('../middleware/erros');
const { isNonEmptyString, isEmail, isDate } = require('../middleware/validacoes');

function validar(body, parcial = false) {
  if (!parcial && !isNonEmptyString(body.nome)) throw new HttpError(400, 'Nome é obrigatório');
  if (body.email && !isEmail(body.email)) throw new HttpError(400, 'E-mail inválido');
}

async function listar(req, res) {
  const itens = ClienteModel.listar(req.usuario.id);
  res.json({ itens });
}

async function buscar(req, res) {
  const c = ClienteModel.buscarPorId(req.params.id, req.usuario.id);
  if (!c) throw new HttpError(404, 'Cliente não encontrado');
  res.json({ cliente: c });
}

async function criar(req, res) {
  validar(req.body);
  const c = ClienteModel.criar(req.usuario.id, req.body);
  res.status(201).json({ cliente: c });
}

async function atualizar(req, res) {
  validar(req.body, true);
  const c = ClienteModel.atualizar(req.params.id, req.usuario.id, req.body);
  if (!c) throw new HttpError(404, 'Cliente não encontrado');
  res.json({ cliente: c });
}

async function remover(req, res) {
  const r = ClienteModel.remover(req.params.id, req.usuario.id);
  if (r.changes === 0) throw new HttpError(404, 'Cliente não encontrado');
  res.status(204).send();
}

module.exports = { listar, buscar, criar, atualizar, remover };
