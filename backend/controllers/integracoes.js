// backend/controllers/integracoes.js
const IntegracaoModel = require('../models/integracao');
const { HttpError } = require('../middleware/erros');
const { isNonEmptyString, isNumber } = require('../middleware/validacoes');

const TRIBUNAIS_VALIDOS = IntegracaoModel.tribunaisSuportados().map((t) => t.id);
const TIPOS_CREDENCIAL = ['certificado_digital', 'login_senha', 'oauth', 'api_key'];

function tribunalValido(t) { return TRIBUNAIS_VALIDOS.includes(t); }

async function tribunaisSuportados(req, res) {
  res.json({ tribunais: IntegracaoModel.tribunaisSuportados() });
}

async function listar(req, res) {
  res.json({ itens: IntegracaoModel.listar(req.usuario.id) });
}

async function buscar(req, res) {
  const i = IntegracaoModel.buscarPorId(req.params.id, req.usuario.id);
  if (!i) throw new HttpError(404, 'Integracao nao encontrada');
  res.json({ integracao: i });
}

async function criar(req, res) {
  const { tribunal, tipo_credencial, identificador, segredo, apelido } = req.body;
  if (!isNonEmptyString(tribunal) || !tribunalValido(tribunal)) {
    throw new HttpError(400, 'tribunal invalido');
  }
  if (!isNonEmptyString(tipo_credencial) || !TIPOS_CREDENCIAL.includes(tipo_credencial)) {
    throw new HttpError(400, 'tipo_credencial invalido');
  }
  if (!isNonEmptyString(identificador)) throw new HttpError(400, 'identificador obrigatorio');
  const i = IntegracaoModel.criar(req.usuario.id, req.body);
  res.status(201).json({ integracao: i });
}

async function atualizar(req, res) {
  const i = IntegracaoModel.atualizar(req.params.id, req.usuario.id, req.body);
  if (!i) throw new HttpError(404, 'Integracao nao encontrada');
  res.json({ integracao: i });
}

async function remover(req, res) {
  const ok = IntegracaoModel.remover(req.params.id, req.usuario.id);
  if (!ok) throw new HttpError(404, 'Integracao nao encontrada');
  res.json({ ok: true });
}

async function consultar(req, res) {
  const resultado = IntegracaoModel.consultar(req.usuario.id, req.params.id);
  if (resultado && resultado.erro) throw new HttpError(400, resultado.erro);
  res.json({ resultado });
}

async function listarOabs(req, res) {
  res.json({ itens: IntegracaoModel.listarOabs(req.usuario.id) });
}

async function adicionarOab(req, res) {
  const { numero_oab, uf, integracao_id, nome } = req.body;
  if (!isNonEmptyString(numero_oab)) throw new HttpError(400, 'numero_oab obrigatorio');
  if (!isNonEmptyString(uf) || uf.length !== 2) throw new HttpError(400, 'uf obrigatorio (sigla de 2 letras)');
  const oab = IntegracaoModel.adicionarOab(req.usuario.id, {
    numero_oab, uf: uf.toUpperCase(), integracao_id: integracao_id || null,
    nome: nome || null
  });
  res.status(201).json({ oab });
}

async function removerOab(req, res) {
  const ok = IntegracaoModel.removerOab(req.params.id, req.usuario.id);
  if (!ok) throw new HttpError(404, 'OAB nao encontrada');
  res.json({ ok: true });
}

async function verificarOabs(req, res) {
  const oabs = IntegracaoModel.listarOabs(req.usuario.id);
  const verificadas = [];
  for (const o of oabs) {
    const item = IntegracaoModel.verificarOabUm(req.usuario.id, o.id);
    if (item) verificadas.push(item);
  }
  res.json({ itens: verificadas });
}

async function verificarOabUm(req, res) {
  const item = IntegracaoModel.verificarOabUm(req.usuario.id, req.params.id);
  if (!item) throw new HttpError(404, 'OAB nao encontrada');
  res.json({ item });
}

async function listarMonitoramento(req, res) {
  res.json(IntegracaoModel.listarMonitoramentoCompleto(req.usuario.id));
}

module.exports = {
  tribunaisSuportados, listar, buscar, criar, atualizar, remover, consultar,
  listarOabs, adicionarOab, removerOab, verificarOabs, verificarOabUm,
  listarMonitoramento
};
