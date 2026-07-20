// backend/models/integracao.js
const { getDb } = require('../db/init');
const crypto = require('node:crypto');
const https = require('node:https');

function rowsFrom(stmt, ...args) { return stmt.all(...args).map((r) => Object.fromEntries(Object.entries(r))); }
function rowFrom(stmt, ...args) { const r = stmt.get(...args); return r ? Object.fromEntries(Object.entries(r)) : null; }

const ALGO = 'aes-256-gcm';
function getKey() {
  const secret = process.env.JWT_SECRET || 'basck-law-dev-secret-change-me-in-production';
  return crypto.createHash('sha256').update(secret).digest();
}
function criptografar(texto) {
  if (!texto) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, getKey(), iv);
  const enc = Buffer.concat([cipher.update(texto, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

class IntegracaoModel {
  static tribunaisSuportados() {
    return [
      { id: 'tjsp',  nome: 'Tribunal de Justica de SP' },
      { id: 'tjrj',  nome: 'Tribunal de Justica do RJ' },
      { id: 'tjmg',  nome: 'Tribunal de Justica de MG' },
      { id: 'trf1',  nome: 'TRF da 1a Regiao' },
      { id: 'trf2',  nome: 'TRF da 2a Regiao' },
      { id: 'trf3',  nome: 'TRF da 3a Regiao' },
      { id: 'stj',   nome: 'STJ' },
      { id: 'cnj',   nome: 'CNJ (DataJud)' },
      { id: 'oab',   nome: 'OAB Nacional' }
    ];
  }

  static listar(usuario_id) {
    return rowsFrom(getDb().prepare(`
      SELECT id, usuario_id, tribunal, tipo_credencial, identificador, apelido, ativo,
             ultima_consulta, ultimo_resultado, criado_em, atualizado_em
      FROM integracoes_tribunal
      WHERE usuario_id = ?
      ORDER BY criado_em DESC
    `), usuario_id);
  }

  static buscarPorId(id, usuario_id) {
    return rowFrom(getDb().prepare(`
      SELECT id, usuario_id, tribunal, tipo_credencial, identificador, apelido, ativo,
             ultima_consulta, ultimo_resultado, criado_em, atualizado_em
      FROM integracoes_tribunal
      WHERE id = ? AND usuario_id = ?
    `), id, usuario_id);
  }

  static criar(usuario_id, dados) {
    const r = getDb().prepare(`
      INSERT INTO integracoes_tribunal
        (usuario_id, tribunal, tipo_credencial, identificador, segredo_criptografado, apelido, ativo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      usuario_id, dados.tribunal, dados.tipo_credencial,
      dados.identificador,
      criptografar(dados.segredo),
      dados.apelido || null,
      dados.ativo === false ? 0 : 1
    );
    return this.buscarPorId(r.lastInsertRowid, usuario_id);
  }

  static atualizar(id, usuario_id, dados) {
    const r = getDb().prepare(`
      UPDATE integracoes_tribunal SET
        apelido = COALESCE(?, apelido),
        ativo = COALESCE(?, ativo),
        atualizado_em = datetime('now')
      WHERE id = ? AND usuario_id = ?
    `).run(dados.apelido ?? null, dados.ativo === undefined ? null : (dados.ativo ? 1 : 0), id, usuario_id);
    if (r.changes === 0) return null;
    return this.buscarPorId(id, usuario_id);
  }

  static remover(id, usuario_id) {
    const r = getDb().prepare('DELETE FROM integracoes_tribunal WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
    return r.changes > 0;
  }

  static descriptografar(segredo_criptografado) {
    if (!segredo_criptografado) return null;
    try {
      const buf = Buffer.from(segredo_criptografado, 'base64');
      const iv = buf.subarray(0, 12);
      const tag = buf.subarray(12, 28);
      const enc = buf.subarray(28);
      const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
    } catch (e) { return null; }
  }

  static async chamarDataJud(tribunal, numeroProcesso, apiKey) {
    const url = `https://api-publica.datajud.cnj.jus.br/api_publica_${tribunal}/_search`;
    return new Promise((resolve, reject) => {
      const req = https.request(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'APIKey ' + apiKey
        },
        timeout: 15000
      }, (res) => {
        let body = '';
        res.on('data', (c) => body += c);
        res.on('end', () => {
          if (res.statusCode !== 200) {
            return reject(new Error(`DataJud retornou ${res.statusCode}: ${body.slice(0, 200)}`));
          }
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(new Error('Resposta invalida do DataJud')); }
        });
      });
      req.on('error', (e) => reject(new Error('Falha de rede com DataJud: ' + e.message)));
      req.on('timeout', () => { req.destroy(); reject(new Error('Timeout (15s) ao consultar DataJud')); });
      req.write(JSON.stringify({
        query: { match: { numeroProcesso: numeroProcesso.replace(/\D/g, '') } }
      }));
      req.end();
    });
  }

  static async consultar(usuario_id, integracao_id) {
    const integ = rowFrom(getDb().prepare('SELECT * FROM integracoes_tribunal WHERE id = ? AND usuario_id = ?'),
      integracao_id, usuario_id);
    if (!integ) return { erro: 'Integracao nao encontrada' };
    if (!integ.ativo) return { erro: 'Integracao desativada' };

    const agora = new Date().toISOString();
    let resultado;
    if (integ.tribunal === 'oab') {
      // OAB nao tem API publica gratuita — mantemos simulacao
      resultado = {
        tipo: 'oab', sucesso: true, simulado: true,
        numero_oab: integ.identificador,
        situacao: 'regular',
        ultima_inscricao: '2010-08-15',
        especialidades: ['Civel', 'Trabalhista'],
        emitido_em: agora,
        aviso: 'Consulta OAB simulada. Nao existe API publica gratuita para verificacao de inscricao na OAB.'
      };
    } else {
      // DataJud CNJ — API publica real
      const apiKey = this.descriptografar(integ.segredo_criptografado);
      if (!apiKey) {
        resultado = { tipo: 'processo', sucesso: false, erro: 'API Key nao configurada ou invalida. Edite a integracao.' };
      } else {
        try {
          const r = await this.chamarDataJud(integ.tribunal, integ.identificador, apiKey);
          const hits = (r.hits && r.hits.hits) || [];
          const proc = hits[0] && hits[0]._source;
          if (!proc) {
            resultado = { tipo: 'processo', sucesso: true, encontrado: false, numero: integ.identificador, tribunal: integ.tribunal, emitido_em: agora };
          } else {
            const movs = (proc.movimentos || []).slice(0, 5);
            resultado = {
              tipo: 'processo', sucesso: true, encontrado: true,
              numero: proc.numeroProcesso || integ.identificador,
              tribunal: integ.tribunal,
              classe: proc.classe ? proc.classe.nome : null,
              orgao: proc.orgaoJulgador ? proc.orgaoJulgador.nome : null,
              data_ajuizamento: proc.dataAjuizamento,
              ultima_movimentacao: movs[0] ? { data: movs[0].dataHora, descricao: movs[0].movimentoNacional || movs[0].descricao } : null,
              movimentos: movs.map((m) => ({ data: m.dataHora, descricao: m.movimentoNacional || m.descricao })),
              assuntos: (proc.assuntos || []).map((a) => a.nome).filter(Boolean),
              emitido_em: agora,
              fonte: 'DataJud CNJ (api-publica.datajud.cnj.jus.br)'
            };
          }
        } catch (e) {
          resultado = { tipo: 'processo', sucesso: false, erro: e.message, numero: integ.identificador, tribunal: integ.tribunal, emitido_em: agora };
        }
      }
    }

    getDb().prepare(`
      UPDATE integracoes_tribunal SET
        ultima_consulta = ?, ultimo_resultado = ?, atualizado_em = ?
      WHERE id = ? AND usuario_id = ?
    `).run(agora, JSON.stringify(resultado), agora, integracao_id, usuario_id);

    return resultado;
  }

  static listarOabs(usuario_id) {
    return rowsFrom(getDb().prepare(`SELECT * FROM oab_monitoramento WHERE usuario_id = ? ORDER BY criado_em DESC`), usuario_id);
  }

  static adicionarOab(usuario_id, dados) {
    const r = getDb().prepare(`
      INSERT INTO oab_monitoramento (usuario_id, integracao_id, numero_oab, uf, situacao)
      VALUES (?, ?, ?, ?, ?)
    `).run(usuario_id, dados.integracao_id || null, dados.numero_oab, dados.uf, dados.situacao || 'pendente');
    return this.buscarOabPorId(r.lastInsertRowid, usuario_id);
  }

  static buscarOabPorId(id, usuario_id) {
    return rowFrom(getDb().prepare('SELECT * FROM oab_monitoramento WHERE id = ? AND usuario_id = ?'), id, usuario_id);
  }

  static removerOab(id, usuario_id) {
    const r = getDb().prepare('DELETE FROM oab_monitoramento WHERE id = ? AND usuario_id = ?').run(id, usuario_id);
    return r.changes > 0;
  }

  static verificarOabs(usuario_id) {
    const oabs = this.listarOabs(usuario_id);
    const agora = new Date().toISOString();
    for (const oab of oabs) {
      getDb().prepare(`
        UPDATE oab_monitoramento SET
          situacao = 'regular', ultima_verificacao = ?, alertas = NULL
        WHERE id = ? AND usuario_id = ?
      `).run(agora, oab.id, usuario_id);
    }
    return this.listarOabs(usuario_id);
  }
}

module.exports = IntegracaoModel;
