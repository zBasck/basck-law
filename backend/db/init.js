// backend/db/init.js
// Inicialização do banco SQLite usando node:sqlite nativo (Node 22+).
// Suporta migrações aditivas tolerantes a execuções repetidas.

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const DEFAULT_DB_PATH = path.join(__dirname, 'basck.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

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
  { sql: "ALTER TABLE prazos ADD COLUMN calculo_regra TEXT", descricao: 'coluna calculo_regra em prazos' }
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
  return db;
}

function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

module.exports = { getDb, initSchema, closeDb };
