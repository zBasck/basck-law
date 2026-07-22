// backend/db/init.js
// Inicialização do banco SQLite usando node:sqlite nativo (Node 22+).
// Suporta migrações aditivas tolerantes a execuções repetidas.

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DEFAULT_DB_PATH = path.join(__dirname, 'basck.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const MIGRATIONS_V120 = require('./migrations-v120');

let _db = null;

function getDb() {
  if (_db) return _db;
  const dbPath = process.env.DB_PATH || DEFAULT_DB_PATH;
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  _db = new DatabaseSync(dbPath);
  _db.exec('PRAGMA foreign_keys = ON;');
  _db.exec('PRAGMA journal_mode = WAL;');
  return _db;
}

// Migrações aditivas: cada item tenta executar; se a coluna/tabela já existir, ignora.
const MIGRATIONS = [
  // v1.1.0 — auditoria do cálculo de prazo
  { sql: "ALTER TABLE prazos ADD COLUMN calculo_detalhes TEXT", descricao: 'coluna calculo_detalhes em prazos' },
  { sql: "ALTER TABLE prazos ADD COLUMN calculo_regra TEXT", descricao: 'coluna calculo_regra em prazos' },
  // v1.2.0+ — importadas de migrations-v120.js
  ...MIGRATIONS_V120
];

function safeExec(db, sql) {
  try { db.exec(sql); return true; }
  catch (e) { return false; } // já existe ou outro motivo não-bloqueante
}

function initSchema() {
  const db = getDb();
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  for (const m of MIGRATIONS) safeExec(db, m.sql);
  // v1.3.0 — vinculacao retroativa de casos existentes a OAB do usuario
  try {
    const casosSemOab = db.prepare('SELECT c.id, c.usuario_id, u.oab FROM casos c JOIN usuarios u ON u.id = c.usuario_id WHERE c.oab_monitoramento_id IS NULL AND u.oab IS NOT NULL AND u.oab <> \'\'').all();
    for (const c of casosSemOab) {
      const m = String(c.oab).match(/^([0-9]+)[\s\-]?([A-Za-z]{2})?/);
      if (!m) continue;
      const numeroOab = m[1];
      const ufOab = (m[2] || 'BR').toUpperCase().slice(0, 2);
      let existente = db.prepare('SELECT id FROM oab_monitoramento WHERE usuario_id = ? AND numero_oab = ? AND uf = ?').get(c.usuario_id, numeroOab, ufOab);
      let oabId;
      if (existente) {
        oabId = existente.id;
      } else {
        const ins = db.prepare(`INSERT INTO oab_monitoramento (usuario_id, numero_oab, uf, nome, situacao) VALUES (?, ?, ?, ?, 'pendente')`).run(c.usuario_id, numeroOab, ufOab, 'OAB do escritorio (retroativo)');
        oabId = ins.lastInsertRowid;
      }
      db.prepare('UPDATE casos SET oab_monitoramento_id = ? WHERE id = ?').run(oabId, c.id);
    }
  } catch (_) { /* silencioso: nao trava inicializacao */ }
  return db;
}

function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

module.exports = { getDb, initSchema, closeDb };
