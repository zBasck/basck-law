// backend/models/casoAndamento.js
// v1.4.0 — Andamentos do caso (timeline cronológica de movimentações)

const { getDb } = require('../db/init');

function rowsFrom(stmt, ...args) {
  return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r)));
}

function rowFrom(stmt, ...args) {
  const r = stmt.get(...args);
  return r ? Object.fromEntries(Object.entries(r)) : null;
}

class CasoAndamentoModel {
  static listar(caso_id, usuario_id) {
    const stmt = getDb().prepare(`
      SELECT a.*, c.titulo AS caso_titulo, c.numero_processo AS caso_numero
      FROM caso_andamentos a
      LEFT JOIN casos c ON c.id = a.caso_id
      WHERE a.caso_id = ? AND a.usuario_id = ?
      ORDER BY a.data DESC, a.id DESC
    `);
    return rowsFrom(stmt, caso_id, usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    return rowFrom(getDb().prepare(`
      SELECT a.* FROM caso_andamentos a
      WHERE a.id = ? AND a.usuario_id = ?
    `), id, usuario_id);
  }

  static criar(caso_id, usuario_id, dados) {
    const r = getDb().prepare(`
      INSERT INTO caso_andamentos (caso_id, usuario_id, data, tipo, descricao, origem, fonte_externa_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      caso_id,
      usuario_id,
      dados.data || new Date().toISOString().slice(0, 10),
      dados.tipo || null,
      dados.descricao,
      dados.origem || 'manual',
      dados.fonte_externa_id || null
    );
    return this.buscarPorId(r.lastInsertRowid, usuario_id);
  }

  static remover(id, usuario_id) {
    return getDb().prepare('DELETE FROM caso_andamentos WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
  }

  static criarEmMassa(caso_id, usuario_id, andamentos) {
    if (!Array.isArray(andamentos) || andamentos.length === 0) return [];
    const db = getDb();
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO caso_andamentos (caso_id, usuario_id, data, tipo, descricao, origem, fonte_externa_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const inseridos = [];
    for (const a of andamentos) {
      if (!a.descricao) continue;
      const r = stmt.run(
        caso_id,
        usuario_id,
        a.data || new Date().toISOString().slice(0, 10),
        a.tipo || null,
        a.descricao,
        a.origem || 'datajud',
        a.fonte_externa_id || null
      );
      if (r.changes > 0) inseridos.push(r.lastInsertRowid);
    }
    return inseridos;
  }
}

module.exports = CasoAndamentoModel;
