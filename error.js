/* ============================================================
   JOÃO ALBERTO — INTERFACE DAS PÁGINAS DE ERRO
   404, 403 e a página "em obras" da identidade visual.
   - A TV liga como um tubo antigo: a tela abre de uma linha
     de luz e a estática aparece.
   - O número de fundo sobe algarismo a algarismo.
   - Na página em obras, a barreira se monta peça por peça.
   - Texto: rótulo digitado, título palavra a palavra, botões.
   Com "reduzir movimento" ou sem GSAP, tudo aparece normal.
   ============================================================ */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const { gsap, SplitText } = window;

function showAll() {
  window.clearTimeout(window.__errorMotionFallback);
  root.classList.add('motion-fallback');
}

function markVisible(elements) {
  [].concat(elements).filter(Boolean).forEach((element) => element.classList.add('is-visible'));
}

if (gsap && !reducedMotion) {
  try {
    window.clearTimeout(window.__errorMotionFallback);
    if (SplitText) gsap.registerPlugin(SplitText);
    animate();
  } catch (error) {
    console.error('Não foi possível iniciar as animações da página de erro:', error);
    showAll();
  }
} else {
  showAll();
}

function animate() {
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.1 });

  /* ---------- moldura: marca e HUD ---------- */
  const chrome = $$('.brand, .hud');
  markVisible(chrome);
  timeline.from(chrome, { opacity: 0, duration: 1, clearProps: 'opacity' }, 0.5);

  /* ---------- visual ---------- */
  const visual = $('.error-visual');
  if (visual) {
    markVisible(visual);
    timeline.from(visual, { opacity: 0, y: 24, duration: 0.9, clearProps: 'opacity,transform' }, 0);

    const backdrop = $('.error-code-backdrop', visual);
    if (backdrop && SplitText) {
      const split = SplitText.create(backdrop, { type: 'chars', mask: 'chars', aria: 'none' });
      timeline.from(split.chars, {
        yPercent: 105,
        duration: 1.1,
        stagger: 0.09,
        ease: 'power4.out',
        onComplete: () => split.revert(),
      }, 0.05);
    }

    if ($('.retro-tv', visual)) tv(timeline, visual);
    if ($('.obra-scene', visual)) barricade(timeline, visual, mobile);
  }

  /* ---------- texto ---------- */
  const copy = $('.error-copy');
  if (!copy) return;

  const label = $('.error-label', copy);
  const title = $('h1', copy);
  const description = $('.error-description', copy);
  const actions = $('.actions', copy);
  markVisible([...copy.children]);

  if (label) {
    if (SplitText) {
      const split = SplitText.create(label, { type: 'chars', aria: 'none' });
      timeline.from(split.chars, { autoAlpha: 0, duration: 0.01, stagger: 0.035, onComplete: () => split.revert() }, 0.35);
    } else {
      timeline.from(label, { opacity: 0, duration: 0.5 }, 0.35);
    }
  }

  if (title) {
    if (SplitText) {
      const split = SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'split-word' });
      timeline.from(split.words, {
        yPercent: 115,
        rotation: 3,
        transformOrigin: '0% 100%',
        duration: 1.05,
        stagger: 0.08,
        ease: 'power4.out',
        onComplete: () => split.revert(),
      }, 0.45);
    } else {
      timeline.from(title, { opacity: 0, y: 24, duration: 0.9, clearProps: 'opacity,transform' }, 0.45);
    }
  }

  if (description) timeline.from(description, { opacity: 0, y: 16, duration: 0.8, clearProps: 'opacity,transform' }, 0.75);
  if (actions) timeline.from([...actions.children], { opacity: 0, y: 14, duration: 0.7, stagger: 0.1, clearProps: 'opacity,transform' }, 0.9);
}

/* A TV liga: corpo assenta, antenas balançam, tela abre de uma linha de luz */
function tv(timeline, visual) {
  const body = $('.tv-body', visual);
  const antenna = $('.tv-antenna', visual);
  const screen = $('.tv-screen', visual);
  const label = $('.tv-screen-label', visual);

  if (body) timeline.from(body, { y: -18, duration: 0.9, ease: 'back.out(1.6)', clearProps: 'transform' }, 0.1);

  // a antena inteira balança e assenta (as hastes já são inclinadas no CSS)
  if (antenna) {
    timeline.from(antenna, {
      rotation: -9,
      transformOrigin: '50% 100%',
      duration: 1.3,
      ease: 'elastic.out(1, 0.35)',
      clearProps: 'transform,transformOrigin',
    }, 0.3);
  }

  if (screen) {
    timeline.fromTo(screen, { scaleY: 0.015, scaleX: 0.7, filter: 'brightness(3)' }, {
      scaleY: 1,
      scaleX: 1,
      filter: 'brightness(1)',
      duration: 0.55,
      ease: 'expo.out',
      clearProps: 'transform,filter',
    }, 0.55);
  }

  if (label) {
    timeline.fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.08, repeat: 4, yoyo: true, clearProps: 'opacity' }, 1.05);
  }
}

/* A barreira se monta: postes sobem, tábuas caem no lugar, cone chega por último */
function barricade(timeline, visual, mobile) {
  const posts = $$('.barricade-post', visual);
  const feet = $$('.barricade-foot', visual);
  const boards = $$('.barricade-board', visual);
  const cone = $('.obra-cone', visual);
  const lights = $$('.barricade-light', visual);

  if (feet.length) timeline.from(feet, { opacity: 0, duration: 0.4, stagger: 0.08, clearProps: 'opacity' }, 0.15);
  if (posts.length) timeline.from(posts, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.6, stagger: 0.1, clearProps: 'transform' }, 0.2);
  if (boards.length) {
    timeline.from(boards, {
      y: mobile ? -24 : -40,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      ease: 'bounce.out',
      clearProps: 'opacity,transform',
    }, 0.45);
  }
  if (lights.length) timeline.from(lights, { opacity: 0, scale: 0.4, duration: 0.4, stagger: 0.1, ease: 'back.out(2)', clearProps: 'opacity,transform' }, 0.95);
  if (cone) timeline.from(cone, { x: 30, opacity: 0, rotation: 12, duration: 0.8, ease: 'back.out(1.7)', clearProps: 'opacity,transform' }, 0.85);
}

/* ---------- blob de fundo ---------- */
const canvas = document.getElementById('stage');

if (canvas) {
  import('./error-blob.js')
    .then(({ initErrorBlob }) => initErrorBlob({ canvas, reducedMotion }))
    .catch((error) => {
      console.warn('O efeito 3D da página de erro não pôde ser carregado.', error);
      canvas.remove();
    });
}
