// backend/routes/prazos.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prazos');
const { authRequired } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

router.use(authRequired);
router.get('/proximos', asyncHandler(ctrl.proximos));
router.post('/calcular', asyncHandler(ctrl.calcular));
router.get('/', asyncHandler(ctrl.listar));
router.get('/:id', asyncHandler(ctrl.buscar));
router.post('/', asyncHandler(ctrl.criar));
router.put('/:id', asyncHandler(ctrl.atualizar));
router.post('/:id/concluir', asyncHandler(ctrl.concluir));
router.post('/:id/reabrir', asyncHandler(ctrl.reabrir));
router.delete('/:id', asyncHandler(ctrl.remover));

module.exports = router;
