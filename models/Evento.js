const db = require('../config/db');

const selectEvento = `
  SELECT e.*, c.nome AS categoria_nome, u.nome AS organizador_nome,
    (SELECT COUNT(*) FROM inscricoes i WHERE i.evento_id = e.id AND i.status_inscricao = 'confirmada') AS vagas_ocupadas
  FROM eventos e
  JOIN categorias_eventos c ON c.id = e.categoria_id
  JOIN usuarios u ON u.id = e.criador_id
`;

exports.criar = async (evento) => {
  const [result] = await db.execute(
    `INSERT INTO eventos
      (titulo, descricao, data_evento, horario, local, cidade, capacidade_maxima, preco_ingresso, imagem, status_evento, categoria_id, criador_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      evento.titulo,
      evento.descricao,
      evento.data_evento,
      evento.horario,
      evento.local,
      evento.cidade,
      evento.capacidade_maxima,
      evento.preco_ingresso,
      evento.imagem || null,
      evento.status_evento,
      evento.categoria_id,
      evento.criador_id
    ]
  );
  return result.insertId;
};

function termoBusca(q) {
  return `%${String(q || '').trim()}%`;
}

exports.listarPublicos = async (q = '') => {
  const params = [];
  let where = "WHERE e.status_evento = 'aprovado'";
  if (q) {
    where += ' AND (e.titulo LIKE ? OR e.descricao LIKE ? OR e.local LIKE ? OR e.cidade LIKE ? OR c.nome LIKE ? OR u.nome LIKE ?)';
    params.push(...Array(6).fill(termoBusca(q)));
  }
  const [rows] = await db.execute(`${selectEvento} ${where} ORDER BY e.data_evento ASC, e.horario ASC`, params);
  return rows;
};

exports.buscarPorId = async (id) => {
  const [rows] = await db.execute(`${selectEvento} WHERE e.id = ?`, [id]);
  return rows[0];
};

exports.atualizar = async (id, evento) => {
  await db.execute(
    `UPDATE eventos SET
      titulo = ?, descricao = ?, data_evento = ?, horario = ?, local = ?, cidade = ?,
      capacidade_maxima = ?, preco_ingresso = ?, imagem = ?, status_evento = ?, categoria_id = ?
     WHERE id = ?`,
    [
      evento.titulo,
      evento.descricao,
      evento.data_evento,
      evento.horario,
      evento.local,
      evento.cidade,
      evento.capacidade_maxima,
      evento.preco_ingresso,
      evento.imagem || null,
      evento.status_evento,
      evento.categoria_id,
      id
    ]
  );
};

exports.excluir = async (id) => {
  await db.execute('DELETE FROM eventos WHERE id = ?', [id]);
};

exports.cancelar = async (id) => {
  await db.execute('UPDATE eventos SET status_evento = "cancelado" WHERE id = ?', [id]);
};

exports.aprovar = async (id) => {
  await db.execute('UPDATE eventos SET status_evento = "aprovado" WHERE id = ?', [id]);
};

exports.rejeitar = async (id) => {
  await db.execute('UPDATE eventos SET status_evento = "rejeitado" WHERE id = ?', [id]);
};

exports.listarTodos = async ({ q = '', status = '' } = {}) => {
  const filtros = [];
  const params = [];
  if (q) {
    filtros.push('(e.titulo LIKE ? OR e.descricao LIKE ? OR e.local LIKE ? OR e.cidade LIKE ? OR c.nome LIKE ? OR u.nome LIKE ?)');
    params.push(...Array(6).fill(termoBusca(q)));
  }
  if (status) {
    filtros.push('e.status_evento = ?');
    params.push(status);
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [rows] = await db.execute(`${selectEvento} ${where} ORDER BY e.criado_em DESC`, params);
  return rows;
};

exports.listarPendentes = async (q = '') => {
  const params = [];
  let where = "WHERE e.status_evento = 'pendente'";
  if (q) {
    where += ' AND (e.titulo LIKE ? OR e.local LIKE ? OR e.cidade LIKE ? OR c.nome LIKE ? OR u.nome LIKE ?)';
    params.push(...Array(5).fill(termoBusca(q)));
  }
  const [rows] = await db.execute(`${selectEvento} ${where} ORDER BY e.criado_em DESC`, params);
  return rows;
};

exports.listarPorCriador = async (criadorId) => {
  const [rows] = await db.execute(
    `${selectEvento} WHERE e.criador_id = ? ORDER BY e.criado_em DESC`,
    [criadorId]
  );
  return rows;
};

exports.dashboardOrganizador = async (criadorId, { q = '', status = '' } = {}) => {
  const params = [criadorId];
  let filtros = 'WHERE e.criador_id = ?';
  if (q) {
    filtros += ' AND (e.titulo LIKE ? OR e.local LIKE ? OR e.cidade LIKE ? OR e.status_evento LIKE ?)';
    params.push(...Array(4).fill(termoBusca(q)));
  }
  if (status) {
    filtros += ' AND e.status_evento = ?';
    params.push(status);
  }
  const [rows] = await db.execute(
    `SELECT e.id, e.titulo, e.status_evento,
      COUNT(DISTINCT i.id) AS total_inscritos,
      COALESCE(SUM(CASE WHEN p.status_pagamento = 'aprovado' THEN p.valor ELSE 0 END), 0) AS total_arrecadado
     FROM eventos e
     LEFT JOIN inscricoes i ON i.evento_id = e.id AND i.status_inscricao <> 'cancelada'
     LEFT JOIN pagamentos p ON p.inscricao_id = i.id
     ${filtros}
     GROUP BY e.id
     ORDER BY e.criado_em DESC`,
    params
  );
  return rows;
};

exports.contarPorStatus = async (status) => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM eventos WHERE status_evento = ?', [status]);
  return rows[0].total;
};

exports.contar = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM eventos');
  return rows[0].total;
};
