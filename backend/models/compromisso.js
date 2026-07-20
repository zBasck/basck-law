// backend/models/compromisso.js
const { getDb } = require('../db/init');

function rowsFrom(stmt, ...args) { return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r))); }
function rowFrom(stmt, ...args) { const r = stmt.get(...args); return r ? Object.fromEntries(Object.entries(r)) : null; }

class CompromissoModel {
  static criar(usuario_id, dados) {
    const r = getDb().prepare(`
      INSERT INTO compromissos (
        usuario_id, caso_id, titulo, tipo, data_hora, duracao_minutos,
        local, tribunal, sala, observacoes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuario_id, dados.caso_id || null, dados.titulo,
      dados.tipo || 'audiencia', dados.data_hora,
      dados.duracao_minutos || 60,
      dados.local || null, dados.tribunal || null, dados.sala || null,
      dados.observacoes || null, dados.status || 'agendado'
    );
    return this.buscarPorId(r.lastInsertRowid, usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    const stmt = getDb().prepare(`
      SELECT c.*, cs.titulo AS caso_titulo
      FROM compromissos c
      LEFT JOIN casos cs ON cs.id = c.caso_id
      WHERE c.id = ? AND c.usuario_id = ?
    `);
    return rowFrom(stmt, id, usuario_id);
  }

  static listar(usuario_id, { caso_id = null, status = null, de = null, ate = null } = {}) {
    let sql = `SELECT c.*, cs.titulo AS caso_titulo FROM compromissos c
               LEFT JOIN casos cs ON cs.id = c.caso_id
               WHERE c.usuario_id = ?`;
    const params = [usuario_id];
    if (caso_id) { sql += ' AND c.caso_id = ?'; params.push(caso_id); }
    if (status) { sql += ' AND c.status = ?'; params.push(status); }
    if (de) { sql += ' AND c.data_hora >= ?'; params.push(de); }
    if (ate) { sql += ' AND c.data_hora <= ?'; params.push(ate); }
    sql += ' ORDER BY c.data_hora ASC';
    return rowsFrom(getDb().prepare(sql), ...params);
  }

  static atualizar(id, usuario_id, dados) {
    const r = getDb().prepare(`
      UPDATE compromissos SET
        caso_id = COALESCE(?, caso_id),
        titulo = COALESCE(?, titulo),
        tipo = COALESCE(?, tipo),
        data_hora = COALESCE(?, data_hora),
        duracao_minutos = COALESCE(?, duracao_minutos),
        local = COALESCE(?, local),
        tribunal = COALESCE(?, tribunal),
        sala = COALESCE(?, sala),
        observacoes = COALESCE(?, observacoes),
        status = COALESCE(?, status),
        concluido_em = COALESCE(?, concluido_em),
        atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(
      dados.caso_id ?? null, dados.titulo ?? null, dados.tipo ?? null,
      dados.data_hora ?? null, dados.duracao_minutos ?? null,
      dados.local ?? null, dados.tribunal ?? null, dados.sala ?? null,
      dados.observacoes ?? null, dados.status ?? null, dados.concluido_em ?? null,
      id, usuario_id
    );
    if (r.changes === 0) return null;
    return this.buscarPorId(id, usuario_id);
  }

  static remover(id, usuario_id) {
    const r = getDb().prepare('DELETE FROM compromissos WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
    return r.changes > 0;
  }

  static proximos(usuario_id, dias = 7) {
    const agora = new Date().toISOString();
    const limite = new Date(Date.now() + dias * 86400000).toISOString();
    return rowsFrom(
      getDb().prepare(`
        SELECT c.*, cs.titulo AS caso_titulo
        FROM compromissos c
        LEFT JOIN casos cs ON cs.id = c.caso_id
        WHERE c.usuario_id = ? AND c.status = 'agendado'
          AND c.data_hora >= ? AND c.data_hora <= ?
        ORDER BY c.data_hora ASC
      `),
      usuario_id, agora, limite
    );
  }
}

module.exports = CompromissoModel;
