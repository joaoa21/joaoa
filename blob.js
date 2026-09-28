/* ============================================================
   JOÃO ALBERTO — EFEITO 3D DA HOME
   O blob vive só no hero: entra pela direita, acompanha o hero
   na rolagem e se dispersa conforme ele sai da tela.
   Renderizador, shader, mouse e loop ficam em assets/js/blob-core.js.
   ============================================================ */
import { createBlobStage, supportsWebGL } from '/assets/js/blob-core.js';

/* Aparência do blob no hero. xv/ys: posição (fração da largura/altura),
   sr: tamanho, pt: tamanho dos pontos, op: opacidade. */
const HERO_DESKTOP = {
  xv: 0.44,
  ys: 0.5,
  sr: 0.9,
  amp: 0.85,
  freq: 1.5,
  speed: 0.16,
  op: 0.9,
  pt: 1,
  tint: 0x77756e,
};

/* No mobile, a nuvem ocupa o espaço reservado acima do título. */
const HERO_MOBILE = {
  ...HERO_DESKTOP,
  xv: 0,
  ys: 0.2,
  sr: 0.55,
  op: 0.66,
  pt: 0.88,
};

export function initBlob({ canvas, hero = null, reducedMotion = false } = {}) {
  if (!canvas || !supportsWebGL()) {
    canvas?.remove();
    return null;
  }

  try {
    return createHeroBlob({ canvas, hero, reduced: reducedMotion });
  } catch (error) {
    console.warn('Não foi possível iniciar o efeito 3D.', error);
    canvas.remove();
    return null;
  }
}

function createHeroBlob({ canvas, hero, reduced }) {
  const stage = createBlobStage({
    canvas,
    reduced,
    color: HERO_DESKTOP.tint,
    amp: 1,
    freq: 1.15,
  });

  const { uniforms, cloud } = stage;
  let state = stage.isMobile() ? HERO_MOBILE : HERO_DESKTOP;

  /* ---------- entrada: surge da direita enquanto ganha opacidade ---------- */
  const anim = { op: 0, enter: 1 };

  if (window.gsap && !reduced) {
    anim.enter = 0;
    window.gsap.to(anim, { op: state.op, enter: 1, duration: 1.8, ease: 'power3.out', delay: 0.3 });
  } else {
    anim.op = state.op;
  }

  stage.onResize(() => {
    state = stage.isMobile() ? HERO_MOBILE : HERO_DESKTOP;
    window.gsap?.killTweensOf(anim);
    anim.op = state.op;
    anim.enter = 1;
  });

  /* ---------- saída do hero (0 = no hero, 1 = hero fora da tela) ---------- */
  let exit = 0;

  function setExit(progress) {
    const next = Math.min(Math.max(progress, 0), 1);
    if (next === exit) return;

    const wasStopped = exit >= 1;
    exit = next;

    if (reduced) stage.requestRender();
    else if (wasStopped && exit < 1) stage.wake();
  }

  /* ---------- quadro a quadro ---------- */
  let time = 0;
  const anchor = hero?.querySelector('[data-blob-anchor]');

  stage.start((delta) => {
    if (!reduced) time += delta * state.speed;

    uniforms.uTime.value = time;
    uniforms.uAmp.value = state.amp;
    uniforms.uFreq.value = state.freq;
    // blobs pequenos usam pontos menores, para não virarem uma massa sólida
    uniforms.uSize.value = stage.baseSize() * (state.pt ?? 1);
    // ao sair do hero, a nuvem se dispersa e some junto com a rolagem
    uniforms.uOpacity.value = anim.op * (1 - exit);
    uniforms.uScatter.value = exit * 1.6;

    const { portrait, normalizedScale } = stage.viewport();
    let pixelX = (0.5 + state.xv * (portrait ? 0.4 : 0.5)) * window.innerWidth;
    let pixelY = window.innerHeight * 0.5;

    if (hero) {
      const rect = hero.getBoundingClientRect();
      pixelY = rect.top + state.ys * rect.height;

      if (stage.isMobile() && anchor) {
        const slot = anchor.getBoundingClientRect();
        pixelX = slot.left + slot.width / 2;
        pixelY = slot.top + slot.height / 2;
      }
    }

    // entrada vindo da direita
    pixelX += window.innerWidth * 0.55 * (1 - anim.enter);

    const world = stage.toWorld(pixelX, pixelY);
    cloud.position.set(world.x, world.y, 0);
    cloud.scale.setScalar(state.sr * Math.max(normalizedScale, 0.55) * (portrait ? 0.9 : 1));
    cloud.rotation.set(0, 0, 0);

    // fora do hero não há nada para desenhar: o loop para até a nuvem voltar
    return exit < 1;
  });

  return { setExit, destroy: stage.destroy };
}
