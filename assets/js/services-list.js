/* Lista de serviços: abre e fecha cada item com animação suave.
   A altura cresce até o tamanho do conteúdo, e o texto e o exemplo sobem em sequência.
   Um item por vez: abrir um fecha o anterior. Sem JavaScript (ou com "reduzir movimento"),
   o <details> abre e fecha normalmente. */
(() => {
  const items = [...document.querySelectorAll('.svc-item')];
  if (!items.length || typeof Element.prototype.animate !== 'function') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const EASE = 'cubic-bezier(.22, 1, .36, 1)';
  const EASE_CLOSE = 'cubic-bezier(.65, 0, .35, 1)';
  const running = new WeakMap();

  function stop(item) {
    running.get(item)?.forEach((animation) => animation.cancel());
    running.delete(item);
  }

  function open(item) {
    stop(item);
    const body = item.querySelector('.svc-item-body');
    item.open = true;
    const height = body.offsetHeight;
    const pad = getComputedStyle(body).paddingBottom;
    const parts = [...body.children];
    const animations = [
      body.animate([{ height: '0px', paddingBottom: '0px', opacity: 0 }, { height: `${height}px`, paddingBottom: pad, opacity: 1 }], { duration: 480, easing: EASE }),
      ...parts.map((part, i) => part.animate(
        [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
        { duration: 520, delay: 90 + i * 80, easing: EASE, fill: 'backwards' },
      )),
    ];
    body.style.overflow = 'hidden';
    animations[0].onfinish = () => { body.style.overflow = ''; running.delete(item); };
    running.set(item, animations);
  }

  function close(item) {
    stop(item);
    const body = item.querySelector('.svc-item-body');
    const height = body.offsetHeight;
    const pad = getComputedStyle(body).paddingBottom;
    body.style.overflow = 'hidden';
    item.classList.add('is-closing');
    const animation = body.animate([{ height: `${height}px`, paddingBottom: pad, opacity: 1 }, { height: '0px', paddingBottom: '0px', opacity: 0 }], { duration: 380, easing: EASE_CLOSE });
    animation.onfinish = () => {
      item.open = false;
      item.classList.remove('is-closing');
      body.style.overflow = '';
      running.delete(item);
    };
    running.set(item, [animation]);
  }

  items.forEach((item) => {
    item.querySelector('summary').addEventListener('click', (event) => {
      event.preventDefault();
      if (item.open && !item.classList.contains('is-closing')) {
        close(item);
        return;
      }
      // um por vez, dentro da mesma lista
      item.closest('.svc-acc')?.querySelectorAll('.svc-item[open]').forEach((other) => {
        if (other !== item && !other.classList.contains('is-closing')) close(other);
      });
      open(item);
    });
  });
})();
