/* ============================================================
   JOÃO ALBERTO — CURRÍCULO
   Scroll suave, impressão ATS e entradas discretas.
   ============================================================ */

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

/* ---------- Lenis ---------- */
let lenis = null;

if (window.Lenis && !reducedMotion) {
  lenis = new window.Lenis({
    duration: 1.2,
    smoothWheel: true,
    smoothTouch: false,
    lerp: 0.08
  });

  const raf = (time) => {
    lenis.raf(time);
    window.requestAnimationFrame(raf);
  };

  window.requestAnimationFrame(raf);
}

/* ---------- Impressão / PDF ---------- */
const printButton = document.getElementById('printCv');

function preparePrint() {
  lenis?.stop();
  document.body.classList.add('is-printing');

  /* Evita que uma seção ainda em animação saia transparente no PDF. */
  document.getAnimations().forEach((animation) => {
    try {
      animation.finish();
    } catch {
      animation.cancel();
    }
  });
}

function restoreAfterPrint() {
  document.body.classList.remove('is-printing');
  lenis?.start();
}

printButton?.addEventListener('click', () => {
  preparePrint();

  /* Aguarda o navegador aplicar o layout de impressão. */
  window.requestAnimationFrame(() => {
    window.print();
  });
});

window.addEventListener('beforeprint', preparePrint);
window.addEventListener('afterprint', restoreAfterPrint);

/* ---------- Entradas discretas ---------- */
const revealElements = document.querySelectorAll('[data-reveal]');

if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.animate(
          [
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
          ],
          {
            duration: 700,
            easing: 'cubic-bezier(.22, 1, .36, 1)',
            fill: 'both'
          }
        );

        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.08,
      rootMargin: '0px 0px -8% 0px'
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}
