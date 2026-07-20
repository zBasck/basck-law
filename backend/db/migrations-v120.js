// backend/db/migrations-v120.js
// Migrações aditivas da v1.2.0 — cada uma é tolerante a execuções repetidas.

module.exports = [
  // Coluna calculo_detalhes/calculo_regra em prazos (v1.1.0)
  { sql: "ALTER TABLE prazos ADD COLUMN calculo_detalhes TEXT", descricao: 'coluna calculo_detalhes em prazos' },
  { sql: "ALTER TABLE prazos ADD COLUMN calculo_regra TEXT", descricao: 'coluna calculo_regra em prazos' },
  // v1.2.0 — kanban
  { sql: "ALTER TABLE casos ADD COLUMN kanban_coluna TEXT NOT NULL DEFAULT 'a_fazer'", descricao: 'coluna kanban_coluna em casos' },
  { sql: "ALTER TABLE casos ADD COLUMN kanban_posicao INTEGER NOT NULL DEFAULT 0", descricao: 'coluna kanban_posicao em casos' },
  // v1.2.0 — auditoria de integração
  { sql: "ALTER TABLE prazos ADD COLUMN origem TEXT", descricao: 'coluna origem em prazos (tribunal/importacao/manual)' },
  { sql: "ALTER TABLE tarefas ADD COLUMN origem TEXT", descricao: 'coluna origem em tarefas' }
];
