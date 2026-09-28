/* ============================================================
   JOÃO ALBERTO — MENU MOBILE
   Compartilhado pela home (main.js) e pelas páginas de projeto (hub.js).
   ============================================================ */

const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initMobileMenu({ lenis = null, query = '(max-width: 860px)' } = {}) {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const mobileMenuQuery = window.matchMedia(query);

  if (!navToggle || !navMenu) return { isOpen: () => false };

  const isOpen = () => navMenu.classList.contains('open');

  function openMenu() {
    if (!mobileMenuQuery.matches) return;

    navToggle.classList.add('open');
    navMenu.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu');
    navMenu.inert = false;
    document.body.classList.add('no-scroll');
    lenis?.stop();

    window.requestAnimationFrame(() => {
      navMenu.querySelector(focusableSelector)?.focus();
    });
  }

  function closeMenu({ restoreFocus = true } = {}) {
    const wasOpen = isOpen();

    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu');
    document.body.classList.remove('no-scroll');
    lenis?.start();

    if (mobileMenuQuery.matches) navMenu.inert = true;
    if (!restoreFocus && navMenu.contains(document.activeElement)) document.activeElement.blur();
    if (restoreFocus && wasOpen) navToggle.focus();
  }

  function syncMenuMode() {
    if (!mobileMenuQuery.matches) {
      closeMenu({ restoreFocus: false });
      navMenu.inert = false;
    } else if (!isOpen()) {
      navMenu.inert = true;
    }
  }

  function trapMenuFocus(event) {
    if (event.key !== 'Tab' || !isOpen()) return;

    const focusable = [...navMenu.querySelectorAll(focusableSelector)]
      .filter((element) => !element.hasAttribute('disabled'));
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  navToggle.addEventListener('click', () => {
    isOpen() ? closeMenu() : openMenu();
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) closeMenu();
    trapMenuFocus(event);
  });

  mobileMenuQuery.addEventListener?.('change', syncMenuMode);
  syncMenuMode();

  return { isOpen };
}
