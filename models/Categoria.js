const db = require('../config/db');

exports.listar = async () => {
  const [rows] = await db.execute('SELECT * FROM categorias_eventos ORDER BY nome');
  return rows;
};
