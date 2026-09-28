/* ============================================================
   JOÃO ALBERTO — LINKS · BLOB
   Nuvem pequena no espaço acima do perfil, com atração do mouse
   e cores que acompanham o tema claro/escuro da página.
   Renderizador, shader, mouse e loop ficam em assets/js/blob-core.js.
   ============================================================ */
import { THREE, createBlobStage, fadeIn, supportsWebGL } from '/assets/js/blob-core.js';

const COLORS = {
  dark: new THREE.Color(0x77756e),
  light: new THREE.Color(0xd8d5cb),
};

const OPACITY = { dark: 0.45, light: 0.25 };

const canvas = document.getElementById('stage');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (canvas && supportsWebGL()) {
  try {
    createLinksBlob();
  } catch (error) {
    console.warn('Não foi possível iniciar o efeito 3D.', error);
    canvas.remove();
  }
} else {
  canvas?.remove();
}

function createLinksBlob() {
  const initialTheme = document.documentElement.classList.contains('light') ? 'light' : 'dark';

  const stage = createBlobStage({
    canvas,
    reduced,
    counts: { mobile: 9000, lowPower: 16000, full: 24000 },
    color: COLORS[initialTheme],
  });

  const { uniforms, cloud } = stage;
  const animation = fadeIn({ opacity: OPACITY[initialTheme], reduced });
  const band = document.querySelector('.hero-space');
  let elapsed = 0;

  /* ---------- tema: a cor e a opacidade acompanham o botão da página ---------- */
  window.addEventListener('site-theme-change', (event) => {
    const theme = event.detail?.theme === 'light' ? 'light' : 'dark';
    const color = COLORS[theme];

    if (window.gsap && !reduced) {
      window.gsap.to(uniforms.uColor.value, { r: color.r, g: color.g, b: color.b, duration: 0.8, ease: 'power2.inOut', overwrite: 'auto' });
      window.gsap.to(animation, { opacity: OPACITY[theme], duration: 0.8, ease: 'power2.inOut', overwrite: 'auto' });
    } else {
      uniforms.uColor.value.copy(color);
      animation.opacity = OPACITY[theme];
      stage.requestRender();
    }
  });

  /* ---------- quadro a quadro: posição fixa no espaço acima do perfil ---------- */
  stage.start((delta) => {
    elapsed += delta * 0.14;

    uniforms.uTime.value = elapsed;
    uniforms.uOpacity.value = animation.opacity;
    uniforms.uScatter.value = animation.scatter;

    const { portrait, normalizedScale } = stage.viewport();
    let anchorY = 180 - window.scrollY;

    if (band) {
      const rect = band.getBoundingClientRect();
      anchorY = rect.top + rect.height * 0.5;
    }

    cloud.position.set(0, stage.toWorld(0, anchorY).y, 0);
    cloud.scale.setScalar(0.27 * Math.max(normalizedScale, 0.5) * (portrait ? 1.15 : 1));
    cloud.rotation.set(0, 0, 0);
  });
}
