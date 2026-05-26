const Usuario = require('../models/Usuario');
const RecuperacaoSenha = require('../models/RecuperacaoSenha');
const emailService = require('../config/email');

exports.telaSolicitar = (req, res) => {
  res.render('esqueci_senha', { titulo: 'Recuperar Senha' });
};

exports.enviarCodigo = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    req.session.erro = 'Informe o e-mail cadastrado.';
    return res.redirect('/esqueci-senha');
  }

  const usuario = await Usuario.buscarPorEmail(email);
  if (!usuario) {
    req.session.erro = 'Nenhum usuario encontrado com este e-mail.';
    return res.redirect('/esqueci-senha');
  }

  const codigo = String(Math.floor(100000 + Math.random() * 900000));
  const expiraEm = new Date(Date.now() + 15 * 60 * 1000);

  // Salva o codigo antes do envio para evitar que o usuario receba um codigo inexistente.
  await RecuperacaoSenha.criar({
    usuario_id: usuario.id,
    codigo,
    expira_em: expiraEm
  });

  try {
    await emailService.enviarCodigoRecuperacao({
      para: usuario.email,
      nome: usuario.nome,
      codigo
    });
  } catch (error) {
    console.error(error);
    req.session.erro = 'Nao foi possivel enviar o e-mail de recuperacao. Verifique as configuracoes SMTP e tente novamente.';
    return res.redirect('/esqueci-senha');
  }

  req.session.sucesso = 'Codigo enviado para o e-mail cadastrado.';
  res.redirect(`/redefinir-senha?email=${encodeURIComponent(usuario.email)}`);
};

exports.telaRedefinir = (req, res) => {
  res.render('redefinir_senha', { titulo: 'Redefinir Senha', email: req.query.email || '' });
};

exports.redefinirSenha = async (req, res) => {
  const { email, codigo, nova_senha, confirmar_senha } = req.body;

  if (!email || !codigo || !nova_senha || !confirmar_senha) {
    req.session.erro = 'Preencha todos os campos.';
    return res.redirect(`/redefinir-senha?email=${encodeURIComponent(email || '')}`);
  }

  if (nova_senha !== confirmar_senha) {
    req.session.erro = 'As senhas nao conferem.';
    return res.redirect(`/redefinir-senha?email=${encodeURIComponent(email)}`);
  }

  const recuperacao = await RecuperacaoSenha.buscarValido({ email, codigo });
  if (!recuperacao) {
    req.session.erro = 'Codigo invalido, expirado ou ja utilizado.';
    return res.redirect(`/redefinir-senha?email=${encodeURIComponent(email)}`);
  }

  await Usuario.atualizarSenha(recuperacao.usuario_id, nova_senha);
  await RecuperacaoSenha.marcarUsado(recuperacao.id);

  req.session.sucesso = 'Senha alterada com sucesso. Faca login com a nova senha.';
  res.redirect('/login');
};
