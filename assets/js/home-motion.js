/* ============================================================
   JOÃO ALBERTO — ANIMAÇÕES DA HOME (GSAP + ScrollTrigger + SplitText)
   Linguagem: HUD e cortes limpos. Textos sobem por máscara, rótulos
   se digitam, linhas se desenham, imagens se revelam e o hero ganha
   profundidade ao sair da tela. Nada gira sem motivo nem pisca.
   Com "reduzir movimento" ou sem GSAP, tudo aparece normal.
   ============================================================ */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const root = document.documentElement;
const fallbackTimer = window.__homeMotionFallback;

function showWithoutAnimation() {
  if (fallbackTimer) window.clearTimeout(fallbackTimer);
  root.classList.add('motion-fallback');
}

/* Gatilho padrão: anima uma vez quando o elemento entra na tela. */
const onEnter = (trigger, extra = {}) => ({ trigger, start: 'top 82%', once: true, ...extra });

export function initHomeMotion() {
  const { gsap, ScrollTrigger, SplitText } = window;

  if (!gsap || !ScrollTrigger) {
    showWithoutAnimation();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (SplitText) gsap.registerPlugin(SplitText);

  const mm = gsap.matchMedia();

  mm.add('(prefers-reduced-motion: reduce)', showWithoutAnimation);

  mm.add(
    {
      motion: '(prefers-reduced-motion: no-preference)',
      desktop: '(min-width: 761px)',
    },
    (context) => {
      const { motion, desktop } = context.conditions;
      if (!motion) return;

      try {
        heroScrollOut({ gsap });

        // As quebras de linha dependem da fonte: espera ela chegar, mas no máximo 0,8 s.
        const fontsOrTimeout = Promise.race([
          document.fonts?.ready ?? Promise.resolve(),
          new Promise((resolve) => window.setTimeout(resolve, 800)),
        ]);

        fontsOrTimeout.then(() => {
          sectionHeads({ gsap, SplitText });
          headings({ gsap, SplitText });
          aboutSection({ gsap, SplitText });
          projectsSection({ gsap, SplitText, desktop });
          contactSection({ gsap, SplitText });
          footerSection({ gsap });
          ScrollTrigger.refresh();
        });

        window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
        if (fallbackTimer) window.clearTimeout(fallbackTimer);
      } catch (error) {
        console.error('Não foi possível iniciar as animações da home:', error);
        showWithoutAnimation();
      }
    },
  );
}

/* ---------- 1. Chegada ----------
   A abertura do hero (navegação, título, perfil, botões e HUD) roda em CSS
   (style.css, "ENTRADA DO HERO"): começa no primeiro quadro, sem esperar
   os scripts, para o texto principal aparecer rápido. */

/* ---------- 2. Hero: profundidade ao sair da tela ----------
   Anima só a variável --hero-out (0 → 1). O CSS distribui em velocidades
   diferentes para cada linha, perfil e botões, sem brigar com a entrada. */
function heroScrollOut({ gsap }) {
  const hero = $('.hero');
  if (!hero) return;

  gsap.fromTo(hero, { '--hero-out': 0 }, {
    '--hero-out': 1,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
  });
}

/* ---------- 3. Cabeçalhos das seções: ícone surge, rótulo se digita, linha se desenha ---------- */
function sectionHeads({ gsap, SplitText }) {
  $$('.sec-head').forEach((head) => {
    const [icon, label] = head.children;

    // linha técnica que acompanha o rótulo até a borda
    let line = $('.sec-line', head);
    if (!line) {
      line = document.createElement('i');
      line.className = 'sec-line';
      line.setAttribute('aria-hidden', 'true');
      head.append(line);
    }

    const timeline = gsap.timeline({ scrollTrigger: onEnter(head, { start: 'top 88%' }) });

    if (icon) {
      timeline.from(icon, { scale: 0.5, autoAlpha: 0, duration: 0.7, ease: 'back.out(2)', clearProps: 'transform,opacity,visibility' }, 0);
      timeline.from(icon.firstElementChild, { yPercent: 120, autoAlpha: 0, duration: 0.6, ease: 'power3.out', clearProps: 'all' }, 0.15);
    }

    if (label && SplitText) {
      const split = SplitText.create(label, { type: 'chars', aria: 'none' });
      timeline.from(split.chars, {
        autoAlpha: 0,
        duration: 0.01,
        stagger: 0.04,
        onComplete: () => split.revert(),
      }, 0.15);
    }

    timeline.from(line, { scaleX: 0, duration: 1.1, ease: 'power3.inOut' }, 0.2);
  });
}

/* ---------- 4. Títulos grandes: palavra por palavra, saindo de uma máscara ---------- */
function headings({ gsap, SplitText }) {
  const titles = $$('.about-copy h2, .projects-title, .contact-copy h2');

  if (!SplitText) {
    titles.forEach((title) => gsap.from(title, {
      autoAlpha: 0, y: 34, duration: 1.1, scrollTrigger: onEnter(title), clearProps: 'all',
    }));
    return;
  }

  titles.forEach((title) => {
    // a máscara corta durante a subida; ao terminar, o título volta ao HTML
    // original, sem caixinhas que cortem o "j", o "g" ou a curva do "S"
    const split = SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'split-word' });
    gsap.from(split.words, {
      yPercent: 115,
      rotation: 4,
      transformOrigin: '0% 100%',
      duration: 1,
      stagger: 0.06,
      ease: 'power4.out',
      scrollTrigger: onEnter(title),
      onComplete: () => split.revert(),
    });
  });
}

/* ---------- 5. Sobre: parágrafos linha a linha e a lista "escaneada" ---------- */
function aboutSection({ gsap, SplitText }) {
  const paragraphs = $$('.about-copy p');

  paragraphs.forEach((paragraph, index) => {
    if (!SplitText) {
      gsap.from(paragraph, { autoAlpha: 0, y: 24, duration: 1, scrollTrigger: onEnter(paragraph), clearProps: 'all' });
      return;
    }

    const split = SplitText.create(paragraph, { type: 'lines', mask: 'lines', linesClass: 'split-line', aria: 'none' });
    gsap.from(split.lines, {
      yPercent: 105,
      duration: 0.9,
      stagger: 0.07,
      delay: 0.15 + index * 0.12,
      ease: 'power3.out',
      scrollTrigger: onEnter(paragraph),
      onComplete: () => split.revert(),
    });
  });

  // cada linha da lista é revelada da esquerda para a direita, como uma leitura
  const items = $$('.stack li');
  if (!items.length) return;

  const stack = gsap.timeline({ scrollTrigger: onEnter('.stack') });

  stack.from(items, {
    clipPath: 'inset(0% 100% 0% 0%)',
    duration: 0.9,
    stagger: 0.09,
    ease: 'power3.inOut',
    clearProps: 'clipPath',
  });

  stack.from($$('.stack li > *'), {
    x: -14,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.045,
    ease: 'power3.out',
    clearProps: 'transform,opacity,visibility',
  }, 0.2);
}

/* ---------- 6. Projetos: linhas, números, imagens e parallax ---------- */
function projectsSection({ gsap, SplitText, desktop }) {
  const rows = $$('.proj');

  rows.forEach((row) => {
    const index = $('.proj-i', row);
    const thumb = $('.proj-thumb', row);
    const image = $('.proj-thumb img', row);
    const title = $('.proj-info h3', row);
    const tags = $('.proj-info p', row);
    const arrow = $('.proj-arrow', row);

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.out' },
      scrollTrigger: onEnter(row, { start: 'top 88%' }),
    });

    // a linha do projeto se desenha, como a borda de uma tabela
    timeline.from(row, {
      clipPath: 'inset(0% 100% 0% 0%)',
      duration: 1,
      ease: 'power3.inOut',
      clearProps: 'clipPath',
    }, 0);

    // o número conta até o valor final (/01, /02…)
    if (index) {
      const target = Number(index.textContent.replace(/\D/g, '')) || 0;
      const counter = { value: 0 };
      timeline.to(counter, {
        value: target,
        duration: 0.8,
        ease: 'power2.out',
        onUpdate: () => { index.textContent = `/${String(Math.round(counter.value)).padStart(2, '0')}`; },
      }, 0.2);
    }

    // a imagem se abre de baixo para cima e assenta
    if (thumb && image && desktop) {
      timeline.from(thumb, {
        clipPath: 'inset(100% 0% 0% 0% round 10px)',
        duration: 1.1,
        ease: 'power4.out',
        clearProps: 'clipPath',
      }, 0.15);
      timeline.from(image, { scale: 1.35, duration: 1.4, ease: 'power3.out', clearProps: 'scale' }, 0.15);
    }

    if (title && SplitText) {
      const split = SplitText.create(title, { type: 'words', mask: 'words', wordsClass: 'split-word' });
      timeline.from(split.words, {
        yPercent: 110,
        duration: 0.9,
        stagger: 0.05,
        ease: 'power4.out',
        onComplete: () => split.revert(),
      }, 0.3);
    }

    if (tags) timeline.from(tags, { autoAlpha: 0, y: 10, duration: 0.7, clearProps: 'all' }, 0.5);

    if (arrow) {
      timeline.from(arrow, {
        scale: 0.5,
        rotation: -45,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'back.out(2)',
        clearProps: 'transform,opacity,visibility',
      }, 0.55);
    }

    // parallax suave da imagem dentro da moldura (usa a propriedade CSS "translate",
    // então o zoom do hover continua funcionando)
    if (thumb && desktop) {
      gsap.fromTo(thumb, { '--py': '-6%' }, {
        '--py': '6%',
        ease: 'none',
        scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }
  });

  const more = $('.projects-more');
  if (more) {
    gsap.from(more, { autoAlpha: 0, y: 24, duration: 0.9, ease: 'power3.out', scrollTrigger: onEnter(more), clearProps: 'all' });
  }
}

/* ---------- 7. Contato: texto, linhas de contato, divisor e redes ---------- */
function contactSection({ gsap, SplitText }) {
  const lead = $('.contact-copy p');
  if (lead) {
    if (SplitText) {
      const split = SplitText.create(lead, { type: 'lines', mask: 'lines', linesClass: 'split-line', aria: 'none' });
      gsap.from(split.lines, {
        yPercent: 105, duration: 0.9, stagger: 0.08, delay: 0.35, ease: 'power3.out', scrollTrigger: onEnter(lead),
        onComplete: () => split.revert(),
      });
    } else {
      gsap.from(lead, { autoAlpha: 0, y: 20, duration: 1, scrollTrigger: onEnter(lead), clearProps: 'all' });
    }
  }

  const side = $('.contact-side');
  if (!side) return;

  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: onEnter(side) });

  timeline
    .from($('.btn', side), { autoAlpha: 0, y: 20, duration: 0.8, clearProps: 'all' }, 0)
    .from($$('.contact-lines a', side), { autoAlpha: 0, x: -16, duration: 0.7, stagger: 0.1, clearProps: 'all' }, 0.15)
    .from($('.contact-divider', side), { scaleX: 0, transformOrigin: '0% 50%', duration: 1, ease: 'power3.inOut', clearProps: 'transform' }, 0.3)
    .from($$('.contact-social-item', side), {
      autoAlpha: 0,
      scale: 0.6,
      y: 12,
      duration: 0.6,
      stagger: 0.08,
      ease: 'back.out(2)',
      clearProps: 'all',
    }, 0.55);
}

/* ---------- 8. Rodapé ---------- */
function footerSection({ gsap }) {
  const footer = $('footer');
  if (!footer) return;

  gsap.timeline({ defaults: { ease: 'power3.out' }, scrollTrigger: onEnter(footer, { start: 'top 95%' }) })
    .from($$('.footer-info > *', footer), { autoAlpha: 0, y: 14, duration: 0.7, stagger: 0.08, clearProps: 'all' })
    .from($('.to-top', footer), { autoAlpha: 0, y: 18, rotation: -90, duration: 0.8, ease: 'back.out(1.8)', clearProps: 'all' }, 0.1);
}
