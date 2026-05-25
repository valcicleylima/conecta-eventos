const express = require('express');
const solicitacaoController = require('../controllers/solicitacaoController');
const { estaLogado, somentePerfis, asyncHandler } = require('./middlewares');

const router = express.Router();

router.get('/', estaLogado, somentePerfis('cliente'), asyncHandler(solicitacaoController.telaSolicitar));
router.post('/', estaLogado, somentePerfis('cliente'), asyncHandler(solicitacaoController.criar));

module.exports = router;
