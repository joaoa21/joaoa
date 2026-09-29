/* ============================================================
   JOÃO ALBERTO — HOME
   Interações essenciais, navegação, temas e animações de interface.
   O efeito Three.js é carregado separadamente em blob.js.
   ============================================================ */

import { initMobileMenu } from '/assets/js/nav.js';
import { initHomeMotion } from '/assets/js/home-motion.js';

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
const hudClock = document.getElementById('hudClock');
const hudDeg = document.getElementById('hudDeg');
const sections = [...document.querySelectorAll('[data-blob]')];
const navSectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

let blobController = null;
let activeSection = null;
let scrollFrame = 0;
let degreeTarget = 0;
let degreeCurrent = 0;

/* ---------- Menu mobile acessível ---------- */
initMobileMenu({ lenis });

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

  // Uma seção assume o tema quando o topo dela passa do meio da tela.
  let candidate = sections[0];
  for (const section of sections) {
    if (section.offsetTop <= window.scrollY + window.innerHeight * 0.5) {
      candidate = section;
    }
  }

  // No fim da página a última seção sempre assume, mesmo em telas altas
  // em que o topo dela nunca chega ao meio da tela.
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  if (maxScroll > 0 && window.scrollY >= maxScroll - 4) {
    candidate = sections[sections.length - 1];
  }

  if (candidate !== activeSection) {
    activeSection = candidate;
    applyTheme(candidate.dataset.theme);
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
  syncBlobExit();
}

/* ---------- Blob só no hero: some conforme o hero sai da tela ---------- */
const heroSection = document.querySelector('.hero');

function syncBlobExit() {
  if (!blobController || !heroSection) return;
  const rect = heroSection.getBoundingClientRect();
  blobController.setExit(rect.height > 0 ? -rect.top / rect.height : 0);
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

/* ---------- Animações de interface (assets/js/home-motion.js) ---------- */
initHomeMotion();

/* ---------- Three.js isolado: falhas não afetam a interface ----------
   O blob é decorativo: só começa a baixar depois que a página carregou,
   para não disputar rede e processador com o texto da abertura. */
const stage = document.getElementById('stage');

const afterLoad = (task) => {
  const run = () => ('requestIdleCallback' in window ? window.requestIdleCallback(task, { timeout: 800 }) : window.setTimeout(task, 200));
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
};

if (stage) afterLoad(() => {
  import('./blob.js')
    .then(({ initBlob }) => {
      blobController = initBlob({
        canvas: stage,
        hero: heroSection,
        reducedMotion: reduced
      });

      document.documentElement.classList.toggle('no-blob', !blobController);
      syncBlobExit();
    })
    .catch((error) => {
      console.warn('Efeito 3D indisponível; a home continuará funcionando.', error);
      stage.remove();
      document.documentElement.classList.add('no-blob');
    });
});

