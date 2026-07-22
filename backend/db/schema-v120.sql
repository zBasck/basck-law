-- ============================================================================
-- v1.2.0 — Compromissos, Kanban e Integrações com Tribunais
-- ============================================================================

CREATE TABLE IF NOT EXISTS compromissos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  caso_id INTEGER,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'audiencia',
  data_hora TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 60,
  local TEXT,
  tribunal TEXT,
  sala TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'agendado',
  concluido_em TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (caso_id) REFERENCES casos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_compromissos_usuario ON compromissos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_compromissos_caso ON compromissos(caso_id);
CREATE INDEX IF NOT EXISTS idx_compromissos_data ON compromissos(data_hora);
CREATE INDEX IF NOT EXISTS idx_compromissos_status ON compromissos(status);

CREATE TABLE IF NOT EXISTS kanban_cartoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  coluna TEXT NOT NULL DEFAULT 'a_fazer',
  posicao INTEGER NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL DEFAULT 'caso',
  referencia_id INTEGER NOT NULL,
  titulo TEXT,
  descricao TEXT,
  prazo TEXT,
  responsavel TEXT,
  etiquetas TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_kanban_usuario ON kanban_cartoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_kanban_coluna ON kanban_cartoes(coluna);
CREATE INDEX IF NOT EXISTS idx_kanban_tipo_ref ON kanban_cartoes(tipo, referencia_id);

CREATE TABLE IF NOT EXISTS integracoes_tribunal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  tribunal TEXT NOT NULL,
  tipo_credencial TEXT NOT NULL,
  identificador TEXT NOT NULL,
  segredo_criptografado TEXT,
  apelido TEXT,
  ativo INTEGER NOT NULL DEFAULT 1,
  ultima_consulta TEXT,
  ultimo_resultado TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_integracoes_usuario ON integracoes_tribunal(usuario_id);
CREATE INDEX IF NOT EXISTS idx_integracoes_tribunal ON integracoes_tribunal(tribunal);

CREATE TABLE IF NOT EXISTS oab_monitoramento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  integracao_id INTEGER,
  numero_oab TEXT NOT NULL,
  uf TEXT NOT NULL,
  situacao TEXT,
  ultima_verificacao TEXT,
  alertas TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (integracao_id) REFERENCES integracoes_tribunal(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_oab_usuario ON oab_monitoramento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_oab_numero ON oab_monitoramento(numero_oab, uf);
