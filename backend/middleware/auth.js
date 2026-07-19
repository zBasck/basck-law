// backend/middleware/auth.js
// Autenticação via JWT

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'basck-law-dev-secret-troque-em-producao';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ erro: 'Token ausente ou inválido' });
  }
  try {
    const decoded = verifyToken(token);
    req.usuario = { id: decoded.id, email: decoded.email, nome: decoded.nome };
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Token expirado ou inválido' });
  }
}

module.exports = { signToken, verifyToken, authRequired };
