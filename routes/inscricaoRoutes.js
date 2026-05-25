const express = require('express');
const inscricaoController = require('../controllers/inscricaoController');
const { estaLogado, somentePerfis, asyncHandler } = require('./middlewares');

const router = express.Router();

router.use(estaLogado, somentePerfis('administrador', 'organizador', 'cliente'));
router.post('/evento/:eventoId', asyncHandler(inscricaoController.inscrever));
router.get('/minhas', asyncHandler(inscricaoController.minhas));
router.put('/:id/cancelar', asyncHandler(inscricaoController.cancelar));
router.get('/:id/comprovante', asyncHandler(inscricaoController.comprovante));

module.exports = router;
