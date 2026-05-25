const Usuario = require('../models/Usuario');
const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');
const Pagamento = require('../models/Pagamento');
const SolicitacaoOrganizador = require('../models/SolicitacaoOrganizador');

exports.dashboard = async (req, res) => {
  const [totalUsuarios, totalOrganizadores, eventosPendentes, solicitacoesPendentes, eventosAprovados, totalPagamentos] = await Promise.all([
    Usuario.contar(),
    Usuario.contarPorPerfil('organizador'),
    Evento.contarPorStatus('pendente'),
    SolicitacaoOrganizador.contarPendentes(),
    Evento.contarPorStatus('aprovado'),
    Pagamento.contar()
  ]);

  res.render('dashboard_admin', {
    titulo: 'Dashboard Administrativo',
    resumo: { totalUsuarios, totalOrganizadores, eventosPendentes, solicitacoesPendentes, eventosAprovados, totalPagamentos }
  });
};

exports.listarUsuarios = async (req, res) => {
  const filtros = {
    q: req.query.q || '',
    perfil: req.query.perfil || '',
    bloqueado: req.query.bloqueado || ''
  };
  const usuarios = await Usuario.pesquisar(filtros);
  res.render('usuarios', { titulo: 'Usuários', usuarios, filtros });
};

exports.atualizarUsuario = async (req, res) => {
  const { nome, email, tipo_usuario, bloqueado } = req.body;
  if (!nome || !email || !tipo_usuario) {
    req.session.erro = 'Preencha todos os campos do usuário.';
    return res.redirect('/admin/usuarios');
  }

  await Usuario.atualizar(req.params.id, { nome, email, tipo_usuario, bloqueado });
  req.session.sucesso = 'Usuário atualizado com sucesso.';
  res.redirect('/admin/usuarios');
};

exports.eventosPendentes = async (req, res) => {
  const filtros = { q: req.query.q || '' };
  const eventos = await Evento.listarPendentes(filtros.q);
  res.render('eventos_pendentes', { titulo: 'Eventos Pendentes', eventos, filtros });
};

exports.todosEventos = async (req, res) => {
  const filtros = { q: req.query.q || '', status: req.query.status || '' };
  const eventos = await Evento.listarTodos(filtros);
  res.render('admin_eventos', { titulo: 'Todos os Eventos', eventos, filtros });
};

exports.aprovarEvento = async (req, res) => {
  await Evento.aprovar(req.params.id);
  req.session.sucesso = 'Evento aprovado e publicado.';
  res.redirect('/admin/eventos-pendentes');
};

exports.rejeitarEvento = async (req, res) => {
  await Evento.rejeitar(req.params.id);
  req.session.sucesso = 'Evento rejeitado.';
  res.redirect('/admin/eventos-pendentes');
};

exports.solicitacoesOrganizador = async (req, res) => {
  const filtros = { q: req.query.q || '' };
  const solicitacoes = await SolicitacaoOrganizador.listarPendentes(filtros.q);
  res.render('solicitacoes_organizador', { titulo: 'Solicitações de Organizador', solicitacoes, filtros });
};

exports.aprovarOrganizador = async (req, res) => {
  const solicitacao = await SolicitacaoOrganizador.buscarPorId(req.params.id);
  if (!solicitacao) {
    req.session.erro = 'Solicitação não encontrada.';
    return res.redirect('/admin/solicitacoes-organizador');
  }
  await SolicitacaoOrganizador.aprovar(req.params.id);
  await Usuario.alterarPerfil(solicitacao.usuario_id, 'organizador');
  req.session.sucesso = 'Solicitação aprovada. Usuário agora é organizador.';
  res.redirect('/admin/solicitacoes-organizador');
};

exports.rejeitarOrganizador = async (req, res) => {
  await SolicitacaoOrganizador.rejeitar(req.params.id);
  req.session.sucesso = 'Solicitação rejeitada.';
  res.redirect('/admin/solicitacoes-organizador');
};

exports.excluirUsuario = async (req, res) => {
  if (Number(req.params.id) === req.session.usuario.id) {
    req.session.erro = 'Você não pode excluir o próprio usuário logado.';
    return res.redirect('/admin/usuarios');
  }

  await Usuario.excluir(req.params.id);
  req.session.sucesso = 'Usuário excluído com sucesso.';
  res.redirect('/admin/usuarios');
};
