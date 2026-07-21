// backend/routes/financeiro.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/financeiro');
const { authRequired } = require('../middleware/auth');

router.use(authRequired);
router.get('/', ctrl.listar);
router.get('/resumo', ctrl.resumo);
router.get('/exportar.csv', ctrl.exportarCsv);
router.get('/:id', ctrl.buscar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.post('/:id/marcar-pago', ctrl.marcarPago);
router.delete('/:id', ctrl.remover);

module.exports = router;
