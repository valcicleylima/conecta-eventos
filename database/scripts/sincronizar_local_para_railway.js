require('dotenv').config();
const mysql = require('mysql2/promise');

const tabelas = [
  'usuarios',
  'categorias_eventos',
  'eventos',
  'setores_evento',
  'inscricoes',
  'pagamentos',
  'solicitacoes_organizador',
  'recuperacoes_senha'
];

function conexaoLocal() {
  return {
    host: process.env.LOCAL_DB_HOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.LOCAL_DB_PORT || process.env.DB_PORT || 3306),
    user: process.env.LOCAL_DB_USER || process.env.DB_USER || 'root',
    password: process.env.LOCAL_DB_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.LOCAL_DB_NAME || process.env.DB_NAME || 'gestao_eventos'
  };
}

function conexaoRailway() {
  return {
    host: process.env.RAILWAY_DB_HOST,
    port: Number(process.env.RAILWAY_DB_PORT || 3306),
    user: process.env.RAILWAY_DB_USER,
    password: process.env.RAILWAY_DB_PASSWORD,
    database: process.env.RAILWAY_DB_NAME
  };
}

function montarInsert(table, row) {
  const columns = Object.keys(row);
  const placeholders = columns.map(() => '?').join(',');
  const escapedColumns = columns.map((column) => `\`${column}\``).join(',');
  const updates = columns.map((column) => `\`${column}\`=VALUES(\`${column}\`)`).join(',');

  return {
    sql: `INSERT INTO \`${table}\` (${escapedColumns}) VALUES (${placeholders}) ON DUPLICATE KEY UPDATE ${updates}`,
    values: columns.map((column) => row[column])
  };
}

(async () => {
  const railway = conexaoRailway();
  if (!railway.host || !railway.user || !railway.password || !railway.database) {
    throw new Error('Configure RAILWAY_DB_HOST, RAILWAY_DB_USER, RAILWAY_DB_PASSWORD e RAILWAY_DB_NAME.');
  }

  const origem = await mysql.createConnection(conexaoLocal());
  const destino = await mysql.createConnection(railway);

  await destino.query('SET FOREIGN_KEY_CHECKS=0');

  for (const tabela of tabelas) {
    const [rows] = await origem.query(`SELECT * FROM \`${tabela}\``);
    for (const row of rows) {
      const query = montarInsert(tabela, row);
      await destino.execute(query.sql, query.values);
    }
    console.log(`${tabela}: ${rows.length} registros sincronizados`);
  }

  await destino.query('SET FOREIGN_KEY_CHECKS=1');
  await origem.end();
  await destino.end();

  console.log('Dados locais enviados para o Railway com sucesso.');
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
