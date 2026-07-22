// backend/models/caso.js

const { getDb } = require('../db/init');

function rowsFrom(stmt, ...args) {
  return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r)));
}

function rowFrom(stmt, ...args) {
  const r = stmt.get(...args);
  return r ? Object.fromEntries(Object.entries(r)) : null;
}

class CasoModel {
  static criar(usuario_id, dados) {
    const r = getDb().prepare(`
      INSERT INTO casos (
        usuario_id, cliente_id, titulo, numero_processo, area, tribunal, instancia,
        valor_causa, status, descricao, data_inicio
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuario_id,
      dados.cliente_id,
      dados.titulo,
      dados.numero_processo || null,
      dados.area || null,
      dados.tribunal || null,
      dados.instancia || null,
      dados.valor_causa || null,
      dados.status || 'em_andamento',
      dados.descricao || null,
      dados.data_inicio || null
    );
    return this.buscarPorId(r.lastInsertRowid, usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    const stmt = getDb().prepare(`
      SELECT c.*, cl.nome AS cliente_nome
      FROM casos c
      LEFT JOIN clientes cl ON cl.id = c.cliente_id
      WHERE c.id = ? AND c.usuario_id = ?
    `);
    return rowFrom(stmt, id, usuario_id);
  }

  static listar(usuario_id, { status = null, cliente_id = null, busca = null } = {}) {
    let sql = `
      SELECT c.*, cl.nome AS cliente_nome
      FROM casos c
      LEFT JOIN clientes cl ON cl.id = c.cliente_id
      WHERE c.usuario_id = ?
    `;
    const params = [usuario_id];
    if (status) { sql += ' AND c.status = ?'; params.push(status); }
    if (cliente_id) { sql += ' AND c.cliente_id = ?'; params.push(cliente_id); }
    if (busca) { sql += ' AND (c.titulo LIKE ? OR c.numero_processo LIKE ?)'; params.push(`%${busca}%`, `%${busca}%`); }
    sql += ' ORDER BY c.atualizado_em DESC';
    return rowsFrom(getDb().prepare(sql), ...params);
  }

  static atualizar(id, usuario_id, dados) {
    getDb().prepare(`
      UPDATE casos SET
        cliente_id = ?, titulo = ?, numero_processo = ?, area = ?, tribunal = ?, instancia = ?,
        valor_causa = ?, status = ?, descricao = ?, data_inicio = ?, data_fim = ?,
        atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(
      dados.cliente_id, dados.titulo, dados.numero_processo || null, dados.area || null,
      dados.tribunal || null, dados.instancia || null, dados.valor_causa || null,
      dados.status || 'em_andamento', dados.descricao || null,
      dados.data_inicio || null, dados.data_fim || null,
      id, usuario_id
    );
    return this.buscarPorId(id, usuario_id);
  }

  static remover(id, usuario_id) {
    return getDb().prepare('DELETE FROM casos WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
  }

  static estatisticas(usuario_id) {
    const db = getDb();
    const total = db.prepare('SELECT COUNT(*) as n FROM casos WHERE usuario_id = ?').get(usuario_id).n;
    const em_andamento = db.prepare("SELECT COUNT(*) as n FROM casos WHERE usuario_id = ? AND status = 'em_andamento'").get(usuario_id).n;
    const concluidos = db.prepare("SELECT COUNT(*) as n FROM casos WHERE usuario_id = ? AND status = 'concluido'").get(usuario_id).n;
    const suspensos = db.prepare("SELECT COUNT(*) as n FROM casos WHERE usuario_id = ? AND status = 'suspenso'").get(usuario_id).n;
    return { total, em_andamento, concluidos, suspensos };
  }
  // v1.4.0 — Detalhes agregados do caso (usado pela tela de detalhes)
  static detalhes(id, usuario_id) {
    const caso = this.buscarPorId(id, usuario_id);
    if (!caso) return null;
    const PrazoModel = require('./prazo');
    const TarefaModel = require('./tarefa');
    const CompromissoModel = require('./compromisso');
    const CasoAndamentoModel = require('./casoAndamento');
    return {
      caso,
      andamentos: CasoAndamentoModel.listar(id, usuario_id),
      prazos: PrazoModel.listar(usuario_id, { caso_id: id }),
      tarefas: TarefaModel.listar(usuario_id, { caso_id: id }),
      compromissos: CompromissoModel.listar(usuario_id, { caso_id: id }),
      documentos: []
    };
  }
}
module.exports = CasoModel;

