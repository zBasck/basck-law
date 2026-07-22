// backend/controllers/casos.js
const CasoModel = require('../models/caso');
const { HttpError } = require('../middleware/erros');
const { isNonEmptyString, isDate, isNumber, validateEnum } = require('../middleware/validacoes');

const STATUS = ['em_andamento', 'concluido', 'suspenso', 'arquivado'];

function validar(body, parcial = false) {
  if (!parcial) {
    if (!isNonEmptyString(body.titulo)) throw new HttpError(400, 'Título é obrigatório');
    if (!isNumber(body.cliente_id)) throw new HttpError(400, 'cliente_id é obrigatório');
  }
  if (body.status) validateEnum(body.status, STATUS, 'status');
  if (body.data_inicio && !isDate(body.data_inicio, 'data_inicio')) throw new HttpError(400, 'data_inicio inválida');
  if (body.data_fim && !isDate(body.data_fim, 'data_fim')) throw new HttpError(400, 'data_fim inválida');
  if (body.valor_causa != null && !isNumber(Number(body.valor_causa))) throw new HttpError(400, 'valor_causa inválido');
}

async function listar(req, res) {
  const itens = CasoModel.listar(req.usuario.id, {
    status: req.query.status || null,
    cliente_id: req.query.cliente_id ? Number(req.query.cliente_id) : null,
    busca: req.query.q || null
  });
  res.json({ itens });
}

async function buscar(req, res) {
  const c = CasoModel.buscarPorId(req.params.id, req.usuario.id);
  if (!c) throw new HttpError(404, 'Caso não encontrado');
  res.json({ caso: c });
}

async function criar(req, res) {
  validar(req.body);
  const c = CasoModel.criar(req.usuario.id, { ...req.body, cliente_id: Number(req.body.cliente_id) });
  res.status(201).json({ caso: c });
}

async function atualizar(req, res) {
  validar(req.body, true);
  const c = CasoModel.atualizar(req.params.id, req.usuario.id, { ...req.body, cliente_id: req.body.cliente_id ? Number(req.body.cliente_id) : undefined });
  if (!c) throw new HttpError(404, 'Caso não encontrado');
  res.json({ caso: c });
}

async function remover(req, res) {
  const r = CasoModel.remover(req.params.id, req.usuario.id);
  if (r.changes === 0) throw new HttpError(404, 'Caso não encontrado');
  res.status(204).send();
}

async function detalhes(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw new HttpError(400, 'id inválido');
  const d = CasoModel.detalhes(id, req.usuario.id);
  if (!d) throw new HttpError(404, 'Caso não encontrado');
  res.json(d);
}

async function estatisticas(req, res) {
  res.json(CasoModel.estatisticas(req.usuario.id));
}

module.exports = { listar, buscar, criar, atualizar, remover, estatisticas, detalhes };
