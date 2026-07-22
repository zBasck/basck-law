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
    const casoId = r.lastInsertRowid;
    // Auto-vinculacao: garante que existe entrada em oab_monitoramento para
    // a OAB do usuario (criada em branco se necessario) e cria vinculo
    // caso <-> OAB para o painel de monitoramento.
    try {
      const db = getDb();
      const usuario = db.prepare('SELECT oab FROM usuarios WHERE id = ?').get(usuario_id);
      if (usuario && usuario.oab) {
        const m = String(usuario.oab).match(/^([0-9]+)[\s\-]?([A-Za-z]{2})?/);
        if (m) {
          const numeroOab = m[1];
          const ufOab = (m[2] || dados.uf || dados.tribunal || 'BR').toUpperCase().slice(0, 2);
          const existente = db.prepare('SELECT id FROM oab_monitoramento WHERE usuario_id = ? AND numero_oab = ? AND uf = ?').get(usuario_id, numeroOab, ufOab);
          let oabId;
          if (existente) {
            oabId = existente.id;
          } else {
            const ins = db.prepare(`INSERT INTO oab_monitoramento (usuario_id, numero_oab, uf, nome, situacao) VALUES (?, ?, ?, ?, 'pendente')`).run(usuario_id, numeroOab, ufOab, 'OAB do escritorio');
            oabId = ins.lastInsertRowid;
          }
          // Vincula o caso a OAB no monitoramento
          db.prepare(`UPDATE casos SET oab_monitoramento_id = ? WHERE id = ? AND usuario_id = ?`).run(oabId, casoId, usuario_id);
        }
      }
    } catch (_) { /* silencioso: nao quebra criacao do caso */ }
    return this.buscarPorId(casoId, usuario_id);
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
}

module.exports = CasoModel;
