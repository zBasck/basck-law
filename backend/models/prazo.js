// backend/models/prazo.js
const { getDb } = require('../db/init');

function rowsFrom(stmt, ...args) {
  return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r)));
}
function rowFrom(stmt, ...args) {
  const r = stmt.get(...args);
  return r ? Object.fromEntries(Object.entries(r)) : null;
}

class PrazoModel {
  static criar(usuario_id, dados) {
    const r = getDb().prepare(`
      INSERT INTO prazos (
        usuario_id, caso_id, titulo, descricao, data_inicio, data_vencimento,
        tipo_dias, prioridade, status, calculo_detalhes, calculo_regra
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuario_id, dados.caso_id, dados.titulo, dados.descricao || null,
      dados.data_inicio, dados.data_vencimento,
      dados.tipo_dias || 'uteis', dados.prioridade || 'normal',
      dados.status || 'pendente',
      dados.calculo_detalhes || null,
      dados.calculo_regra || null
    );
    return this.buscarPorId(r.lastInsertRowid, usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    const stmt = getDb().prepare(`
      SELECT p.*, c.titulo AS caso_titulo
      FROM prazos p
      LEFT JOIN casos c ON c.id = p.caso_id
      WHERE p.id = ? AND p.usuario_id = ?
    `);
    return rowFrom(stmt, id, usuario_id);
  }

  static listar(usuario_id, { caso_id = null, status = null } = {}) {
    let sql = `
      SELECT p.*, c.titulo AS caso_titulo
      FROM prazos p
      LEFT JOIN casos c ON c.id = p.caso_id
      WHERE p.usuario_id = ?
    `;
    const params = [usuario_id];
    if (caso_id) { sql += ' AND p.caso_id = ?'; params.push(caso_id); }
    if (status) { sql += ' AND p.status = ?'; params.push(status); }
    sql += ' ORDER BY p.data_vencimento ASC';
    return rowsFrom(getDb().prepare(sql), ...params);
  }

  static proximos(usuario_id, dias = 7) {
    const sql = `
      SELECT p.*, c.titulo AS caso_titulo
      FROM prazos p
      LEFT JOIN casos c ON c.id = p.caso_id
      WHERE p.usuario_id = ?
        AND p.status = 'pendente'
        AND date(p.data_vencimento) <= date('now', '+' || ? || ' days')
      ORDER BY p.data_vencimento ASC
    `;
    return rowsFrom(getDb().prepare(sql), usuario_id, dias);
  }

  static atualizar(id, usuario_id, dados) {
    getDb().prepare(`
      UPDATE prazos SET
        caso_id = ?, titulo = ?, descricao = ?, data_inicio = ?, data_vencimento = ?,
        tipo_dias = ?, prioridade = ?, status = ?, concluido_em = ?,
        calculo_detalhes = ?, calculo_regra = ?,
        atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(
      dados.caso_id, dados.titulo, dados.descricao || null,
      dados.data_inicio, dados.data_vencimento,
      dados.tipo_dias || 'uteis', dados.prioridade || 'normal',
      dados.status || 'pendente', dados.concluido_em || null,
      dados.calculo_detalhes || null, dados.calculo_regra || null,
      id, usuario_id
    );
    return this.buscarPorId(id, usuario_id);
  }

  static concluir(id, usuario_id) {
    getDb().prepare(`
      UPDATE prazos SET status = 'concluido', concluido_em = datetime('now'), atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(id, usuario_id);
    return this.buscarPorId(id, usuario_id);
  }

  static reabrir(id, usuario_id) {
    getDb().prepare(`
      UPDATE prazos SET status = 'pendente', concluido_em = NULL, atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(id, usuario_id);
    return this.buscarPorId(id, usuario_id);
  }

  static remover(id, usuario_id) {
    return getDb().prepare('DELETE FROM prazos WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
  }
}

module.exports = PrazoModel;
