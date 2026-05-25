USE gestao_eventos;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS bloqueado TINYINT(1) NOT NULL DEFAULT 0;

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
);

ALTER TABLE eventos
  MODIFY status_evento ENUM('ativo', 'inativo', 'encerrado', 'pendente', 'aprovado', 'rejeitado', 'cancelado') NOT NULL DEFAULT 'pendente';

UPDATE eventos SET status_evento = 'aprovado' WHERE status_evento = 'ativo';
UPDATE eventos SET status_evento = 'pendente' WHERE status_evento = 'inativo';
UPDATE eventos SET status_evento = 'cancelado' WHERE status_evento = 'encerrado';

ALTER TABLE eventos
  MODIFY status_evento ENUM('pendente', 'aprovado', 'rejeitado', 'cancelado') NOT NULL DEFAULT 'pendente';
