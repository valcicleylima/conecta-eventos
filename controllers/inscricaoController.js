const Inscricao = require('../models/Inscricao');
const Evento = require('../models/Evento');
const Pagamento = require('../models/Pagamento');
const SetorEvento = require('../models/SetorEvento');

exports.inscrever = async (req, res) => {
  const eventoId = req.params.eventoId;
  const usuarioId = req.session.usuario.id;
  const evento = await Evento.buscarPorId(eventoId);
  const quantidade = Math.max(1, Number(req.body.quantidade || 1));
  const setorId = req.body.setor_id || null;

  if (!evento || evento.status_evento !== 'aprovado') {
    req.session.erro = 'Evento indisponível para inscrição.';
    return res.redirect('/eventos');
  }

  const setores = await SetorEvento.listarPorEvento(eventoId);
  let valorUnitario = Number(evento.preco_ingresso);
  let setorSelecionado = null;
  let disponiveis = 0;

  if (setores.length) {
    setorSelecionado = setores.find((setor) => Number(setor.id) === Number(setorId));
    if (!setorSelecionado) {
      req.session.erro = 'Selecione um setor válido.';
      return res.redirect(`/eventos/${eventoId}`);
    }
    valorUnitario = Number(setorSelecionado.preco);
    disponiveis = Number(setorSelecionado.disponiveis);
  } else {
    const disponibilidadeGeral = await Evento.disponibilidadeGeral(eventoId);
    disponiveis = Number(disponibilidadeGeral.disponiveis);
  }

  if (quantidade > disponiveis) {
    req.session.erro = 'Limite de vagas atingido.';
    return res.redirect(`/eventos/${eventoId}`);
  }

  const valorTotal = valorUnitario * quantidade;
  const inscricaoId = await Inscricao.criar({ usuario_id: usuarioId, evento_id: eventoId, setor_id: setorId, quantidade, valor_total: valorTotal, status_inscricao: 'pendente' });
  await Pagamento.criar({ inscricao_id: inscricaoId, valor: valorTotal, metodo_pagamento: 'pix', status_pagamento: 'pendente' });
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
