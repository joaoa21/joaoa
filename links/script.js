/* ============================================================
   JOÃO ALBERTO — LINKS
   Tema, acessibilidade e animações essenciais.
   O efeito Three.js vive isolado em blob.js.
   ============================================================ */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const hasGSAP = typeof window.gsap !== 'undefined';
const root = document.documentElement;
const toggleBtn = document.getElementById('themeToggle');
const themeColor = document.getElementById('themeColor');

/* ---------- Lenis · mesma sensação de rolagem da home ---------- */
let lenis = null;

if (window.Lenis && !reducedMotion) {
  lenis = new Lenis({
    duration: 1,
    lerp: 0.075,
    smoothWheel: true
  });

  const raf = (time) => {
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  };

  window.requestAnimationFrame(raf);
}

function updateThemeControl(theme) {
  if (!toggleBtn) return;

  const light = theme === 'light';
  const icon = toggleBtn.querySelector('.knob i');

  if (icon) {
    icon.className = light ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }

  toggleBtn.setAttribute('aria-checked', String(light));
  toggleBtn.setAttribute('aria-label', light ? 'Ativar tema escuro' : 'Ativar tema claro');
}

function applyTheme(theme, save = true) {
  const normalizedTheme = theme === 'light' ? 'light' : 'dark';
  const light = normalizedTheme === 'light';

  root.classList.toggle('light', light);
  themeColor?.setAttribute('content', light ? '#f2f0eb' : '#0f0f0f');
  updateThemeControl(normalizedTheme);

  if (save) {
    try {
      localStorage.setItem('joaoa-theme', normalizedTheme);
    } catch {}
  }

  window.dispatchEvent(new CustomEvent('site-theme-change', {
    detail: { theme: normalizedTheme }
  }));
}

const initialTheme = root.classList.contains('light') ? 'light' : 'dark';
applyTheme(initialTheme, false);

toggleBtn?.addEventListener('click', () => {
  applyTheme(root.classList.contains('light') ? 'dark' : 'light');
});

/* ---------- Entrada da interface ---------- */
const linksMotionFallback = window.__linksMotionFallback;

function showLinksWithoutAnimation() {
  if (linksMotionFallback) window.clearTimeout(linksMotionFallback);
  root.classList.add('motion-fallback');
}

function finishLinksElement(element, clearProps = 'opacity,transform') {
  if (!element) return;
  element.classList.add('is-visible');
  window.gsap?.set(element, { clearProps });
}

if (hasGSAP && !reducedMotion) {
  try {
    const introTargets = [...document.querySelectorAll(
      '.profile, .bio, .theme-toggle, .link-section, .socials'
    )];
    const hudFixed = document.querySelector('.hud-fixed');

    if (introTargets.length) {
      window.gsap.to(introTargets, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: .08,
        delay: .15,
        onComplete: () => introTargets.forEach((element) => finishLinksElement(element))
      });
    }

    if (hudFixed) {
      window.gsap.to(hudFixed, {
        opacity: 1,
        duration: 1.2,
        delay: .8,
        onComplete: () => finishLinksElement(hudFixed, 'opacity')
      });
    }

    if (linksMotionFallback) window.clearTimeout(linksMotionFallback);
  } catch (error) {
    console.error('Não foi possível iniciar as animações da página de links:', error);
    showLinksWithoutAnimation();
  }
} else {
  showLinksWithoutAnimation();
}

