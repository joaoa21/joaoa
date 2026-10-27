// Escreve os cards da página "Email Design" em português, entre <!--emails--> e <!--/emails-->
// de projetos/email-design/index.html. A página em inglês sai do make.mjs (dicionário em
// scripts/i18n/pages/emaildesign.mjs, montado com o mesmo catálogo).
//   node scripts/emails/page.mjs && node scripts/i18n/make.mjs emaildesign
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { catalog, cardText, TYPES } from './catalog.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(ROOT, 'projetos/email-design/index.html');
const text = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
const esc = (s) => text(s).replace(/"/g, '&quot;');

function card(item, badge) {
  const t = cardText(item, 'pt');
  const { img } = item;
  const data = [`data-filter="${TYPES[item.type].filter}"`, `data-html="${item.html}"`, `data-light="${img.light}"`];
  if (img.dark) data.push(`data-dark="${img.dark}"`, `data-mobile="${img.mobile}"`);
  return `<article class="ed-card" ${data.join(' ')}>
<button class="ed-thumb" type="button" aria-label="${esc(t.open)}"><img alt="${esc(t.alt)}" decoding="async" loading="lazy" src="${img.light}" width="${img.w}" height="${img.h}"/></button>
<div class="ed-meta">
<p class="ed-kicker mono"><span>${text(item.brand.pt)}</span><span>${text(t.type)}</span>${badge ? `<span class="ed-badge">${text(badge.pt)}</span>` : ''}</p>
<h3 class="ed-subject">${text(item.subject.pt)}</h3>
<a class="ed-html" href="${item.html}" rel="noopener" target="_blank">Ver o HTML <i aria-hidden="true" class="fa-solid fa-arrow-right"></i></a>
</div>
</article>`;
}

const groups = await catalog();
const sections = groups.map((g, i) => `<section class="work-section ed-group" id="${g.id}" aria-labelledby="titulo-${g.id}">
<div class="s-head">
<div class="s-head-left">
<span class="s-num">// ${String(i + 1).padStart(2, '0')}</span>
<h2 class="s-title" id="titulo-${g.id}">${text(g.pt.title)}<span class="dot">.</span></h2>
</div>
<p class="ed-group-text">${text(g.pt.text)}</p>
</div>
<div class="ed-grid">
${g.items.map((it) => card(it, g.badge)).join('\n')}
</div>
</section>`).join('\n');

const html = fs.readFileSync(FILE, 'utf8');
if (!/<!--emails-->[\s\S]*<!--\/emails-->/.test(html)) throw new Error('marcadores <!--emails--> não encontrados');
fs.writeFileSync(FILE, html.replace(/<!--emails-->[\s\S]*<!--\/emails-->/, `<!--emails-->\n${sections}\n<!--/emails-->`));
console.log(`${groups.reduce((n, g) => n + g.items.length, 0)} emails em ${groups.length} grupos`);
