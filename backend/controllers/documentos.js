// backend/controllers/documentos.js
const fs = require('node:fs');
const path = require('node:path');
const DocumentoModel = require('../models/documento');
const { HttpError } = require('../middleware/erros');

async function listar(req, res) {
  const itens = DocumentoModel.listar(req.usuario.id, {
    caso_id: req.query.caso_id ? Number(req.query.caso_id) : null
  });
  res.json({ itens });
}

async function buscar(req, res) {
  const d = DocumentoModel.buscarPorId(req.params.id, req.usuario.id);
  if (!d) throw new HttpError(404, 'Documento não encontrado');
  res.json({ documento: d });
}

async function upload(req, res) {
  if (!req.file) throw new HttpError(400, 'Arquivo não enviado');
  const { titulo, caso_id, descricao } = req.body || {};
  if (!titulo) throw new HttpError(400, 'Título é obrigatório');

  const doc = DocumentoModel.criar(req.usuario.id, {
    titulo,
    caso_id: caso_id ? Number(caso_id) : null,
    descricao: descricao || null,
    nome_arquivo: req.file.originalname,
    caminho_arquivo: req.file.path,
    tipo_mime: req.file.mimetype,
    tamanho_bytes: req.file.size
  });
  res.status(201).json({ documento: doc });
}

async function download(req, res) {
  const d = DocumentoModel.buscarPorId(req.params.id, req.usuario.id);
  if (!d) throw new HttpError(404, 'Documento não encontrado');
  if (!fs.existsSync(d.caminho_arquivo)) throw new HttpError(410, 'Arquivo físico não encontrado');
  res.setHeader('Content-Type', d.tipo_mime || 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename="${d.nome_arquivo}"`);
  fs.createReadStream(d.caminho_arquivo).pipe(res);
}

async function remover(req, res) {
  const d = DocumentoModel.buscarPorId(req.params.id, req.usuario.id);
  if (!d) throw new HttpError(404, 'Documento não encontrado');
  try {
    if (fs.existsSync(d.caminho_arquivo)) fs.unlinkSync(d.caminho_arquivo);
  } catch (_) { /* ignora erro de filesystem */ }
  DocumentoModel.remover(req.params.id, req.usuario.id);
  res.status(204).send();
}

async function espaco(req, res) {
  res.json({ bytes: DocumentoModel.espacoUsado(req.usuario.id) });
}

module.exports = { listar, buscar, upload, download, remover, espaco };
