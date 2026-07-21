// backend/controllers/prazos.js
const PrazoModel = require('../models/prazo');
const { HttpError } = require('../middleware/erros');
const { isNonEmptyString, isDate, isNumber, validateEnum } = require('../middleware/validacoes');
const { calcularPrazo } = require('../utils/prazos');

const TIPOS = ['uteis', 'corridos'];
const PRIORIDADES = ['baixa', 'normal', 'alta', 'urgente'];
const STATUS = ['pendente', 'concluido', 'cancelado'];

function validar(body, parcial = false) {
  if (!parcial) {
    if (!isNonEmptyString(body.titulo)) throw new HttpError(400, 'Titulo obrigatorio');
    if (!isNumber(Number(body.caso_id))) throw new HttpError(400, 'caso_id obrigatorio');
    if (!isDate(body.data_inicio)) throw new HttpError(400, 'data_inicio obrigatoria (YYYY-MM-DD)');
    if (!isDate(body.data_vencimento)) throw new HttpError(400, 'data_vencimento obrigatoria (YYYY-MM-DD)');
  }
  if (body.tipo_dias) validateEnum(body.tipo_dias, TIPOS, 'tipo_dias');
  if (body.prioridade) validateEnum(body.prioridade, PRIORIDADES, 'prioridade');
  if (body.status) validateEnum(body.status, STATUS, 'status');
}

async function listar(req, res) {
  const itens = PrazoModel.listar(req.usuario.id, {
    caso_id: req.query.caso_id ? Number(req.query.caso_id) : null,
    status: req.query.status || null
  });
  res.json({ itens });
}

async function proximos(req, res) {
  const dias = req.query.dias ? Math.min(60, Math.max(1, Number(req.query.dias))) : 7;
  res.json({ itens: PrazoModel.proximos(req.usuario.id, dias) });
}

async function buscar(req, res) {
  const p = PrazoModel.buscarPorId(req.params.id, req.usuario.id);
  if (!p) throw new HttpError(404, 'Prazo nao encontrado');
  res.json({ prazo: p });
}

async function criar(req, res) {
  validar(req.body);
  const p = PrazoModel.criar(req.usuario.id, { ...req.body, caso_id: Number(req.body.caso_id) });
  res.status(201).json({ prazo: p });
}

async function atualizar(req, res) {
  validar(req.body, true);
  const p = PrazoModel.atualizar(req.params.id, req.usuario.id, {
    ...req.body,
    caso_id: req.body.caso_id ? Number(req.body.caso_id) : undefined
  });
  if (!p) throw new HttpError(404, 'Prazo nao encontrado');
  res.json({ prazo: p });
}

async function concluir(req, res) {
  const p = PrazoModel.concluir(req.params.id, req.usuario.id);
  if (!p) throw new HttpError(404, 'Prazo nao encontrado');
  res.json({ prazo: p });
}

async function reabrir(req, res) {
  const p = PrazoModel.reabrir(req.params.id, req.usuario.id);
  if (!p) throw new HttpError(404, 'Prazo nao encontrado');
  res.json({ prazo: p });
}

async function remover(req, res) {
  const r = PrazoModel.remover(req.params.id, req.usuario.id);
  if (r.changes === 0) throw new HttpError(404, 'Prazo nao encontrado');
  res.status(204).send();
}

/**
 * POST /api/prazos/calcular
 * Body: { dataInicio, dias, tipo, feriadosExtras?, salvar? }
 * - Se salvar for true e caso_id for informado, cria um prazo com o resultado.
 */
async function calcular(req, res) {
  const { dataInicio, dias, tipo = 'uteis', feriadosExtras = [], salvar = false, caso_id = null, titulo = null, prioridade = 'normal' } = req.body || {};
  if (!isDate(dataInicio)) throw new HttpError(400, 'dataInicio invalida (YYYY-MM-DD)');
  const n = Number(dias);
  if (!Number.isInteger(n) || n < 1 || n > 3650) throw new HttpError(400, 'dias deve ser inteiro entre 1 e 3650');
  if (!['uteis', 'corridos'].includes(tipo)) throw new HttpError(400, 'tipo deve ser "uteis" ou "corridos"');

  const resultado = calcularPrazo({ dataInicio, dias: n, tipo, feriadosExtras: Array.isArray(feriadosExtras) ? feriadosExtras : [] });

  let prazo = null;
  if (salvar) {
    if (!isNumber(Number(caso_id))) throw new HttpError(400, 'caso_id obrigatorio para salvar');
    if (!isNonEmptyString(titulo)) throw new HttpError(400, 'titulo obrigatorio para salvar');
    prazo = PrazoModel.criar(req.usuario.id, {
      caso_id: Number(caso_id),
      titulo,
      descricao: resultado.regra,
      data_inicio: dataInicio,
      data_vencimento: resultado.dataFinal,
      tipo_dias: tipo,
      prioridade,
      status: 'pendente',
      calculo_detalhes: JSON.stringify(resultado),
      calculo_regra: resultado.regra
    });
  }
  res.json({ resultado, prazo });
}

module.exports = { listar, proximos, buscar, criar, atualizar, concluir, reabrir, remover, calcular };
