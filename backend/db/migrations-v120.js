// backend/db/migrations-v120.js
// Migrações aditivas da v1.2.0 — cada uma é tolerante a execuções repetidas.

module.exports = [
  // v1.2.0 — kanban (casos)
  { sql: "ALTER TABLE casos ADD COLUMN kanban_coluna TEXT NOT NULL DEFAULT 'a_fazer'", descricao: 'coluna kanban_coluna em casos' },
  { sql: "ALTER TABLE casos ADD COLUMN kanban_posicao INTEGER NOT NULL DEFAULT 0", descricao: 'coluna kanban_posicao em casos' },
  // v1.2.5 — kanban (tarefas) - espelhamento de tarefas no kanban
  { sql: "ALTER TABLE tarefas ADD COLUMN kanban_coluna TEXT NOT NULL DEFAULT 'a_fazer'", descricao: 'coluna kanban_coluna em tarefas' },
  { sql: "ALTER TABLE tarefas ADD COLUMN kanban_posicao INTEGER NOT NULL DEFAULT 0", descricao: 'coluna kanban_posicao em tarefas' },
  // v1.2.0 — auditoria de integração
  { sql: "ALTER TABLE prazos ADD COLUMN origem TEXT", descricao: 'coluna origem em prazos (tribunal/importacao/manual)' },
  { sql: "ALTER TABLE tarefas ADD COLUMN origem TEXT", descricao: 'coluna origem em tarefas' },
  // v1.3.0 — vinculacao caso <-> monitoramento OAB
  { sql: "ALTER TABLE casos ADD COLUMN oab_monitoramento_id INTEGER", descricao: 'coluna oab_monitoramento_id em casos' },
  { sql: "CREATE INDEX IF NOT EXISTS idx_casos_oab ON casos(oab_monitoramento_id)", descricao: 'index idx_casos_oab em casos' }
];
