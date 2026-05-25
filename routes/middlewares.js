function estaLogado(req, res, next) {
  if (!req.session.usuario) {
    req.session.erro = 'Faça login para acessar esta área.';
    return res.redirect('/login');
  }
  next();
}

function somentePerfis(...perfis) {
  return (req, res, next) => {
    if (!req.session.usuario || !perfis.includes(req.session.usuario.tipo_usuario)) {
      req.session.erro = 'Você não tem permissão para acessar esta página.';
      return res.redirect('/eventos');
    }
    next();
  };
}

function somenteAdministrador(req, res, next) {
  return somentePerfis('administrador')(req, res, next);
}

function somenteOrganizador(req, res, next) {
  return somentePerfis('organizador')(req, res, next);
}

function asyncHandler(controller) {
  return (req, res, next) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
}

module.exports = { estaLogado, somentePerfis, somenteAdministrador, somenteOrganizador, asyncHandler };
