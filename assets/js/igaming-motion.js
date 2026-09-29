/* ============================================================
   JOÃO ALBERTO — ANIMAÇÕES DA PÁGINA DE iGAMING
   Complementa o hub.js (que anima cabeçalho, voltar e CTA):
   categorias, cabeçalhos das seções e todas as peças.
   As peças só se revelam depois que a imagem carregou — assim
   nada aparece "pulando" antes da animação.
   Com "reduzir movimento" ou sem GSAP, tudo aparece normal.
   ============================================================ */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const root = document.documentElement;
const page = $('.igaming-page');

const ITEM_SELECTOR = '.card, .banner, .widget, .gamif-card, .gamif-banner, .email-card';

function showAll() {
  root.classList.add('motion-fallback');
}

function markVisible(elements) {
  elements.forEach((element) => element.classList.add('is-visible'));
}

/* ---------- imagens: carregar antes de revelar ---------- */
function waitForImage(image, timeout = 1400) {
  if (!image) return Promise.resolve();
  if (image.complete && image.naturalWidth > 0) {
    return image.decode ? image.decode().catch(() => {}) : Promise.resolve();
  }

  return new Promise((resolve) => {
    const done = () => resolve();
    image.addEventListener('load', done, { once: true });
    image.addEventListener('error', done, { once: true });
    window.setTimeout(done, timeout); // conexão lenta: anima mesmo assim
  });
}

/* começa a baixar as imagens um pouco antes de elas chegarem à tela */
function preloadNearViewport(items) {
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const image = $('img', entry.target);
      if (image?.loading === 'lazy') image.loading = 'eager';
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px 900px 0px' });

  items.forEach((item) => observer.observe(item));
}

(() => {
  const { gsap, ScrollTrigger, SplitText } = window;
  if (!page || !gsap || !ScrollTrigger) {
    showAll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: reduce)', showAll);

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    try {
      window.clearTimeout(window.__igamingMotionFallback);
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      galleryNav(gsap);
      sectionHeads(gsap, SplitText);
      pieces(gsap, ScrollTrigger, mobile);
      popupShowcase(gsap);
      clubProject(gsap, SplitText);
      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    } catch (error) {
      console.error('Não foi possível iniciar as animações da página de iGaming:', error);
      showAll();
    }
  });
})();

/* ---------- 1. Categorias: entram logo depois do título ---------- */
function galleryNav(gsap) {
  const links = $$('.gallery-nav a');
  if (!links.length) return;

  gsap.fromTo(links, { y: 14, opacity: 0 }, {
    y: 0,
    opacity: 1,
    duration: 0.6,
    ease: 'power3.out',
    stagger: 0.05,
    delay: 0.85,
    onStart: () => markVisible(links),
    clearProps: 'transform,opacity',
  });
}

/* ---------- 2. Cabeçalho das seções: linha, número e título ---------- */
function sectionHeads(gsap, SplitText) {
  $$('.s-head', page).forEach((head) => {
    const number = $('.s-num', head);
    const title = $('.s-title', head);

    // a borda de cima vira uma linha que se desenha
    const line = document.createElement('i');
    line.className = 's-line';
    line.setAttribute('aria-hidden', 'true');
    head.classList.add('has-line');
    head.prepend(line);

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: head, start: 'top 86%', once: true },
      onStart: () => markVisible([number, title].filter(Boolean)),
    });

    timeline.from(line, { scaleX: 0, duration: 1.1, ease: 'power3.inOut' }, 0);

    if (number && SplitText) {
      const split = SplitText.create(number, { type: 'chars', aria: 'none' });
      timeline.from(split.chars, {
        autoAlpha: 0, duration: 0.01, stagger: 0.05, onComplete: () => split.revert(),
      }, 0.15);
    }

    if (title && SplitText) {
      const split = SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'split-word' });
      timeline.from(split.words, {
        yPercent: 115,
        rotation: 3,
        transformOrigin: '0% 100%',
        duration: 1,
        stagger: 0.06,
        ease: 'power4.out',
        onComplete: () => split.revert(),
      }, 0.2);
    } else if (title) {
      timeline.from(title, { y: 30, opacity: 0, duration: 0.9 }, 0.2);
    }
  });
}

/* ---------- 3. Peças: sobem e aparecem quando a imagem já carregou ---------- */
function pieces(gsap, ScrollTrigger, mobile) {
  const items = $$(ITEM_SELECTOR, page);
  if (!items.length) return;

  preloadNearViewport(items);

  const reveal = async (batch) => {
    await Promise.all(batch.map((item) => waitForImage($('img', item))));

    // a peça sobe suavemente enquanto aparece, com uma escala quase imperceptível
    gsap.set(batch, { opacity: 0, y: mobile ? 24 : 36, scale: 0.96, transformOrigin: '50% 100%' });
    markVisible(batch);

    gsap.to(batch, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: mobile ? 0.75 : 0.95,
      ease: 'power3.out',
      stagger: mobile ? 0.07 : 0.09,
      clearProps: 'opacity,transform,transformOrigin',
    });
  };

  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    interval: 0.12,
    batchMax: mobile ? 4 : 8,
    onEnter: reveal,
  });
}

/* ---------- 4. Pop-up animado: o quadro surge em destaque ---------- */
function popupShowcase(gsap) {
  const wrap = $('.popup-anim-wrap', page);
  if (!wrap) return;

  const label = $('.popup-anim-label', wrap);
  const frame = $('.popup-anim-frame', wrap);

  gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: wrap, start: 'top 82%', once: true },
    onStart: () => markVisible([label, frame].filter(Boolean)),
  })
    .fromTo(label, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, clearProps: 'transform,opacity' }, 0)
    .fromTo(frame, { y: 40, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'power4.out', clearProps: 'transform,opacity' }, 0.1);
}

/* ---------- 5. Clube de Ouro: texto em sequência e a prévia se revelando ---------- */
function clubProject(gsap, SplitText) {
  const club = $('.club-project', page);
  if (!club) return;

  const parts = [...club.children];
  const title = $('h3', club);
  const preview = $('.club-preview', club);
  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: club, start: 'top 80%', once: true },
    onStart: () => markVisible(parts),
  });

  const texts = $$('.club-kicker, .club-desc', club);
  timeline.fromTo(texts, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.12, clearProps: 'transform,opacity' }, 0);

  if (title && SplitText) {
    const split = SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'split-word' });
    timeline.from(split.words, { yPercent: 115, duration: 1, stagger: 0.06, ease: 'power4.out', onComplete: () => split.revert() }, 0.1);
  }

  const chips = $$('.club-features li', club);
  if (chips.length) {
    timeline.fromTo(chips, { y: 10, opacity: 0, scale: 0.9 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: 'back.out(2)', clearProps: 'transform,opacity' }, 0.35);
  }

  const button = $('.club-info .club-open', club);
  if (button) {
    timeline.fromTo(button, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, clearProps: 'transform,opacity' }, 0.5);
  }

  // a prévia: só opacidade e máscara — a inclinação 3D e o selo usam transform no CSS
  if (preview) {
    const media = $('.club-preview-media img', preview);
    const cta = $('.club-preview-cta', preview);
    timeline.fromTo(preview, { opacity: 0, clipPath: 'inset(0% 0% 100% 0% round 14px)' }, {
      opacity: 1, clipPath: 'inset(0% 0% 0% 0% round 14px)', duration: 1.2, ease: 'power4.inOut', clearProps: 'opacity,clipPath',
    }, 0.1);
    if (media) timeline.fromTo(media, { scale: 1.2 }, { scale: 1, duration: 1.6, clearProps: 'transform' }, 0.1);
    if (cta) timeline.fromTo(cta, { opacity: 0 }, { opacity: 1, duration: 0.6, clearProps: 'opacity' }, 1);
  }
}
