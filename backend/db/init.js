// backend/db/init.js
// Inicialização do banco SQLite usando node:sqlite nativo (Node 22+)

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

function initSchema() {
  const db = getDb();
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  return db;
}

function closeDb() {
  if (_db) {
    _db.close();
    _db = null;
  }
}

module.exports = { getDb, initSchema, closeDb };
