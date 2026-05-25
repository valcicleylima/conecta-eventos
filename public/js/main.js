document.querySelectorAll('form[data-confirm]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    const mensagem = form.getAttribute('data-confirm') || 'Confirmar ação?';
    if (!confirm(mensagem)) {
      event.preventDefault();
    }
  });
});

const metodoPagamento = document.querySelector('#metodoPagamento');
const paineisPagamento = document.querySelectorAll('[data-payment-panel]');

function atualizarPainelPagamento() {
  if (!metodoPagamento) return;
  paineisPagamento.forEach((painel) => {
    painel.classList.toggle('d-none', painel.dataset.paymentPanel !== metodoPagamento.value);
  });
}

if (metodoPagamento) {
  metodoPagamento.addEventListener('change', atualizarPainelPagamento);
  atualizarPainelPagamento();
}
