exports.quemSomos = (req, res) => {
  res.render('quem_somos', { titulo: 'Quem Somos' });
};

exports.contato = (req, res) => {
  res.render('contato', { titulo: 'Contato' });
};
