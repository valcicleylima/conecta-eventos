const Pagamento = require('../models/Pagamento');
const Inscricao = require('../models/Inscricao');

exports.telaPagamento = async (req, res) => {
  const inscricao = await Inscricao.buscarPagamento(req.params.inscricaoId, req.session.usuario.id);
  if (!inscricao) {
    req.session.erro = 'Inscricao nao encontrada.';
    return res.redirect('/inscricoes/minhas');
  }

  const valor = Number(inscricao.valor || inscricao.preco_ingresso || 0).toFixed(2);
  const dadosPagamento = gerarDadosSimulados(inscricao.id, valor);

  res.render('pagamento', { titulo: 'Pagamento', inscricao, dadosPagamento });
};

exports.processar = async (req, res) => {
  const { metodo_pagamento } = req.body;
  if (!['pix', 'cartao', 'boleto'].includes(metodo_pagamento)) {
    req.session.erro = 'Selecione uma forma de pagamento valida.';
    return res.redirect(`/pagamentos/${req.params.inscricaoId}`);
  }

  // Simulacao academica: todo pagamento enviado e aprovado automaticamente.
  await Pagamento.aprovar(req.params.inscricaoId, metodo_pagamento);
  await Inscricao.confirmar(req.params.inscricaoId, req.session.usuario.id);
  req.session.sucesso = 'Pagamento aprovado e inscricao confirmada.';
  res.redirect('/inscricoes/minhas');
};

function gerarDadosSimulados(inscricaoId, valor) {
  const base = String(inscricaoId).padStart(6, '0');
  const centavos = String(Math.round(Number(valor) * 100)).padStart(8, '0');
  const chavePix = `pix-${base}-${Date.now().toString().slice(-6)}@conectaeventos.com.br`;
  const payloadPix = `PIX|CONTA=Conecta Eventos|CHAVE=${chavePix}|VALOR=${valor}|INSCRICAO=${inscricaoId}`;

  return {
    chavePix,
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(payloadPix)}`,
    boletoLinha: `23790.0000${base.slice(0, 2)} 60000.${base.slice(2, 6)}00 90000.000001 1 ${centavos}`,
    boletoCodigo: `34191${base}000000${centavos}2026`,
    valor
  };
}
