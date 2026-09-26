/* ============================================================
   JOÃO ALBERTO — INTERFACE DAS PÁGINAS DE ERRO
   ============================================================ */

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const hasGSAP = typeof window.gsap !== 'undefined';
const errorRoot = document.documentElement;
const errorMotionFallback = window.__errorMotionFallback;

function showErrorWithoutAnimation() {
  if (errorMotionFallback) window.clearTimeout(errorMotionFallback);
  errorRoot.classList.add('motion-fallback');
}

function finishErrorElement(element, clearProps = 'opacity,transform') {
  if (!element) return;
  element.classList.add('is-visible');
  window.gsap?.set(element, { clearProps });
}

if (hasGSAP && !reducedMotion) {
  try {
    const visual = document.querySelector('.error-visual');
    const copyElements = [...document.querySelectorAll('.error-copy > *')];
    const chromeElements = [...document.querySelectorAll('.brand, .hud')];

    if (visual) {
      window.gsap.to(visual, {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 1.15,
        ease: 'power3.out',
        delay: .12,
        onComplete: () => finishErrorElement(visual)
      });
    }

    if (copyElements.length) {
      window.gsap.to(copyElements, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: 'power3.out',
        stagger: .1,
        delay: .25,
        onComplete: () => copyElements.forEach((element) => finishErrorElement(element))
      });
    }

    if (chromeElements.length) {
      window.gsap.to(chromeElements, {
        opacity: 1,
        duration: 1.2,
        delay: .65,
        onComplete: () => chromeElements.forEach((element) => finishErrorElement(element, 'opacity'))
      });
    }

    if (errorMotionFallback) window.clearTimeout(errorMotionFallback);
  } catch (error) {
    console.error('Não foi possível iniciar as animações da página de erro:', error);
    showErrorWithoutAnimation();
  }
} else {
  showErrorWithoutAnimation();
}

const canvas = document.getElementById('stage');

if (canvas) {
  import('./error-blob.js')
    .then(({ initErrorBlob }) => {
      initErrorBlob({
        canvas,
        reducedMotion
      });
    })
    .catch((error) => {
      console.warn('O efeito 3D da página de erro não pôde ser carregado.', error);
      canvas.remove();
    });
}
