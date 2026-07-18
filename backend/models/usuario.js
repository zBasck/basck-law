// backend/models/usuario.js
// Wrapper para queries que retorna rows com protótipo Object (compatível com controllers)

const { getDb } = require('../db/init');

function rowsFrom(stmt) {
  const rows = stmt.all();
  return rows.map((r) => Object.fromEntries(Object.entries(r)));
}

function rowFrom(stmt, ...args) {
  const r = stmt.get(...args);
  return r ? Object.fromEntries(Object.entries(r)) : null;
}

class UsuarioModel {
  static criar({ nome, email, senha_hash, oab = null, telefone = null, plano = 'autonomo' }) {
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO usuarios (nome, email, senha_hash, oab, telefone, plano)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(nome, email, senha_hash, oab, telefone, plano);
    return this.buscarPorId(result.lastInsertRowid);
  }

  static buscarPorId(id) {
    const stmt = getDb().prepare('SELECT * FROM usuarios WHERE id = ?');
    return rowFrom(stmt, id);
  }

  static buscarPorEmail(email) {
    const stmt = getDb().prepare('SELECT * FROM usuarios WHERE email = ?');
    return rowFrom(stmt, email);
  }

  static listar() {
    const stmt = getDb().prepare('SELECT id, nome, email, oab, telefone, plano, criado_em FROM usuarios ORDER BY criado_em DESC');
    return rowsFrom(stmt);
  }

  static atualizar(id, { nome, email, oab, telefone, plano }) {
    getDb().prepare(`
      UPDATE usuarios SET nome = ?, email = ?, oab = ?, telefone = ?, plano = ?, atualizado_em = datetime('now')
      WHERE id = ?
    `).run(nome, email, oab, telefone, plano, id);
    return this.buscarPorId(id);
  }

  static remover(id) {
    return getDb().prepare('DELETE FROM usuarios WHERE id = ?').run(id);
  }
}

module.exports = UsuarioModel;
