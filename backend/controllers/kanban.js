// backend/controllers/kanban.js
const KanbanModel = require('../models/kanban');
const { HttpError } = require('../middleware/erros');
const { isNonEmptyString, isNumber } = require('../middleware/validacoes');

async function listar(req, res) {
  const itens = KanbanModel.listar(req.usuario.id);
  res.json({ colunas: KanbanModel.colunasValidas(), itens });
}

async function mover(req, res) {
  const { coluna, posicao } = req.body;
  if (!isNonEmptyString(coluna)) throw new HttpError(400, 'coluna obrigatoria');
  const resultado = KanbanModel.mover(req.usuario.id, req.params.id, {
    coluna,
    posicao: posicao !== undefined ? Number(posicao) : 0
  });
  if (resultado && resultado.erro) throw new HttpError(400, resultado.erro);
  if (!resultado) throw new HttpError(404, 'Cartao nao encontrado');
  res.json({ cartao: resultado });
}

async function criar(req, res) {
  const { tipo, referencia_id, coluna, titulo } = req.body;
  if (!isNonEmptyString(tipo)) throw new HttpError(400, 'tipo obrigatorio (caso ou tarefa)');
  if (!isNumber(Number(referencia_id))) throw new HttpError(400, 'referencia_id obrigatorio');
  if (!isNonEmptyString(titulo)) throw new HttpError(400, 'titulo obrigatorio');
  const cartao = KanbanModel.criar(req.usuario.id, {
    ...req.body,
    referencia_id: Number(referencia_id),
    posicao: req.body.posicao ? Number(req.body.posicao) : 0
  });
  if (cartao && cartao.erro) throw new HttpError(400, cartao.erro);
  res.status(201).json({ cartao });
}

async function remover(req, res) {
  const ok = KanbanModel.remover(req.params.id, req.usuario.id);
  if (!ok) throw new HttpError(404, 'Cartao nao encontrado');
  res.json({ ok: true });
}

module.exports = { listar, mover, criar, remover };
