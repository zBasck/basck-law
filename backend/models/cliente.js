// backend/models/cliente.js

const { getDb } = require('../db/init');

function rowsFrom(stmt, ...args) {
  return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r)));
}

function rowFrom(stmt, ...args) {
  const r = stmt.get(...args);
  return r ? Object.fromEntries(Object.entries(r)) : null;
}

class ClienteModel {
  static criar(usuario_id, { nome, documento = null, email = null, telefone = null, endereco = null, observacoes = null }) {
    const db = getDb();
    const r = db.prepare(`
      INSERT INTO clientes (usuario_id, nome, documento, email, telefone, endereco, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(usuario_id, nome, documento, email, telefone, endereco, observacoes);
    return this.buscarPorId(r.lastInsertRowid, usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    const stmt = getDb().prepare('SELECT * FROM clientes WHERE id = ? AND usuario_id = ?');
    return rowFrom(stmt, id, usuario_id);
  }

  static listar(usuario_id) {
    const stmt = getDb().prepare('SELECT * FROM clientes WHERE usuario_id = ? ORDER BY nome ASC');
    return rowsFrom(stmt, usuario_id);
  }

  static atualizar(id, usuario_id, dados) {
    getDb().prepare(`
      UPDATE clientes SET nome = ?, documento = ?, email = ?, telefone = ?, endereco = ?, observacoes = ?, atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(dados.nome, dados.documento, dados.email, dados.telefone, dados.endereco, dados.observacoes, id, usuario_id);
    return this.buscarPorId(id, usuario_id);
  }

  static remover(id, usuario_id) {
    return getDb().prepare('DELETE FROM clientes WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
  }
}

module.exports = ClienteModel;
