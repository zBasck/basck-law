// backend/models/kanban.js
const { getDb } = require('../db/init');

function rowsFrom(stmt, ...args) { return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r))); }
function rowFrom(stmt, ...args) { const r = stmt.get(...args); return r ? Object.fromEntries(Object.entries(r)) : null; }

const COLUNAS = ['a_fazer', 'em_andamento', 'em_revisao', 'concluido'];

class KanbanModel {
  static colunasValidas() { return [...COLUNAS]; }

  static inicializarCasos(usuario_id) {
    const casos = rowsFrom(getDb().prepare('SELECT id, titulo, kanban_coluna, kanban_posicao FROM casos WHERE usuario_id = ?'), usuario_id);
    for (const c of casos) {
      const existe = rowFrom(getDb().prepare('SELECT id FROM kanban_cartoes WHERE usuario_id = ? AND tipo = ? AND referencia_id = ?'),
        usuario_id, 'caso', c.id);
      if (!existe) {
        getDb().prepare(`
          INSERT INTO kanban_cartoes (usuario_id, coluna, posicao, tipo, referencia_id, titulo)
          VALUES (?, ?, ?, 'caso', ?, ?)
        `).run(usuario_id, c.kanban_coluna || 'a_fazer', c.kanban_posicao || 0, c.id, c.titulo);
      }
    }
  }

  static inicializarTarefas(usuario_id) {
    const tarefas = rowsFrom(getDb().prepare("SELECT id, titulo, kanban_coluna, kanban_posicao FROM tarefas WHERE usuario_id = ? AND status != 'concluida'"), usuario_id);
    for (const t of tarefas) {
      const existe = rowFrom(getDb().prepare('SELECT id FROM kanban_cartoes WHERE usuario_id = ? AND tipo = ? AND referencia_id = ?'),
        usuario_id, 'tarefa', t.id);
      if (!existe) {
        getDb().prepare(`
          INSERT INTO kanban_cartoes (usuario_id, coluna, posicao, tipo, referencia_id, titulo)
          VALUES (?, ?, ?, 'tarefa', ?, ?)
        `).run(usuario_id, t.kanban_coluna || 'a_fazer', t.kanban_posicao || 0, t.id, t.titulo);
      }
    }
  }

  static listar(usuario_id) {
    this.inicializarCasos(usuario_id);
    this.inicializarTarefas(usuario_id);
    const cartoes = rowsFrom(getDb().prepare(`
      SELECT k.* FROM kanban_cartoes k
      WHERE k.usuario_id = ?
      ORDER BY k.coluna, k.posicao ASC, k.id ASC
    `), usuario_id);
    return cartoes.map((cart) => {
      if (cart.tipo === 'tarefa') {
        const t = rowFrom(getDb().prepare('SELECT id, titulo, status, data_vencimento FROM tarefas WHERE id = ? AND usuario_id = ?'),
          cart.referencia_id, usuario_id);
        if (t) { cart.tarefa = t; cart.titulo = t.titulo; cart.prazo = t.data_vencimento; }
      } else if (cart.tipo === 'caso') {
        const caso = rowFrom(getDb().prepare('SELECT id, titulo, status, area, tribunal FROM casos WHERE id = ? AND usuario_id = ?'),
          cart.referencia_id, usuario_id);
        if (caso) { cart.caso = caso; cart.titulo = caso.titulo; }
      }
      return cart;
    });
  }

  static mover(usuario_id, cartao_id, { coluna, posicao }) {
    const colValida = COLUNAS.includes(coluna);
    if (!colValida) return { erro: 'Coluna invalida' };
    const r = getDb().prepare(`
      UPDATE kanban_cartoes
      SET coluna = ?, posicao = ?, atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(coluna, posicao || 0, cartao_id, usuario_id);
    if (r.changes === 0) return null;
    const cart = rowFrom(getDb().prepare('SELECT * FROM kanban_cartoes WHERE id = ? AND usuario_id = ?'), cartao_id, usuario_id);
    if (cart && cart.tipo === 'caso') {
      getDb().prepare('UPDATE casos SET kanban_coluna = ?, kanban_posicao = ? WHERE id = ? AND usuario_id = ?')
        .run(coluna, posicao || 0, cart.referencia_id, usuario_id);
    }
    if (cart && cart.tipo === 'tarefa') {
      getDb().prepare("UPDATE tarefas SET kanban_coluna = ?, kanban_posicao = ? WHERE id = ? AND usuario_id = ?")
        .run(coluna, posicao || 0, cart.referencia_id, usuario_id);
    }
    return this.buscarPorId(cartao_id, usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    return rowFrom(getDb().prepare('SELECT * FROM kanban_cartoes WHERE id = ? AND usuario_id = ?'), id, usuario_id);
  }

  static criar(usuario_id, dados) {
    const colValida = COLUNAS.includes(dados.coluna || 'a_fazer');
    if (!colValida) return { erro: 'Coluna invalida' };
    const r = getDb().prepare(`
      INSERT INTO kanban_cartoes (usuario_id, coluna, posicao, tipo, referencia_id, titulo, descricao, prazo, responsavel, etiquetas)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuario_id, dados.coluna || 'a_fazer', dados.posicao || 0,
      dados.tipo || 'tarefa', dados.referencia_id || 0,
      dados.titulo || null, dados.descricao || null, dados.prazo || null,
      dados.responsavel || null, dados.etiquetas || null
    );
    return this.buscarPorId(r.lastInsertRowid, usuario_id);
  }

  static remover(id, usuario_id) {
    const r = getDb().prepare('DELETE FROM kanban_cartoes WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
    return r.changes > 0;
  }

  static removerPorReferencia(usuario_id, tipo, referencia_id) {
    getDb().prepare('DELETE FROM kanban_cartoes WHERE usuario_id = ? AND tipo = ? AND referencia_id = ?')
      .run(usuario_id, tipo, referencia_id);
  }

  static atualizarPorReferencia(usuario_id, tipo, referencia_id, dados) {
    if (dados.titulo) {
      getDb().prepare("UPDATE kanban_cartoes SET titulo = ?, atualizado_em = datetime('now') WHERE usuario_id = ? AND tipo = ? AND referencia_id = ?")
        .run(dados.titulo, usuario_id, tipo, referencia_id);
    }
  }
}

module.exports = KanbanModel;
