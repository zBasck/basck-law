// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth');
const { authRequired } = require('../middleware/auth');
const { rateLimit } = require('../middleware/rateLimit');
const { asyncHandler } = require('../middleware/asyncHandler');

// 5 tentativas por minuto por IP — protecao basica contra forca bruta
const loginLimiter = rateLimit({ windowMs: 60_000, max: 5 });

router.post('/cadastro', asyncHandler(ctrl.cadastrar));
router.post('/login', loginLimiter, asyncHandler(ctrl.login));
router.get('/perfil', authRequired, asyncHandler(ctrl.perfil));
router.put('/perfil', authRequired, asyncHandler(ctrl.atualizarPerfil));

module.exports = router;
