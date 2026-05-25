const express = require('express');
const pagamentoController = require('../controllers/pagamentoController');
const { estaLogado, somentePerfis, asyncHandler } = require('./middlewares');

const router = express.Router();

router.use(estaLogado, somentePerfis('administrador', 'organizador', 'cliente'));
router.get('/:inscricaoId', asyncHandler(pagamentoController.telaPagamento));
router.post('/:inscricaoId', asyncHandler(pagamentoController.processar));

module.exports = router;
