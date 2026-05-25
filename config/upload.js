const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'img', 'eventos'));
  },
  filename: (req, file, cb) => {
    const extensao = path.extname(file.originalname).toLowerCase();
    const nomeSeguro = `${Date.now()}-${Math.round(Math.random() * 1E9)}${extensao}`;
    cb(null, nomeSeguro);
  }
});

const filtroImagem = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  cb(new Error('Envie apenas arquivos de imagem.'));
};

module.exports = multer({
  storage,
  fileFilter: filtroImagem,
  limits: { fileSize: 5 * 1024 * 1024 }
});
