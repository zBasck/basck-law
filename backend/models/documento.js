// backend/models/documento.js

const { getDb } = require('../db/init');

function rowsFrom(stmt, ...args) {
  return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r)));
}

function rowFrom(stmt, ...args) {
  const r = stmt.get(...args);
  return r ? Object.fromEntries(Object.entries(r)) : null;
}

class DocumentoModel {
  static criar(usuario_id, { titulo, nome_arquivo, caminho_arquivo, tipo_mime, tamanho_bytes, descricao = null, caso_id = null }) {
    const r = getDb().prepare(`
      INSERT INTO documentos (usuario_id, caso_id, titulo, nome_arquivo, caminho_arquivo, tipo_mime, tamanho_bytes, descricao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(usuario_id, caso_id, titulo, nome_arquivo, caminho_arquivo, tipo_mime, tamanho_bytes, descricao);
    return this.buscarPorId(r.lastInsertRowid, usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    const stmt = getDb().prepare(`
      SELECT d.*, c.titulo AS caso_titulo
      FROM documentos d
      LEFT JOIN casos c ON c.id = d.caso_id
      WHERE d.id = ? AND d.usuario_id = ?
    `);
    return rowFrom(stmt, id, usuario_id);
  }

  static listar(usuario_id, { caso_id = null } = {}) {
    let sql = `
      SELECT d.*, c.titulo AS caso_titulo
      FROM documentos d
      LEFT JOIN casos c ON c.id = d.caso_id
      WHERE d.usuario_id = ?
    `;
    const params = [usuario_id];
    if (caso_id) { sql += ' AND d.caso_id = ?'; params.push(caso_id); }
    sql += ' ORDER BY d.criado_em DESC';
    return rowsFrom(getDb().prepare(sql), ...params);
  }

  static remover(id, usuario_id) {
    return getDb().prepare('DELETE FROM documentos WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
  }

  static espacoUsado(usuario_id) {
    const r = getDb().prepare('SELECT COALESCE(SUM(tamanho_bytes), 0) AS bytes FROM documentos WHERE usuario_id = ?').get(usuario_id);
    return Number(r.bytes) || 0;
  }
}

module.exports = DocumentoModel;
