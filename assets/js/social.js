/* Social Media: stories passando e feed rolando. */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STEP = 3200;          // tempo de cada peça no card (ms)

  /* ---------- Trilho deslizando sozinho, com setas ---------- */
  // duplica os cards para o loop não ter emenda; a cópia fica escondida dos leitores de tela
  const rail = document.querySelector('.sm-rail');
  const RAIL_SPEED = 40;  // px por segundo
  const ARROW_MS = 650;   // duração do deslize das setas
  if (rail) {
    [...rail.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); rail.appendChild(c); });
    const win = rail.parentElement;
    let x = 0, half = rail.scrollWidth / 2, hover = false, onScreen = true, tween = null, last = performance.now();
    const mod = (v) => ((v % half) + half) % half;
    const stepW = () => { const it = rail.querySelector('.sm-story'); return it.getBoundingClientRect().width + parseFloat(getComputedStyle(it).marginRight); };
    const go = (dir) => { const from = tween ? tween.to : x; tween = { from: x, to: from + dir * stepW(), t0: performance.now() }; };
    document.querySelector('[data-sm-prev]')?.addEventListener('click', () => go(-1));
    document.querySelector('[data-sm-next]')?.addEventListener('click', () => go(1));
    win.addEventListener('mouseenter', () => { hover = true; });   // mouse em cima: para
    win.addEventListener('mouseleave', () => { hover = false; });
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(win);
    window.addEventListener('resize', () => { half = rail.scrollWidth / 2; });
    const frame = (now) => {
      const dt = Math.min(64, now - last); last = now;
      if (tween) {
        const p = reduce ? 1 : Math.min(1, (now - tween.t0) / ARROW_MS);
        x = tween.from + (tween.to - tween.from) * (1 - Math.pow(1 - p, 3));
        if (p >= 1) tween = null;
      } else if (!hover && onScreen && !reduce && !document.hidden) {
        x += RAIL_SPEED * dt / 1000;
      }
      rail.style.transform = `translate3d(${-mod(x)}px,0,0)`;
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ---------- Cards que passam sozinhos ---------- */
  const cards = [...document.querySelectorAll('.sm-story-card')];
  const anim = (bar, ms) => {
    bar.style.transition = 'none'; bar.style.width = '0';
    void bar.offsetWidth;
    bar.style.transition = `width ${ms}ms linear`; bar.style.width = '100%';
  };
  cards.forEach((card, k) => {
    const list = JSON.parse(card.dataset.stories || '[]');
    const img = card.querySelector('img');
    const bars = [...card.querySelectorAll('.sm-story-bars i')];
    let i = 0, timer = null, visible = false;
    const show = (n) => {
      i = n % list.length;
      bars.forEach((b, j) => { b.classList.toggle('is-done', j < i); const f = b.querySelector('b'); if (j !== i) { f.style.transition = 'none'; f.style.width = j < i ? '100%' : '0'; } });
      if (img.getAttribute('src') !== list[i]) {
        const pre = new Image(); pre.src = list[i];
        pre.decode().catch(() => {}).then(() => { img.src = list[i]; });
      }
      if (!reduce) anim(bars[i].querySelector('b'), STEP);
    };
    const tick = () => { show(i + 1); timer = setTimeout(tick, STEP); };
    const start = () => { if (timer || reduce || list.length < 2) return; show(i); timer = setTimeout(tick, STEP); };
    const stop = () => { clearTimeout(timer); timer = null; };
    // começa em momentos diferentes para os cards não trocarem juntos
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      visible = e.isIntersecting;
      if (visible) setTimeout(() => visible && start(), (k % 4) * 700); else stop();
    }), { threshold: 0.3 });
    io.observe(card);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : visible && start()));
  });

  /* ---------- Feed rolando ---------- */
  // no celular, as peças das colunas escondidas passam para as duas primeiras
  const cols = [...document.querySelectorAll('.sm-feed-col')];
  if (window.matchMedia('(max-width: 767px)').matches && cols.length > 2) {
    cols.slice(2).forEach((c, k) => [...c.children].forEach((li) => cols[k % 2].appendChild(li)));
  }
  cols.forEach((col, k) => {
    // duplica a coluna para o loop não ter emenda
    [...col.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); col.appendChild(c); });
  });
  // todas as colunas sobem na mesma velocidade; as setas adiantam ou voltam o mural
  const SPEED = 36;        // px por segundo
  const FEED_ARROW_MS = 700;
  const wall = document.querySelector('.sm-wall');
  if (wall && !reduce) {
    const live = cols.filter((c) => c.offsetParent !== null);
    let half = live.map((c) => c.scrollHeight / 2);
    let y = live.map((c, k) => ((k * 0.37) % 1) * half[k]); // começa em pontos diferentes
    let tween = null, onScreen = true, last = performance.now();
    const stepH = () => wall.clientHeight * 0.6;
    const go = (dir) => {
      const base = tween ? tween.to : y;
      tween = { from: y.slice(), to: base.map((v) => v + dir * stepH()), t0: performance.now() };
    };
    document.querySelector('[data-feed-prev]')?.addEventListener('click', () => go(-1));
    document.querySelector('[data-feed-next]')?.addEventListener('click', () => go(1));
    new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(wall);
    window.addEventListener('resize', () => { half = live.map((c) => c.scrollHeight / 2); });
    const frame = (now) => {
      const dt = Math.min(64, now - last); last = now;
      if (tween) {
        const p = Math.min(1, (now - tween.t0) / FEED_ARROW_MS), e = 1 - Math.pow(1 - p, 3);
        y = tween.from.map((v, k) => v + (tween.to[k] - v) * e);
        if (p >= 1) tween = null;
      } else if (onScreen && !document.hidden) {
        y = y.map((v) => v + SPEED * dt / 1000);
      }
      live.forEach((c, k) => { const m = ((y[k] % half[k]) + half[k]) % half[k]; c.style.transform = `translate3d(0,${-m}px,0)`; });
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }
})();
