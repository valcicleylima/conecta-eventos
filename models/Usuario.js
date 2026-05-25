const db = require('../config/db');

exports.criar = async ({ nome, email, senha, tipo_usuario }) => {
  const [result] = await db.execute(
    'INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES (?, ?, ?, ?)',
    [nome, email, senha, tipo_usuario || 'cliente']
  );
  return result.insertId;
};

exports.buscarPorEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
};

exports.atualizarSenha = async (id, senha) => {
  await db.execute('UPDATE usuarios SET senha = ? WHERE id = ?', [senha, id]);
};

exports.listar = async () => {
  const [rows] = await db.execute('SELECT id, nome, email, tipo_usuario, bloqueado, criado_em FROM usuarios ORDER BY nome');
  return rows;
};

exports.pesquisar = async ({ q = '', perfil = '', bloqueado = '' } = {}) => {
  const filtros = [];
  const params = [];
  if (q) {
    const termo = `%${q}%`;
    filtros.push(`(
      u.nome LIKE ? OR u.email LIKE ? OR u.tipo_usuario LIKE ?
      OR EXISTS (
        SELECT 1 FROM solicitacoes_organizador s
        WHERE s.usuario_id = u.id
        AND (s.cpf_cnpj LIKE ? OR s.telefone LIKE ? OR s.nome_organizacao LIKE ?)
      )
    )`);
    params.push(termo, termo, termo, termo, termo, termo);
  }
  if (perfil) {
    filtros.push('u.tipo_usuario = ?');
    params.push(perfil);
  }
  if (bloqueado !== '') {
    filtros.push('u.bloqueado = ?');
    params.push(Number(bloqueado));
  }
  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `SELECT u.id, u.nome, u.email, u.tipo_usuario, u.bloqueado, u.criado_em
     FROM usuarios u
     ${where}
     ORDER BY u.nome`,
    params
  );
  return rows;
};

exports.atualizar = async (id, { nome, email, tipo_usuario, bloqueado }) => {
  await db.execute(
    'UPDATE usuarios SET nome = ?, email = ?, tipo_usuario = ?, bloqueado = ? WHERE id = ?',
    [nome, email, tipo_usuario, Number(bloqueado || 0), id]
  );
};

exports.alterarPerfil = async (id, tipoUsuario) => {
  await db.execute('UPDATE usuarios SET tipo_usuario = ? WHERE id = ?', [tipoUsuario, id]);
};

exports.excluir = async (id) => {
  await db.execute('DELETE FROM usuarios WHERE id = ?', [id]);
};

exports.contar = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM usuarios');
  return rows[0].total;
};

exports.contarPorPerfil = async (perfil) => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM usuarios WHERE tipo_usuario = ?', [perfil]);
  return rows[0].total;
};
