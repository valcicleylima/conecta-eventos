const Evento = require('../models/Evento');
const Categoria = require('../models/Categoria');

exports.listar = async (req, res) => {
  const filtros = { q: req.query.q || '' };
  const eventos = await Evento.listarPublicos(filtros.q);
  res.render('eventos', { titulo: 'Eventos', eventos, filtros });
};

exports.detalhes = async (req, res) => {
  const evento = await Evento.buscarPorId(req.params.id);
  if (!evento) {
    req.session.erro = 'Evento não encontrado.';
    return res.redirect('/eventos');
  }
  const podeVerRestrito = req.session.usuario && podeGerenciar(req.session.usuario, evento);
  if (evento.status_evento !== 'aprovado' && !podeVerRestrito) {
    req.session.erro = 'Este evento ainda não está disponível publicamente.';
    return res.redirect('/eventos');
  }
  res.render('detalhes_evento', { titulo: evento.titulo, evento });
};

exports.telaNovo = async (req, res) => {
  const categorias = await Categoria.listar();
  res.render('novo_evento', { titulo: 'Novo Evento', categorias });
};

exports.criar = async (req, res) => {
  const { titulo, descricao, data_evento, horario, local, cidade, capacidade_maxima, preco_ingresso, categoria_id } = req.body;
  if (!titulo || !descricao || !data_evento || !horario || !local || !cidade || !capacidade_maxima || !preco_ingresso || !categoria_id) {
    req.session.erro = 'Preencha todos os campos obrigatórios do evento.';
    return res.redirect(req.session.usuario.tipo_usuario === 'administrador' ? '/eventos/novo' : '/organizador/eventos/novo');
  }

  const status_evento = req.session.usuario.tipo_usuario === 'administrador' ? 'aprovado' : 'pendente';

  await Evento.criar({
    titulo,
    descricao,
    data_evento,
    horario,
    local,
    cidade,
    capacidade_maxima,
    preco_ingresso,
    imagem: req.file ? `/img/eventos/${req.file.filename}` : null,
    status_evento,
    categoria_id,
    criador_id: req.session.usuario.id
  });
  req.session.sucesso = status_evento === 'aprovado'
    ? 'Evento criado e publicado com sucesso.'
    : 'Evento enviado para aprovação do administrador.';
  res.redirect(req.session.usuario.tipo_usuario === 'administrador' ? '/admin/eventos-pendentes' : '/organizador/eventos');
};

exports.telaEditar = async (req, res) => {
  const evento = await Evento.buscarPorId(req.params.id);
  if (!evento) {
    req.session.erro = 'Evento não encontrado.';
    return res.redirect('/eventos');
  }
  if (!podeGerenciar(req.session.usuario, evento)) {
    req.session.erro = 'Você não tem permissão para editar este evento.';
    return res.redirect('/eventos');
  }
  const categorias = await Categoria.listar();
  res.render('editar_evento', { titulo: 'Editar Evento', evento, categorias });
};

exports.atualizar = async (req, res) => {
  const evento = await Evento.buscarPorId(req.params.id);
  if (!evento || !podeGerenciar(req.session.usuario, evento)) {
    req.session.erro = 'Você não tem permissão para atualizar este evento.';
    return res.redirect('/eventos');
  }

  const dadosEvento = {
    ...req.body,
    status_evento: req.session.usuario.tipo_usuario === 'administrador' ? req.body.status_evento : evento.status_evento,
    imagem: req.file ? `/img/eventos/${req.file.filename}` : evento.imagem
  };

  await Evento.atualizar(req.params.id, dadosEvento);
  req.session.sucesso = 'Evento atualizado com sucesso.';
  res.redirect(`/eventos/${req.params.id}`);
};

exports.excluir = async (req, res) => {
  const evento = await Evento.buscarPorId(req.params.id);
  if (!evento || !podeGerenciar(req.session.usuario, evento)) {
    req.session.erro = 'Você não tem permissão para excluir este evento.';
    return res.redirect('/eventos');
  }

  await Evento.excluir(req.params.id);
  req.session.sucesso = 'Evento excluído com sucesso.';
  res.redirect('/eventos');
};

exports.cancelar = async (req, res) => {
  const evento = await Evento.buscarPorId(req.params.id);
  if (!evento || !podeGerenciar(req.session.usuario, evento)) {
    req.session.erro = 'Você não tem permissão para cancelar este evento.';
    return res.redirect('/organizador/eventos');
  }

  await Evento.cancelar(req.params.id);
  req.session.sucesso = 'Evento cancelado.';
  res.redirect(req.session.usuario.tipo_usuario === 'administrador' ? '/admin/eventos-pendentes' : '/organizador/eventos');
};

function podeGerenciar(usuario, evento) {
  return usuario.tipo_usuario === 'administrador' || Number(evento.criador_id) === Number(usuario.id);
}
