const express = require('express');
const siteController = require('../controllers/siteController');

const router = express.Router();

router.get('/quem-somos', siteController.quemSomos);
router.get('/contato', siteController.contato);

module.exports = router;
