/* ============================================================
   JOÃO ALBERTO — PÁGINA DE CASE
   Animações editoriais da página de case.
   ============================================================ */

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = motionQuery.matches;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const hasGSAP = typeof gsap !== 'undefined';
const hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';
const motionFallback = window.__caseMotionFallback;

if (hasScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
}

const animatedSelector = [
  '.case-back-link',
  '.case-kicker',
  '.case-title',
  '.case-lead',
  '.case-meta',
  '.case-hero-media',
  '.case-reveal'
].join(',');

function finishElement(element) {
  if (!element) return;
  element.classList.add('is-visible');
  gsap?.set(element, { clearProps: 'opacity,transform,clipPath,willChange' });
}

function revealAll() {
  document.documentElement.classList.add('motion-fallback');
  document.querySelectorAll(animatedSelector).forEach((element) => {
    element.classList.add('is-visible');
    element.style.removeProperty('opacity');
    element.style.removeProperty('transform');
    element.style.removeProperty('clip-path');
  });

  document.querySelectorAll('.case-hero-media img, .gallery-item img').forEach((image) => {
    image.style.removeProperty('transform');
    image.style.removeProperty('will-change');
  });

  document.querySelectorAll('.gallery-item').forEach((item) => {
    item.style.removeProperty('opacity');
    item.style.removeProperty('transform');
    item.style.removeProperty('clip-path');
    item.style.removeProperty('will-change');
  });

  if (motionFallback) window.clearTimeout(motionFallback);
}

function animateIntro() {
  if (!hasGSAP || reduced) {
    revealAll();
    return;
  }

  const back = document.querySelector('.case-back-link');
  const kicker = document.querySelector('.case-kicker');
  const title = document.querySelector('.case-title');
  const lead = document.querySelector('.case-lead');
  const meta = document.querySelector('.case-meta');
  const media = document.querySelector('.case-hero-media');
  const mediaImage = media?.querySelector('img');
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const ease = 'power3.out';

  const timeline = gsap.timeline({ defaults: { ease } });

  if (back) {
    timeline.to(back, {
      y: 0,
      opacity: 1,
      duration: mobile ? .55 : .72,
      onComplete: () => finishElement(back)
    });
  }

  if (kicker) {
    timeline.to(kicker, {
      y: 0,
      opacity: 1,
      duration: mobile ? .58 : .76,
      onComplete: () => finishElement(kicker)
    }, '-=.38');
  }

  if (title) {
    timeline.to(title, {
      y: 0,
      opacity: 1,
      duration: mobile ? .82 : 1.05,
      onComplete: () => finishElement(title)
    }, '-=.42');
  }

  if (lead) {
    timeline.to(lead, {
      y: 0,
      opacity: 1,
      duration: mobile ? .66 : .84,
      onComplete: () => finishElement(lead)
    }, '-=.7');
  }

  if (meta) {
    timeline.to(meta, {
      y: 0,
      opacity: 1,
      duration: mobile ? .64 : .8,
      onComplete: () => finishElement(meta)
    }, '-=.58');
  }

  if (media) {
    /* O container recebe apenas posição e opacidade. Evitamos clip-path
       no próprio item do grid para não gerar artefatos durante a entrada. */
    timeline.to(media, {
      y: 0,
      opacity: 1,
      duration: mobile ? .78 : 1,
      onComplete: () => finishElement(media)
    }, '-=.72');

    if (mediaImage) {
      timeline.to(mediaImage, {
        scale: 1,
        duration: mobile ? .9 : 1.2,
        ease: 'power2.out',
        clearProps: 'transform,willChange'
      }, '<');
    }
  }
}

function animateReveal(element) {
  gsap.to(element, {
    y: 0,
    opacity: 1,
    duration: .82,
    ease: 'power3.out',
    onComplete: () => finishElement(element)
  });
}

function prepareGallery(grid) {
  const items = [...grid.querySelectorAll('.gallery-item')];
  const images = items
    .map((item) => item.querySelector('img'))
    .filter(Boolean);

  gsap.set(items, {
    y: 30,
    opacity: 0,
    willChange: 'opacity, transform'
  });

  gsap.set(images, {
    scale: 1.035,
    willChange: 'transform'
  });

  return { items, images };
}

function waitForImage(image) {
  if (!image) return Promise.resolve();

  image.loading = 'eager';

  if (image.complete && image.naturalWidth > 0) {
    return typeof image.decode === 'function'
      ? image.decode().catch(() => undefined)
      : Promise.resolve();
  }

  return new Promise((resolve) => {
    const finish = () => {
      image.removeEventListener('load', finish);
      image.removeEventListener('error', finish);

      if (typeof image.decode === 'function' && image.naturalWidth > 0) {
        image.decode().catch(() => undefined).finally(resolve);
      } else {
        resolve();
      }
    };

    image.addEventListener('load', finish, { once: true });
    image.addEventListener('error', finish, { once: true });
  });
}

function preloadGallery(grid, images) {
  if (grid.__imagesReady) return grid.__imagesReady;

  grid.__imagesReady = Promise.all(images.map(waitForImage));
  return grid.__imagesReady;
}

function animateGallery(grid, prepared) {
  if (grid.dataset.animated === 'true') return;
  grid.dataset.animated = 'true';

  const { items, images } = prepared;
  const mobile = window.matchMedia('(max-width: 760px)').matches;
  const stagger = mobile ? .065 : .1;

  if (!items.length) return;

  const timeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => {
      items.forEach((item) => item.classList.add('is-visible'));
      gsap.set(items, { clearProps: 'opacity,transform,willChange' });
      gsap.set(images, { clearProps: 'transform,willChange' });
    }
  });

  timeline.to(items, {
    y: 0,
    opacity: 1,
    duration: mobile ? .68 : .88,
    stagger
  }, 0);

  timeline.to(images, {
    scale: 1,
    duration: mobile ? .78 : 1,
    stagger,
    ease: 'power2.out'
  }, 0);
}

function setupScrollAnimations() {
  const reveals = [...document.querySelectorAll('.case-reveal')];
  const grids = [...document.querySelectorAll('.gallery-grid')];

  if (!hasGSAP || reduced) {
    revealAll();
    return;
  }

  reveals.forEach((element) => {
    if (hasScrollTrigger) {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 88%',
        once: true,
        onEnter: () => animateReveal(element)
      });
    } else {
      finishElement(element);
    }
  });

  const preparedGrids = new Map();
  grids.forEach((grid) => preparedGrids.set(grid, prepareGallery(grid)));

  if (!('IntersectionObserver' in window)) {
    grids.forEach(async (grid) => {
      const prepared = preparedGrids.get(grid);
      await preloadGallery(grid, prepared.images);
      animateGallery(grid, prepared);
    });
    return;
  }

  /* Começa a carregar as miniaturas antes de o grid entrar na tela. */
  const preloadObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const grid = entry.target;
      const prepared = preparedGrids.get(grid);
      preloadGallery(grid, prepared.images);
      observer.unobserve(grid);
    });
  }, {
    rootMargin: '520px 0px 520px 0px',
    threshold: 0
  });

  /* A animação só começa quando o grid entra e todas as imagens estão decodificadas. */
  const entranceObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(async (entry) => {
      if (!entry.isIntersecting) return;

      const grid = entry.target;
      const prepared = preparedGrids.get(grid);
      observer.unobserve(grid);

      await preloadGallery(grid, prepared.images);

      requestAnimationFrame(() => {
        animateGallery(grid, prepared);
      });
    });
  }, {
    rootMargin: '0px 0px -8% 0px',
    threshold: .06
  });

  grids.forEach((grid) => {
    preloadObserver.observe(grid);
    entranceObserver.observe(grid);
  });
}

try {
  animateIntro();
  setupScrollAnimations();

  if (motionFallback) window.clearTimeout(motionFallback);
} catch (error) {
  console.error('Não foi possível iniciar as animações do case:', error);
  revealAll();
}
