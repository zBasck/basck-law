// backend/routes/casoAndamento.js
// v1.4.0 — Rotas de andamentos do caso
const express = require('express');
const router = express.Router({ mergeParams: true });
const ctrl = require('../controllers/casoAndamento');
const { authRequired } = require('../middleware/auth');

router.use(authRequired);
router.get('/', ctrl.listar);
router.post('/', ctrl.criar);
router.delete('/:andamentoId', ctrl.remover);

module.exports = router;
