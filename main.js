/* ============================================================
   JOÃO ALBERTO — HOME
   Interações essenciais, navegação, temas e animações de interface.
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
const hud = document.querySelector('.hud');
const sections = [...document.querySelectorAll('section[data-theme]')];
const navSectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

let activeSection = null;
let scrollFrame = 0;
let degreeTarget = 0;
let degreeCurrent = 0;
let degreeRunning = false;
let degreeShown = null;

/* ---------- Menu mobile acessível ---------- */
initMobileMenu({ lenis });

/* ---------- Voltar ao topo sem "#topo" no endereço ----------
   Logo, "Início" e a seta do rodapé sobem suave até o topo e deixam a URL limpa. */
function scrollToTop() {
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
}

document.querySelectorAll('a[href="#topo"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    scrollToTop();
  });
});

// quem chega com #topo no endereço (link antigo) fica com a URL limpa
if (location.hash === '#topo') history.replaceState(null, '', location.pathname + location.search);

/* ---------- HUD ---------- */
function updateClock() {
  if (hudClock) {
    hudClock.textContent = new Date().toLocaleTimeString('pt-BR', { hour12: false });
  }
}

updateClock();
window.setInterval(updateClock, 1000);

/* ---------- Seção ativa ----------
   As cores das seções são fixas (CSS, data-theme): aqui só o item do menu e a HUD acompanham. */
function setActiveNavLink(section) {
  navSectionLinks.forEach((link) => {
    const isCurrent = link.getAttribute('href') === `#${section.id}`;
    if (isCurrent) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function syncSection() {
  if (!sections.length) return;

  // Uma seção assume quando o topo dela passa do meio da tela.
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
    hud?.classList.toggle('on-light', candidate.dataset.theme === 'light');
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
  startDegree();
}

function requestScrollUpdate() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateFromScroll);
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate, { passive: true });
requestScrollUpdate();

/* O contador só anima enquanto o valor muda: com a página parada, não há trabalho nenhum. */
function showDegree() {
  const rounded = Math.round(degreeCurrent);
  if (rounded === degreeShown) return;
  degreeShown = rounded;
  if (hudDeg) hudDeg.textContent = `${rounded}°`;
}

function animateDegree() {
  degreeCurrent += (degreeTarget - degreeCurrent) * 0.12;
  showDegree();
  if (Math.abs(degreeTarget - degreeCurrent) > 0.05) requestAnimationFrame(animateDegree);
  else degreeRunning = false;
}

function startDegree() {
  if (reduced || degreeRunning) return;
  degreeRunning = true;
  requestAnimationFrame(animateDegree);
}

if (reduced) {
  const syncReducedDegree = () => {
    degreeCurrent = degreeTarget;
    showDegree();
  };
  window.addEventListener('scroll', syncReducedDegree, { passive: true });
  window.addEventListener('resize', syncReducedDegree, { passive: true });
  requestAnimationFrame(syncReducedDegree);
}

/* ---------- Animações de interface (assets/js/home-motion.js) ---------- */
initHomeMotion();
