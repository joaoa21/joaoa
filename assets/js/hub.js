/* ============================================================
   JOÃO ALBERTO — HUB DE PORTFÓLIO
   Navegação, HUD, Lenis, reveals e inicialização do blob.
   ============================================================ */

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = motionQuery.matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const hasGSAP = typeof gsap !== 'undefined';
const hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';

if (hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

/* ---------- Lenis ---------- */
let lenis = null;

if (window.Lenis && !reduced) {
  lenis = new window.Lenis({
    duration: 1,
    lerp: .075,
    smoothWheel: true
  });

  if (hasScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const lenisFrame = (time) => {
      lenis.raf(time);
      window.requestAnimationFrame(lenisFrame);
    };

    window.requestAnimationFrame(lenisFrame);
  }
}

/* ---------- Elementos ---------- */
const siteNav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const hudClock = document.getElementById('hudClock');
const hud = document.querySelector('.hud');
const footer = document.querySelector('footer');
const toTop = document.querySelector('.to-top');
const mobileMenuQuery = window.matchMedia('(max-width: 860px)');
const focusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ---------- Navbar durante o scroll ---------- */
let scrollFrame = 0;

function updateNav() {
  scrollFrame = 0;
  siteNav?.classList.toggle('scrolled', window.scrollY > 80);
}

function requestNavUpdate() {
  if (!scrollFrame) {
    scrollFrame = window.requestAnimationFrame(updateNav);
  }
}

window.addEventListener('scroll', requestNavUpdate, { passive: true });
window.addEventListener('resize', requestNavUpdate, { passive: true });
updateNav();

/* ---------- Menu mobile acessível ---------- */
function syncMenuMode() {
  if (!navMenu || !navToggle) return;

  if (!mobileMenuQuery.matches) {
    closeMenu({ restoreFocus: false });
    navMenu.inert = false;
  } else if (!navMenu.classList.contains('open')) {
    navMenu.inert = true;
  }
}

function openMenu() {
  if (!navMenu || !navToggle || !mobileMenuQuery.matches) return;

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
  if (!navMenu || !navToggle) return;

  const wasOpen = navMenu.classList.contains('open');

  navToggle.classList.remove('open');
  navMenu.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Abrir menu');
  document.body.classList.remove('no-scroll');
  lenis?.start();

  if (mobileMenuQuery.matches) {
    navMenu.inert = true;
  }

  if (!restoreFocus && navMenu.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  if (restoreFocus && wasOpen) {
    navToggle.focus();
  }
}

function trapMenuFocus(event) {
  if (event.key !== 'Tab' || !navMenu?.classList.contains('open')) return;

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

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.contains('open') ? closeMenu() : openMenu();
  });

  navMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu({ restoreFocus: false }));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('open')) {
      closeMenu();
    }

    trapMenuFocus(event);
  });

  mobileMenuQuery.addEventListener?.('change', syncMenuMode);
  syncMenuMode();
}

/* ---------- HUD ---------- */
function updateClock() {
  if (!hudClock) return;

  hudClock.textContent = new Date().toLocaleTimeString('pt-BR', {
    hour12: false
  });
}

updateClock();
window.setInterval(updateClock, 1000);

if (hud && footer && 'IntersectionObserver' in window) {
  const footerObserver = new IntersectionObserver(
    ([entry]) => hud.classList.toggle('hud-hidden', entry.isIntersecting),
    { rootMargin: '0px 0px 80px 0px' }
  );

  footerObserver.observe(footer);
}

/* ---------- Voltar ao topo ---------- */
toTop?.addEventListener('click', (event) => {
  event.preventDefault();

  if (lenis) {
    lenis.scrollTo(0);
  } else {
    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  }
});

/* ---------- Animações de interface ---------- */
const rootElement = document.documentElement;
const motionFallback = window.__hubMotionFallback;
const isMobileMotion = window.matchMedia('(max-width: 760px)').matches;

function revealWithoutAnimation() {
  if (motionFallback) window.clearTimeout(motionFallback);
  rootElement.classList.add('motion-fallback');
}

function finishElement(element, clearProps = 'opacity,transform') {
  if (!element) return;

  element.classList.add('is-visible');
  gsap.set(element, { clearProps });
}

function finishElements(elements, clearProps = 'opacity,transform') {
  elements.forEach((element) => finishElement(element, clearProps));
}

function animateCard(card, delay = 0) {
  if (!card || card.dataset.revealed === 'true') return;

  card.dataset.revealed = 'true';

  const preview = card.querySelector('.pcard-preview');
  const image = preview?.querySelector('img');
  const content = [...card.querySelectorAll('.pcard-body > *')];
  const duration = isMobileMotion ? .68 : .9;

  const timeline = gsap.timeline({
    delay,
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      card.classList.add('is-visible');
      gsap.set(card, { clearProps: 'opacity,transform' });
      if (preview) gsap.set(preview, { clearProps: 'clipPath,willChange' });
      if (image) gsap.set(image, { clearProps: 'transform,willChange' });
      content.forEach((element) => gsap.set(element, { clearProps: 'opacity,transform,willChange' }));
    }
  });

  timeline.to(card, {
    y: 0,
    opacity: 1,
    duration
  }, 0);

  if (preview) {
    timeline.to(preview, {
      clipPath: 'inset(0% 0% 0% 0%)',
      duration: isMobileMotion ? .72 : 1
    }, .04);
  }

  if (image) {
    timeline.to(image, {
      scale: 1.02,
      duration: isMobileMotion ? .8 : 1.08
    }, .04);
  }

  if (content.length) {
    timeline.to(content, {
      y: 0,
      opacity: 1,
      duration: isMobileMotion ? .48 : .58,
      stagger: isMobileMotion ? .045 : .075
    }, isMobileMotion ? .18 : .24);
  }
}

function setupInterfaceAnimations() {
  if (!hasGSAP || reduced) {
    revealWithoutAnimation();
    return;
  }

  try {
    const ease = 'power3.out';
    const introNav = document.querySelector('.site-nav');
    const introBackLink = document.querySelector('.hub-back-link');
    const introLabel = document.querySelector('.hub-label');
    const introTitle = document.querySelector('.hub-title');
    const introDesc = document.querySelector('.hub-desc');

    const introTimeline = gsap.timeline({ defaults: { ease } });

    if (introNav) {
      introTimeline.to(introNav, {
        y: 0,
        opacity: 1,
        duration: isMobileMotion ? .72 : .95,
        onComplete: () => finishElement(introNav)
      });
    }

    if (introBackLink) {
      introTimeline.to(introBackLink, {
        y: 0,
        opacity: 1,
        duration: isMobileMotion ? .56 : .72,
        onComplete: () => finishElement(introBackLink)
      }, '-=.5');
    }

    if (introLabel) {
      introTimeline.to(introLabel, {
        y: 0,
        opacity: 1,
        duration: isMobileMotion ? .62 : .82,
        onComplete: () => finishElement(introLabel)
      }, '-=.52');
    }

    if (introTitle) {
      introTimeline.to(introTitle, {
        y: 0,
        opacity: 1,
        duration: isMobileMotion ? .82 : 1.08,
        onComplete: () => finishElement(introTitle)
      }, '-=.48');
    }

    if (introDesc) {
      introTimeline.to(introDesc, {
        y: 0,
        opacity: 1,
        duration: isMobileMotion ? .68 : .86,
        onComplete: () => finishElement(introDesc)
      }, '-=.72');
    }

    const cards = [...document.querySelectorAll('.pcard')];
    const backElements = [...document.querySelectorAll('.hub-back-section > *')];
    const ctaElements = [...document.querySelectorAll('.hub-cta > *')];

    if (hasScrollTrigger) {
      cards.forEach((card, index) => {
        ScrollTrigger.create({
          trigger: card,
          start: 'top 88%',
          once: true,
          onEnter: () => animateCard(
            card,
            isMobileMotion ? 0 : (index % 2) * .12
          )
        });
      });

      if (backElements.length) {
        gsap.to(backElements, {
          y: 0,
          opacity: 1,
          duration: isMobileMotion ? .62 : .82,
          ease,
          stagger: isMobileMotion ? .06 : .1,
          scrollTrigger: {
            trigger: '.hub-back-section',
            start: 'top 90%',
            once: true
          },
          onComplete: () => finishElements(backElements)
        });
      }

      if (ctaElements.length) {
        gsap.to(ctaElements, {
          y: 0,
          opacity: 1,
          duration: isMobileMotion ? .66 : .88,
          ease,
          stagger: isMobileMotion ? .07 : .12,
          scrollTrigger: {
            trigger: '.hub-cta',
            start: 'top 86%',
            once: true
          },
          onComplete: () => finishElements(ctaElements)
        });
      }

      if (footer) {
        gsap.to(footer, {
          y: 0,
          opacity: 1,
          duration: isMobileMotion ? .62 : .82,
          ease,
          scrollTrigger: {
            trigger: footer,
            start: 'top 96%',
            once: true
          },
          onComplete: () => finishElement(footer)
        });
      }

      window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    } else {
      cards.forEach((card) => animateCard(card));
      finishElements(backElements);
      finishElements(ctaElements);
      finishElement(footer);
    }

    if (motionFallback) window.clearTimeout(motionFallback);
  } catch (error) {
    console.error('Não foi possível iniciar as animações do hub:', error);
    revealWithoutAnimation();
  }
}

setupInterfaceAnimations();

/* ---------- Blob (carregado apenas quando a página possui canvas) ---------- */
const blobCanvas = document.getElementById('stage');

if (blobCanvas) {
  import('./blob-hub.js')
    .then(({ initProjectBlob }) => {
      const blobController = initProjectBlob({
        canvas: blobCanvas,
        anchor: document.querySelector('.hub-head'),
        reducedMotion: reduced
      });

      window.addEventListener('pagehide', () => blobController?.destroy(), { once: true });
    })
    .catch((error) => {
      console.error('Não foi possível carregar o blob do hub:', error);
      blobCanvas.remove();
    });
}
