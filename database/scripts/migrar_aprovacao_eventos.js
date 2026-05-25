require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
  const database = process.env.DB_NAME;
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database
  });

  const [cols] = await conn.execute(
    'SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND COLUMN_NAME = ?',
    [database, 'usuarios', 'bloqueado']
  );

  if (!cols.length) {
    await conn.execute('ALTER TABLE usuarios ADD COLUMN bloqueado TINYINT(1) NOT NULL DEFAULT 0');
    console.log('Coluna usuarios.bloqueado criada.');
  }

  await conn.query(`
    CREATE TABLE IF NOT EXISTS solicitacoes_organizador (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usuario_id INT NOT NULL,
      nome_completo VARCHAR(150) NOT NULL,
      telefone VARCHAR(30) NOT NULL,
      cpf_cnpj VARCHAR(30) NOT NULL,
      nome_organizacao VARCHAR(150) NOT NULL,
      descricao_organizacao TEXT NOT NULL,
      site_redes VARCHAR(255),
      status_solicitacao ENUM('pendente', 'aprovado', 'rejeitado') NOT NULL DEFAULT 'pendente',
      criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      analisado_em DATETIME NULL,
      CONSTRAINT fk_solicitacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    )
  `);

  await conn.query(`
    ALTER TABLE eventos
    MODIFY status_evento ENUM('ativo', 'inativo', 'encerrado', 'pendente', 'aprovado', 'rejeitado', 'cancelado') NOT NULL DEFAULT 'pendente'
  `);
  await conn.query("UPDATE eventos SET status_evento = 'aprovado' WHERE status_evento = 'ativo'");
  await conn.query("UPDATE eventos SET status_evento = 'pendente' WHERE status_evento = 'inativo'");
  await conn.query("UPDATE eventos SET status_evento = 'cancelado' WHERE status_evento = 'encerrado'");
  await conn.query(`
    ALTER TABLE eventos
    MODIFY status_evento ENUM('pendente', 'aprovado', 'rejeitado', 'cancelado') NOT NULL DEFAULT 'pendente'
  `);

  await conn.end();
  console.log('Migração concluída.');
})().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
