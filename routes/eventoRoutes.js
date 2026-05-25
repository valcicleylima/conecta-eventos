const express = require('express');
const eventoController = require('../controllers/eventoController');
const { estaLogado, somentePerfis, asyncHandler } = require('./middlewares');
const upload = require('../config/upload');

const router = express.Router();

router.get('/', asyncHandler(eventoController.listar));
router.get('/novo', estaLogado, somentePerfis('administrador'), asyncHandler(eventoController.telaNovo));
router.post('/', estaLogado, somentePerfis('administrador'), upload.single('imagem'), asyncHandler(eventoController.criar));
router.get('/:id', asyncHandler(eventoController.detalhes));
router.get('/:id/editar', estaLogado, somentePerfis('administrador', 'organizador'), asyncHandler(eventoController.telaEditar));
router.put('/:id', estaLogado, somentePerfis('administrador', 'organizador'), upload.single('imagem'), asyncHandler(eventoController.atualizar));
router.delete('/:id', estaLogado, somentePerfis('administrador', 'organizador'), asyncHandler(eventoController.excluir));

module.exports = router;
