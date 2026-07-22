// backend/routes/kanban.js
const router = require('express').Router();
const ctrl = require('../controllers/kanban');
const { asyncHandler } = require('../middleware/asyncHandler');
const auth = require('../middleware/auth');

router.use(auth.authRequired);

router.get('/', asyncHandler(ctrl.listar));
router.post('/', asyncHandler(ctrl.criar));
router.put('/:id/mover', asyncHandler(ctrl.mover));
router.delete('/:id', asyncHandler(ctrl.remover));

module.exports = router;
