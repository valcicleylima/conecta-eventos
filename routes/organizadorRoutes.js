const express = require('express');
const organizadorController = require('../controllers/organizadorController');
const eventoController = require('../controllers/eventoController');
const { estaLogado, somenteOrganizador, asyncHandler } = require('./middlewares');
const upload = require('../config/upload');

const router = express.Router();

router.use(estaLogado, somenteOrganizador);
router.get('/dashboard', asyncHandler(organizadorController.dashboard));
router.get('/eventos', asyncHandler(organizadorController.meusEventos));
router.get('/eventos/:id/inscricoes', asyncHandler(organizadorController.inscricoesEvento));
router.get('/eventos/novo', asyncHandler(eventoController.telaNovo));
router.post('/eventos', upload.single('imagem'), asyncHandler(eventoController.criar));
router.get('/eventos/editar/:id', asyncHandler(eventoController.telaEditar));
router.put('/eventos/:id', upload.single('imagem'), asyncHandler(eventoController.atualizar));
router.put('/eventos/:id/cancelar', asyncHandler(eventoController.cancelar));

module.exports = router;
