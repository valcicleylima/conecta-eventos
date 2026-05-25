const Inscricao = require('../models/Inscricao');
const Evento = require('../models/Evento');
const Pagamento = require('../models/Pagamento');

exports.inscrever = async (req, res) => {
  const eventoId = req.params.eventoId;
  const usuarioId = req.session.usuario.id;
  const evento = await Evento.buscarPorId(eventoId);

  if (!evento || evento.status_evento !== 'aprovado') {
    req.session.erro = 'Evento indisponível para inscrição.';
    return res.redirect('/eventos');
  }

  const existente = await Inscricao.buscarPorUsuarioEvento(usuarioId, eventoId);
  if (existente) {
    req.session.erro = 'Você já possui inscrição neste evento.';
    return res.redirect(`/eventos/${eventoId}`);
  }

  const confirmadas = await Inscricao.contarConfirmadasPorEvento(eventoId);
  if (confirmadas >= evento.capacidade_maxima) {
    req.session.erro = 'Limite de vagas atingido.';
    return res.redirect(`/eventos/${eventoId}`);
  }

  const inscricaoId = await Inscricao.criar({ usuario_id: usuarioId, evento_id: eventoId, status_inscricao: 'pendente' });
  await Pagamento.criar({ inscricao_id: inscricaoId, valor: evento.preco_ingresso, metodo_pagamento: 'pix', status_pagamento: 'pendente' });
  req.session.sucesso = 'Inscrição iniciada. Finalize o pagamento para confirmar.';
  res.redirect(`/pagamentos/${inscricaoId}`);
};

exports.minhas = async (req, res) => {
  const inscricoes = await Inscricao.listarPorUsuario(req.session.usuario.id);
  res.render('minhas_inscricoes', { titulo: 'Minhas Inscrições', inscricoes });
};

exports.cancelar = async (req, res) => {
  await Inscricao.cancelar(req.params.id, req.session.usuario.id);
  await Pagamento.cancelarPorInscricao(req.params.id);
  req.session.sucesso = 'Inscrição cancelada.';
  res.redirect('/inscricoes/minhas');
};

exports.comprovante = async (req, res) => {
  const inscricao = await Inscricao.buscarComprovante(req.params.id, req.session.usuario.id);
  if (!inscricao || inscricao.status_inscricao !== 'confirmada') {
    req.session.erro = 'Comprovante disponível apenas para inscrições confirmadas.';
    return res.redirect('/inscricoes/minhas');
  }
  res.render('comprovante', { titulo: 'Comprovante', inscricao });
};
