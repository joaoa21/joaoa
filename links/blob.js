/* ============================================================
   JOÃO ALBERTO — LINKS · THREE.JS
   Blob fixo com atração magnética local no mouse.
   ============================================================ */
import * as THREE from 'three';

const reducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

const finePointer = window.matchMedia(
  '(pointer: fine)'
).matches;

const hasGSAP = typeof window.gsap !== 'undefined';
const canvas = document.getElementById('stage');

if (canvas && supportsWebGL()) {
  initBlob(canvas);
} else {
  canvas?.remove();
}

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

function initBlob(targetCanvas) {
  const initialMobile = window.innerWidth < 760;

  const limitedCPU =
    navigator.hardwareConcurrency
    && navigator.hardwareConcurrency <= 4;

  const limitedMemory =
    navigator.deviceMemory
    && navigator.deviceMemory <= 4;

  const lowPower =
    initialMobile
    || limitedCPU
    || limitedMemory;

  const pointerSupported =
    finePointer
    && !reducedMotion;

  const pointerAllowed = () =>
    pointerSupported
    && window.innerWidth >= 760;

  /* ============================================================
     RENDERER E CÂMERA
     ============================================================ */

  const renderer = new THREE.WebGLRenderer({
    canvas: targetCanvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance'
  });

  let dpr = Math.min(
    window.devicePixelRatio || 1,
    lowPower ? 1.5 : 2
  );

  renderer.setPixelRatio(dpr);

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    38,
    window.innerWidth / window.innerHeight,
    0.1,
    50
  );

  camera.position.z = 7;

  /* ============================================================
     PARTÍCULAS EM ESFERA DE FIBONACCI
     ============================================================ */

  const count = initialMobile
    ? 9000
    : lowPower
      ? 16000
      : 24000;

  const positions = new Float32Array(count * 3);
  const scales = new Float32Array(count);

  const goldenAngle =
    Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const y =
      1 - (i / (count - 1)) * 2;

    const radius =
      Math.sqrt(1 - y * y);

    const theta =
      goldenAngle * i;

    positions[i * 3] =
      Math.cos(theta) * radius
      + (Math.random() - 0.5) * 0.04;

    positions[i * 3 + 1] =
      y
      + (Math.random() - 0.5) * 0.04;

    positions[i * 3 + 2] =
      Math.sin(theta) * radius
      + (Math.random() - 0.5) * 0.04;

    scales[i] =
      0.5 + Math.random();
  }

  const geometry =
    new THREE.BufferGeometry();

  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(
      positions,
      3
    )
  );

  geometry.setAttribute(
    'aScale',
    new THREE.BufferAttribute(
      scales,
      1
    )
  );

  /* ============================================================
     CORES E OPACIDADES
     ============================================================ */

  const colors = {
    dark: new THREE.Color(0x77756e),
    light: new THREE.Color(0xd8d5cb)
  };

  const opacity = {
    dark: 0.45,
    light: 0.25
  };

  const initialTheme =
    document.documentElement.classList.contains('light')
      ? 'light'
      : 'dark';

  /* ============================================================
     UNIFORMS
     ============================================================ */

  const uniforms = {
    uTime: {
      value: 0
    },

    uAmp: {
      value: 0.9
    },

    uFreq: {
      value: 1.5
    },

    uSize: {
      value:
        (initialMobile ? 2.4 : 2.0)
        * dpr
    },

    uColor: {
      value:
        colors[initialTheme].clone()
    },

    uOpacity: {
      value:
        reducedMotion
          ? opacity[initialTheme]
          : 0
    },

    uScatter: {
      value:
        reducedMotion
          ? 0
          : 3
    },

    /* interação magnética */
    uPointer: {
      value:
        new THREE.Vector2(
          999,
          999
        )
    },

    uPointerRadius: {
      value: 1.05
    },

    uPointerForce: {
      value: 0.3
    },

    uPointerActive: {
      value: 0
    }
  };

  /* ============================================================
     SHADER
     ============================================================ */

  const material =
    new THREE.ShaderMaterial({
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

        /* Simplex Noise 3D
           Ashima Arts / Ian McEwan — domínio público */

        vec3 mod289(vec3 x) {
          return x
            - floor(
              x * (1.0 / 289.0)
            ) * 289.0;
        }

        vec4 mod289(vec4 x) {
          return x
            - floor(
              x * (1.0 / 289.0)
            ) * 289.0;
        }

        vec4 permute(vec4 x) {
          return mod289(
            (
              (x * 34.0)
              + 1.0
            ) * x
          );
        }

        vec4 taylorInvSqrt(vec4 r) {
          return
            1.79284291400159
            - 0.85373472095314 * r;
        }

        float snoise(vec3 v) {
          const vec2 C =
            vec2(
              1.0 / 6.0,
              1.0 / 3.0
            );

          const vec4 D =
            vec4(
              0.0,
              0.5,
              1.0,
              2.0
            );

          vec3 i =
            floor(
              v
              + dot(v, C.yyy)
            );

          vec3 x0 =
            v
            - i
            + dot(i, C.xxx);

          vec3 g =
            step(
              x0.yzx,
              x0.xyz
            );

          vec3 l =
            1.0 - g;

          vec3 i1 =
            min(
              g.xyz,
              l.zxy
            );

          vec3 i2 =
            max(
              g.xyz,
              l.zxy
            );

          vec3 x1 =
            x0
            - i1
            + C.xxx;

          vec3 x2 =
            x0
            - i2
            + C.yyy;

          vec3 x3 =
            x0
            - D.yyy;

          i = mod289(i);

          vec4 p =
            permute(
              permute(
                permute(
                  i.z
                  + vec4(
                    0.0,
                    i1.z,
                    i2.z,
                    1.0
                  )
                )
                + i.y
                + vec4(
                  0.0,
                  i1.y,
                  i2.y,
                  1.0
                )
              )
              + i.x
              + vec4(
                0.0,
                i1.x,
                i2.x,
                1.0
              )
            );

          float n_ =
            0.142857142857;

          vec3 ns =
            n_ * D.wyz
            - D.xzx;

          vec4 j =
            p
            - 49.0
            * floor(
              p
              * ns.z
              * ns.z
            );

          vec4 x_ =
            floor(
              j * ns.z
            );

          vec4 y_ =
            floor(
              j
              - 7.0 * x_
            );

          vec4 x =
            x_ * ns.x
            + ns.yyyy;

          vec4 y =
            y_ * ns.x
            + ns.yyyy;

          vec4 h =
            1.0
            - abs(x)
            - abs(y);

          vec4 b0 =
            vec4(
              x.xy,
              y.xy
            );

          vec4 b1 =
            vec4(
              x.zw,
              y.zw
            );

          vec4 s0 =
            floor(b0)
            * 2.0
            + 1.0;

          vec4 s1 =
            floor(b1)
            * 2.0
            + 1.0;

          vec4 sh =
            -step(
              h,
              vec4(0.0)
            );

          vec4 a0 =
            b0.xzyw
            + s0.xzyw
            * sh.xxyy;

          vec4 a1 =
            b1.xzyw
            + s1.xzyw
            * sh.zzww;

          vec3 p0 =
            vec3(
              a0.xy,
              h.x
            );

          vec3 p1 =
            vec3(
              a0.zw,
              h.y
            );

          vec3 p2 =
            vec3(
              a1.xy,
              h.z
            );

          vec3 p3 =
            vec3(
              a1.zw,
              h.w
            );

          vec4 norm =
            taylorInvSqrt(
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

          vec4 m =
            max(
              0.6
              - vec4(
                dot(x0, x0),
                dot(x1, x1),
                dot(x2, x2),
                dot(x3, x3)
              ),
              0.0
            );

          m = m * m;

          return
            42.0
            * dot(
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
          vec3 dir =
            normalize(position);

          /* forma principal */

          float n1 =
            snoise(
              dir * uFreq
              + vec3(
                uTime * 0.30,
                uTime * 0.24,
                -uTime * 0.15
              )
            );

          float n2 =
            snoise(
              dir
              * uFreq
              * 2.4
              + vec3(
                -uTime * 0.18,
                uTime * 0.30,
                uTime * 0.12
              )
            );

          float n3 =
            snoise(
              dir
              * uFreq
              * 5.2
              + vec3(
                uTime * 0.10,
                -uTime * 0.14,
                uTime * 0.20
              )
            );

          float n =
            n1 * 0.55
            + n2 * 0.32
            + n3 * 0.13;

          float d =
            1.0
            + n
            * uAmp
            * 0.5;

          vec3 p =
            dir
            * 1.5
            * d;

          /* entrada convergindo do caos */

          if (uScatter > 0.001) {
            vec3 dev =
              vec3(
                n2,
                n3,
                n1
              ) * 0.4;

            p +=
              normalize(
                dir + dev
              )
              * uScatter
              * (
                0.35
                + aScale
              );
          }

          /* ====================================================
             ATRAÇÃO MAGNÉTICA LOCAL
             ==================================================== */

          vec2 toPointer =
            uPointer
            - p.xy;

          float dist =
            length(toPointer);

          /*
            Queda gaussiana:
            evita uma borda circular marcada.
          */

          float normalizedDist =
            dist
            / max(
              uPointerRadius,
              0.0001
            );

          float influence =
            exp(
              -normalizedDist
              * normalizedDist
              * 2.4
            );

          /*
            Prioriza a superfície frontal.
            Evita duas camadas ou dois círculos.
          */

          float frontMask =
            smoothstep(
              -0.35,
              0.75,
              p.z
            );

          influence *=
            frontMask
            * uPointerActive;

          if (influence > 0.001) {
            float scaleVariation =
              0.78
              + aScale
              * 0.22;

            /*
              Atrai os pontos para o mouse.
            */

            p.xy +=
              toPointer
              * influence
              * uPointerForce
              * scaleVariation;

            /*
              Pequena curva lateral para
              deixar a resposta mais orgânica.
            */

            vec2 tangent =
              vec2(
                -toPointer.y,
                toPointer.x
              );

            p.xy +=
              tangent
              * influence
              * 0.012;
          }

          vec4 mv =
            modelViewMatrix
            * vec4(
              p,
              1.0
            );

          gl_PointSize =
            uSize
            * aScale
            * (
              5.6
              / -mv.z
            );

          gl_Position =
            projectionMatrix
            * mv;

          vFade =
            smoothstep(
              -1.6,
              1.2,
              p.z
            );
        }
      `,

      fragmentShader: /* glsl */`
        uniform vec3 uColor;
        uniform float uOpacity;

        varying float vFade;

        void main() {
          vec2 c =
            gl_PointCoord
            - 0.5;

          if (
            dot(c, c)
            > 0.25
          ) {
            discard;
          }

          gl_FragColor =
            vec4(
              uColor,
              uOpacity
              * mix(
                0.35,
                1.0,
                vFade
              )
            );
        }
      `
    });

  const cloud =
    new THREE.Points(
      geometry,
      material
    );

  scene.add(cloud);

  /* ============================================================
     ENTRADA DO BLOB
     ============================================================ */

  const animation = {
    scatter:
      reducedMotion
        ? 0
        : 3,

    opacity:
      reducedMotion
        ? opacity[initialTheme]
        : 0
  };

  if (hasGSAP && !reducedMotion) {
    window.gsap.to(
      animation,
      {
        scatter: 0,
        opacity:
          opacity[initialTheme],
        duration: 2.2,
        ease: 'power3.out',
        delay: 0.2
      }
    );
  } else {
    animation.scatter = 0;
    animation.opacity =
      opacity[initialTheme];
  }

  const band =
    document.querySelector(
      '.hero-space'
    );

  /* ============================================================
     ATRAÇÃO DO MOUSE
     ============================================================ */

  const raycaster =
    new THREE.Raycaster();

  const interactionPlane =
    new THREE.Plane(
      new THREE.Vector3(
        0,
        0,
        1
      ),
      0
    );

  const pointerNdc =
    new THREE.Vector2();

  const pointerWorld =
    new THREE.Vector3();

  const pointerTargetWorld =
    new THREE.Vector2(
      999,
      999
    );

  const pointerWorldCurrent =
    new THREE.Vector2(
      999,
      999
    );

  const pointerLocal =
    new THREE.Vector2(
      999,
      999
    );

  let pointerActiveTarget = 0;
  let pointerActive = 0;
  let hasPointerPosition = false;

  function hidePointer() {
    pointerActiveTarget = 0;
  }

  function handlePointerMove(event) {
    if (!pointerAllowed()) {
      hidePointer();
      return;
    }

    pointerNdc.set(
      (
        event.clientX
        / window.innerWidth
      ) * 2 - 1,

      -(
        event.clientY
        / window.innerHeight
      ) * 2 + 1
    );

    raycaster.setFromCamera(
      pointerNdc,
      camera
    );

    const intersects =
      raycaster.ray.intersectPlane(
        interactionPlane,
        pointerWorld
      );

    if (intersects) {
      pointerTargetWorld.set(
        pointerWorld.x,
        pointerWorld.y
      );

      /*
        Evita que o efeito venha lentamente
        de uma posição distante no primeiro hover.
      */

      if (!hasPointerPosition) {
        pointerWorldCurrent.copy(
          pointerTargetWorld
        );

        hasPointerPosition = true;
      }

      pointerActiveTarget = 1;
    }
  }

  if (pointerSupported) {
    window.addEventListener(
      'pointermove',
      handlePointerMove,
      { passive: true }
    );

    window.addEventListener(
      'pointerleave',
      hidePointer,
      { passive: true }
    );

    window.addEventListener(
      'blur',
      hidePointer,
      { passive: true }
    );
  }

  /* ============================================================
     TEMA
     ============================================================ */

  function updateTheme(theme) {
    const normalizedTheme =
      theme === 'light'
        ? 'light'
        : 'dark';

    const targetColor =
      colors[normalizedTheme];

    const targetOpacity =
      opacity[normalizedTheme];

    if (hasGSAP && !reducedMotion) {
      window.gsap.to(
        uniforms.uColor.value,
        {
          r: targetColor.r,
          g: targetColor.g,
          b: targetColor.b,
          duration: 0.8,
          ease: 'power2.inOut',
          overwrite: 'auto'
        }
      );

      window.gsap.to(
        animation,
        {
          opacity:
            targetOpacity,
          duration: 0.8,
          ease: 'power2.inOut',
          overwrite: 'auto'
        }
      );
    } else {
      uniforms.uColor.value.copy(
        targetColor
      );

      animation.opacity =
        targetOpacity;

      renderStatic();
    }
  }

  window.addEventListener(
    'site-theme-change',
    (event) => {
      updateTheme(
        event.detail?.theme
      );
    }
  );

  /* ============================================================
     POSIÇÃO FIXA NA HERO-SPACE
     ============================================================ */

  function positionCloud() {
    const halfHeight =
      Math.tan(
        THREE.MathUtils.degToRad(
          camera.fov / 2
        )
      )
      * camera.position.z;

    const halfWidth =
      halfHeight
      * camera.aspect;

    const portrait =
      camera.aspect < 0.85;

    const normalizedScale =
      Math.min(
        halfWidth,
        halfHeight
      ) / 2.41;

    const worldScale =
      0.27
      * Math.max(
        normalizedScale,
        0.5
      )
      * (
        portrait
          ? 1.15
          : 1
      );

    let anchorY =
      180
      - window.scrollY;

    if (band) {
      const rect =
        band.getBoundingClientRect();

      anchorY =
        rect.top
        + rect.height
        * 0.5;
    }

    const worldY =
      -(
        anchorY
        / window.innerHeight
        - 0.5
      )
      * 2
      * halfHeight;

    /*
      O mouse não move nem gira o blob.
    */

    cloud.position.set(
      0,
      worldY,
      0
    );

    cloud.scale.setScalar(
      worldScale
    );

    cloud.rotation.set(
      0,
      0,
      0
    );
  }

  /* ============================================================
     ATUALIZAÇÃO DA INTERAÇÃO
     ============================================================ */

  function updatePointerInteraction() {
    if (
      !pointerAllowed()
      || !hasPointerPosition
    ) {
      pointerActive +=
        (
          0
          - pointerActive
        ) * 0.075;

      uniforms.uPointerActive.value =
        pointerActive;

      if (pointerActive < 0.001) {
        uniforms.uPointer.value.set(
          999,
          999
        );
      }

      return;
    }

    /*
      Acompanhamento suave e com inércia.
    */

    pointerWorldCurrent.lerp(
      pointerTargetWorld,
      0.09
    );

    pointerActive +=
      (
        pointerActiveTarget
        - pointerActive
      ) * 0.075;

    /*
      Converte o cursor do espaço mundial
      para o espaço local do blob.
    */

    pointerLocal.set(
      (
        pointerWorldCurrent.x
        - cloud.position.x
      )
      / Math.max(
        cloud.scale.x,
        0.0001
      ),

      (
        pointerWorldCurrent.y
        - cloud.position.y
      )
      / Math.max(
        cloud.scale.y,
        0.0001
      )
    );

    uniforms.uPointer.value.copy(
      pointerLocal
    );

    uniforms.uPointerActive.value =
      pointerActive;
  }

  /* ============================================================
     RENDERIZAÇÃO ESTÁTICA
     ============================================================ */

  function renderStatic() {
    uniforms.uOpacity.value =
      animation.opacity;

    uniforms.uScatter.value =
      animation.scatter;

    uniforms.uPointer.value.set(
      999,
      999
    );

    uniforms.uPointerActive.value = 0;

    positionCloud();

    renderer.render(
      scene,
      camera
    );
  }

  /* ============================================================
     RESIZE
     ============================================================ */

  function resize() {
    camera.aspect =
      window.innerWidth
      / window.innerHeight;

    camera.updateProjectionMatrix();

    dpr = Math.min(
      window.devicePixelRatio || 1,
      lowPower ? 1.5 : 2
    );

    renderer.setPixelRatio(dpr);

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    const mobileNow =
      window.innerWidth < 760;

    uniforms.uSize.value =
      (
        mobileNow
          ? 2.4
          : 2.0
      ) * dpr;

    if (!pointerAllowed()) {
      hidePointer();
    }

    if (reducedMotion) {
      renderStatic();
    }
  }

  window.addEventListener(
    'resize',
    resize,
    { passive: true }
  );

  /* ============================================================
     REDUZIR MOVIMENTO
     ============================================================ */

  if (reducedMotion) {
    renderStatic();

    window.addEventListener(
      'scroll',
      renderStatic,
      { passive: true }
    );

    return;
  }

  /* ============================================================
     LOOP
     ============================================================ */

  let running = true;
  let elapsed = 0;
  let lastFrame = performance.now();
  let animationFrame = 0;

  document.addEventListener(
    'visibilitychange',
    () => {
      running =
        !document.hidden;

      if (running) {
        lastFrame =
          performance.now();

        animationFrame =
          window.requestAnimationFrame(
            tick
          );
      }
    }
  );

  function tick(now) {
    if (!running) {
      return;
    }

    const delta =
      Math.min(
        (
          now
          - lastFrame
        ) / 1000,
        0.05
      );

    lastFrame = now;

    elapsed +=
      delta * 0.14;

    uniforms.uTime.value =
      elapsed;

    uniforms.uOpacity.value =
      animation.opacity;

    uniforms.uScatter.value =
      animation.scatter;

    positionCloud();
    updatePointerInteraction();

    renderer.render(
      scene,
      camera
    );

    animationFrame =
      window.requestAnimationFrame(
        tick
      );
  }

  animationFrame =
    window.requestAnimationFrame(
      tick
    );
}