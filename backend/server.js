// backend/server.js
// Servidor principal do Basck Law

require('dotenv').config({ override: false });

const path = require('node:path');
const express = require('express');
const cors = require('cors');

const { initSchema, closeDb } = require('./db/init');
const { errorHandler, notFound } = require('./middleware/erros');
const { build: buildBundle } = require('./build-bundle');

const authRoutes = require('./routes/auth');
const clientesRoutes = require('./routes/clientes');
const casosRoutes = require('./routes/casos');
const prazosRoutes = require('./routes/prazos');
const tarefasRoutes = require('./routes/tarefas');
const documentosRoutes = require('./routes/documentos');
const financeiroRoutes = require('./routes/financeiro');
const buscaRoutes = require('./routes/busca');
const compromissosRoutes = require('./routes/compromissos');
const kanbanRoutes = require('./routes/kanban');
const integracoesRoutes = require('./routes/integracoes');

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Constroi o bundle JS (JSX pre-compilado para JS puro via esbuild)
try {
  buildBundle();
} catch (err) {
  console.error('[basck-law] Aviso: falha no build do bundle:', err.message);
  console.error('  O servidor sobe mesmo assim, mas a interface nao vai carregar.');
}

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
app.use('/api/compromissos', compromissosRoutes);
app.use('/api/kanban', kanbanRoutes);
app.use('/api/integracoes', integracoesRoutes);

// Frontend estatico (DEPOIS das rotas de API)
const frontendDir = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendDir, { index: 'index.html', extensions: ['html'] }));

// SPA fallback: rotas que NAO comecam com /api/ e NAO tem extensao
// (exclui .js, .css, .png, .jsx para que o express.static acima sirva esses).
// Garante que /dist/bundle.js (e qualquer arquivo com extensao) NAO seja
// capturado por este fallback.
app.get(/^\/(?!api\/)[^.]*$/, (req, res) => {
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
