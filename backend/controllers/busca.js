// backend/controllers/busca.js
const PrazoModel = require('../models/prazo');
const TarefaModel = require('../models/tarefa');
const ClienteModel = require('../models/cliente');
const CasoModel = require('../models/caso');

function sanitizar(q) {
  if (typeof q !== 'string') return '';
  return q.replace(/[%_]/g, '\\$&').trim().slice(0, 80);
}

function matchLike(haystack, needle) {
  if (!haystack) return false;
  return String(haystack).toLowerCase().includes(needle.toLowerCase());
}

async function buscar(req, res) {
  const q = sanitizar(req.query.q);
  if (q.length < 2) {
    return res.json({ q, total: 0, grupos: { clientes: [], casos: [], prazos: [], tarefas: [] } });
  }
  const uid = req.usuario.id;

  // Carrega conjuntos inteiros do usuario (espera-se volume baixo; otimizar com FTS5 no futuro)
  const clientes = ClienteModel.listar(uid).filter((c) =>
    matchLike(c.nome, q) || matchLike(c.documento, q) || matchLike(c.email, q)
  ).slice(0, 8);

  const casos = CasoModel.listar(uid, {}).filter((c) =>
    matchLike(c.titulo, q) || matchLike(c.numero_processo, q) || matchLike(c.area, q) || matchLike(c.tribunal, q)
  ).slice(0, 10);

  const prazos = PrazoModel.listar(uid, {}).filter((p) =>
    matchLike(p.titulo, q) || matchLike(p.descricao, q) || matchLike(p.caso_titulo, q)
  ).slice(0, 10);

  const tarefas = TarefaModel.listar(uid, {}).filter((t) =>
    matchLike(t.titulo, q) || matchLike(t.descricao, q)
  ).slice(0, 10);

  res.json({
    q,
    total: clientes.length + casos.length + prazos.length + tarefas.length,
    grupos: { clientes, casos, prazos, tarefas }
  });
}

module.exports = { buscar };
