const Evento = require('../models/Evento');
const Categoria = require('../models/Categoria');
const SetorEvento = require('../models/SetorEvento');

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
  const setores = await SetorEvento.listarPorEvento(req.params.id);
  const disponibilidadeGeral = await Evento.disponibilidadeGeral(req.params.id);
  res.render('detalhes_evento', { titulo: evento.titulo, evento, setores, disponibilidadeGeral });
};

exports.telaNovo = async (req, res) => {
  const categorias = await Categoria.listar();
  res.render('novo_evento', { titulo: 'Novo Evento', categorias });
};

exports.criar = async (req, res) => {
  const { titulo, descricao, data_evento, horario, local, cidade, categoria_id } = req.body;
  const setores = normalizarSetores(req.body);
  const capacidade_maxima = setores.length ? somaCapacidadeSetores(setores) : req.body.capacidade_maxima;
  const preco_ingresso = setores.length ? menorPrecoSetores(setores) : req.body.preco_ingresso;

  if (!titulo || !descricao || !data_evento || !horario || !local || !cidade || !categoria_id) {
    req.session.erro = 'Preencha todos os campos obrigatórios do evento.';
    return res.redirect(req.session.usuario.tipo_usuario === 'administrador' ? '/eventos/novo' : '/organizador/eventos/novo');
  }
  if (!setores.length) {
    req.session.erro = 'Gere pelo menos um setor com capacidade e valor.';
    return res.redirect(req.session.usuario.tipo_usuario === 'administrador' ? '/eventos/novo' : '/organizador/eventos/novo');
  }

  const erroSetores = validarSetores(setores, capacidade_maxima);
  if (erroSetores) {
    req.session.erro = erroSetores;
    return res.redirect(req.session.usuario.tipo_usuario === 'administrador' ? '/eventos/novo' : '/organizador/eventos/novo');
  }

  const status_evento = req.session.usuario.tipo_usuario === 'administrador' ? 'aprovado' : 'pendente';

  const eventoId = await Evento.criar({
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
  await SetorEvento.criarVarios(eventoId, setores);
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
  const setores = await SetorEvento.listarPorEvento(req.params.id);
  res.render('editar_evento', { titulo: 'Editar Evento', evento, categorias, setores });
};

exports.atualizar = async (req, res) => {
  const evento = await Evento.buscarPorId(req.params.id);
  if (!evento || !podeGerenciar(req.session.usuario, evento)) {
    req.session.erro = 'Você não tem permissão para atualizar este evento.';
    return res.redirect('/eventos');
  }

  const dadosEvento = {
    ...req.body,
    capacidade_maxima: normalizarSetores(req.body).length ? somaCapacidadeSetores(normalizarSetores(req.body)) : 0,
    preco_ingresso: normalizarSetores(req.body).length ? menorPrecoSetores(normalizarSetores(req.body)) : 0,
    status_evento: req.session.usuario.tipo_usuario === 'administrador' ? req.body.status_evento : evento.status_evento,
    imagem: req.file ? `/img/eventos/${req.file.filename}` : evento.imagem
  };

  const setores = normalizarSetores(req.body);
  if (!setores.length) {
    req.session.erro = 'Gere pelo menos um setor com capacidade e valor.';
    return res.redirect(req.session.usuario.tipo_usuario === 'administrador' ? `/eventos/${req.params.id}/editar` : `/organizador/eventos/editar/${req.params.id}`);
  }

  await Evento.atualizar(req.params.id, dadosEvento);
  await SetorEvento.substituirDoEvento(req.params.id, setores);
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

function normalizarSetores(body) {
  const nomes = Array.isArray(body.setor_nome) ? body.setor_nome : body.setor_nome ? [body.setor_nome] : [];
  const ids = Array.isArray(body.setor_id) ? body.setor_id : body.setor_id ? [body.setor_id] : [];
  const capacidades = Array.isArray(body.setor_capacidade) ? body.setor_capacidade : body.setor_capacidade ? [body.setor_capacidade] : [];
  const precos = Array.isArray(body.setor_preco) ? body.setor_preco : body.setor_preco ? [body.setor_preco] : [];

  return nomes
    .map((nome, index) => ({
      id: ids[index] || null,
      nome,
      capacidade: Number(capacidades[index] || 0),
      preco: Number(precos[index] || 0)
    }))
    .filter((setor) => setor.nome && setor.capacidade > 0);
}

function validarSetores(setores, capacidadeMaxima) {
  if (!setores.length) return null;

  const capacidadeEvento = Number(capacidadeMaxima || 0);
  const somaSetores = setores.reduce((total, setor) => total + Number(setor.capacidade || 0), 0);

  if (somaSetores > capacidadeEvento) {
    return `A soma das capacidades dos setores (${somaSetores}) não pode ser maior que a capacidade total do evento (${capacidadeEvento}).`;
  }

  return null;
}

function somaCapacidadeSetores(setores) {
  return setores.reduce((total, setor) => total + Number(setor.capacidade || 0), 0);
}

function menorPrecoSetores(setores) {
  return Math.min(...setores.map((setor) => Number(setor.preco || 0)));
}
