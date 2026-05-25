const express = require('express');
const authController = require('../controllers/authController');
const recuperacaoController = require('../controllers/recuperacaoController');
const { asyncHandler } = require('./middlewares');

const router = express.Router();

router.get('/login', authController.telaLogin);
router.post('/login', authController.login);
router.get('/cadastro', authController.telaCadastro);
router.post('/cadastro', authController.cadastrar);
router.get('/esqueci-senha', recuperacaoController.telaSolicitar);
router.post('/esqueci-senha', asyncHandler(recuperacaoController.enviarCodigo));
router.get('/redefinir-senha', recuperacaoController.telaRedefinir);
router.post('/redefinir-senha', asyncHandler(recuperacaoController.redefinirSenha));
router.post('/logout', authController.logout);

module.exports = router;
