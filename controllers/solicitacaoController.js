const SolicitacaoOrganizador = require('../models/SolicitacaoOrganizador');

exports.telaSolicitar = async (req, res) => {
  const solicitacaoPendente = await SolicitacaoOrganizador.buscarPendentePorUsuario(req.session.usuario.id);
  res.render('solicitar_organizador', { titulo: 'Solicitar Organizador', solicitacaoPendente });
};

exports.criar = async (req, res) => {
  const { telefone, cpf_cnpj, nome_organizacao, descricao_organizacao, site_redes } = req.body;
  if (!telefone || !cpf_cnpj || !nome_organizacao || !descricao_organizacao) {
    req.session.erro = 'Preencha todos os campos obrigatórios da solicitação.';
    return res.redirect('/solicitar-organizador');
  }

  const existente = await SolicitacaoOrganizador.buscarPendentePorUsuario(req.session.usuario.id);
  if (existente) {
    req.session.erro = 'Você já possui uma solicitação pendente.';
    return res.redirect('/solicitar-organizador');
  }

  await SolicitacaoOrganizador.criar({
    usuario_id: req.session.usuario.id,
    nome_completo: req.session.usuario.nome,
    telefone,
    cpf_cnpj,
    nome_organizacao,
    descricao_organizacao,
    site_redes
  });

  req.session.sucesso = 'Solicitação enviada para análise do administrador.';
  res.redirect('/eventos');
};
