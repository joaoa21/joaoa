/* "Começar meu projeto": modal em três etapas que monta a mensagem e abre o WhatsApp.
   Os botões .brief-open são links para o WhatsApp; com JavaScript, abrem o modal.
   Os textos vêm do próprio HTML (já traduzidos na versão em inglês). */
(() => {
  const dialog = document.getElementById('brief');
  if (!dialog || typeof dialog.showModal !== 'function') return;

  const en = document.documentElement.lang === 'en';
  const PHONE = '5581988780144';
  const form = dialog.querySelector('form');
  const steps = [...dialog.querySelectorAll('.brief-step')];
  const labels = [...dialog.querySelectorAll('.brief-steps li')];
  const bar = dialog.querySelector('.brief-progress span');
  const error = dialog.querySelector('.brief-error');
  const back = dialog.querySelector('.brief-back');
  const next = dialog.querySelector('.brief-next');
  const nextLabel = next.querySelector('span');
  const done = dialog.querySelector('.brief-done');
  const doneLink = dialog.querySelector('.brief-done a');
  const foot = dialog.querySelector('.brief-foot');
  const T = en
    ? { next: 'Next', send: 'Send on WhatsApp', pick: 'Choose an option to continue.', name: 'Tell me your name to continue.' }
    : { next: 'Próximo', send: 'Enviar pelo WhatsApp', pick: 'Escolha uma opção para continuar.', name: 'Diga o seu nome para continuar.' };
  let current = 0;

  function show(index) {
    current = index;
    steps.forEach((step, i) => { step.hidden = i !== index; });
    labels.forEach((label, i) => {
      label.classList.toggle('is-current', i === index);
      label.classList.toggle('is-done', i < index);
    });
    bar.style.width = `${((index + 1) / steps.length) * 100}%`;
    back.hidden = index === 0;
    nextLabel.textContent = index === steps.length - 1 ? T.send : T.next;
    error.textContent = '';
  }

  function reset() {
    form.reset();
    done.hidden = true;
    foot.hidden = false;
    dialog.querySelector('.brief-progress').hidden = false;
    dialog.querySelector('.brief-steps').hidden = false;
    show(0);
  }

  function checked(name) {
    const input = form.querySelector(`input[name="${name}"]:checked`);
    return input ? input.closest('label').textContent.trim() : '';
  }

  function valid() {
    if (current === 0 && !checked('servico')) { error.textContent = T.pick; return false; }
    if (current === steps.length - 1 && !form.elements.nome.value.trim()) {
      error.textContent = T.name;
      form.elements.nome.focus();
      return false;
    }
    return true;
  }

  function message() {
    const v = (name) => form.elements[name]?.value.trim() || '';
    const lines = en
      ? [`Hi, João! I'm ${v('nome')}${v('empresa') ? ` (${v('empresa')})` : ''} and I'd like to start a project.`, '', `• Service: ${checked('servico')}`]
      : [`Oi, João! Sou ${v('nome')}${v('empresa') ? ` (${v('empresa')})` : ''} e quero começar um projeto.`, '', `• Serviço: ${checked('servico')}`];
    if (v('objetivo')) lines.push(`${en ? '• Main goal' : '• Objetivo'}: ${v('objetivo')}`);
    if (checked('prazo')) lines.push(`${en ? '• Timeline' : '• Prazo'}: ${checked('prazo')}`);
    if (v('detalhes')) lines.push(`${en ? '• Details' : '• Detalhes'}: ${v('detalhes')}`);
    return lines.join('\n');
  }

  function send() {
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message())}`;
    window.open(url, '_blank', 'noopener');
    doneLink.href = url;
    error.textContent = '';
    steps.forEach((step) => { step.hidden = true; });
    foot.hidden = true;
    dialog.querySelector('.brief-progress').hidden = true;
    dialog.querySelector('.brief-steps').hidden = true;
    done.hidden = false;
    done.querySelector('h3').focus();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!valid()) return;
    if (current < steps.length - 1) show(current + 1);
    else send();
  });

  back.addEventListener('click', () => show(Math.max(0, current - 1)));
  form.addEventListener('change', () => { error.textContent = ''; });
  dialog.querySelector('.brief-close').addEventListener('click', () => dialog.close());
  // clique fora do cartão fecha
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

  document.querySelectorAll('.brief-open').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      reset();
      // o serviço pode vir pré-selecionado (data-servico com o valor da opção)
      const preset = button.dataset.servico && form.querySelector(`input[name="servico"][value="${button.dataset.servico}"]`);
      if (preset) preset.checked = true;
      dialog.showModal();
    });
  });
})();
