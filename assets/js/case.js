/* ============================================================
   JOÃO ALBERTO — PÁGINA DE CASE
   Animações editoriais das páginas de case (OAB e sites).
   - Abertura: voltar, rótulo com linha, título palavra a palavra,
     texto, ficha técnica e imagem principal.
   - Cabeçalhos de seção: linha que se desenha + título em palavras.
   - Peças das galerias: só aparecem depois que a imagem carregou,
     subindo suavemente, em sequência.
   Com "reduzir movimento" ou sem GSAP, tudo aparece normal.
   ============================================================ */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const root = document.documentElement;

/* Robôs de busca (Google, Bing…) leem o texto inteiro, sem animação: o SplitText
   quebra títulos e parágrafos em pedaços, e o Google mostrava "Do. layout. ao. código.". */
const isCrawler = /bot|crawl|spider|slurp|facebookexternalhit/i.test(navigator.userAgent);

function showAll() {
  root.classList.add('motion-fallback');
  window.clearTimeout(window.__caseMotionFallback);
}

function markVisible(elements) {
  [].concat(elements).filter(Boolean).forEach((element) => element.classList.add('is-visible'));
}

/* ---------- imagens: carregar antes de revelar ---------- */
function waitForImage(image, timeout = 1600) {
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

/* título palavra a palavra, cada uma saindo de trás de uma máscara */
function splitWords(gsap, SplitText, element, vars = {}) {
  if (!SplitText) return null;
  const split = SplitText.create(element, { type: 'words', mask: 'words', wordsClass: 'split-word' });

  return gsap.from(split.words, {
    yPercent: 115,
    rotation: 3,
    transformOrigin: '0% 100%',
    duration: 1,
    stagger: 0.06,
    ease: 'power4.out',
    onComplete: () => split.revert(),
    ...vars,
  });
}

(() => {
  const { gsap, ScrollTrigger, SplitText } = window;
  if (isCrawler || !gsap || !ScrollTrigger || !$('.case-shell')) {
    showAll();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: reduce)', showAll);

  mm.add('(prefers-reduced-motion: no-preference)', () => {
    try {
      window.clearTimeout(window.__caseMotionFallback);
      const mobile = window.matchMedia('(max-width: 760px)').matches;
      const handled = new Set();

      intro(gsap, SplitText, mobile);
      sectionHeads(gsap, SplitText, handled);
      copyBlocks(gsap, handled);
      scopeList(gsap, ScrollTrigger, handled);
      genericReveals(gsap, ScrollTrigger, SplitText, handled);
      galleries(gsap, ScrollTrigger, mobile);

      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    } catch (error) {
      console.error('Não foi possível iniciar as animações do case:', error);
      showAll();
    }
  });
})();

/* ---------- 1. Abertura ---------- */
function intro(gsap, SplitText, mobile) {
  const back = $('.case-back-link');
  const kicker = $('.case-kicker');
  const title = $('.case-title');
  const lead = $('.case-lead');
  const meta = $('.case-meta');
  const media = $('.case-hero-media') || $('.site-showcase');

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.15 });

  if (back) {
    gsap.set(back, { opacity: 0, x: -12, y: 0 });
    markVisible(back);
    timeline.to(back, { opacity: 1, x: 0, duration: 0.6, clearProps: 'opacity,transform' }, 0);
  }

  if (kicker) {
    const rule = $('.case-rule', kicker);
    gsap.set(kicker, { opacity: 0, y: 0 });
    markVisible(kicker);
    timeline.to(kicker, { opacity: 1, duration: 0.5, clearProps: 'opacity,transform' }, 0.1);
    if (rule) timeline.from(rule, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.9, ease: 'power3.inOut', clearProps: 'transform' }, 0.1);
  }

  if (title) {
    gsap.set(title, { opacity: 1, y: 0 });
    markVisible(title);
    const words = splitWords(gsap, SplitText, title, { stagger: 0.08, duration: mobile ? 0.95 : 1.1 });
    if (words) timeline.add(words, 0.2);
    else timeline.from(title, { opacity: 0, y: 30, duration: 0.9 }, 0.2);
    timeline.set(title, { clearProps: 'opacity,transform' });
  }

  if (lead) {
    gsap.set(lead, { opacity: 0, y: 22 });
    markVisible(lead);
    timeline.to(lead, { opacity: 1, y: 0, duration: 0.8, clearProps: 'opacity,transform' }, 0.55);
  }

  if (meta) {
    const items = $$('.case-meta-item', meta);
    gsap.set(meta, { opacity: 1, y: 0 });
    markVisible(meta);
    if (items.length) {
      timeline.from(items, { opacity: 0, y: 16, duration: 0.6, stagger: 0.08, clearProps: 'opacity,transform' }, 0.7);
    }
  }

  if (media) {
    gsap.set(media, { opacity: 0, y: mobile ? 24 : 36, scale: 0.96, transformOrigin: '50% 100%' });
    markVisible(media);
    const started = performance.now();
    // entra junto com o texto, mas nunca antes de a imagem estar pronta
    waitForImage($('img', media)).then(() => {
      const elapsed = (performance.now() - started) / 1000;
      gsap.to(media, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: mobile ? 0.9 : 1.1,
        delay: Math.max(0.5 - elapsed, 0),
        ease: 'power3.out',
        clearProps: 'opacity,transform,transformOrigin',
      });
    });
  }
}

/* ---------- 2. Cabeçalhos: linha, rótulo e título ---------- */
function sectionHeads(gsap, SplitText, handled) {
  $$('.case-reveal').forEach((head) => {
    const label = $('.case-section-label', head);
    if (!label || label.closest('.case-reveal') !== head) return;

    const heading = $$('h2', head).find((element) => element.closest('.case-reveal') === head);
    const extras = $$('.gallery-note', head);
    const rule = $('.case-rule', label);
    handled.add(head);

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: { trigger: head, start: 'top 86%', once: true },
      onStart: () => markVisible(head),
    });

    // o bloco em si já não se move: quem anima são as partes
    gsap.set(head, { opacity: 1, y: 0 });
    timeline.from(label, { opacity: 0, x: -10, duration: 0.6, clearProps: 'opacity,transform' }, 0);
    if (rule) timeline.from(rule, { scaleX: 0, transformOrigin: '0% 50%', duration: 1, ease: 'power3.inOut', clearProps: 'transform' }, 0);

    if (heading) {
      const words = splitWords(gsap, SplitText, heading);
      if (words) timeline.add(words, 0.12);
      else timeline.from(heading, { opacity: 0, y: 30, duration: 0.9, clearProps: 'opacity,transform' }, 0.12);
    }

    if (extras.length) {
      timeline.from(extras, { opacity: 0, y: 16, duration: 0.7, clearProps: 'opacity,transform' }, 0.4);
    }

    timeline.set(head, { clearProps: 'opacity,transform' });
  });
}

/* ---------- 3. Textos corridos: parágrafo a parágrafo ---------- */
function copyBlocks(gsap, handled) {
  $$('.case-copy.case-reveal').forEach((block) => {
    const parts = [...block.children];
    if (!parts.length) return;
    handled.add(block);

    gsap.set(block, { opacity: 1, y: 0 });
    gsap.set(parts, { opacity: 0, y: 22 });

    gsap.to(parts, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
      scrollTrigger: { trigger: block, start: 'top 86%', once: true },
      onStart: () => markVisible(block),
      onComplete: () => gsap.set(block, { clearProps: 'opacity,transform' }),
    });
  });
}

/* ---------- 4. Lista de atuação: linha a linha ---------- */
function scopeList(gsap, ScrollTrigger, handled) {
  const items = $$('.scope-item.case-reveal');
  if (!items.length) return;
  items.forEach((item) => handled.add(item));

  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => {
      gsap.set(batch, { opacity: 0, y: 24 });
      markVisible(batch);
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: 'power3.out',
        clearProps: 'opacity,transform',
      });
    },
  });
}

/* ---------- 5. Demais blocos (CTA, voltar, seções dos sites) ---------- */
function genericReveals(gsap, ScrollTrigger, SplitText, handled) {
  const elements = $$('.case-reveal').filter((element) => !handled.has(element));
  if (!elements.length) return;

  ScrollTrigger.batch(elements, {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      batch.forEach((element, index) => {
        const delay = index * 0.1;

        // títulos entram palavra a palavra
        if (/^H[12]$/.test(element.tagName) && SplitText) {
          gsap.set(element, { opacity: 1, y: 0 });
          markVisible(element);
          splitWords(gsap, SplitText, element, { delay, onStart: () => gsap.set(element, { clearProps: 'opacity,transform' }) });
          return;
        }

        gsap.set(element, { opacity: 0, y: 28 });
        markVisible(element);
        gsap.to(element, { opacity: 1, y: 0, duration: 0.85, delay, ease: 'power3.out', clearProps: 'opacity,transform' });
      });
    },
  });
}

/* ---------- 6. Galerias: sobem e aparecem quando a imagem já carregou ---------- */
function galleries(gsap, ScrollTrigger, mobile) {
  const items = $$('.gallery-item');
  if (!items.length) return;

  preloadNearViewport(items);

  const reveal = async (batch) => {
    await Promise.all(batch.map((item) => waitForImage($('img', item))));

    gsap.set(batch, { opacity: 0, y: mobile ? 24 : 36, scale: 0.96, transformOrigin: '50% 100%', transition: 'none' });
    markVisible(batch);

    gsap.to(batch, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: mobile ? 0.75 : 0.95,
      ease: 'power3.out',
      stagger: mobile ? 0.07 : 0.09,
      clearProps: 'opacity,transform,transformOrigin,transition',
    });
  };

  ScrollTrigger.batch(items, {
    start: 'top 92%',
    once: true,
    batchMax: mobile ? 2 : 6,
    onEnter: reveal,
  });
}
