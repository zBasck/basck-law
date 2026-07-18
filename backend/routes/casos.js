// backend/routes/casos.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/casos');
const { authRequired } = require('../middleware/auth');

router.use(authRequired);
router.get('/', ctrl.listar);
router.get('/estatisticas', ctrl.estatisticas);
router.get('/:id', ctrl.buscar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.delete('/:id', ctrl.remover);

module.exports = router;
