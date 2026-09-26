/* ============================================================
   JOÃO ALBERTO — BLOB DAS PÁGINAS DE ERRO
   Blob fixo com atração magnética local no mouse.
   ============================================================ */

import * as THREE from 'three';

function supportsWebGL() {
  try {
    const probe = document.createElement('canvas');

    return Boolean(
      probe.getContext('webgl2')
      || probe.getContext('webgl')
    );
  } catch {
    return false;
  }
}

export function initErrorBlob({
  canvas,
  reducedMotion = false
} = {}) {
  if (!canvas || !supportsWebGL()) {
    canvas?.remove();
    return null;
  }

  try {
    return createBlob({ canvas, reducedMotion });
  } catch (error) {
    console.warn('Não foi possível iniciar o efeito 3D.', error);
    canvas.remove();
    return null;
  }
}

function createBlob({ canvas, reducedMotion }) {
  const reduced = reducedMotion;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const isMobile = window.innerWidth < 760;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const allowPointerInteraction = false;

  const lowPowerDevice = isMobile
    || (navigator.deviceMemory && navigator.deviceMemory <= 4)
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance'
  });

  let dpr = Math.min(
    window.devicePixelRatio || 1,
    lowPowerDevice ? 1.5 : 2
  );

  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    38,
    window.innerWidth / window.innerHeight,
    .1,
    50
  );

  camera.position.z = 7;

  const count = isMobile
    ? 8500
    : lowPowerDevice
      ? 13500
      : 19000;

  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;

    positions[i * 3] =
      Math.cos(theta) * radius
      + (Math.random() - .5) * .04;

    positions[i * 3 + 1] =
      y
      + (Math.random() - .5) * .04;

    positions[i * 3 + 2] =
      Math.sin(theta) * radius
      + (Math.random() - .5) * .04;

    scales[i] = .5 + Math.random();
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );

  geometry.setAttribute(
    'aScale',
    new THREE.BufferAttribute(scales, 1)
  );

  const uniforms = {
    uTime: { value: 0 },
    uAmp: { value: .9 },
    uFreq: { value: 1.5 },
    uSize: { value: (isMobile ? 2.55 : 2.15) * dpr },
    uColor: { value: new THREE.Color(0x77756e) },
    uOpacity: { value: reduced ? (isMobile ? .22 : .28) : 0 },
    uScatter: { value: reduced ? 0 : 3 },
    uPointer: { value: new THREE.Vector2(999, 999) },
    uPointerRadius: { value: 1.05 },
    uPointerForce: { value: .3 },
    uPointerActive: { value: 0 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,

    vertexShader: /* glsl */`
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

      vec3 mod289(vec3 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }

      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159 - 0.85373472095314 * r;
      }

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

        vec4 p = permute(
          permute(
            permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0)
            )
            + i.y + vec4(0.0, i1.y, i2.y, 1.0)
          )
          + i.x + vec4(0.0, i1.x, i2.x, 1.0)
        );

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
        vec4 norm = taylorInvSqrt(
          vec4(
            dot(p0, p0),
            dot(p1, p1),
            dot(p2, p2),
            dot(p3, p3)
          )
        );

        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(
          0.6 - vec4(
            dot(x0, x0),
            dot(x1, x1),
            dot(x2, x2),
            dot(x3, x3)
          ),
          0.0
        );

        m = m * m;

        return 42.0 * dot(
          m * m,
          vec4(
            dot(p0, x0),
            dot(p1, x1),
            dot(p2, x2),
            dot(p3, x3)
          )
        );
      }

      void main() {
        vec3 dir = normalize(position);

        float n1 = snoise(
          dir * uFreq
          + vec3(uTime * .30, uTime * .24, -uTime * .15)
        );

        float n2 = snoise(
          dir * uFreq * 2.4
          + vec3(-uTime * .18, uTime * .30, uTime * .12)
        );

        float n3 = snoise(
          dir * uFreq * 5.2
          + vec3(uTime * .10, -uTime * .14, uTime * .20)
        );

        float noiseValue = n1 * .55 + n2 * .32 + n3 * .13;
        float displacement = 1.0 + noiseValue * uAmp * .5;
        vec3 point = dir * 1.5 * displacement;

        if (uScatter > .001) {
          vec3 deviation = vec3(n2, n3, n1) * .4;

          point += normalize(dir + deviation)
            * uScatter
            * (.35 + aScale);
        }

        vec2 toPointer = uPointer - point.xy;
        float pointerDistance = length(toPointer);
        float normalizedDistance = pointerDistance
          / max(uPointerRadius, .0001);

        float influence = exp(
          -normalizedDistance
          * normalizedDistance
          * 2.4
        );

        float frontMask = smoothstep(-.35, .75, point.z);
        influence *= frontMask * uPointerActive;

        if (influence > .001) {
          float scaleVariation = .78 + aScale * .22;

          point.xy += toPointer
            * influence
            * uPointerForce
            * scaleVariation;

          vec2 tangent = vec2(-toPointer.y, toPointer.x);
          point.xy += tangent * influence * .012;
        }

        vec4 modelViewPosition = modelViewMatrix * vec4(point, 1.0);

        gl_PointSize = uSize
          * aScale
          * (5.6 / -modelViewPosition.z);

        gl_Position = projectionMatrix * modelViewPosition;
        vFade = smoothstep(-1.6, 1.2, point.z);
      }
    `,

    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vFade;

      void main() {
        vec2 center = gl_PointCoord - .5;

        if (dot(center, center) > .25) {
          discard;
        }

        gl_FragColor = vec4(
          uColor,
          uOpacity * mix(.35, 1.0, vFade)
        );
      }
    `
  });

  const cloud = new THREE.Points(geometry, material);
  scene.add(cloud);

  const animation = {
    scatter: reduced ? 0 : 3,
    opacity: reduced ? (isMobile ? .22 : .28) : 0
  };

  if (hasGSAP && !reduced) {
    window.gsap.to(animation, {
      scatter: 0,
      opacity: isMobile ? .22 : .28,
      duration: 2.2,
      ease: 'power3.out',
      delay: .2
    });
  } else {
    animation.scatter = 0;
    animation.opacity = isMobile ? .22 : .28;
  }

  const raycaster = new THREE.Raycaster();
  const interactionPlane = new THREE.Plane(
    new THREE.Vector3(0, 0, 1),
    0
  );
  const pointerNdc = new THREE.Vector2();
  const pointerWorld = new THREE.Vector3();
  const pointerTargetWorld = new THREE.Vector2(999, 999);
  const pointerWorldCurrent = new THREE.Vector2(999, 999);
  const pointerLocal = new THREE.Vector2(999, 999);

  let pointerActiveTarget = 0;
  let pointerActive = 0;
  let hasPointerPosition = false;

  const hidePointer = () => {
    pointerActiveTarget = 0;
  };

  const handlePointerMove = (event) => {
    pointerNdc.set(
      (event.clientX / window.innerWidth) * 2 - 1,
      -(event.clientY / window.innerHeight) * 2 + 1
    );

    raycaster.setFromCamera(pointerNdc, camera);

    const intersection = raycaster.ray.intersectPlane(
      interactionPlane,
      pointerWorld
    );

    if (!intersection) return;

    pointerTargetWorld.set(pointerWorld.x, pointerWorld.y);

    if (!hasPointerPosition) {
      pointerWorldCurrent.copy(pointerTargetWorld);
      hasPointerPosition = true;
    }

    pointerActiveTarget = 1;
  };

  if (allowPointerInteraction) {
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', hidePointer, { passive: true });
    window.addEventListener('blur', hidePointer, { passive: true });
  }

  const positionCloud = () => {
    const halfHeight = Math.tan(
      THREE.MathUtils.degToRad(camera.fov / 2)
    ) * camera.position.z;

    const halfWidth = halfHeight * camera.aspect;
    const normalizedScale = Math.min(halfWidth, halfHeight) / 2.41;
    const portrait = camera.aspect < .85;

    const worldScale = .98
      * Math.max(normalizedScale, .5)
      * (portrait ? .92 : 1);

    cloud.position.set(0, portrait ? -.18 : -.08, 0);
    cloud.scale.setScalar(worldScale);
    cloud.rotation.set(0, 0, 0);
  };

  const updatePointer = () => {
    if (!allowPointerInteraction || !hasPointerPosition) {
      pointerActive += (0 - pointerActive) * .075;
      uniforms.uPointerActive.value = pointerActive;

      if (pointerActive < .001) {
        uniforms.uPointer.value.set(999, 999);
      }

      return;
    }

    pointerWorldCurrent.lerp(pointerTargetWorld, .09);
    pointerActive += (pointerActiveTarget - pointerActive) * .075;

    pointerLocal.set(
      (pointerWorldCurrent.x - cloud.position.x)
        / Math.max(cloud.scale.x, .0001),
      (pointerWorldCurrent.y - cloud.position.y)
        / Math.max(cloud.scale.y, .0001)
    );

    uniforms.uPointer.value.copy(pointerLocal);
    uniforms.uPointerActive.value = pointerActive;
  };

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    dpr = Math.min(
      window.devicePixelRatio || 1,
      lowPowerDevice ? 1.5 : 2
    );

    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);

    uniforms.uSize.value =
      (window.innerWidth < 760 ? 2.55 : 2.15)
      * dpr;

    positionCloud();

    if (reduced) {
      renderStatic();
    }
  };

  window.addEventListener('resize', handleResize, { passive: true });

  let running = true;
  let elapsed = 0;
  let lastFrame = performance.now();
  let animationFrame = 0;

  const renderStatic = () => {
    uniforms.uOpacity.value = animation.opacity;
    uniforms.uScatter.value = animation.scatter;
    uniforms.uPointer.value.set(999, 999);
    uniforms.uPointerActive.value = 0;

    positionCloud();
    renderer.render(scene, camera);
  };

  const tick = (now) => {
    if (!running || reduced) return;

    const delta = Math.min((now - lastFrame) / 1000, .05);
    lastFrame = now;
    elapsed += delta * .14;

    uniforms.uTime.value = elapsed;
    uniforms.uOpacity.value = animation.opacity;
    uniforms.uScatter.value = animation.scatter;

    positionCloud();
    updatePointer();
    renderer.render(scene, camera);

    animationFrame = window.requestAnimationFrame(tick);
  };

  if (reduced) {
    renderStatic();
  } else {
    animationFrame = window.requestAnimationFrame(tick);
  }

  const handleVisibility = () => {
    running = !document.hidden;

    if (running && !reduced) {
      lastFrame = performance.now();
      animationFrame = window.requestAnimationFrame(tick);
    }
  };

  document.addEventListener('visibilitychange', handleVisibility);

  const destroy = () => {
    running = false;

    window.cancelAnimationFrame(animationFrame);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerleave', hidePointer);
    window.removeEventListener('blur', hidePointer);
    document.removeEventListener('visibilitychange', handleVisibility);

    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };

  return { destroy };
}
