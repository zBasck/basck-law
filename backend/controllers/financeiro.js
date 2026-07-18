// backend/controllers/financeiro.js
const LancamentoModel = require('../models/lancamento');
const { HttpError } = require('../middleware/erros');
const { isNonEmptyString, isDate, isNumber, validateEnum } = require('../middleware/validacoes');

const TIPOS = ['honorario', 'despesa', 'reembolso'];
const FORMAS = ['pix', 'boleto', 'cartao', 'transferencia', 'dinheiro'];
const STATUS = ['pendente', 'pago', 'cancelado'];

function validar(body, parcial = false) {
  if (!parcial) {
    if (!isNonEmptyString(body.descricao)) throw new HttpError(400, 'Descrição é obrigatória');
    if (!isNumber(Number(body.valor))) throw new HttpError(400, 'Valor é obrigatório');
    if (!isNonEmptyString(body.tipo)) throw new HttpError(400, 'Tipo é obrigatório');
  }
  if (body.tipo) validateEnum(body.tipo, TIPOS, 'tipo');
  if (body.forma_pagamento) validateEnum(body.forma_pagamento, FORMAS, 'forma_pagamento');
  if (body.status) validateEnum(body.status, STATUS, 'status');
  if (body.data_vencimento && !isDate(body.data_vencimento, 'data_vencimento')) throw new HttpError(400, 'data_vencimento inválida');
  if (body.data_pagamento && !isDate(body.data_pagamento, 'data_pagamento')) throw new HttpError(400, 'data_pagamento inválida');
}

async function listar(req, res) {
  const itens = LancamentoModel.listar(req.usuario.id, {
    tipo: req.query.tipo || null,
    status: req.query.status || null,
    caso_id: req.query.caso_id ? Number(req.query.caso_id) : null,
    cliente_id: req.query.cliente_id ? Number(req.query.cliente_id) : null
  });
  res.json({ itens });
}

async function buscar(req, res) {
  const l = LancamentoModel.buscarPorId(req.params.id, req.usuario.id);
  if (!l) throw new HttpError(404, 'Lançamento não encontrado');
  res.json({ lancamento: l });
}

async function criar(req, res) {
  validar(req.body);
  const l = LancamentoModel.criar(req.usuario.id, { ...req.body, valor: Number(req.body.valor) });
  res.status(201).json({ lancamento: l });
}

async function atualizar(req, res) {
  validar(req.body, true);
  const dados = { ...req.body };
  if (dados.valor != null) dados.valor = Number(dados.valor);
  const l = LancamentoModel.atualizar(req.params.id, req.usuario.id, dados);
  if (!l) throw new HttpError(404, 'Lançamento não encontrado');
  res.json({ lancamento: l });
}

async function marcarPago(req, res) {
  const { data_pagamento, forma_pagamento } = req.body || {};
  if (forma_pagamento) validateEnum(forma_pagamento, FORMAS, 'forma_pagamento');
  if (data_pagamento && !isDate(data_pagamento, 'data_pagamento')) throw new HttpError(400, 'data_pagamento inválida');
  const l = LancamentoModel.marcarPago(req.params.id, req.usuario.id, { data_pagamento, forma_pagamento });
  if (!l) throw new HttpError(404, 'Lançamento não encontrado');
  res.json({ lancamento: l });
}

async function remover(req, res) {
  const r = LancamentoModel.remover(req.params.id, req.usuario.id);
  if (r.changes === 0) throw new HttpError(404, 'Lançamento não encontrado');
  res.status(204).send();
}

async function resumo(req, res) {
  res.json(LancamentoModel.resumo(req.usuario.id));
}

async function exportarCsv(req, res) {
  const itens = LancamentoModel.listar(req.usuario.id, {
    tipo: req.query.tipo || null,
    status: req.query.status || null
  });
  const headers = ['id', 'data', 'tipo', 'descricao', 'cliente', 'caso', 'valor', 'status', 'data_vencimento', 'data_pagamento', 'forma_pagamento'];
  const fmt = (v) => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return /[",\n;]/.test(s) ? `"${s}"` : s;
  };
  const linhas = itens.map((l) => [
    l.id,
    l.criado_em,
    l.tipo,
    l.descricao,
    l.cliente_nome || '',
    l.caso_titulo || '',
    Number(l.valor).toFixed(2).replace('.', ','),
    l.status,
    l.data_vencimento || '',
    l.data_pagamento || '',
    l.forma_pagamento || ''
  ].map(fmt).join(';'));
  const csv = headers.join(';') + '\n' + linhas.join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="basck-law-financeiro-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send('﻿' + csv);
}

module.exports = { listar, buscar, criar, atualizar, marcarPago, remover, resumo, exportarCsv };
