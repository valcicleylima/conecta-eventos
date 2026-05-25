const db = require('../config/db');

exports.criar = async ({ usuario_id, codigo, expira_em }) => {
  await db.execute(
    'UPDATE recuperacoes_senha SET usado = 1 WHERE usuario_id = ? AND usado = 0',
    [usuario_id]
  );

  const [result] = await db.execute(
    'INSERT INTO recuperacoes_senha (usuario_id, codigo, expira_em) VALUES (?, ?, ?)',
    [usuario_id, codigo, expira_em]
  );
  return result.insertId;
};

exports.buscarValido = async ({ email, codigo }) => {
  const [rows] = await db.execute(
    `SELECT r.*, u.email, u.nome
     FROM recuperacoes_senha r
     JOIN usuarios u ON u.id = r.usuario_id
     WHERE u.email = ?
       AND r.codigo = ?
       AND r.usado = 0
       AND r.expira_em >= NOW()
     ORDER BY r.criado_em DESC
     LIMIT 1`,
    [email, codigo]
  );
  return rows[0];
};

exports.marcarUsado = async (id) => {
  await db.execute('UPDATE recuperacoes_senha SET usado = 1 WHERE id = ?', [id]);
};
