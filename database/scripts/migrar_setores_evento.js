require('dotenv').config();
const mysql = require('mysql2/promise');

async function colunaExiste(conn, database, tabela, coluna) {
  const [rows] = await conn.execute(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [database, tabela, coluna]
  );
  return rows.length > 0;
}

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  await conn.query(`
    CREATE TABLE IF NOT EXISTS setores_evento (
      id INT AUTO_INCREMENT PRIMARY KEY,
      evento_id INT NOT NULL,
      nome VARCHAR(100) NOT NULL,
      capacidade INT NOT NULL,
      preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_setor_evento FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
    )
  `);

  const database = process.env.DB_NAME;
  if (!(await colunaExiste(conn, database, 'inscricoes', 'setor_id'))) {
    await conn.query('ALTER TABLE inscricoes ADD COLUMN setor_id INT NULL AFTER evento_id');
    await conn.query('ALTER TABLE inscricoes ADD CONSTRAINT fk_inscricao_setor FOREIGN KEY (setor_id) REFERENCES setores_evento(id) ON DELETE SET NULL');
  }
  if (!(await colunaExiste(conn, database, 'inscricoes', 'quantidade'))) {
    await conn.query('ALTER TABLE inscricoes ADD COLUMN quantidade INT NOT NULL DEFAULT 1 AFTER setor_id');
  }
  if (!(await colunaExiste(conn, database, 'inscricoes', 'valor_total'))) {
    await conn.query('ALTER TABLE inscricoes ADD COLUMN valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER quantidade');
    await conn.query('UPDATE inscricoes i JOIN eventos e ON e.id = i.evento_id SET i.valor_total = e.preco_ingresso WHERE i.valor_total = 0');
  }

  await conn.end();
  console.log('Migração de setores concluída.');
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
