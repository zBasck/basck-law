// backend/routes/busca.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/busca');
const { authRequired } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/asyncHandler');

router.use(authRequired);
router.get('/', asyncHandler(ctrl.buscar));

module.exports = router;
