/* ============================================================
   JOÃO ALBERTO — CURRÍCULO
   Scroll suave, impressão ATS e entradas discretas com GSAP.
   É um documento: o movimento acompanha a leitura, sem chamar
   mais atenção que o conteúdo. A impressão usa a versão ATS,
   que não tem animação nenhuma.
   ============================================================ */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const { gsap, ScrollTrigger, SplitText } = window;

function showAll() {
  root.classList.add('motion-fallback');
  window.clearTimeout(window.__cvMotionFallback);
}

function markVisible(elements) {
  [].concat(elements).filter(Boolean).forEach((element) => element.classList.add('is-visible'));
}

/* ---------- Lenis ---------- */
let lenis = null;

if (window.Lenis && !reducedMotion) {
  lenis = new window.Lenis({
    duration: 1.2,
    smoothWheel: true,
    smoothTouch: false,
    lerp: 0.08,
  });

  if (gsap && ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (time) => {
      lenis.raf(time);
      window.requestAnimationFrame(raf);
    };
    window.requestAnimationFrame(raf);
  }
}

/* ---------- Impressão / PDF ---------- */
const printButton = document.getElementById('printCv');

function preparePrint() {
  lenis?.stop();
  document.body.classList.add('is-printing');
}

function restoreAfterPrint() {
  document.body.classList.remove('is-printing');
  lenis?.start();
}

printButton?.addEventListener('click', () => {
  preparePrint();
  /* Aguarda o navegador aplicar o layout de impressão. */
  window.requestAnimationFrame(() => window.print());
});

window.addEventListener('beforeprint', preparePrint);
window.addEventListener('afterprint', restoreAfterPrint);

/* ---------- Animações ---------- */
(() => {
  if (!gsap || !ScrollTrigger) {
    showAll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: reduce)', showAll);

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    try {
      window.clearTimeout(window.__cvMotionFallback);
      intro();
      $$('.cv-page > section[data-reveal]').forEach(section);
      footer();
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    } catch (error) {
      console.error('Não foi possível iniciar as animações do currículo:', error);
      showAll();
    }
  });
})();

/* título palavra a palavra, saindo de trás de uma máscara */
function words(element, vars = {}) {
  if (!SplitText || !element) return null;
  const split = SplitText.create(element, { type: 'words', mask: 'words', wordsClass: 'split-word' });

  return gsap.from(split.words, {
    yPercent: 110,
    duration: 0.9,
    stagger: 0.06,
    ease: 'power4.out',
    onComplete: () => split.revert(),
    ...vars,
  });
}

/* ---------- 1. Barra, folha e cabeçalho ---------- */
function intro() {
  const toolbar = $('.cv-toolbar');
  const page = $('.cv-page');
  const header = $('.cv-header');
  if (!header) return;

  const title = $('h1', header);
  const photo = $('.profile-photo', header);
  const contacts = $$('.contact-grid a', header);

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

  gsap.set(header, { opacity: 1 });
  markVisible([header, toolbar, page]);

  if (toolbar) timeline.from(toolbar, { y: -16, opacity: 0, duration: 0.7, clearProps: 'opacity,transform' }, 0);
  if (page) timeline.from(page, { y: 28, opacity: 0, duration: 1, clearProps: 'opacity,transform' }, 0.05);

  timeline.from($$('.header-meta span', header), { opacity: 0, y: 8, duration: 0.6, stagger: 0.08, clearProps: 'opacity,transform' }, 0.35);
  if (photo) timeline.from(photo, { opacity: 0, scale: 0.9, duration: 0.8, clearProps: 'opacity,transform' }, 0.4);
  timeline.from($('.role', header), { opacity: 0, x: -10, duration: 0.6, clearProps: 'opacity,transform' }, 0.45);

  const titleWords = words(title, { duration: 1 });
  if (titleWords) timeline.add(titleWords, 0.5);

  timeline.from($('.positioning', header), { opacity: 0, y: 12, duration: 0.7, clearProps: 'opacity,transform' }, 0.75);
  if (contacts.length) {
    timeline.from(contacts, { opacity: 0, y: 12, duration: 0.6, stagger: 0.07, clearProps: 'opacity,transform' }, 0.85);
  }
}

/* ---------- 2. Seções: título, linha e conteúdo em sequência ---------- */
function section(block) {
  const heading = $('.section-heading', block);
  const index = $('.section-index', heading || block);
  const title = $('h2', heading || block);
  const line = $('.section-line', heading || block);

  // conteúdo da seção, na ordem de leitura
  const parts = [
    ...$$(':scope > p, .summary-points li', block),
    ...$$('.timeline-item, .skill-group, .subsection-title, .education-list li, .language-list li', block),
  ];
  const timelineRail = $('.timeline', block);

  gsap.set(block, { opacity: 1 });
  gsap.set(parts, { opacity: 0, y: 18 });

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: block, start: 'top 85%', once: true },
    onStart: () => markVisible(block),
  });

  if (index) timeline.from(index, { opacity: 0, duration: 0.5, clearProps: 'opacity' }, 0);
  const titleWords = words(title);
  if (titleWords) timeline.add(titleWords, 0.05);
  if (line) timeline.from(line, { scaleX: 0, transformOrigin: '0% 50%', duration: 1, ease: 'power3.inOut', clearProps: 'transform' }, 0.1);

  // a linha do tempo se desenha de cima para baixo enquanto os cargos entram
  if (timelineRail) {
    timeline.fromTo(timelineRail, { '--rail': 0 }, { '--rail': 1, duration: 1.4, ease: 'power2.inOut' }, 0.25);
    timeline.from($$('.timeline-marker', block), { scale: 0, duration: 0.5, stagger: 0.18, ease: 'back.out(2)', clearProps: 'transform' }, 0.35);
  }

  if (parts.length) {
    timeline.to(parts, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      stagger: Math.min(0.08, 0.6 / parts.length),
      clearProps: 'opacity,transform',
    }, 0.25);
  }
}

/* ---------- 3. Rodapé ---------- */
function footer() {
  const element = $('.cv-footer');
  if (!element) return;

  gsap.from(element.children, {
    opacity: 0,
    y: 10,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power3.out',
    clearProps: 'opacity,transform',
    scrollTrigger: { trigger: element, start: 'top 95%', once: true },
  });
}
