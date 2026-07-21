// backend/routes/integracoes.js
const router = require('express').Router();
const ctrl = require('../controllers/integracoes');
const { asyncHandler } = require('../middleware/asyncHandler');
const auth = require('../middleware/auth');

router.use(auth.authRequired);

router.get('/tribunais', asyncHandler(ctrl.tribunaisSuportados));
router.get('/', asyncHandler(ctrl.listar));
router.get('/:id', asyncHandler(ctrl.buscar));
router.post('/', asyncHandler(ctrl.criar));
router.put('/:id', asyncHandler(ctrl.atualizar));
router.delete('/:id', asyncHandler(ctrl.remover));
router.post('/:id/consultar', asyncHandler(ctrl.consultar));

// Monitoramento OAB
router.get('/oab/listar', asyncHandler(ctrl.listarOabs));
router.post('/oab', asyncHandler(ctrl.adicionarOab));
router.delete('/oab/:id', asyncHandler(ctrl.removerOab));
router.post('/oab/verificar', asyncHandler(ctrl.verificarOabs));
router.post('/oab/:id/verificar', asyncHandler(ctrl.verificarOabUm));

module.exports = router;
