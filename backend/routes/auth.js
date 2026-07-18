// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/auth');
const { authRequired } = require('../middleware/auth');

router.post('/cadastro', ctrl.cadastrar);
router.post('/login', ctrl.login);
router.get('/perfil', authRequired, ctrl.perfil);
router.put('/perfil', authRequired, ctrl.atualizarPerfil);

module.exports = router;
