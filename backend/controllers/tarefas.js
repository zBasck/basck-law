// backend/controllers/tarefas.js
const TarefaModel = require('../models/tarefa');
const { HttpError } = require('../middleware/erros');
const { isNonEmptyString, isDate, validateEnum } = require('../middleware/validacoes');

const PRIORIDADES = ['baixa', 'normal', 'alta', 'urgente'];
const STATUS = ['pendente', 'concluida', 'cancelada'];

function validar(body, parcial = false) {
  if (!parcial && !isNonEmptyString(body.titulo)) throw new HttpError(400, 'Título é obrigatório');
  if (body.data_vencimento && !isDate(body.data_vencimento, 'data_vencimento')) throw new HttpError(400, 'data_vencimento inválida');
  if (body.prioridade) validateEnum(body.prioridade, PRIORIDADES, 'prioridade');
  if (body.status) validateEnum(body.status, STATUS, 'status');
}

async function listar(req, res) {
  const itens = TarefaModel.listar(req.usuario.id, {
    status: req.query.status || null,
    caso_id: req.query.caso_id ? Number(req.query.caso_id) : null
  });
  res.json({ itens });
}

async function buscar(req, res) {
  const t = TarefaModel.buscarPorId(req.params.id, req.usuario.id);
  if (!t) throw new HttpError(404, 'Tarefa não encontrada');
  res.json({ tarefa: t });
}

async function criar(req, res) {
  validar(req.body);
  const t = TarefaModel.criar(req.usuario.id, req.body);
  res.status(201).json({ tarefa: t });
}

async function atualizar(req, res) {
  validar(req.body, true);
  const t = TarefaModel.atualizar(req.params.id, req.usuario.id, req.body);
  if (!t) throw new HttpError(404, 'Tarefa não encontrada');
  res.json({ tarefa: t });
}

async function concluir(req, res) {
  const t = TarefaModel.concluir(req.params.id, req.usuario.id);
  if (!t) throw new HttpError(404, 'Tarefa não encontrada');
  res.json({ tarefa: t });
}

async function remover(req, res) {
  const r = TarefaModel.remover(req.params.id, req.usuario.id);
  if (r.changes === 0) throw new HttpError(404, 'Tarefa não encontrada');
  res.status(204).send();
}

module.exports = { listar, buscar, criar, atualizar, concluir, remover };
