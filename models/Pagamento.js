const db = require('../config/db');

exports.criar = async ({ inscricao_id, valor, metodo_pagamento, status_pagamento }) => {
  const [result] = await db.execute(
    'INSERT INTO pagamentos (inscricao_id, valor, metodo_pagamento, status_pagamento) VALUES (?, ?, ?, ?)',
    [inscricao_id, valor, metodo_pagamento, status_pagamento]
  );
  return result.insertId;
};

exports.aprovar = async (inscricaoId, metodoPagamento) => {
  await db.execute(
    'UPDATE pagamentos SET metodo_pagamento = ?, status_pagamento = "aprovado", pago_em = NOW() WHERE inscricao_id = ?',
    [metodoPagamento, inscricaoId]
  );
};

exports.cancelarPorInscricao = async (inscricaoId) => {
  await db.execute(
    'UPDATE pagamentos SET status_pagamento = "cancelado" WHERE inscricao_id = ? AND status_pagamento <> "aprovado"',
    [inscricaoId]
  );
};

exports.contar = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) AS total FROM pagamentos');
  return rows[0].total;
};

exports.listarTodos = async () => {
  const [rows] = await db.execute(
    `SELECT p.*, u.nome AS usuario_nome, e.titulo AS evento_titulo
     FROM pagamentos p
     JOIN inscricoes i ON i.id = p.inscricao_id
     JOIN usuarios u ON u.id = i.usuario_id
     JOIN eventos e ON e.id = i.evento_id
     ORDER BY p.criado_em DESC`
  );
  return rows;
};
