/* ============================================================
   JOÃO ALBERTO — HOME
   Interações essenciais, navegação, temas e animações de interface.
   O efeito Three.js é carregado separadamente em blob.js.
   ============================================================ */

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = motionQuery.matches;
const hasGSAP = typeof window.gsap !== 'undefined';
const hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== 'undefined';

if (hasScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

/* ---------- Lenis + GSAP ---------- */
let lenis = null;

if (window.Lenis && !reduced) {
  lenis = new window.Lenis({
    duration: 1,
    lerp: 0.075,
    smoothWheel: true
  });

  if (hasScrollTrigger) {
    lenis.on('scroll', window.ScrollTrigger.update);
    window.gsap.ticker.add((time) => lenis.raf(time * 1000));
    window.gsap.ticker.lagSmoothing(0);
  } else {
    const lenisFrame = (time) => {
      lenis.raf(time);
      requestAnimationFrame(lenisFrame);
    };
    requestAnimationFrame(lenisFrame);
  }
}

/* ---------- Elementos compartilhados ---------- */
const siteNav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const hudClock = document.getElementById('hudClock');
const hudDeg = document.getElementById('hudDeg');
const sections = [...document.querySelectorAll('[data-blob]')];
const navSectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const mobileMenuQuery = window.matchMedia('(max-width: 860px)');

let blobController = null;
let activeSection = null;
let scrollFrame = 0;
let degreeTarget = 0;
let degreeCurrent = 0;

/* ---------- Menu mobile acessível ---------- */
const menuFocusableSelector = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

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

  requestAnimationFrame(() => {
    navMenu.querySelector(menuFocusableSelector)?.focus();
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

  if (mobileMenuQuery.matches) navMenu.inert = true;
  if (!restoreFocus && navMenu.contains(document.activeElement)) document.activeElement.blur();
  if (restoreFocus && wasOpen) navToggle.focus();
}

function trapMenuFocus(event) {
  if (event.key !== 'Tab' || !navMenu?.classList.contains('open')) return;

  const focusable = [...navMenu.querySelectorAll(menuFocusableSelector)]
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
    if (event.key === 'Escape' && navMenu.classList.contains('open')) closeMenu();
    trapMenuFocus(event);
  });

  mobileMenuQuery.addEventListener?.('change', syncMenuMode);
  syncMenuMode();
}

/* ---------- HUD ---------- */
function updateClock() {
  if (hudClock) {
    hudClock.textContent = new Date().toLocaleTimeString('pt-BR', { hour12: false });
  }
}

updateClock();
window.setInterval(updateClock, 1000);

/* ---------- Tema e seção ativa ---------- */
function applyTheme(theme) {
  document.body.classList.toggle('light', theme === 'light');
  blobController?.setTheme(theme);
}

function setActiveNavLink(section) {
  navSectionLinks.forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${section.id}`;
    if (isCurrent) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function syncSection() {
  if (!sections.length) return;

  let candidate = sections[0];
  for (const section of sections) {
    const activationFactor = section.dataset.blob === 'contact' ? 0.3 : 0.5;
    if (section.offsetTop <= window.scrollY + window.innerHeight * activationFactor) {
      candidate = section;
    }
  }

  if (candidate !== activeSection) {
    activeSection = candidate;
    applyTheme(candidate.dataset.theme);
    blobController?.goTo(candidate.dataset.blob);
    setActiveNavLink(candidate);
  }
}

/* ---------- Um único ciclo para leituras de scroll ---------- */
function updateFromScroll() {
  scrollFrame = 0;
  siteNav?.classList.toggle('scrolled', window.scrollY > 80);

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  degreeTarget = maxScroll > 0 ? (window.scrollY / maxScroll) * 360 : 0;
  syncSection();
}

function requestScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateFromScroll);
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate, { passive: true });
requestScrollUpdate();

function animateDegree() {
  degreeCurrent += (degreeTarget - degreeCurrent) * 0.12;
  if (hudDeg) hudDeg.textContent = `${Math.round(degreeCurrent)}°`;
  requestAnimationFrame(animateDegree);
}

if (reduced) {
  const syncReducedDegree = () => {
    degreeCurrent = degreeTarget;
    if (hudDeg) hudDeg.textContent = `${Math.round(degreeCurrent)}°`;
  };
  window.addEventListener('scroll', syncReducedDegree, { passive: true });
  window.addEventListener('resize', syncReducedDegree, { passive: true });
  requestAnimationFrame(syncReducedDegree);
} else {
  requestAnimationFrame(animateDegree);
}

/* ---------- Animações de interface ---------- */
const homeRoot = document.documentElement;
const homeMotionFallback = window.__homeMotionFallback;

function showHomeWithoutAnimation() {
  if (homeMotionFallback) window.clearTimeout(homeMotionFallback);
  homeRoot.classList.add('motion-fallback');
}

function finishHomeElement(element, clearProps = 'opacity,transform') {
  if (!element) return;
  element.classList.add('is-visible');
  window.gsap?.set(element, { clearProps });
}

if (hasGSAP && !reduced) {
  try {
    const gsap = window.gsap;
    const ease = 'power3.out';
    const introNav = document.querySelector('.site-nav');
    const titleLines = [...document.querySelectorAll('.hero-title .line em')];
    const heroProfile = document.querySelector('.hero-profile');
    const heroCta = document.querySelector('.hero-cta');
    const hudElements = [...document.querySelectorAll('.hud-corner, .hud-deg')];

    const introTimeline = gsap.timeline({ defaults: { ease } });

    if (introNav) {
      introTimeline.to(introNav, {
        y: 0,
        opacity: 1,
        duration: 1,
        onComplete: () => finishHomeElement(introNav)
      });
    }

    if (titleLines.length) {
      introTimeline.to(titleLines, {
        '--home-title-reveal-y': '0%',
        duration: 1.4,
        stagger: .13,
        ease: 'power4.out',
        onComplete: () => {
          titleLines.forEach((line) => {
            line.classList.add('is-visible');
            line.style.removeProperty('--home-title-reveal-y');
            line.style.removeProperty('transform');
          });
        }
      }, '-=.55');
    }

    if (heroProfile) {
      introTimeline.to(heroProfile, {
        y: 0,
        opacity: 1,
        duration: 1,
        onComplete: () => finishHomeElement(heroProfile)
      }, '-=.85');
    }

    if (heroCta) {
      introTimeline.to(heroCta, {
        y: 0,
        opacity: 1,
        duration: 1,
        onComplete: () => finishHomeElement(heroCta)
      }, '-=.8');
    }

    if (hudElements.length) {
      introTimeline.to(hudElements, {
        opacity: 1,
        duration: 1.2,
        onComplete: () => hudElements.forEach((element) => finishHomeElement(element, 'opacity'))
      }, '-=.9');
    }

    if (hasScrollTrigger) {
      const rise = (targets, trigger, options = {}) => {
        gsap.from(targets, {
          y: 34,
          opacity: 0,
          duration: 1.15,
          ease,
          stagger: options.stagger ?? 0.1,
          scrollTrigger: {
            trigger,
            start: options.start ?? 'top 78%',
            once: true
          }
        });
      };

      rise('.about .sec-head', '.about');
      rise('.about-copy > *', '.about-copy', { stagger: 0.12 });
      rise('.stack li', '.stack', { stagger: 0.07 });
      rise('.projects .sec-head', '.projects');
      rise('.projects-title', '.projects-title');

      gsap.from('.proj', {
        y: 40,
        opacity: 0,
        duration: 1.05,
        ease,
        stagger: 0.11,
        scrollTrigger: { trigger: '.proj-list', start: 'top 80%', once: true },
        clearProps: 'all'
      });

      rise('.contact-copy > *', '.contact', { start: 'top 70%', stagger: 0.12 });
      rise('.contact-side', '.contact-side');

      gsap.to('.hero-title', {
        yPercent: -10,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      window.addEventListener('load', () => window.ScrollTrigger.refresh(), { once: true });
    }

    if (homeMotionFallback) window.clearTimeout(homeMotionFallback);
  } catch (error) {
    console.error('Não foi possível iniciar as animações da home:', error);
    showHomeWithoutAnimation();
  }
} else {
  showHomeWithoutAnimation();
}

/* ---------- Three.js isolado: falhas não afetam a interface ---------- */
const stage = document.getElementById('stage');

if (stage) {
  import('./blob.js')
    .then(({ initBlob }) => {
      blobController = initBlob({
        canvas: stage,
        sections,
        activeSection,
        reducedMotion: reduced
      });

      if (activeSection && blobController) {
        blobController.setTheme(activeSection.dataset.theme);
        blobController.goTo(activeSection.dataset.blob);
      }
    })
    .catch((error) => {
      console.warn('Efeito 3D indisponível; a home continuará funcionando.', error);
      stage.remove();
    });
}

