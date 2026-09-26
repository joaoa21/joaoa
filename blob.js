/* ============================================================
   JOÃO ALBERTO — EFEITO 3D DA HOME
   Blob com atração magnética local no mouse
   ============================================================ */
import * as THREE from "three";

function supportsWebGL() {
  try {
    const testCanvas = document.createElement("canvas");

    return Boolean(
      testCanvas.getContext("webgl2") || testCanvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

export function initBlob({
  canvas,
  sections = [],
  activeSection = null,
  reducedMotion = false,
} = {}) {
  if (!canvas || !supportsWebGL()) {
    canvas?.remove();
    return null;
  }

  try {
    return createBlob({
      canvas,
      sections,
      activeSection,
      reducedMotion,
    });
  } catch (error) {
    console.warn("Não foi possível iniciar o efeito 3D.", error);
    canvas.remove();
    return null;
  }
}

function createBlob({ canvas, sections, activeSection, reducedMotion }) {
  const reduced = reducedMotion;
  const hasGSAP = typeof window.gsap !== "undefined";
  const activeSec = activeSection;

  let isMobile = window.innerWidth <= 760;
  const allowPointerInteraction = !isMobile && !reduced;

  const lowPowerDevice =
    isMobile ||
    (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });

  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2);
  const basePointSize = (isMobile ? 2.4 : 2.0) * dpr;

  renderer.setPixelRatio(dpr);
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    38,
    window.innerWidth / window.innerHeight,
    0.1,
    50,
  );

  camera.position.z = 7;

  /* ---------- pontos em esfera de Fibonacci ---------- */
  const COUNT = lowPowerDevice ? (isMobile ? 9000 : 18000) : 30000;

  const positions = new Float32Array(COUNT * 3);
  const scales = new Float32Array(COUNT);

  const GA = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = GA * i;

    positions[i * 3] = Math.cos(th) * r + (Math.random() - 0.5) * 0.04;

    positions[i * 3 + 1] = y + (Math.random() - 0.5) * 0.04;

    positions[i * 3 + 2] = Math.sin(th) * r + (Math.random() - 0.5) * 0.04;

    scales[i] = 0.5 + Math.random();
  }

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  geometry.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));

  const COLORS = {
    dark: new THREE.Color(0xf2f0eb),
    light: new THREE.Color(0x161616),
  };

  const uniforms = {
    uTime: {
      value: 0,
    },

    uAmp: {
      value: 1,
    },

    uFreq: {
      value: 1.15,
    },

    uSize: {
      value: basePointSize,
    },

    uColor: {
      value: COLORS.dark.clone(),
    },

    uOpacity: {
      value: 0,
    },

    uScatter: {
      value: 0,
    },

    /* interação magnética do mouse */
    uPointer: {
      value: new THREE.Vector2(999, 999),
    },

    uPointerRadius: {
      value: 1.05,
    },

    uPointerForce: {
      value: 0.3,
    },

    uPointerActive: {
      value: 0,
    },
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,

    vertexShader: /* glsl */ `
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
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 mod289(vec4 x) {
        return x - floor(x * (1.0 / 289.0)) * 289.0;
      }

      vec4 permute(vec4 x) {
        return mod289(((x * 34.0) + 1.0) * x);
      }

      vec4 taylorInvSqrt(vec4 r) {
        return 1.79284291400159
          - 0.85373472095314 * r;
      }

      float snoise(vec3 v) {
        const vec2 C = vec2(
          1.0 / 6.0,
          1.0 / 3.0
        );

        const vec4 D = vec4(
          0.0,
          0.5,
          1.0,
          2.0
        );

        vec3 i = floor(
          v + dot(v, C.yyy)
        );

        vec3 x0 =
          v - i + dot(i, C.xxx);

        vec3 g =
          step(x0.yzx, x0.xyz);

        vec3 l =
          1.0 - g;

        vec3 i1 =
          min(g.xyz, l.zxy);

        vec3 i2 =
          max(g.xyz, l.zxy);

        vec3 x1 =
          x0 - i1 + C.xxx;

        vec3 x2 =
          x0 - i2 + C.yyy;

        vec3 x3 =
          x0 - D.yyy;

        i = mod289(i);

        vec4 p = permute(
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

        float n_ = 0.142857142857;

        vec3 ns =
          n_ * D.wyz - D.xzx;

        vec4 j =
          p
          - 49.0
          * floor(p * ns.z * ns.z);

        vec4 x_ =
          floor(j * ns.z);

        vec4 y_ =
          floor(j - 7.0 * x_);

        vec4 x =
          x_ * ns.x + ns.yyyy;

        vec4 y =
          y_ * ns.x + ns.yyyy;

        vec4 h =
          1.0 - abs(x) - abs(y);

        vec4 b0 =
          vec4(x.xy, y.xy);

        vec4 b1 =
          vec4(x.zw, y.zw);

        vec4 s0 =
          floor(b0) * 2.0 + 1.0;

        vec4 s1 =
          floor(b1) * 2.0 + 1.0;

        vec4 sh =
          -step(h, vec4(0.0));

        vec4 a0 =
          b0.xzyw
          + s0.xzyw * sh.xxyy;

        vec4 a1 =
          b1.xzyw
          + s1.xzyw * sh.zzww;

        vec3 p0 =
          vec3(a0.xy, h.x);

        vec3 p1 =
          vec3(a0.zw, h.y);

        vec3 p2 =
          vec3(a1.xy, h.z);

        vec3 p3 =
          vec3(a1.zw, h.w);

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

        vec4 m = max(
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

        /* forma principal do blob */
        float n1 = snoise(
          dir * uFreq
          + vec3(
            uTime * 0.30,
            uTime * 0.24,
            -uTime * 0.15
          )
        );

        float n2 = snoise(
          dir * uFreq * 2.4
          + vec3(
            -uTime * 0.18,
            uTime * 0.30,
            uTime * 0.12
          )
        );

        float n3 = snoise(
          dir * uFreq * 5.2
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
          1.0 + n * uAmp * 0.5;

        vec3 p =
          dir * 1.5 * d;

        /* explosão usada na mudança entre seções */
        if (uScatter > 0.001) {
          vec3 dev =
            vec3(n2, n3, n1) * 0.4;

          p +=
            normalize(dir + dev)
            * uScatter
            * (0.35 + aScale);
        }

        /* ====================================================
           ATRAÇÃO MAGNÉTICA LOCAL
           ==================================================== */

        vec2 toPointer =
          uPointer - p.xy;

        float dist =
          length(toPointer);

        /*
          Curva gaussiana:
          evita uma borda circular marcada no efeito.
        */
        float normalizedDist =
          dist / max(uPointerRadius, 0.0001);

        float influence =
          exp(
            -normalizedDist
            * normalizedDist
            * 2.4
          );

        /*
          Prioriza os pontos da frente do blob.
          Isso reduz o aspecto de dois círculos sobrepostos.
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
          /*
            Pequena variação individual evita que
            todos os pontos se movam igualmente.
          */
          float scaleVariation =
            0.78
            + aScale * 0.22;

          /*
            Atrai para o cursor, mas não leva todos
            os pontos exatamente até o mesmo local.
          */
          p.xy +=
            toPointer
            * influence
            * uPointerForce
            * scaleVariation;

          /*
            Leve movimento tangencial cria uma
            resposta mais orgânica e menos mecânica.
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
          * vec4(p, 1.0);

        gl_PointSize =
          uSize
          * aScale
          * (5.6 / -mv.z);

        gl_Position =
          projectionMatrix * mv;

        vFade =
          smoothstep(
            -1.6,
            1.2,
            p.z
          );
      }
    `,

    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;

      varying float vFade;

      void main() {
        vec2 c =
          gl_PointCoord - 0.5;

        if (dot(c, c) > 0.25) {
          discard;
        }

        gl_FragColor = vec4(
          uColor,
          uOpacity
          * mix(
            0.35,
            1.0,
            vFade
          )
        );
      }
    `,
  });

  const cloud = new THREE.Points(geometry, material);

  scene.add(cloud);

  /* ---------- estados por seção ---------- */
  const DESKTOP_STATES = {
    hero: {
      xv: 0.44,
      ys: 0.5,
      sr: 0.9,
      amp: 0.85,
      freq: 1.5,
      speed: 0.16,
      op: 0.9,
      pt: 1,
      from: "right",
      tint: 0x77756e,
    },

    about: {
      xv: 0.72,
      ys: 0.72,
      sr: 0.24,
      amp: 1,
      freq: 1.8,
      speed: 0.2,
      op: 0.55,
      pt: 1,
      from: "right",
      tint: 0xbdbab0,
    },

    projects: {
      xv: 0.75,
      ys: 0.12,
      sr: 0.22,
      amp: 1.1,
      freq: 2,
      speed: 0.22,
      op: 0.5,
      pt: 1,
      from: "left",
      tint: 0x77756e,
    },

    contact: {
      xv: 0,
      ys: 0.8,
      sr: 0.24,
      amp: 0.8,
      freq: 1.4,
      speed: 0.13,
      op: 0.6,
      pt: 1,
      from: "bottom",
      tint: 0xbdbab0,
    },
  };

  /*
    No mobile, a nuvem ocupa espaços reservados acima da apresentação,
    depois das competências e antes do contato, preservando a leitura.
  */
  const MOBILE_STATES = {
    hero: {
      ...DESKTOP_STATES.hero,
      /* A nuvem ocupa o espaço reservado acima do título. */
      xv: 0,
      ys: 0.2,
      sr: 0.55,
      op: 0.66,
      pt: 0.88,
    },

    about: {
      ...DESKTOP_STATES.about,
      /* Encerramento visual: depois da lista de competências. */
      xv: 0,
      ys: 0.91,
      sr: 0.4,
      op: 0.48,
      pt: 0.65,
    },

    projects: {
      ...DESKTOP_STATES.projects,
      xv: 0.88,
      ys: 0.07,
      sr: 0.17,
      op: 0.32,
      pt: 0.44,
    },

    contact: {
      ...DESKTOP_STATES.contact,
      /* A nuvem ocupa o espaço reservado acima do contato. */
      xv: 0,
      ys: 0.12,
      sr: 0.4,
      op: 0.48,
      pt: 0.65,
    },
  };
  let STATES = isMobile ? MOBILE_STATES : DESKTOP_STATES;

  const secByName = {};

  sections.forEach((section) => {
    secByName[section.dataset.blob] = section;
  });

  const initialName = activeSec?.dataset.blob ?? "hero";

  const cur = {
    ...STATES[initialName],
  };

  let curName = initialName;

  const anim = {
    scatter: 0,
    op: 0,
    enter: 1,
  };

  let transitionTimeline = null;

  /* ---------- cores ---------- */
  let currentTheme = document.body.classList.contains("light")
    ? "light"
    : "dark";

  let pendingName = null;

  const targetColor = () => {
    const tint = STATES[pendingName ?? curName]?.tint;

    return tint != null ? new THREE.Color(tint) : COLORS[currentTheme];
  };

  const retint = (instant = false) => {
    const target = targetColor();

    if (hasGSAP && !reduced && !instant) {
      gsap.to(uniforms.uColor.value, {
        r: target.r,
        g: target.g,
        b: target.b,
        duration: 1.1,
        ease: "power2.inOut",
        overwrite: "auto",
      });
    } else {
      if (hasGSAP) {
        gsap.killTweensOf(uniforms.uColor.value);
      }

      uniforms.uColor.value.copy(target);
    }
  };

  const setTheme = (theme) => {
    currentTheme = theme;
    retint();
    requestStaticRender();
  };

  retint(true);

  /* ---------- entrada inicial ---------- */
  if (hasGSAP && !reduced) {
    anim.enter = 0;

    gsap.to(anim, {
      op: cur.op,
      enter: 1,
      duration: 1.8,
      ease: "power3.out",
      delay: 0.3,
    });
  } else {
    anim.op = cur.op;
  }

  /* ---------- mudança entre seções ---------- */
  const transitionTo = (name) => {
    const nextState = STATES[name];

    if (!nextState || name === curName) {
      return;
    }

    if (!hasGSAP || reduced) {
      curName = name;

      Object.assign(cur, nextState);

      anim.scatter = 0;
      anim.enter = 1;
      anim.op = nextState.op;

      retint(true);
      requestStaticRender();

      return;
    }

    if (transitionTimeline) {
      transitionTimeline.kill();
    }

    pendingName = name;

    transitionTimeline = gsap.timeline();

    transitionTimeline
      .to(anim, {
        scatter: 2.6,
        op: 0,
        duration: 0.55,
        ease: "power2.in",
      })
      .add(() => {
        curName = name;
        pendingName = null;

        Object.assign(cur, nextState);

        anim.scatter = 0;
        anim.enter = 0;

        retint(true);
      })
      .to(anim, {
        op: nextState.op,
        enter: 1,
        duration: 1.1,
        ease: "power3.out",
      });
  };

  const goTo = transitionTo;

  /* ============================================================
     INTERAÇÃO DO MOUSE
     O blob permanece parado.
     Apenas os pontos reagem.
     ============================================================ */

  const raycaster = new THREE.Raycaster();

  const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

  const pointerNdc = new THREE.Vector2();

  const pointerWorld = new THREE.Vector3();

  const pointerTargetWorld = new THREE.Vector2(999, 999);

  const pointerWorldCurrent = new THREE.Vector2(999, 999);

  const pointerLocal = new THREE.Vector2(999, 999);

  let pointerActiveTarget = 0;
  let pointerActive = 0;

  const hidePointer = () => {
    pointerActiveTarget = 0;
  };

  const handlePointerMove = (event) => {
    if (!allowPointerInteraction) {
      return;
    }

    pointerNdc.set(
      (event.clientX / window.innerWidth) * 2 - 1,

      -(event.clientY / window.innerHeight) * 2 + 1,
    );

    raycaster.setFromCamera(pointerNdc, camera);

    const intersects = raycaster.ray.intersectPlane(
      interactionPlane,
      pointerWorld,
    );

    if (intersects) {
      pointerTargetWorld.set(pointerWorld.x, pointerWorld.y);

      pointerActiveTarget = 1;
    }
  };

  if (allowPointerInteraction) {
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });

    window.addEventListener("pointerleave", hidePointer, { passive: true });

    window.addEventListener("blur", hidePointer, { passive: true });
  }

  /* ---------- redimensionamento ---------- */
  const handleResize = () => {
    isMobile = window.innerWidth <= 760;
    STATES = isMobile ? MOBILE_STATES : DESKTOP_STATES;
    transitionTimeline?.kill();
    pendingName = null;
    Object.assign(cur, STATES[curName]);
    anim.op = cur.op;
    anim.enter = 1;
    anim.scatter = 0;
    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    requestStaticRender();
  };

  window.addEventListener("resize", handleResize, { passive: true });

  /* ---------- pausa quando a aba está oculta ---------- */
  let running = true;

  const handleVisibility = () => {
    running = !document.hidden;

    if (running && !reduced) {
      last = performance.now();

      animationFrame = requestAnimationFrame(tick);
    }
  };

  document.addEventListener("visibilitychange", handleVisibility);

  /* ---------- loop ---------- */
  let time = 0;
  let last = performance.now();

  let animationFrame = 0;
  let staticFrame = 0;

  function requestStaticRender() {
    if (!reduced || staticFrame) {
      return;
    }

    staticFrame = requestAnimationFrame((now) => {
      staticFrame = 0;
      tick(now);
    });
  }

  function tick(now) {
    if (!running) {
      return;
    }

    const dt = Math.min((now - last) / 1000, 0.05);

    last = now;

    if (!reduced) {
      time += dt * cur.speed;
    }

    uniforms.uTime.value = time;
    uniforms.uAmp.value = cur.amp;
    uniforms.uFreq.value = cur.freq;
    /*
      Blobs pequenos usam pontos menores. Assim as partículas deixam
      espaços internos e não viram uma massa visualmente sólida.
    */
    uniforms.uSize.value = basePointSize * (cur.pt ?? 1);
    uniforms.uOpacity.value = anim.op;
    uniforms.uScatter.value = anim.scatter;

    /* ---------- posição do blob na seção ---------- */
    const halfH =
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;

    const halfW = halfH * camera.aspect;

    const portrait = camera.aspect < 0.85;

    const sizeNormalized = Math.min(halfW, halfH) / 2.41;

    const worldScale =
      cur.sr * Math.max(sizeNormalized, 0.55) * (portrait ? 0.9 : 1);

    const section = secByName[curName];

    let pixelX = (0.5 + cur.xv * (portrait ? 0.4 : 0.5)) * window.innerWidth;

    let pixelY = window.innerHeight * 0.5;

    if (section) {
      const rect = section.getBoundingClientRect();

      pixelY = rect.top + cur.ys * rect.height;
      const anchor = isMobile && section.querySelector('[data-blob-anchor]');
      if (anchor) {
        const slot = anchor.getBoundingClientRect();
        pixelX = slot.left + slot.width / 2;
        pixelY = slot.top + slot.height / 2;
      }
    }

    /* movimento de entrada da seção */
    const slide = 1 - anim.enter;

    if (cur.from === "right") {
      pixelX += window.innerWidth * 0.55 * slide;
    }

    if (cur.from === "left") {
      pixelX -= window.innerWidth * 0.55 * slide;
    }

    if (cur.from === "bottom") {
      pixelY += window.innerHeight * 0.6 * slide;
    }

    const worldX = (pixelX / window.innerWidth - 0.5) * 2 * halfW;

    const worldY = -(pixelY / window.innerHeight - 0.5) * 2 * halfH;

    /*
      O blob não se move com o mouse.
      Sua posição depende apenas da seção.
    */
    cloud.position.set(worldX, worldY, 0);

    cloud.scale.setScalar(worldScale);

    cloud.rotation.set(0, 0, 0);

    /* ---------- atração dos pontos ---------- */
    if (allowPointerInteraction) {
      /*
        Quanto menor, mais lento e suave
        o campo acompanha o cursor.
      */
      pointerWorldCurrent.lerp(pointerTargetWorld, 0.09);

      pointerActive += (pointerActiveTarget - pointerActive) * 0.075;

      /*
        Converte o mouse do espaço mundial
        para o espaço local do blob.
      */
      pointerLocal.set(
        (pointerWorldCurrent.x - cloud.position.x) /
          Math.max(cloud.scale.x, 0.0001),

        (pointerWorldCurrent.y - cloud.position.y) /
          Math.max(cloud.scale.y, 0.0001),
      );

      uniforms.uPointer.value.copy(pointerLocal);

      uniforms.uPointerActive.value = pointerActive;
    } else {
      uniforms.uPointer.value.set(999, 999);

      uniforms.uPointerActive.value = 0;
    }

    renderer.render(scene, camera);

    if (!reduced) {
      animationFrame = requestAnimationFrame(tick);
    }
  }

  const handleReducedScroll = () => {
    requestStaticRender();
  };

  if (reduced) {
    window.addEventListener("scroll", handleReducedScroll, { passive: true });
  }

  animationFrame = requestAnimationFrame(tick);

  /* ---------- limpeza ---------- */
  function destroy() {
    running = false;

    cancelAnimationFrame(animationFrame);

    cancelAnimationFrame(staticFrame);

    window.removeEventListener("resize", handleResize);

    window.removeEventListener("pointermove", handlePointerMove);

    window.removeEventListener("pointerleave", hidePointer);

    window.removeEventListener("blur", hidePointer);

    window.removeEventListener("scroll", handleReducedScroll);

    document.removeEventListener("visibilitychange", handleVisibility);

    geometry.dispose();
    material.dispose();
    renderer.dispose();
  }

  return {
    setTheme,
    goTo,
    destroy,
  };
}
