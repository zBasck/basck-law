-- Schema do Basck Law
-- Banco SQLite usando node:sqlite nativo do Node 22+

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  oab TEXT,
  telefone TEXT,
  plano TEXT NOT NULL DEFAULT 'autonomo',
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  nome TEXT NOT NULL,
  documento TEXT,
  email TEXT,
  telefone TEXT,
  endereco TEXT,
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_clientes_usuario ON clientes(usuario_id);

CREATE TABLE IF NOT EXISTS casos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  cliente_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  numero_processo TEXT,
  area TEXT,
  tribunal TEXT,
  instancia TEXT,
  valor_causa REAL,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  descricao TEXT,
  data_inicio TEXT,
  data_fim TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_casos_usuario ON casos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_casos_cliente ON casos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_casos_status ON casos(status);

CREATE TABLE IF NOT EXISTS prazos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  caso_id INTEGER NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TEXT NOT NULL,
  data_vencimento TEXT NOT NULL,
  tipo_dias TEXT NOT NULL DEFAULT 'uteis',
  prioridade TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pendente',
  concluido_em TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (caso_id) REFERENCES casos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_prazos_usuario ON prazos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_prazos_caso ON prazos(caso_id);
CREATE INDEX IF NOT EXISTS idx_prazos_vencimento ON prazos(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_prazos_status ON prazos(status);

CREATE TABLE IF NOT EXISTS tarefas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  caso_id INTEGER,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_vencimento TEXT,
  prioridade TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'pendente',
  concluido_em TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (caso_id) REFERENCES casos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tarefas_usuario ON tarefas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_caso ON tarefas(caso_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);

CREATE TABLE IF NOT EXISTS documentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  caso_id INTEGER,
  titulo TEXT NOT NULL,
  nome_arquivo TEXT NOT NULL,
  caminho_arquivo TEXT NOT NULL,
  tipo_mime TEXT,
  tamanho_bytes INTEGER,
  descricao TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (caso_id) REFERENCES casos(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_documentos_usuario ON documentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_documentos_caso ON documentos(caso_id);

CREATE TABLE IF NOT EXISTS lancamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  caso_id INTEGER,
  cliente_id INTEGER,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  data_vencimento TEXT,
  data_pagamento TEXT,
  forma_pagamento TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (caso_id) REFERENCES casos(id) ON DELETE SET NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_lancamentos_usuario ON lancamentos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_caso ON lancamentos(caso_id);
CREATE INDEX IF NOT EXISTS idx_lancamentos_status ON lancamentos(status);
CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo ON lancamentos(tipo);
