// backend/controllers/casoAndamento.js
// v1.4.0 — Andamentos do caso (timeline)
const CasoAndamentoModel = require('../models/casoAndamento');
const CasoModel = require('../models/caso');
const { HttpError } = require('../middleware/erros');
const { isNonEmptyString, isDate, isNumber } = require('../middleware/validacoes');

function validar(body) {
  if (!isNonEmptyString(body.descricao)) throw new HttpError(400, 'Descrição é obrigatória');
  if (body.data && !isDate(body.data, 'data')) throw new HttpError(400, 'data inválida');
}

function garantirCaso(caso_id, usuario_id) {
  const caso = CasoModel.buscarPorId(caso_id, usuario_id);
  if (!caso) throw new HttpError(404, 'Caso não encontrado');
  return caso;
}

async function listar(req, res) {
  const caso_id = Number(req.params.id);
  if (!isNumber(caso_id)) throw new HttpError(400, 'id inválido');
  garantirCaso(caso_id, req.usuario.id);
  const itens = CasoAndamentoModel.listar(caso_id, req.usuario.id);
  res.json({ itens });
}

async function criar(req, res) {
  const caso_id = Number(req.params.id);
  if (!isNumber(caso_id)) throw new HttpError(400, 'id inválido');
  garantirCaso(caso_id, req.usuario.id);
  validar(req.body);
  const item = CasoAndamentoModel.criar(caso_id, req.usuario.id, req.body);
  res.status(201).json({ andamento: item });
}

async function remover(req, res) {
  const id = Number(req.params.andamentoId);
  if (!isNumber(id)) throw new HttpError(400, 'andamentoId inválido');
  const r = CasoAndamentoModel.remover(id, req.usuario.id);
  if (r.changes === 0) throw new HttpError(404, 'Andamento não encontrado');
  res.status(204).send();
}

module.exports = { listar, criar, remover };
