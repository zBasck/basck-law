// backend/routes/compromissos.js
const router = require('express').Router();
const ctrl = require('../controllers/compromissos');
const { asyncHandler } = require('../middleware/asyncHandler');
const auth = require('../middleware/auth');

router.use(auth.authRequired);

router.get('/', asyncHandler(ctrl.listar));
router.get('/proximos', asyncHandler(ctrl.proximos));
router.get('/:id', asyncHandler(ctrl.buscar));
router.post('/', asyncHandler(ctrl.criar));
router.put('/:id', asyncHandler(ctrl.atualizar));
router.delete('/:id', asyncHandler(ctrl.remover));

module.exports = router;
