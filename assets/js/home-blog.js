/* "Do blog" na home: lê /blog/posts.json (gerado pelo blog) e mostra os três posts mais recentes.
   O HTML já vem com os posts da última publicação do portfólio (o Google lê esses links);
   este script só troca pelos mais novos. Se o arquivo não carregar, fica o que veio no HTML. */
(() => {
  const list = document.querySelector('.home-blog-list');
  if (!list) return;

  const en = document.documentElement.lang === 'en';
  const fmt = new Intl.DateTimeFormat(en ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const minutes = (text) => (en ? text.replace('min de leitura', 'min read') : text);

  function card(post) {
    const date = fmt.format(new Date(`${post.date}T00:00:00Z`)).replace(/ de /g, ' ');
    const cover = post.cover
      ? `<img alt="" decoding="async" height="400" loading="lazy" src="${esc(post.cover)}" width="640"/>`
      : '<span aria-hidden="true" class="home-blog-ph"></span>';
    return `<li><a class="home-blog-card" href="${esc(post.url)}"><span class="home-blog-cover">${cover}</span>`
      + `<span class="home-blog-meta mono">${esc(post.category)} · ${esc(minutes(post.readingTime))}</span>`
      + `<strong>${esc(post.title)}</strong>`
      + `<time datetime="${esc(post.date)}">${esc(date)}</time></a></li>`;
  }

  fetch('/blog/posts.json', { cache: 'no-cache' })
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then(({ posts }) => {
      if (!Array.isArray(posts) || !posts.length) return;
      const html = posts.slice(0, 3).map(card).join('');
      if (html !== list.innerHTML) list.innerHTML = html;
    })
    .catch(() => {});
})();
