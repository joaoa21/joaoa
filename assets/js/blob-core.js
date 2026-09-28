/* ============================================================
   JOÃO ALBERTO — NÚCLEO DO BLOB (Three.js)
   Tudo o que é igual em todas as páginas: renderizador, câmera,
   nuvem de pontos em esfera de Fibonacci, shader com ruído simplex,
   atração magnética do mouse, loop, redimensionamento e pausa.
   Cada página decide só onde a nuvem fica e como ela se comporta:
   home (blob.js), projetos (blob-hub.js), links e páginas de erro.
   ============================================================ */

import * as THREE from 'three';

export { THREE };

export function supportsWebGL() {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

const MOBILE_MAX = 760;
const isMobileViewport = () => window.innerWidth <= MOBILE_MAX;

/* ---------- shaders ---------- */
const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  uniform float uFreq;
  uniform float uSize;
  uniform float uScatter;
  uniform vec2 uPointer;
  uniform float uPointerRadius;
  uniform float uPointerForce;
  uniform float uPointerActive;

  attribute float aScale;
  varying float vFade;

  /* Simplex noise 3D — Ashima Arts / Ian McEwan (domínio público) */
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  void main() {
    vec3 dir = normalize(position);

    float n1 = snoise(dir * uFreq + vec3(uTime * 0.30, uTime * 0.24, -uTime * 0.15));
    float n2 = snoise(dir * uFreq * 2.4 + vec3(-uTime * 0.18, uTime * 0.30, uTime * 0.12));
    float n3 = snoise(dir * uFreq * 5.2 + vec3(uTime * 0.10, -uTime * 0.14, uTime * 0.20));

    float n = n1 * 0.55 + n2 * 0.32 + n3 * 0.13;
    float d = 1.0 + n * uAmp * 0.5;
    vec3 p = dir * 1.5 * d;

    /* dispersão: entrada, troca de estado e saída */
    if (uScatter > 0.001) {
      vec3 dev = vec3(n2, n3, n1) * 0.4;
      p += normalize(dir + dev) * uScatter * (0.35 + aScale);
    }

    /* atração magnética local: curva gaussiana, sem borda circular marcada */
    vec2 toPointer = uPointer - p.xy;
    float dist = length(toPointer);
    float normalizedDist = dist / max(uPointerRadius, 0.0001);
    float influence = exp(-normalizedDist * normalizedDist * 2.4);

    /* prioriza os pontos da frente para não parecer dois círculos sobrepostos */
    float frontMask = smoothstep(-0.35, 0.75, p.z);
    influence *= frontMask * uPointerActive;

    if (influence > 0.001) {
      float scaleVariation = 0.78 + aScale * 0.22;
      p.xy += toPointer * influence * uPointerForce * scaleVariation;

      /* leve movimento tangencial deixa a resposta mais orgânica */
      vec2 tangent = vec2(-toPointer.y, toPointer.x);
      p.xy += tangent * influence * 0.012;
    }

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * aScale * (5.6 / -mv.z);
    gl_Position = projectionMatrix * mv;
    vFade = smoothstep(-1.6, 1.2, p.z);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    if (dot(c, c) > 0.25) discard;
    gl_FragColor = vec4(uColor, uOpacity * mix(0.35, 1.0, vFade));
  }
`;

/**
 * Cria a cena do blob num canvas de tela cheia.
 * A página controla a posição e os uniforms dentro de `start(frame)`.
 */
export function createBlobStage({
  canvas,
  reduced = false,
  counts = { mobile: 9000, lowPower: 18000, full: 30000 },
  pointSize = { mobile: 2.4, desktop: 2 },
  color = 0x77756e,
  amp = 0.9,
  freq = 1.5,
  opacity = 0,
  scatter = 0,
  pointer = true,
} = {}) {
  const initialMobile = isMobileViewport();
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const pointerAllowed = () => pointer && finePointer && !reduced && !isMobileViewport();

  const lowPowerDevice = initialMobile
    || (navigator.deviceMemory && navigator.deviceMemory <= 4)
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  /* ---------- renderizador e câmera ---------- */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });

  const pixelRatio = () => Math.min(window.devicePixelRatio || 1, lowPowerDevice ? 1.5 : 2);
  const baseSize = () => (isMobileViewport() ? pointSize.mobile : pointSize.desktop) * pixelRatio();

  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(pixelRatio());
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 50);
  camera.position.z = 7;

  /* ---------- pontos em esfera de Fibonacci ---------- */
  const count = initialMobile ? counts.mobile : lowPowerDevice ? counts.lowPower : counts.full;
  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    positions[i * 3] = Math.cos(theta) * radius + (Math.random() - 0.5) * 0.04;
    positions[i * 3 + 1] = y + (Math.random() - 0.5) * 0.04;
    positions[i * 3 + 2] = Math.sin(theta) * radius + (Math.random() - 0.5) * 0.04;
    scales[i] = 0.5 + Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: amp },
    uFreq: { value: freq },
    uSize: { value: baseSize() },
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: opacity },
    uScatter: { value: scatter },
    uPointer: { value: new THREE.Vector2(999, 999) },
    uPointerRadius: { value: 1.05 },
    uPointerForce: { value: 0.3 },
    uPointerActive: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
  });

  const cloud = new THREE.Points(geometry, material);
  scene.add(cloud);

  /* ---------- medidas da tela no espaço 3D ---------- */
  function viewport() {
    const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const halfWidth = halfHeight * camera.aspect;
    return {
      halfWidth,
      halfHeight,
      portrait: camera.aspect < 0.85,
      normalizedScale: Math.min(halfWidth, halfHeight) / 2.41,
    };
  }

  /** Converte um ponto da tela (px) para o espaço 3D. */
  function toWorld(pixelX, pixelY) {
    const { halfWidth, halfHeight } = viewport();
    return {
      x: (pixelX / window.innerWidth - 0.5) * 2 * halfWidth,
      y: -(pixelY / window.innerHeight - 0.5) * 2 * halfHeight,
    };
  }

  /* ---------- atração do mouse: o blob fica parado, só os pontos reagem ---------- */
  const raycaster = new THREE.Raycaster();
  const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const pointerNdc = new THREE.Vector2();
  const pointerWorld = new THREE.Vector3();
  const pointerTarget = new THREE.Vector2(999, 999);
  const pointerCurrent = new THREE.Vector2(999, 999);
  const pointerLocal = new THREE.Vector2(999, 999);

  let pointerActiveTarget = 0;
  let pointerActive = 0;
  let hasPointerPosition = false;

  const hidePointer = () => { pointerActiveTarget = 0; };

  const handlePointerMove = (event) => {
    if (!pointerAllowed()) {
      hidePointer();
      return;
    }

    pointerNdc.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1);
    raycaster.setFromCamera(pointerNdc, camera);
    if (!raycaster.ray.intersectPlane(interactionPlane, pointerWorld)) return;

    pointerTarget.set(pointerWorld.x, pointerWorld.y);

    // no primeiro movimento o efeito nasce no cursor, sem "voar" de longe
    if (!hasPointerPosition) {
      pointerCurrent.copy(pointerTarget);
      hasPointerPosition = true;
    }

    pointerActiveTarget = 1;
  };

  if (pointer && finePointer && !reduced) {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', hidePointer, { passive: true });
    window.addEventListener('blur', hidePointer, { passive: true });
  }

  function updatePointer() {
    if (!pointerAllowed() || !hasPointerPosition) {
      pointerActive += (0 - pointerActive) * 0.075;
      uniforms.uPointerActive.value = pointerActive;
      if (pointerActive < 0.001) uniforms.uPointer.value.set(999, 999);
      return;
    }

    pointerCurrent.lerp(pointerTarget, 0.09);
    pointerActive += (pointerActiveTarget - pointerActive) * 0.075;

    // do espaço do mundo para o espaço local do blob
    pointerLocal.set(
      (pointerCurrent.x - cloud.position.x) / Math.max(cloud.scale.x, 0.0001),
      (pointerCurrent.y - cloud.position.y) / Math.max(cloud.scale.y, 0.0001),
    );

    uniforms.uPointer.value.copy(pointerLocal);
    uniforms.uPointerActive.value = pointerActive;
  }

  /* ---------- loop ----------
     frame(delta) atualiza posição e uniforms; se devolver false,
     o loop para depois de desenhar e só volta com wake(). */
  let frame = () => true;
  let running = !document.hidden;
  let lastFrame = performance.now();
  let animationFrame = 0;
  let staticFrame = 0;
  const resizeHandlers = [];

  function render(delta) {
    const keepGoing = frame(delta) !== false;

    if (reduced) {
      uniforms.uPointer.value.set(999, 999);
      uniforms.uPointerActive.value = 0;
    } else {
      updatePointer();
    }

    renderer.render(scene, camera);
    return keepGoing;
  }

  function tick(now) {
    animationFrame = 0;
    if (!running) return;

    const delta = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    if (render(delta)) animationFrame = window.requestAnimationFrame(tick);
  }

  /** Movimento reduzido: desenha um quadro parado quando algo muda. */
  function requestRender() {
    if (!reduced) {
      wake();
      return;
    }

    if (staticFrame) return;
    staticFrame = window.requestAnimationFrame(() => {
      staticFrame = 0;
      render(0);
    });
  }

  function wake() {
    if (reduced) {
      requestRender();
      return;
    }

    if (!running || animationFrame) return;
    lastFrame = performance.now();
    animationFrame = window.requestAnimationFrame(tick);
  }

  function start(onFrame) {
    frame = onFrame;
    lastFrame = performance.now();

    if (reduced) {
      window.addEventListener('scroll', requestRender, { passive: true });
      requestRender();
    } else {
      animationFrame = window.requestAnimationFrame(tick);
    }
  }

  /* ---------- redimensionamento e aba oculta ---------- */
  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(pixelRatio());
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uSize.value = baseSize();

    if (!pointerAllowed()) hidePointer();
    resizeHandlers.forEach((handler) => handler());
    requestRender();
  }

  function handleVisibility() {
    running = !document.hidden;
    if (running) wake();
  }

  window.addEventListener('resize', handleResize, { passive: true });
  document.addEventListener('visibilitychange', handleVisibility);

  function destroy() {
    running = false;
    window.cancelAnimationFrame(animationFrame);
    window.cancelAnimationFrame(staticFrame);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', requestRender);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerleave', hidePointer);
    window.removeEventListener('blur', hidePointer);
    document.removeEventListener('visibilitychange', handleVisibility);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  return {
    uniforms,
    cloud,
    reduced,
    isMobile: isMobileViewport,
    baseSize,
    viewport,
    toWorld,
    start,
    wake,
    requestRender,
    onResize: (handler) => resizeHandlers.push(handler),
    destroy,
  };
}

/**
 * Entrada padrão: a nuvem nasce dispersa e se reagrupa enquanto aparece.
 * Devolve o objeto animado ({ scatter, opacity }) para a página usar no quadro.
 */
export function fadeIn({ opacity, reduced }) {
  const state = { scatter: reduced ? 0 : 3, opacity: reduced ? opacity : 0 };

  if (window.gsap && !reduced) {
    window.gsap.to(state, { scatter: 0, opacity, duration: 2.2, ease: 'power3.out', delay: 0.2 });
  } else {
    state.scatter = 0;
    state.opacity = opacity;
  }

  return state;
}
