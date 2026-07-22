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
      // Tribunais superiores
      { id: 'stf',   nome: 'STF - Supremo Tribunal Federal' },
      { id: 'stj',   nome: 'STJ - Superior Tribunal de Justica' },
      { id: 'tst',   nome: 'TST - Tribunal Superior do Trabalho' },
      // Justica Federal (TRFs - 6 regioes)
      { id: 'trf1',  nome: 'TRF 1a Regiao (DF, GO, MT, MS, TO, BA, MA, PA, PI, RN, CE, MA, AP, AC, RO, RR, AM)' },
      { id: 'trf2',  nome: 'TRF 2a Regiao (RJ, ES)' },
      { id: 'trf3',  nome: 'TRF 3a Regiao (SP, MS)' },
      { id: 'trf4',  nome: 'TRF 4a Regiao (RS, PR, SC)' },
      { id: 'trf5',  nome: 'TRF 5a Regiao (PE, CE, AL, PB, RN, SE, BA, MA, PI)' },
      { id: 'trf6',  nome: 'TRF 6a Regiao (MG)' },
      // Justica Estadual - principais
      { id: 'tjsp',  nome: 'TJSP - Tribunal de Justica de Sao Paulo' },
      { id: 'tjrj',  nome: 'TJRJ - Tribunal de Justica do Rio de Janeiro' },
      { id: 'tjmg',  nome: 'TJMG - Tribunal de Justica de Minas Gerais' },
      { id: 'tjrs',  nome: 'TJRS - Tribunal de Justica do Rio Grande do Sul' },
      { id: 'tjpr',  nome: 'TJPR - Tribunal de Justica do Parana' },
      { id: 'tjsc',  nome: 'TJSC - Tribunal de Justica de Santa Catarina' },
      { id: 'tjba',  nome: 'TJBA - Tribunal de Justica da Bahia' },
      { id: 'tjpe',  nome: 'TJPE - Tribunal de Justica de Pernambuco' },
      { id: 'tjce',  nome: 'TJCE - Tribunal de Justica do Ceara' },
      { id: 'tjgo',  nome: 'TJGO - Tribunal de Justica de Goias' },
      { id: 'tjdf',  nome: 'TJDFT - Tribunal de Justica do DF e Territorios' },
      // Justica do Trabalho (TRTs)
      { id: 'trt1',  nome: 'TRT 1a Regiao (RJ)' },
      { id: 'trt2',  nome: 'TRT 2a Regiao (SP)' },
      { id: 'trt3',  nome: 'TRT 3a Regiao (MG)' },
      { id: 'trt4',  nome: 'TRT 4a Regiao (RS)' },
      // OAB
      { id: 'oab',   nome: 'OAB Nacional (monitoramento de inscricao)' }
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

  static descriptografar(b64) {
    if (!b64) return null;
    try {
      const buf = Buffer.from(b64, 'base64');
      const iv = buf.subarray(0, 12);
      const tag = buf.subarray(12, 28);
      const enc = buf.subarray(28);
      const decipher = crypto.createDecipheriv(ALGO, getKey(), iv);
      decipher.setAuthTag(tag);
      return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
    } catch (_) { return null; }
  }

  static _datajudRequest(tribunal, path, apiKey, bodyObj) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, 'https://api-publica.datajud.cnj.jus.br');
      const body = bodyObj ? JSON.stringify(bodyObj) : '';
      const req = https.request({
        hostname: url.hostname,
        port: 443,
        path: url.pathname + url.search,
        method: 'POST',
        headers: {
          'Authorization': 'APIKey ' + apiKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        },
        timeout: 12000
      }, (res) => {
        let data = '';
        res.on('data', (c) => { data += c; });
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try { resolve(JSON.parse(data)); }
            catch (_) { resolve({ hits: { total: 0, hits: [] } }); }
          } else if (res.statusCode === 401 || res.statusCode === 403) {
            reject(new Error('API Key invalida ou sem permissao para o tribunal ' + tribunal));
          } else if (res.statusCode === 404) {
            resolve({ hits: { total: 0, hits: [] } });
          } else {
            reject(new Error('DataJud HTTP ' + res.statusCode + ': ' + data.slice(0, 200)));
          }
        });
      });
      req.on('timeout', () => { req.destroy(new Error('DataJud timeout (12s)')); });
      req.on('error', (e) => reject(e));
      if (body) req.write(body);
      req.end();
    });
  }

  static async consultar(usuario_id, integracao_id) {
    const integ = rowFrom(getDb().prepare('SELECT * FROM integracoes_tribunal WHERE id = ? AND usuario_id = ?'),
      integracao_id, usuario_id);
    if (!integ) return { erro: 'Integracao nao encontrada' };
    if (!integ.ativo) return { erro: 'Integracao desativada' };

    const agora = new Date().toISOString();
    const apiKey = this.descriptografar(integ.segredo_criptografado);
    let resultado;
    let fonte = 'desconhecida';

    if (integ.tribunal === 'oab') {
      // OAB Nacional — sem API publica de consulta por numero/UF. Mantemos
      // uma verificacao de formato (somente numeros + UF) e registramos a consulta.
      const match = /^\d+$/.test(String(integ.identificador || '').trim());
      resultado = {
        tipo: 'oab', sucesso: match,
        numero_oab: integ.identificador,
        uf: null,
        observacao: match
          ? 'OAB Nacional nao expoe API publica de consulta por numero. Valide manualmente em https://cna.oab.org.br.'
          : 'Numero OAB invalido (espera apenas digitos)',
        emitido_em: agora
      };
      fonte = 'oab-formato';
    } else if (apiKey) {
      // DataJud CNJ — consulta real por numero de processo
      const numero = String(integ.identificador || '').replace(/\D/g, '');
      try {
        const query = {
          query: { match: { numeroProcesso: numero } },
          size: 1,
          _source: ['numeroProcesso', 'classe', 'assuntos', 'movimentos', 'orgaoJulgador', 'dataAjuizamento']
        };
        const resp = await this._datajudRequest(integ.tribunal, '/' + integ.tribunal + '/_search', apiKey, query);
        const hit = (resp.hits && resp.hits.hits && resp.hits.hits[0]) || null;
        const src = hit ? hit._source : null;
        resultado = {
          tipo: 'processo', sucesso: !!hit,
          numero: integ.identificador,
          tribunal: integ.tribunal,
          fonte: 'DataJud CNJ',
          encontrado: !!hit,
          classe: src ? src.classe : null,
          assuntos: src ? (src.assuntos || []) : [],
          orgao: src ? (src.orgaoJulgador && src.orgaoJulgador.nome) : null,
          data_ajuizamento: src ? src.dataAjuizamento : null,
          ultima_movimentacao: src && src.movimentos && src.movimentos[0]
            ? { data: src.movimentos[0].dataHora, descricao: src.movimentos[0].descricao }
            : null,
          emitido_em: agora
        };
        fonte = 'datajud';
      } catch (e) {
        resultado = {
          tipo: 'processo', sucesso: false,
          numero: integ.identificador,
          tribunal: integ.tribunal,
          fonte: 'DataJud CNJ',
          erro: e.message,
          emitido_em: agora
        };
        fonte = 'datajud-erro';
      }
    } else {
      resultado = {
        tipo: 'processo', sucesso: false,
        numero: integ.identificador,
        tribunal: integ.tribunal,
        fonte: 'local',
        erro: 'Cadastre uma API Key do DataJud para esta integracao (gratuita em https://datajud-wiki.cnj.jus.br).',
        emitido_em: agora
      };
      fonte = 'sem-credencial';
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

  static verificarOabUm(usuario_id, oab_id) {
    const oab = this.buscarOabPorId(oab_id, usuario_id);
    if (!oab) return null;
    const agora = new Date().toISOString();
    const match = /^\d+$/.test(String(oab.numero_oab || '').trim());
    const situacao = match ? 'regular' : 'formato_invalido';
    const alertas = match ? null : 'Numero OAB deve conter apenas digitos.';
    getDb().prepare(`
      UPDATE oab_monitoramento SET
        situacao = ?, ultima_verificacao = ?, alertas = ?, atualizado_em = ?
      WHERE id = ? AND usuario_id = ?
    `).run(situacao, agora, alertas, agora, oab_id, usuario_id);
    return this.buscarOabPorId(oab_id, usuario_id);
  }

  /**
   * Lista o monitoramento completo: OABs + casos vinculados a essas OABs.
   * Usado pelo painel "Monitoramento" da IntegracoesView.
   */
  static listarMonitoramentoCompleto(usuario_id) {
    const db = getDb();
    const oabs = this.listarOabs(usuario_id);
    const ids = oabs.map((o) => o.id);
    let casos = [];
    if (ids.length) {
      const placeholders = ids.map(() => '?').join(',');
      casos = rowsFrom(db.prepare(`
        SELECT c.id, c.titulo, c.numero_processo, c.tribunal, c.status, c.area,
               c.cliente_id, cl.nome AS cliente_nome, c.oab_monitoramento_id,
               o.numero_oab, o.uf AS oab_uf
        FROM casos c
        LEFT JOIN clientes cl ON cl.id = c.cliente_id
        LEFT JOIN oab_monitoramento o ON o.id = c.oab_monitoramento_id
        WHERE c.usuario_id = ? AND c.oab_monitoramento_id IN (${placeholders})
        ORDER BY c.atualizado_em DESC
      `), usuario_id, ...ids);
    }
    return { oabs, casos };
  }
}
module.exports = IntegracaoModel;
