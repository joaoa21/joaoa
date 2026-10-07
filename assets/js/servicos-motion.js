/* ============================================================
   JOÃO ALBERTO — ANIMAÇÕES DA PÁGINA "CRIAÇÃO DE SITES"
   A navegação, a abertura, os cards de projeto e o CTA já são animados
   pelo hub.js. Aqui ficam as seções próprias da página: cada uma entra
   uma vez, quando chega na tela. Os passos do processo se montam em
   sequência: a linha se desenha, os números aparecem e cada visual
   ganha vida (etiquetas, proposta, esqueleto do layout e "No ar").
   ============================================================ */

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

const root = document.documentElement;
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isCrawler = /bot|crawl|spider|slurp|facebookexternalhit/i.test(navigator.userAgent);
const isMobile = window.matchMedia('(max-width: 760px)').matches;

const onEnter = (trigger, start = 'top 82%') => ({ trigger, start, once: true });

function showActions() {
  $('.svc-actions')?.classList.add('is-visible');
}

function init() {
  const { gsap, ScrollTrigger } = window;

  if (isCrawler || reduced || !gsap || !ScrollTrigger || root.classList.contains('motion-fallback')) {
    showActions();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  const ease = 'power3.out';

  // cabeçalho de cada seção: rótulo, título e texto de apoio
  $$('.svc-head').forEach((head) => {
    gsap.from(head.children, {
      y: 28,
      autoAlpha: 0,
      duration: .9,
      stagger: .1,
      ease,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: onEnter(head, 'top 85%'),
    });
  });

  // o que eu faço: os cards sobem em sequência
  const cards = $$('.svc-card');
  if (cards.length) {
    gsap.from(cards, {
      y: 40,
      autoAlpha: 0,
      duration: .85,
      stagger: isMobile ? .08 : .09,
      ease,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: onEnter('.svc-grid'),
    });
  }

  // como funciona: linha, números, textos e visuais
  const steps = $('.svc-steps');
  if (steps) {
    // No computador os quatro passos estão lado a lado: uma sequência só.
    // No celular eles ficam empilhados: cada passo anima quando chega na tela.
    const shared = isMobile ? null : gsap.timeline({ defaults: { ease }, scrollTrigger: onEnter(steps, 'top 78%') });
    shared?.fromTo(steps, { '--steps-line': 0 }, { '--steps-line': 1, duration: 1.4, ease: 'power2.inOut' }, 0);

    $$('.svc-step', steps).forEach((step, index) => {
      const timeline = shared ?? gsap.timeline({ defaults: { ease }, scrollTrigger: onEnter(step, 'top 85%') });
      const at = shared ? .15 + index * .22 : 0;
      const number = $('.svc-step-n', step);
      const texts = $$('h3, p', step);
      const visual = $('.svc-step-visual', step);

      if (number) {
        timeline.from(number, { scale: .4, autoAlpha: 0, duration: .6, ease: 'back.out(2.2)', clearProps: 'transform,opacity,visibility' }, at);
      }
      timeline.from(texts, { y: 18, autoAlpha: 0, duration: .7, stagger: .08, clearProps: 'transform,opacity,visibility' }, at + .1);

      if (!visual) return;
      const chips = $$('.svc-chips span', visual);
      const pill = $('.svc-pill', visual);
      const bars = $$('.svc-wire i', visual);
      const status = $('.svc-status', visual);

      if (chips.length) {
        timeline.from(chips, { y: 10, autoAlpha: 0, duration: .45, stagger: .07, clearProps: 'transform,opacity,visibility' }, at + .35);
      }
      if (pill) {
        timeline.from(pill, { clipPath: 'inset(0% 100% 0% 0%)', duration: .7, ease: 'power3.inOut', clearProps: 'clipPath' }, at + .35);
      }
      if (bars.length) {
        timeline.from($('.svc-wire', visual), { autoAlpha: 0, duration: .3, clearProps: 'opacity,visibility' }, at + .3);
        timeline.from(bars, { scaleX: 0, transformOrigin: '0% 50%', duration: .5, stagger: .08, ease: 'power2.out', clearProps: 'transform' }, at + .4);
      }
      if (status) {
        timeline.from(status, { scale: .6, autoAlpha: 0, duration: .55, ease: 'back.out(2)', clearProps: 'transform,opacity,visibility' }, at + .4);
      }
    });
  }

  // o que todo site inclui: cada linha se revela da esquerda para a direita
  const items = $$('.svc-list li');
  if (items.length) {
    const list = gsap.timeline({ scrollTrigger: onEnter('.svc-list') });
    list.from(items, { clipPath: 'inset(0% 100% 0% 0%)', duration: .9, stagger: .07, ease: 'power3.inOut', clearProps: 'clipPath' });
    list.from($$('.svc-list li > *'), { x: -12, autoAlpha: 0, duration: .6, stagger: .035, ease, clearProps: 'transform,opacity,visibility' }, .2);
  }

  // perguntas frequentes
  const questions = $$('.svc-faq-list details');
  if (questions.length) {
    gsap.from(questions, {
      y: 20,
      autoAlpha: 0,
      duration: .7,
      stagger: .07,
      ease,
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: onEnter('.svc-faq-list'),
    });
  }

  const more = $('.svc-more');
  if (more) {
    gsap.from(more, { y: 16, autoAlpha: 0, duration: .7, ease, clearProps: 'transform,opacity,visibility', scrollTrigger: onEnter(more, 'top 92%') });
  }

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

try {
  init();
} catch (error) {
  console.error('Não foi possível iniciar as animações da página de serviços:', error);
  showActions();
}
