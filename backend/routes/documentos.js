// backend/routes/documentos.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/documentos');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../config/upload');

router.use(authRequired);
router.get('/', ctrl.listar);
router.get('/espaco', ctrl.espaco);
router.get('/:id', ctrl.buscar);
router.get('/:id/download', ctrl.download);
router.post('/', upload.single('arquivo'), ctrl.upload);
router.delete('/:id', ctrl.remover);

module.exports = router;
