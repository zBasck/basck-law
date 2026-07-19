// backend/routes/tarefas.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/tarefas');
const { authRequired } = require('../middleware/auth');

router.use(authRequired);
router.get('/', ctrl.listar);
router.get('/:id', ctrl.buscar);
router.post('/', ctrl.criar);
router.put('/:id', ctrl.atualizar);
router.post('/:id/concluir', ctrl.concluir);
router.delete('/:id', ctrl.remover);

module.exports = router;
