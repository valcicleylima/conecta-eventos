const Usuario = require('../models/Usuario');

exports.telaLogin = (req, res) => {
  if (req.session.usuario) {
    return res.redirect(destinoPorPerfil(req.session.usuario.tipo_usuario));
  }
  return res.render('login', { titulo: 'Login' });
};

exports.telaCadastro = (req, res) => res.render('cadastro', { titulo: 'Cadastro' });

exports.cadastrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      req.session.erro = 'Preencha todos os campos obrigatórios.';
      return res.redirect('/cadastro');
    }

    const existente = await Usuario.buscarPorEmail(email);
    if (existente) {
      req.session.erro = 'Este e-mail já está cadastrado.';
      return res.redirect('/cadastro');
    }

    // Cadastro público cria cliente. Para virar organizador, o usuário envia uma solicitação ao admin.
    await Usuario.criar({ nome, email, senha, tipo_usuario: 'cliente' });
    req.session.sucesso = 'Cadastro realizado. Faça login para continuar.';
    return res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.session.erro = 'Erro ao cadastrar usuário.';
    return res.redirect('/cadastro');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      req.session.erro = 'Informe e-mail e senha.';
      return res.redirect('/login');
    }

    const usuario = await Usuario.buscarPorEmail(email);
    if (!usuario || senha !== usuario.senha) {
      req.session.erro = 'E-mail ou senha inválidos.';
      return res.redirect('/login');
    }
    if (usuario.bloqueado) {
      req.session.erro = 'Seu usuário está bloqueado. Entre em contato com o administrador.';
      return res.redirect('/login');
    }

    req.session.usuario = {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario
    };

    req.session.sucesso = `Bem-vindo, ${usuario.nome}!`;
    return res.redirect(destinoPorPerfil(usuario.tipo_usuario));
  } catch (error) {
    console.error(error);
    req.session.erro = 'Erro ao realizar login.';
    return res.redirect('/login');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};

function destinoPorPerfil(tipoUsuario) {
  if (tipoUsuario === 'administrador') {
    return '/admin/dashboard';
  }
  if (tipoUsuario === 'organizador') {
    return '/organizador/dashboard';
  }

  // Cliente entra pela área pública de eventos aprovados.
  return '/eventos';
}
