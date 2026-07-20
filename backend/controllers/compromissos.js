// backend/controllers/compromissos.js
const CompromissoModel = require('../models/compromisso');
const { HttpError } = require('../middleware/erros');
const { isNonEmptyString, isDateTime, isNumber, isPositiveInt, validateEnum } = require('../middleware/validacoes');

const TIPOS = ['audiencia', 'reuniao', 'prazo_judicial', 'sessao', 'diligencia', 'outro'];
const STATUS = ['agendado', 'concluido', 'cancelado', 'remarcado'];

function validar(body, parcial = false) {
  if (!parcial) {
    if (!isNonEmptyString(body.titulo)) throw new HttpError(400, 'Titulo obrigatorio');
    if (!isDateTime(body.data_hora)) throw new HttpError(400, 'data_hora obrigatoria (YYYY-MM-DDTHH:MM)');
  }
  if (body.tipo) validateEnum(body.tipo, TIPOS, 'tipo');
  if (body.status) validateEnum(body.status, STATUS, 'status');
  if (body.duracao_minutos !== undefined && !isPositiveInt(Number(body.duracao_minutos))) {
    throw new HttpError(400, 'duracao_minutos deve ser inteiro positivo');
  }
  if (body.caso_id !== undefined && body.caso_id !== null && !isNumber(Number(body.caso_id))) {
    throw new HttpError(400, 'caso_id invalido');
  }
}

async function listar(req, res) {
  const itens = CompromissoModel.listar(req.usuario.id, {
    caso_id: req.query.caso_id ? Number(req.query.caso_id) : null,
    status: req.query.status || null,
    de: req.query.de || null,
    ate: req.query.ate || null
  });
  res.json({ itens });
}

async function proximos(req, res) {
  const dias = req.query.dias ? Math.min(90, Math.max(1, Number(req.query.dias))) : 7;
  res.json({ itens: CompromissoModel.proximos(req.usuario.id, dias) });
}

async function buscar(req, res) {
  const c = CompromissoModel.buscarPorId(req.params.id, req.usuario.id);
  if (!c) throw new HttpError(404, 'Compromisso nao encontrado');
  res.json({ compromisso: c });
}

async function criar(req, res) {
  validar(req.body);
  const c = CompromissoModel.criar(req.usuario.id, {
    ...req.body,
    caso_id: req.body.caso_id ? Number(req.body.caso_id) : null,
    duracao_minutos: req.body.duracao_minutos ? Number(req.body.duracao_minutos) : 60
  });
  res.status(201).json({ compromisso: c });
}

async function atualizar(req, res) {
  validar(req.body, true);
  const c = CompromissoModel.atualizar(req.params.id, req.usuario.id, {
    ...req.body,
    caso_id: req.body.caso_id !== undefined ? (req.body.caso_id ? Number(req.body.caso_id) : null) : undefined,
    duracao_minutos: req.body.duracao_minutos ? Number(req.body.duracao_minutos) : undefined
  });
  if (!c) throw new HttpError(404, 'Compromisso nao encontrado');
  res.json({ compromisso: c });
}

async function remover(req, res) {
  const ok = CompromissoModel.remover(req.params.id, req.usuario.id);
  if (!ok) throw new HttpError(404, 'Compromisso nao encontrado');
  res.json({ ok: true });
}

module.exports = { listar, proximos, buscar, criar, atualizar, remover };
