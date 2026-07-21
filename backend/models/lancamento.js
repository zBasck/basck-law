// backend/models/lancamento.js

const { getDb } = require('../db/init');

function rowsFrom(stmt, ...args) {
  return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r)));
}

function rowFrom(stmt, ...args) {
  const r = stmt.get(...args);
  return r ? Object.fromEntries(Object.entries(r)) : null;
}

class LancamentoModel {
  static criar(usuario_id, dados) {
    const r = getDb().prepare(`
      INSERT INTO lancamentos (
        usuario_id, caso_id, cliente_id, tipo, descricao, valor,
        data_vencimento, data_pagamento, forma_pagamento, status, observacoes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuario_id,
      dados.caso_id || null,
      dados.cliente_id || null,
      dados.tipo,
      dados.descricao,
      dados.valor,
      dados.data_vencimento || null,
      dados.data_pagamento || null,
      dados.forma_pagamento || null,
      dados.status || 'pendente',
      dados.observacoes || null
    );
    return this.buscarPorId(r.lastInsertRowid, usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    const stmt = getDb().prepare(`
      SELECT l.*, c.nome AS cliente_nome, cs.titulo AS caso_titulo
      FROM lancamentos l
      LEFT JOIN clientes c ON c.id = l.cliente_id
      LEFT JOIN casos cs ON cs.id = l.caso_id
      WHERE l.id = ? AND l.usuario_id = ?
    `);
    return rowFrom(stmt, id, usuario_id);
  }

  static listar(usuario_id, { tipo = null, status = null, caso_id = null, cliente_id = null } = {}) {
    let sql = `
      SELECT l.*, c.nome AS cliente_nome, cs.titulo AS caso_titulo
      FROM lancamentos l
      LEFT JOIN clientes c ON c.id = l.cliente_id
      LEFT JOIN casos cs ON cs.id = l.caso_id
      WHERE l.usuario_id = ?
    `;
    const params = [usuario_id];
    if (tipo) { sql += ' AND l.tipo = ?'; params.push(tipo); }
    if (status) { sql += ' AND l.status = ?'; params.push(status); }
    if (caso_id) { sql += ' AND l.caso_id = ?'; params.push(caso_id); }
    if (cliente_id) { sql += ' AND l.cliente_id = ?'; params.push(cliente_id); }
    sql += ' ORDER BY COALESCE(l.data_vencimento, l.data_pagamento) DESC, l.criado_em DESC';
    return rowsFrom(getDb().prepare(sql), ...params);
  }

  static atualizar(id, usuario_id, dados) {
    getDb().prepare(`
      UPDATE lancamentos SET
        caso_id = ?, cliente_id = ?, tipo = ?, descricao = ?, valor = ?,
        data_vencimento = ?, data_pagamento = ?, forma_pagamento = ?,
        status = ?, observacoes = ?, atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(
      dados.caso_id || null, dados.cliente_id || null, dados.tipo, dados.descricao, dados.valor,
      dados.data_vencimento || null, dados.data_pagamento || null, dados.forma_pagamento || null,
      dados.status || 'pendente', dados.observacoes || null,
      id, usuario_id
    );
    return this.buscarPorId(id, usuario_id);
  }

  static marcarPago(id, usuario_id, { data_pagamento = null, forma_pagamento = null } = {}) {
    getDb().prepare(`
      UPDATE lancamentos SET
        status = 'pago', data_pagamento = ?, forma_pagamento = COALESCE(?, forma_pagamento),
        atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(data_pagamento || new Date().toISOString().slice(0, 10), forma_pagamento, id, usuario_id);
    return this.buscarPorId(id, usuario_id);
  }

  static remover(id, usuario_id) {
    return getDb().prepare('DELETE FROM lancamentos WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
  }

  static resumo(usuario_id) {
    const db = getDb();
    const r = (sql, ...params) => {
      const row = db.prepare(sql).get(...params);
      return Number(row?.total || 0);
    };
    const recebidoHonorarios = r("SELECT COALESCE(SUM(valor), 0) AS total FROM lancamentos WHERE usuario_id = ? AND tipo = 'honorario' AND status = 'pago'", usuario_id);
    const pendenteHonorarios = r("SELECT COALESCE(SUM(valor), 0) AS total FROM lancamentos WHERE usuario_id = ? AND tipo = 'honorario' AND status = 'pendente'", usuario_id);
    const recebidoDespesas = r("SELECT COALESCE(SUM(valor), 0) AS total FROM lancamentos WHERE usuario_id = ? AND tipo = 'despesa' AND status = 'pago'", usuario_id);
    const pendenteDespesas = r("SELECT COALESCE(SUM(valor), 0) AS total FROM lancamentos WHERE usuario_id = ? AND tipo = 'despesa' AND status = 'pendente'", usuario_id);
    const atrasados = db.prepare(`
      SELECT COUNT(*) AS n, COALESCE(SUM(valor), 0) AS total
      FROM lancamentos
      WHERE usuario_id = ? AND status = 'pendente' AND data_vencimento < date('now')
    `).get(usuario_id);

    return {
      recebido: recebidoHonorarios + recebidoDespesas,
      recebidoHonorarios,
      pendente: pendenteHonorarios + pendenteDespesas,
      pendenteHonorarios,
      recebidoDespesas,
      pendenteDespesas,
      atrasados: { quantidade: Number(atrasados.n) || 0, valor: Number(atrasados.total) || 0 }
    };
  }
}

module.exports = LancamentoModel;
