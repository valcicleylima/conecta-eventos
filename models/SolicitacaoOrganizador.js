const db = require('../config/db');

exports.criar = async (dados) => {
  const [result] = await db.execute(
    `INSERT INTO solicitacoes_organizador
      (usuario_id, nome_completo, telefone, cpf_cnpj, nome_organizacao, descricao_organizacao, site_redes, status_solicitacao)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente')`,
    [
      dados.usuario_id,
      dados.nome_completo,
      dados.telefone,
      dados.cpf_cnpj,
      dados.nome_organizacao,
      dados.descricao_organizacao,
      dados.site_redes || null
    ]
  );
  return result.insertId;
};

exports.buscarPendentePorUsuario = async (usuarioId) => {
  const [rows] = await db.execute(
    'SELECT * FROM solicitacoes_organizador WHERE usuario_id = ? AND status_solicitacao = "pendente"',
    [usuarioId]
  );
  return rows[0];
};

exports.listarPendentes = async (q = '') => {
  const params = [];
  let filtro = "WHERE s.status_solicitacao = 'pendente'";
  if (q) {
    const termo = `%${q}%`;
    filtro += ` AND (
      s.nome_completo LIKE ? OR s.telefone LIKE ? OR s.cpf_cnpj LIKE ?
      OR s.nome_organizacao LIKE ? OR s.descricao_organizacao LIKE ?
      OR s.site_redes LIKE ? OR u.nome LIKE ? OR u.email LIKE ?
    )`;
    params.push(termo, termo, termo, termo, termo, termo, termo, termo);
  }
  const [rows] = await db.execute(
    `SELECT s.*, u.nome AS usuario_nome, u.email
     FROM solicitacoes_organizador s
     JOIN usuarios u ON u.id = s.usuario_id
     ${filtro}
     ORDER BY s.criado_em DESC`,
    params
  );
  return rows;
};

exports.aprovar = async (id) => {
  await db.execute('UPDATE solicitacoes_organizador SET status_solicitacao = "aprovado", analisado_em = NOW() WHERE id = ?', [id]);
};

exports.rejeitar = async (id) => {
  await db.execute('UPDATE solicitacoes_organizador SET status_solicitacao = "rejeitado", analisado_em = NOW() WHERE id = ?', [id]);
};

exports.buscarPorId = async (id) => {
  const [rows] = await db.execute('SELECT * FROM solicitacoes_organizador WHERE id = ?', [id]);
  return rows[0];
};

exports.contarPendentes = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM solicitacoes_organizador WHERE status_solicitacao = "pendente"');
  return rows[0].total;
};
