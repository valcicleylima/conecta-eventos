CREATE DATABASE IF NOT EXISTS gestao_eventos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestao_eventos;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('administrador', 'organizador', 'cliente') NOT NULL DEFAULT 'cliente',
  bloqueado TINYINT(1) NOT NULL DEFAULT 0,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categorias_eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  descricao VARCHAR(255)
);

CREATE TABLE eventos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT NOT NULL,
  data_evento DATE NOT NULL,
  horario TIME NOT NULL,
  local VARCHAR(150) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  capacidade_maxima INT NOT NULL,
  preco_ingresso DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  imagem VARCHAR(500),
  status_evento ENUM('pendente', 'aprovado', 'rejeitado', 'cancelado') NOT NULL DEFAULT 'pendente',
  categoria_id INT NOT NULL,
  criador_id INT NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_evento_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_eventos(id),
  CONSTRAINT fk_evento_criador FOREIGN KEY (criador_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE solicitacoes_organizador (
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

CREATE TABLE inscricoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  evento_id INT NOT NULL,
  status_inscricao ENUM('pendente', 'confirmada', 'cancelada') NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_inscricao_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  CONSTRAINT fk_inscricao_evento FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE
);

CREATE TABLE pagamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inscricao_id INT NOT NULL UNIQUE,
  valor DECIMAL(10,2) NOT NULL,
  metodo_pagamento ENUM('pix', 'cartao', 'boleto') NOT NULL,
  status_pagamento ENUM('pendente', 'aprovado', 'recusado', 'cancelado') NOT NULL DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  pago_em DATETIME NULL,
  CONSTRAINT fk_pagamento_inscricao FOREIGN KEY (inscricao_id) REFERENCES inscricoes(id) ON DELETE CASCADE
);

CREATE TABLE recuperacoes_senha (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  codigo VARCHAR(10) NOT NULL,
  usado TINYINT(1) NOT NULL DEFAULT 0,
  expira_em DATETIME NOT NULL,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_recuperacao_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

INSERT INTO categorias_eventos (nome, descricao) VALUES
('Tecnologia', 'Eventos de tecnologia, programação e inovação'),
('Educação', 'Cursos, palestras e encontros acadêmicos'),
('Cultura', 'Shows, exposições e eventos culturais'),
('Negócios', 'Feiras, congressos e networking empresarial'),
('Esportes', 'Competições e atividades esportivas');
