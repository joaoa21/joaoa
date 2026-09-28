/* ============================================================
   JOÃO ALBERTO — BLOB DAS PÁGINAS DE ERRO
   Nuvem centralizada, mais discreta e sem atração do mouse.
   Renderizador, shader e loop ficam em assets/js/blob-core.js.
   ============================================================ */

import { createBlobStage, fadeIn, supportsWebGL } from '/assets/js/blob-core.js';

export function initErrorBlob({ canvas, reducedMotion = false } = {}) {
  if (!canvas || !supportsWebGL()) {
    canvas?.remove();
    return null;
  }

  try {
    return createErrorBlob({ canvas, reduced: reducedMotion });
  } catch (error) {
    console.warn('Não foi possível iniciar o efeito 3D.', error);
    canvas.remove();
    return null;
  }
}

function createErrorBlob({ canvas, reduced }) {
  const stage = createBlobStage({
    canvas,
    reduced,
    counts: { mobile: 8500, lowPower: 13500, full: 19000 },
    pointSize: { mobile: 2.55, desktop: 2.15 },
    pointer: false,
  });

  const { uniforms, cloud } = stage;
  const animation = fadeIn({ opacity: stage.isMobile() ? 0.22 : 0.28, reduced });
  let elapsed = 0;

  stage.start((delta) => {
    elapsed += delta * 0.14;

    uniforms.uTime.value = elapsed;
    uniforms.uOpacity.value = animation.opacity;
    uniforms.uScatter.value = animation.scatter;

    const { portrait, normalizedScale } = stage.viewport();
    cloud.position.set(0, portrait ? -0.18 : -0.08, 0);
    cloud.scale.setScalar(0.98 * Math.max(normalizedScale, 0.5) * (portrait ? 0.92 : 1));
    cloud.rotation.set(0, 0, 0);
  });

  return { destroy: stage.destroy };
}
