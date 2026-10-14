/* Aviso de cookies do Trackik (portfólio e blog, que dividem o endereço joaoa.com.br:
   a escolha feita em um vale no outro). O blog carrega este mesmo arquivo.

   - Sem escolha: mostra o aviso. O Trackik conta cada pessoa 1 vez por dia, sem guardar nada.
   - "Aceitar": trackik.consentir() guarda um código anônimo no navegador e a mesma pessoa
     passa a contar 1 vez no período, mesmo voltando em outros dias.
   - "Recusar": trackik.revogar() apaga o código.
   - "Preferências de cookies" no rodapé reabre o aviso (mudar de ideia tem que ser fácil).
   Guia: trackik/docs/contagem-precisa-nos-sites.md */
(() => {
  const KEY = 'joaoa-cookies';
  const en = document.documentElement.lang === 'en';
  const TEXT = en
    ? {
        label: 'Cookie preferences',
        title: 'Your privacy',
        body: 'I count visits anonymously, without storing your IP. If you accept, your browser keeps an anonymous code that only tells me when you come back. None of it identifies you.',
        accept: 'Accept',
        decline: 'Decline',
        prefs: 'Cookie preferences',
      }
    : {
        label: 'Preferência de cookies',
        title: 'Sua privacidade',
        body: 'Conto as visitas de forma anônima, sem guardar seu IP. Se você aceitar, seu navegador guarda um código anônimo que só me diz quando você volta. Nada disso identifica você.',
        accept: 'Aceitar',
        decline: 'Recusar',
        prefs: 'Preferências de cookies',
      };

  const read = () => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  };

  // O Trackik é carregado por outro script (só em joaoa.com.br): se ainda não existir,
  // espera a página terminar de carregar. Em teste local ele não existe e nada acontece.
  function trackik(action) {
    const run = () => window.trackik?.[action]?.();
    if (window.trackik || document.readyState === 'complete') run();
    else window.addEventListener('load', run, { once: true });
  }

  const CSS = `
.cookie-banner{position:fixed;left:1rem;bottom:1rem;z-index:2147483000;width:min(25rem,calc(100vw - 2rem));padding:1.15rem 1.2rem 1.2rem;border:1px solid rgba(242,240,235,.14);border-radius:18px;background:rgba(15,15,15,.88);-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);box-shadow:0 24px 60px rgba(0,0,0,.35);color:#f2f0eb;font-size:.92rem;line-height:1.5;opacity:0;transform:translateY(12px);transition:opacity .35s ease,transform .45s cubic-bezier(.22,1,.36,1)}
.cookie-banner.is-in{opacity:1;transform:none}
.cookie-banner[hidden]{display:none}
.cookie-banner strong{display:block;margin-bottom:.35rem;font-size:.7rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;color:rgba(242,240,235,.6);font-family:"DM Mono",ui-monospace,monospace}
.cookie-banner p{margin:0;color:rgba(242,240,235,.82)}
.cookie-actions{display:flex;gap:.5rem;margin-top:1rem}
.cookie-actions button{flex:1;min-height:42px;padding:0 1rem;border:1px solid #f2f0eb;border-radius:10px;font:inherit;font-size:.8rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;cursor:pointer;transition:background-color .2s ease,color .2s ease,border-color .2s ease}
.cookie-accept{background:#f2f0eb;color:#0f0f0f}
.cookie-accept:hover{background:transparent;color:#f2f0eb}
.cookie-decline{background:transparent;color:#f2f0eb;border-color:rgba(242,240,235,.3)!important}
.cookie-decline:hover{border-color:#f2f0eb!important}
.cookie-actions button:focus-visible,.cookie-prefs:focus-visible{outline:2px solid #f2f0eb;outline-offset:3px}
.cookie-prefs{padding:0;border:0;background:none;color:inherit;font:inherit;text-decoration:underline;text-underline-offset:3px;text-decoration-color:currentColor;opacity:.75;cursor:pointer}
.cookie-prefs:hover{opacity:1}
@media (max-width:560px){.cookie-banner{left:.75rem;right:.75rem;bottom:.75rem;width:auto}}
@media (prefers-reduced-motion:reduce){.cookie-banner{transition:none}}`;

  let banner = null;

  function build() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.append(style);

    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', TEXT.label);
    banner.hidden = true;
    banner.innerHTML = `<strong>${TEXT.title}</strong><p>${TEXT.body}</p><div class="cookie-actions"><button type="button" class="cookie-accept">${TEXT.accept}</button><button type="button" class="cookie-decline">${TEXT.decline}</button></div>`;
    banner.querySelector('.cookie-accept').addEventListener('click', () => choose('aceito'));
    banner.querySelector('.cookie-decline').addEventListener('click', () => choose('recusado'));
    document.body.append(banner);
  }

  function show() {
    if (!banner) build();
    banner.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => banner.classList.add('is-in')));
  }

  function hide() {
    if (!banner) return;
    banner.classList.remove('is-in');
    banner.hidden = true;
  }

  function choose(value) {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    hide();
    trackik(value === 'aceito' ? 'consentir' : 'revogar');
  }

  // "Preferências de cookies" no rodapé (portfólio, currículo e blog)
  function addFooterLink() {
    const footer = document.querySelector('footer .footer-info, footer.cv-footer, footer.site-footer > div');
    if (!footer || footer.querySelector('.cookie-prefs')) return;
    if (!banner) build();
    const line = document.createElement('p');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cookie-prefs';
    button.textContent = TEXT.prefs;
    button.addEventListener('click', () => {
      show();
      banner.querySelector('.cookie-accept').focus({ preventScroll: true });
    });
    line.append(button);
    footer.append(line);
  }

  function start() {
    const choice = read();
    if (choice === 'aceito') trackik('consentir');
    addFooterLink();
    if (!choice) show();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
