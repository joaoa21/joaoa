/* ============================================================
   JOÃO ALBERTO — SELETOR DE IDIOMA
   A lista abre e fecha sozinha (<details>). Aqui só o que o HTML não faz:
   fechar ao clicar fora e com a tecla Esc (devolvendo o foco ao botão).
   ============================================================ */
(() => {
  const menus = [...document.querySelectorAll('details.lang-menu')];
  if (!menus.length) return;

  document.addEventListener('click', (event) => {
    menus.forEach((menu) => {
      if (menu.open && !menu.contains(event.target)) menu.open = false;
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    menus.forEach((menu) => {
      if (!menu.open) return;
      menu.open = false;
      menu.querySelector('summary')?.focus();
    });
  });
})();
