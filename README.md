# Conecta Eventos

Sistema academico completo feito com Node.js, Express, EJS, MySQL e Bootstrap.

## Funcionalidades

- Cadastro, login, logout e sessao com `express-session`
- Senhas em texto puro temporariamente para facilitar testes academicos
- Perfis: cliente/participante, organizador e administrador
- Cliente visualiza eventos aprovados, inscreve-se, paga e acompanha suas inscricoes
- Cliente pode solicitar perfil de organizador
- Administrador aprova ou rejeita solicitacoes de organizador
- Organizador cria eventos, mas os eventos ficam como `pendente`
- Administrador aprova ou rejeita eventos pendentes
- Somente eventos `aprovado` aparecem na area publica
- Organizador gerencia apenas seus proprios eventos
- Administrador gerencia usuarios, perfis, bloqueios e todos os eventos
- Dashboard administrativo e dashboard do organizador
- Pesquisa de eventos na area publica, no painel do organizador e na area administrativa
- Pesquisa administrativa de usuarios por nome, e-mail, perfil, CPF/CNPJ, telefone ou organizacao
- Pesquisa administrativa de solicitacoes de organizador por CPF/CNPJ, telefone, e-mail ou organizacao
- Upload de imagem do evento a partir do computador ou celular
- Pagamento simulado por Pix, cartao ou boleto
- Recuperacao de senha por codigo enviado ao e-mail cadastrado
- Comprovante de inscricao
- Banco MySQL com chaves primarias, estrangeiras e relacionamentos

## Perfis

### Cliente/participante

- Cria conta
- Faz login
- Visualiza eventos aprovados
- Inscreve-se em eventos
- Paga inscricao/ingresso
- Visualiza e cancela suas inscricoes
- Solicita permissao para virar organizador

### Organizador

- Acessa `/organizador/dashboard`
- Cria eventos
- Edita apenas seus proprios eventos
- Visualiza inscritos e pagamentos dos seus eventos
- Cancela seus proprios eventos
- Eventos criados por organizador entram como `pendente`

### Administrador

- Acessa `/admin/dashboard`
- Aprova ou rejeita eventos
- Aprova ou rejeita solicitacoes de organizador
- Edita e exclui qualquer evento
- Gerencia usuarios, perfis e bloqueios
- Visualiza indicadores gerais do sistema

## Fluxo de aprovacao de eventos

1. Organizador cria um evento.
2. O evento fica com status `pendente`.
3. Administrador acessa `/admin/eventos-pendentes`.
4. Administrador aprova ou rejeita o evento.
5. Apenas eventos `aprovado` aparecem em `/eventos`.
6. Eventos `rejeitado` ou `cancelado` nao aparecem publicamente.

Evento criado por administrador ja entra como `aprovado`.

## Fluxo para virar organizador

1. Cliente acessa `/solicitar-organizador`.
2. O sistema usa automaticamente o nome cadastrado do usuario.
3. Cliente preenche telefone, CPF/CNPJ, organizacao, descricao e site/redes.
4. Solicitacao fica como `pendente`.
5. Administrador acessa `/admin/solicitacoes-organizador`.
6. Se aprovar, o usuario vira `organizador`.

## Estrutura

```text
config/
controllers/
models/
routes/
views/
public/
  css/
  img/
  js/
database/
```

## Como instalar e rodar

1. Instale as dependencias:

```bash
npm install
```

2. Configure `.env`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=123456
DB_NAME=gestao_eventos
SESSION_SECRET=sistema-eventos-academico
PORT=3000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-do-google
SMTP_FROM=Conecta Eventos <seu-email@gmail.com>
```

3. Crie o banco e importe o SQL:

```bash
mysql -u root -p < database/schema.sql
```

4. Para atualizar um banco antigo deste projeto, rode:

```bash
node database/scripts/migrar_aprovacao_eventos.js
node database/scripts/migrar_recuperacao_senha.js
```

5. Inicie o sistema:

```bash
npm start
```

6. Acesse:

```text
http://localhost:3000
```

## Recuperacao de senha por e-mail

O sistema envia um codigo de 6 digitos para o e-mail cadastrado do usuario.

Fluxo:

1. Usuario acessa `/esqueci-senha`.
2. Informa o e-mail cadastrado.
3. Sistema envia um codigo por SMTP.
4. Usuario acessa `/redefinir-senha`.
5. Informa e-mail, codigo e nova senha.
6. O codigo expira em 15 minutos e so pode ser usado uma vez.

Para Gmail, use senha de app, nao a senha normal da conta:

```text
Conta Google > Seguranca > Verificacao em duas etapas > Senhas de app
```

## Rotas principais

- `/login`
- `/cadastro`
- `/esqueci-senha`
- `/redefinir-senha`
- `/eventos`
- `/eventos/:id`
- `/minhas-inscricoes`
- `/pagamento/:id`
- `/solicitar-organizador`
- `/organizador/dashboard`
- `/organizador/eventos`
- `/organizador/eventos/novo`
- `/organizador/eventos/editar/:id`
- `/admin/dashboard`
- `/admin/eventos`
- `/admin/eventos-pendentes`
- `/admin/solicitacoes-organizador`
- `/admin/usuarios`

## Observacoes

- A criptografia de senha foi retirada temporariamente a pedido do usuario. Para uso real, reative `bcrypt`.
- As consultas usam prepared statements com `mysql2`.
- As rotas privadas usam middlewares de sessao e controle de perfil.
