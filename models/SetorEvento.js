const db = require('../config/db');

exports.criarVarios = async (eventoId, setores = []) => {
  for (const setor of setores) {
    if (!setor.nome || !setor.capacidade || setor.preco === undefined) continue;
    await db.execute(
      'INSERT INTO setores_evento (evento_id, nome, capacidade, preco) VALUES (?, ?, ?, ?)',
      [eventoId, setor.nome, setor.capacidade, setor.preco]
    );
  }
};

exports.substituirDoEvento = async (eventoId, setores = []) => {
  await db.execute('DELETE FROM setores_evento WHERE evento_id = ?', [eventoId]);
  await exports.criarVarios(eventoId, setores);
};

exports.listarPorEvento = async (eventoId) => {
  const [rows] = await db.execute(
    `SELECT s.*,
      COALESCE(SUM(CASE WHEN i.status_inscricao = 'confirmada' THEN i.quantidade ELSE 0 END), 0) AS vendidos,
      s.capacidade - COALESCE(SUM(CASE WHEN i.status_inscricao = 'confirmada' THEN i.quantidade ELSE 0 END), 0) AS disponiveis
     FROM setores_evento s
     LEFT JOIN inscricoes i ON i.setor_id = s.id
     WHERE s.evento_id = ?
     GROUP BY s.id
     ORDER BY s.id`,
    [eventoId]
  );
  return rows;
};

exports.buscarPorId = async (id) => {
  const [rows] = await db.execute('SELECT * FROM setores_evento WHERE id = ?', [id]);
  return rows[0];
};
