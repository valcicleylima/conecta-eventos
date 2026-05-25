const nodemailer = require('nodemailer');
require('dotenv').config();

function criarTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Configure SMTP_USER e SMTP_PASS no arquivo .env para enviar e-mails reais.');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

exports.enviarCodigoRecuperacao = async ({ para, nome, codigo }) => {
  const transporter = criarTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: para,
    subject: 'Codigo de recuperacao de senha',
    text: `Ola, ${nome}.\n\nSeu codigo de recuperacao de senha e: ${codigo}\n\nEle expira em 15 minutos.`,
    html: `
      <h2>Recuperacao de senha</h2>
      <p>Ola, <strong>${nome}</strong>.</p>
      <p>Seu codigo de recuperacao de senha e:</p>
      <h1 style="letter-spacing: 4px;">${codigo}</h1>
      <p>Ele expira em 15 minutos.</p>
    `
  });
};
