// backend/routes/casos.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/casos');
const andamentoRouter = require('./casoAndamento');
const { authRequired } = require('../middleware/auth');

router.use(authRequired);
router.get('/', ctrl.listar);
router.get('/estatisticas', ctrl.estatisticas);
router.get('/:id', ctrl.buscar);
router.get('/:id/detalhes', ctrl.detalhes);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.remover);

// Sub-rotas de andamentos: /api/casos/:id/andamentos
router.use('/:id/andamentos', andamentoRouter);

module.exports = router;
