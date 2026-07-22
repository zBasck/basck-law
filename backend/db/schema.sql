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
  kanban_coluna TEXT DEFAULT 'a_fazer',
  kanban_posicao INTEGER DEFAULT 0,
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
  kanban_coluna TEXT DEFAULT 'a_fazer',
  kanban_posicao INTEGER DEFAULT 0,
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


-- v1.2.0+ — Kanban
CREATE TABLE IF NOT EXISTS kanban_cartoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  coluna TEXT NOT NULL DEFAULT 'a_fazer',
  posicao INTEGER NOT NULL DEFAULT 0,
  tipo TEXT NOT NULL DEFAULT 'tarefa',
  referencia_id INTEGER,
  titulo TEXT NOT NULL,
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
CREATE INDEX IF NOT EXISTS idx_kanban_referencia ON kanban_cartoes(tipo, referencia_id);

-- v1.2.0+ — Compromissos
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
  kanban_coluna TEXT DEFAULT 'a_fazer',
  kanban_posicao INTEGER DEFAULT 0,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (caso_id) REFERENCES casos(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_compromissos_usuario ON compromissos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_compromissos_data ON compromissos(data_hora);
CREATE INDEX IF NOT EXISTS idx_compromissos_caso ON compromissos(caso_id);
CREATE INDEX IF NOT EXISTS idx_compromissos_status ON compromissos(status);

-- v1.2.0+ — Integrações com tribunais
CREATE TABLE IF NOT EXISTS integracoes_tribunal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  tribunal TEXT NOT NULL,
  tipo_credencial TEXT NOT NULL DEFAULT 'api_key',
  identificador TEXT,
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

-- v1.2.0+ — Monitoramento OAB
CREATE TABLE IF NOT EXISTS oab_monitoramento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL,
  integracao_id INTEGER,
  numero_oab TEXT NOT NULL,
  uf TEXT NOT NULL,
  nome TEXT,
  situacao TEXT NOT NULL DEFAULT 'pendente',
  ultima_verificacao TEXT,
  alertas TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now')),
  atualizado_em TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (integracao_id) REFERENCES integracoes_tribunal(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_oab_usuario ON oab_monitoramento(usuario_id);
CREATE INDEX IF NOT EXISTS idx_oab_numero ON oab_monitoramento(numero_oab, uf);
