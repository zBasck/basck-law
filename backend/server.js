// backend/server.js
// Servidor principal do Basck Law

require('dotenv').config({ override: false });

const path = require('node:path');
const express = require('express');
const cors = require('cors');

const { initSchema, closeDb } = require('./db/init');
const { errorHandler, notFound } = require('./middleware/erros');

const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const casosRoutes = require('./routes/casos');
const prazosRoutes = require('./routes/prazos');
const tarefasRoutes = require('./routes/tarefas');
const documentosRoutes = require('./routes/documentos');
const financeiroRoutes = require('./routes/financeiro');
const buscaRoutes = require('./routes/busca');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Inicializa o banco antes de aceitar conexoes
initSchema();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/saude', (req, res) => {
  const pkg = require('../package.json');
  res.json({ ok: true, servico: 'basck-law', versao: pkg.version, agora: new Date().toISOString() });
});

// API
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clientesRoutes);
app.use('/api/casos', casosRoutes);
app.use('/api/prazos', prazosRoutes);
app.use('/api/tarefas', tarefasRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/busca', buscaRoutes);

// Frontend estatico (DEPOIS das rotas de API para nao conflitar)
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir));

// SPA fallback: so atende arquivos que nao comecam com /api/
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'), (err) => {
    if (err) res.status(404).json({ erro: 'Pagina nao encontrada' });
  });
});

app.use('/api', notFound);
app.use(errorHandler);

const server = app.listen(PORT, () => {
  console.log(`[basck-law] Servidor rodando em http://localhost:${PORT}`);
  console.log(`[basck-law] Health: http://localhost:${PORT}/api/saude`);
});

function shutdown(signal) {
  console.log(`\n[basck-law] Recebido ${signal}, encerrando...`);
  server.close(() => {
    closeDb();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
