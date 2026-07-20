// backend/db/init.js
// Inicialização do banco SQLite usando node:sqlite nativo (Node 22+).
// Suporta migrações aditivas tolerantes a execuções repetidas.

const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const MIGRATIONS = require('./migrations-v120');

const DEFAULT_DB_PATH = path.join(__dirname, 'basck.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SCHEMA_V120_PATH = path.join(__dirname, 'schema-v120.sql');

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

function safeExec(db, sql) {
  try { db.exec(sql); return true; }
  catch (e) { return false; }
}

function initSchema() {
  const db = getDb();
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  // v1.2.0 — schema adicional
  if (fs.existsSync(SCHEMA_V120_PATH)) {
    const schemaV120 = fs.readFileSync(SCHEMA_V120_PATH, 'utf8');
    db.exec(schemaV120);
  }
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
