/* ============================================================
   JOÃO ALBERTO — BLOB DAS PÁGINAS DE PROJETOS
   Nuvem ancorada ao cabeçalho, à direita. O mouse afeta só as partículas.
   Renderizador, shader, mouse e loop ficam em blob-core.js.
   ============================================================ */

import { createBlobStage, fadeIn, supportsWebGL } from './blob-core.js';

const OPACITY = 0.5;

export function initProjectBlob({ canvas, anchor = null, reducedMotion = false } = {}) {
  if (!canvas || !supportsWebGL()) {
    canvas?.remove();
    return null;
  }

  try {
    return createProjectBlob({ canvas, anchor, reduced: reducedMotion });
  } catch (error) {
    console.warn('Não foi possível iniciar o efeito 3D.', error);
    canvas.remove();
    return null;
  }
}

function createProjectBlob({ canvas, anchor, reduced }) {
  const stage = createBlobStage({ canvas, reduced });
  const { uniforms, cloud } = stage;
  const animation = fadeIn({ opacity: OPACITY, reduced });
  let elapsed = 0;

  stage.start((delta) => {
    elapsed += delta * 0.14;

    uniforms.uTime.value = elapsed;
    uniforms.uOpacity.value = animation.opacity;
    uniforms.uScatter.value = animation.scatter;

    const { portrait, normalizedScale } = stage.viewport();
    let pixelY = window.innerHeight * 0.45;

    if (anchor) {
      const rect = anchor.getBoundingClientRect();
      pixelY = portrait
        ? rect.top + rect.height * 0.52
        : rect.top + rect.height * 0.42 + window.innerHeight * 0.15;
    }

    const pixelX = (0.5 + (portrait ? 0.44 : 0.62) * 0.5) * window.innerWidth;
    const world = stage.toWorld(pixelX, pixelY);

    cloud.position.set(world.x, world.y, 0);
    cloud.scale.setScalar(0.5 * Math.max(normalizedScale, 0.5) * (portrait ? 0.9 : 1));
    cloud.rotation.set(0, 0, 0);
  });

  return { destroy: stage.destroy };
}
