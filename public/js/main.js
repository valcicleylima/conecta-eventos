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

const setoresWrapper = document.querySelector('#setoresWrapper');
const quantidadeSetores = document.querySelector('#quantidadeSetores');
const gerarSetores = document.querySelector('#gerarSetores');
const setoresContainer = document.querySelector('#setoresContainer');

function criarLinhaSetor(index) {
  const row = document.createElement('div');
  row.className = 'row g-2 mb-2 setor-row';
  row.innerHTML = `
    <div class="col-md-4"><input name="setor_nome" class="form-control" placeholder="Nome do setor ${index}"></div>
    <div class="col-md-4"><input type="number" name="setor_capacidade" class="form-control" min="1" placeholder="Capacidade"></div>
    <div class="col-md-4"><input type="number" step="0.01" name="setor_preco" class="form-control" min="0" placeholder="Valor"></div>
  `;
  return row;
}

function atualizarSetores() {
  if (!setoresWrapper || !setoresContainer) return;
}
atualizarSetores();

if (gerarSetores) {
  gerarSetores.addEventListener('click', () => {
    setoresContainer.innerHTML = '';
    const total = Math.max(1, Number(quantidadeSetores.value || 1));
    for (let i = 1; i <= total; i++) {
      setoresContainer.appendChild(criarLinhaSetor(i));
    }
  });
}

const formEvento = document.querySelector('form.form-card');

function somaCapacidadeSetores() {
  return Array.from(document.querySelectorAll('input[name="setor_capacidade"]'))
    .reduce((total, input) => total + Number(input.value || 0), 0);
}

if (formEvento && setoresContainer) {
  formEvento.addEventListener('submit', (event) => {
    const totalSetores = somaCapacidadeSetores();

    if (totalSetores <= 0) {
      event.preventDefault();
      alert('Informe a capacidade dos setores.');
    }
  });
}
