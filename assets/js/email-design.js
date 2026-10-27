/* Página Email Design: filtros por tipo e visualizador (claro, escuro e celular).
   Cada card traz os endereços nas próprias marcações: data-light, data-dark, data-mobile e data-html.
   Os emails reais de CRM só têm a versão clara: as abas somem para eles. */
(() => {
  const viewer = document.querySelector('.ed-viewer');
  const cards = [...document.querySelectorAll('.ed-card')];
  if (!viewer || !cards.length) return;

  /* ---------- Filtros ---------- */
  const filterButtons = [...document.querySelectorAll('.ed-filters button')];
  filterButtons.forEach((button) => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    filterButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    cards.forEach((card) => {
      card.hidden = filter !== 'all' && card.dataset.filter !== filter;
      // depois de filtrar, os cards aparecem direto (sem esperar a animação de entrada)
      card.classList.add('is-visible');
      card.style.opacity = '';
      card.style.transform = '';
    });
    document.querySelectorAll('.ed-group').forEach((group) => {
      group.hidden = !group.querySelector('.ed-card:not([hidden])');
    });
    window.ScrollTrigger?.refresh();
  }));

  /* ---------- Visualizador ---------- */
  const title = viewer.querySelector('.ed-viewer-title');
  const kicker = viewer.querySelector('.ed-viewer-kicker');
  const tabs = viewer.querySelector('.ed-viewer-tabs');
  const tabButtons = [...tabs.querySelectorAll('button')];
  const body = viewer.querySelector('.ed-viewer-body');
  const image = body.querySelector('img');
  const htmlLink = viewer.querySelector('.ed-viewer-html');
  let current = null;
  let opener = null;

  function show(variant) {
    const src = current.dataset[variant] || current.dataset.light;
    tabButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.variant === variant)));
    body.classList.toggle('is-mobile', variant === 'mobile');
    image.src = src;
    image.alt = current.querySelector('.ed-thumb img').alt;
    body.scrollTop = 0;
  }

  cards.forEach((card) => card.querySelector('.ed-thumb').addEventListener('click', (event) => {
    current = card;
    opener = event.currentTarget;
    title.textContent = card.querySelector('.ed-subject').textContent;
    kicker.textContent = [...card.querySelectorAll('.ed-kicker span')].map((s) => s.textContent).join(' · ');
    htmlLink.href = card.dataset.html;
    tabs.hidden = !card.dataset.dark;
    show('light');
    viewer.showModal();
    document.documentElement.style.overflow = 'hidden';
  }));

  tabButtons.forEach((b) => b.addEventListener('click', () => show(b.dataset.variant)));
  viewer.querySelector('.ed-viewer-close').addEventListener('click', () => viewer.close());
  // clique no fundo escuro (fora da caixa) fecha
  viewer.addEventListener('click', (event) => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    opener?.focus();
  });
})();
