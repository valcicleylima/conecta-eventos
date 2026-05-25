const Evento = require('../models/Evento');
const Inscricao = require('../models/Inscricao');

exports.dashboard = async (req, res) => {
  const filtros = { q: req.query.q || '', status: req.query.status || '' };
  const eventos = await Evento.dashboardOrganizador(req.session.usuario.id, filtros);
  const resumo = {
    total: eventos.length,
    pendentes: eventos.filter((e) => e.status_evento === 'pendente').length,
    aprovados: eventos.filter((e) => e.status_evento === 'aprovado').length,
    rejeitados: eventos.filter((e) => e.status_evento === 'rejeitado').length
  };

  res.render('dashboard_organizador', { titulo: 'Dashboard do Organizador', eventos, resumo, filtros });
};

exports.meusEventos = async (req, res) => {
  const filtros = { q: req.query.q || '', status: req.query.status || '' };
  const eventos = await Evento.dashboardOrganizador(req.session.usuario.id, filtros);
  res.render('meus_eventos', { titulo: 'Meus Eventos', eventos, filtros });
};

exports.inscricoesEvento = async (req, res) => {
  const evento = await Evento.buscarPorId(req.params.id);
  if (!evento || Number(evento.criador_id) !== Number(req.session.usuario.id)) {
    req.session.erro = 'Você não tem permissão para visualizar este evento.';
    return res.redirect('/organizador/eventos');
  }

  const inscricoes = await Inscricao.listarPorEvento(req.params.id);
  res.render('inscricoes_evento', { titulo: 'Inscrições do Evento', evento, inscricoes });
};
