// backend/middleware/erros.js
// Tratamento centralizado de erros

function errorHandler(err, req, res, next) {
  console.error('[ERRO]', err);
  const status = err.status || 500;
  res.status(status).json({
    erro: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

function notFound(req, res) {
  res.status(404).json({ erro: 'Rota não encontrada' });
}

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

module.exports = { errorHandler, notFound, HttpError };
