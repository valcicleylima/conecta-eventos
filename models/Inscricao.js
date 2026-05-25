const db = require('../config/db');

exports.criar = async ({ usuario_id, evento_id, status_inscricao }) => {
  const [result] = await db.execute(
    'INSERT INTO inscricoes (usuario_id, evento_id, status_inscricao) VALUES (?, ?, ?)',
    [usuario_id, evento_id, status_inscricao]
  );
  return result.insertId;
};

exports.buscarPorUsuarioEvento = async (usuarioId, eventoId) => {
  const [rows] = await db.execute(
    'SELECT * FROM inscricoes WHERE usuario_id = ? AND evento_id = ? AND status_inscricao <> "cancelada"',
    [usuarioId, eventoId]
  );
  return rows[0];
};

exports.contarConfirmadasPorEvento = async (eventoId) => {
  const [rows] = await db.execute(
    'SELECT COUNT(*) AS total FROM inscricoes WHERE evento_id = ? AND status_inscricao = "confirmada"',
    [eventoId]
  );
  return rows[0].total;
};

exports.listarPorUsuario = async (usuarioId) => {
  const [rows] = await db.execute(
    `SELECT i.*, e.titulo, e.data_evento, e.horario, e.local, e.cidade, p.status_pagamento, p.metodo_pagamento, p.valor
     FROM inscricoes i
     JOIN eventos e ON e.id = i.evento_id
     LEFT JOIN pagamentos p ON p.inscricao_id = i.id
     WHERE i.usuario_id = ?
     ORDER BY i.criado_em DESC`,
    [usuarioId]
  );
  return rows;
};

exports.buscarPagamento = async (inscricaoId, usuarioId) => {
  const [rows] = await db.execute(
    `SELECT i.*, e.titulo, e.preco_ingresso, p.status_pagamento, p.metodo_pagamento, p.valor
     FROM inscricoes i
     JOIN eventos e ON e.id = i.evento_id
     LEFT JOIN pagamentos p ON p.inscricao_id = i.id
     WHERE i.id = ? AND i.usuario_id = ?`,
    [inscricaoId, usuarioId]
  );
  return rows[0];
};

exports.confirmar = async (inscricaoId, usuarioId) => {
  await db.execute(
    'UPDATE inscricoes SET status_inscricao = "confirmada" WHERE id = ? AND usuario_id = ?',
    [inscricaoId, usuarioId]
  );
};

exports.cancelar = async (inscricaoId, usuarioId) => {
  await db.execute(
    'UPDATE inscricoes SET status_inscricao = "cancelada" WHERE id = ? AND usuario_id = ?',
    [inscricaoId, usuarioId]
  );
};

exports.buscarComprovante = async (inscricaoId, usuarioId) => {
  const [rows] = await db.execute(
    `SELECT i.*, u.nome, u.email, e.titulo, e.data_evento, e.horario, e.local, e.cidade,
      p.metodo_pagamento, p.status_pagamento, p.valor
     FROM inscricoes i
     JOIN usuarios u ON u.id = i.usuario_id
     JOIN eventos e ON e.id = i.evento_id
     LEFT JOIN pagamentos p ON p.inscricao_id = i.id
     WHERE i.id = ? AND i.usuario_id = ?`,
    [inscricaoId, usuarioId]
  );
  return rows[0];
};

exports.contar = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM inscricoes');
  return rows[0].total;
};

exports.listarPorEvento = async (eventoId) => {
  const [rows] = await db.execute(
    `SELECT i.*, u.nome, u.email, p.status_pagamento, p.valor
     FROM inscricoes i
     JOIN usuarios u ON u.id = i.usuario_id
     LEFT JOIN pagamentos p ON p.inscricao_id = i.id
     WHERE i.evento_id = ?
     ORDER BY i.criado_em DESC`,
    [eventoId]
  );
  return rows;
};
