const express = require('express');
const adminController = require('../controllers/adminController');
const { estaLogado, somentePerfis, asyncHandler } = require('./middlewares');

const router = express.Router();

router.use(estaLogado, somentePerfis('administrador'));
router.get('/dashboard', asyncHandler(adminController.dashboard));
router.get('/eventos', asyncHandler(adminController.todosEventos));
router.get('/eventos-pendentes', asyncHandler(adminController.eventosPendentes));
router.post('/aprovar-evento/:id', asyncHandler(adminController.aprovarEvento));
router.post('/rejeitar-evento/:id', asyncHandler(adminController.rejeitarEvento));
router.get('/aprovar-evento/:id', asyncHandler(adminController.aprovarEvento));
router.get('/rejeitar-evento/:id', asyncHandler(adminController.rejeitarEvento));
router.get('/solicitacoes-organizador', asyncHandler(adminController.solicitacoesOrganizador));
router.post('/aprovar-organizador/:id', asyncHandler(adminController.aprovarOrganizador));
router.post('/rejeitar-organizador/:id', asyncHandler(adminController.rejeitarOrganizador));
router.get('/aprovar-organizador/:id', asyncHandler(adminController.aprovarOrganizador));
router.get('/rejeitar-organizador/:id', asyncHandler(adminController.rejeitarOrganizador));
router.get('/usuarios', asyncHandler(adminController.listarUsuarios));
router.put('/usuarios/:id', asyncHandler(adminController.atualizarUsuario));
router.delete('/usuarios/:id', asyncHandler(adminController.excluirUsuario));

module.exports = router;
