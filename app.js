const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const inscricaoRoutes = require('./routes/inscricaoRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const organizadorRoutes = require('./routes/organizadorRoutes');
const solicitacaoRoutes = require('./routes/solicitacaoRoutes');
const siteRoutes = require('./routes/siteRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo-academico',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 2 }
}));

// Variáveis disponíveis em todas as views.
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.sucesso = req.session.sucesso || null;
  res.locals.erro = req.session.erro || null;
  delete req.session.sucesso;
  delete req.session.erro;
  next();
});

app.get('/', (req, res) => res.redirect('/eventos'));
app.use('/', siteRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/organizador', organizadorRoutes);
app.use('/eventos', eventoRoutes);
app.use('/inscricoes', inscricaoRoutes);
app.get('/minhas-inscricoes', (req, res) => res.redirect('/inscricoes/minhas'));
app.use('/pagamentos', pagamentoRoutes);
app.use('/pagamento', pagamentoRoutes);
app.use('/solicitar-organizador', solicitacaoRoutes);

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).render('erro', {
    titulo: 'Erro no sistema',
    mensagem: 'Não foi possível concluir a operação. Verifique o terminal, o MySQL e as configurações do arquivo .env.'
  });
});

app.use((req, res) => {
  res.status(404).render('erro', { titulo: 'Página não encontrada', mensagem: 'A página solicitada não existe.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sistema rodando em http://localhost:${PORT}`);
});
