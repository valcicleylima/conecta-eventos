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
  const idsMantidos = [];

  for (const setor of setores) {
    if (!setor.nome || !setor.capacidade || setor.preco === undefined) continue;

    if (setor.id) {
      await db.execute(
        'UPDATE setores_evento SET nome = ?, capacidade = ?, preco = ? WHERE id = ? AND evento_id = ?',
        [setor.nome, setor.capacidade, setor.preco, setor.id, eventoId]
      );
      idsMantidos.push(Number(setor.id));
    } else {
      const [result] = await db.execute(
        'INSERT INTO setores_evento (evento_id, nome, capacidade, preco) VALUES (?, ?, ?, ?)',
        [eventoId, setor.nome, setor.capacidade, setor.preco]
      );
      idsMantidos.push(result.insertId);
    }
  }

  // Remove apenas setores sem inscrições. Setores já vendidos permanecem para manter histórico correto.
  if (idsMantidos.length) {
    const placeholders = idsMantidos.map(() => '?').join(',');
    await db.execute(
      `DELETE s FROM setores_evento s
       LEFT JOIN inscricoes i ON i.setor_id = s.id
       WHERE s.evento_id = ?
         AND s.id NOT IN (${placeholders})
         AND i.id IS NULL`,
      [eventoId, ...idsMantidos]
    );
  }
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
