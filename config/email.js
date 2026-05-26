const nodemailer = require('nodemailer');
require('dotenv').config();

function criarTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('Configure SMTP_USER e SMTP_PASS no arquivo .env para enviar e-mails reais.');
  }

  const senhaApp = process.env.SMTP_PASS.replace(/\s/g, '');
  const configBase = {
    requireTLS: process.env.SMTP_SECURE !== 'true',
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    auth: {
      user: process.env.SMTP_USER,
      pass: senhaApp
    }
  };

  return nodemailer.createTransport({
    ...configBase,
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE === 'true'
  });
}

function limitarTempo(promise, tempoMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Tempo limite excedido ao enviar e-mail SMTP.'));
      }, tempoMs);
    })
  ]);
}

exports.enviarCodigoRecuperacao = async ({ para, nome, codigo }) => {
  const transporter = criarTransporter();

  try {
    await limitarTempo(transporter.sendMail({
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
    }), 17000);
  } finally {
    transporter.close();
  }
};
