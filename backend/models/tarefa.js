// backend/models/tarefa.js
const { getDb } = require('../db/init');
const KanbanModel = require('./kanban');

function rowsFrom(stmt, ...args) {
  return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r)));
}

function rowFrom(stmt, ...args) {
  const r = stmt.get(...args);
  return r ? Object.fromEntries(Object.entries(r)) : null;
}

class TarefaModel {
  static criar(usuario_id, dados) {
    const r = getDb().prepare(`
      INSERT INTO tarefas (
        usuario_id, caso_id, titulo, descricao, data_vencimento, prioridade, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuario_id, dados.caso_id || null, dados.titulo, dados.descricao || null,
      dados.data_vencimento || null, dados.prioridade || 'normal', dados.status || 'pendente'
    );
    const id = r.lastInsertRowid;
    // Espelha no Kanban (cartao tipo 'tarefa')
    KanbanModel.criar(usuario_id, {
      coluna: 'a_fazer',
      posicao: 0,
      tipo: 'tarefa',
      referencia_id: Number(id),
      titulo: dados.titulo,
      prazo: dados.data_vencimento || null
    });
    return this.buscarPorId(id, usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    const stmt = getDb().prepare(`
      SELECT t.*, c.titulo AS caso_titulo
      FROM tarefas t
      LEFT JOIN casos c ON c.id = t.caso_id
      WHERE t.id = ? AND t.usuario_id = ?
    `);
    return rowFrom(stmt, id, usuario_id);
  }

  static listar(usuario_id, { status = null, caso_id = null } = {}) {
    let sql = `
      SELECT t.*, c.titulo AS caso_titulo
      FROM tarefas t
      LEFT JOIN casos c ON c.id = t.caso_id
      WHERE t.usuario_id = ?
    `;
    const params = [usuario_id];
    if (status) { sql += ' AND t.status = ?'; params.push(status); }
    if (caso_id) { sql += ' AND t.caso_id = ?'; params.push(caso_id); }
    sql += ' ORDER BY t.data_vencimento IS NULL, t.data_vencimento ASC';
    return rowsFrom(getDb().prepare(sql), ...params);
  }

  static atualizar(id, usuario_id, dados) {
    getDb().prepare(`
      UPDATE tarefas SET
        caso_id = ?, titulo = ?, descricao = ?, data_vencimento = ?,
        prioridade = ?, status = ?, concluido_em = ?,
        atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(
      dados.caso_id || null, dados.titulo, dados.descricao || null,
      dados.data_vencimento || null, dados.prioridade || 'normal',
      dados.status || 'pendente', dados.concluido_em || null,
      id, usuario_id
    );
    // Espelha mudancas no Kanban
    KanbanModel.atualizarPorReferencia(usuario_id, 'tarefa', Number(id), {
      titulo: dados.titulo,
      prazo: dados.data_vencimento || null
    });
    return this.buscarPorId(id, usuario_id);
  }

  static concluir(id, usuario_id) {
    getDb().prepare(`
      UPDATE tarefas SET status = 'concluida', concluido_em = datetime('now'), atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(id, usuario_id);
    // Move cartao do Kanban para coluna 'concluido' (se existir)
    const cartao = rowFrom(getDb().prepare(
      "SELECT id FROM kanban_cartoes WHERE usuario_id = ? AND tipo = 'tarefa' AND referencia_id = ?"
    ), usuario_id, id);
    if (cartao) {
      getDb().prepare("UPDATE kanban_cartoes SET coluna = 'concluido', atualizado_em = datetime('now') WHERE id = ?")
        .run(cartao.id);
    }
    return this.buscarPorId(id, usuario_id);
  }

  static reabrir(id, usuario_id) {
    getDb().prepare(`
      UPDATE tarefas SET status = 'pendente', concluido_em = NULL, atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(id, usuario_id);
    const cartao = rowFrom(getDb().prepare(
      "SELECT id FROM kanban_cartoes WHERE usuario_id = ? AND tipo = 'tarefa' AND referencia_id = ?"
    ), usuario_id, id);
    if (cartao) {
      getDb().prepare("UPDATE kanban_cartoes SET coluna = 'a_fazer', atualizado_em = datetime('now') WHERE id = ?")
        .run(cartao.id);
    }
    return this.buscarPorId(id, usuario_id);
  }

  static remover(id, usuario_id) {
    // Remove o cartao kanban espelhado
    KanbanModel.removerPorReferencia(usuario_id, 'tarefa', Number(id));
    return getDb().prepare('DELETE FROM tarefas WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
  }
}

module.exports = TarefaModel;
