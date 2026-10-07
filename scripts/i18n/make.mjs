// Gera as páginas em inglês (pasta /en/) a partir das páginas em português.
//   node scripts/i18n/make.mjs              → todas
//   node scripts/i18n/make.mjs home cv      → só algumas (nomes em scripts/i18n/pages/)
// Os textos traduzidos ficam em scripts/i18n/pages/<página>.mjs; os repetidos, em common.mjs.
// Também acrescenta o seletor PT/EN e as marcações hreflang na página em português.
// Ao mudar um texto em português, acrescente a tradução no dicionário e rode de novo:
// o script lista o que ficou sem tradução.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { translate, absolutize, relink } from './lib.mjs';
import { URLS, COMMON, KEEP } from './common.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const SITE = 'https://joaoa.com.br';

function hreflangTags(ptUrl, enUrl) {
  return `<link rel="alternate" hreflang="pt-BR" href="${SITE}${ptUrl}"/><link rel="alternate" hreflang="en" href="${SITE}${enUrl}"/><link rel="alternate" hreflang="x-default" href="${SITE}${ptUrl}"/>`;
}

function addHreflang(html, ptUrl, enUrl) {
  if (html.includes('hreflang="x-default"')) return html;
  const tags = hreflangTags(ptUrl, enUrl);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*\/?>/);
  if (canonical) return html.replace(canonical[0], canonical[0] + tags);
  return html.replace('</title>', '</title>' + tags);
}

/* ---------- Seletor de idioma ----------
   Botão com o idioma atual (bandeira + sigla) que abre a lista com os dois idiomas
   (<details>, estilos em assets/css/lang-menu.css, fechar fora/Esc em assets/js/lang-menu.js).
   O seletor fica entre <!--lang--> e <!--/lang--> para poder ser regravado. */
const LANG_CSS = '<link href="/assets/css/lang-menu.css" rel="stylesheet" media="print" onload="this.media=\'all\'"/><noscript><link href="/assets/css/lang-menu.css" rel="stylesheet"/></noscript>';
const LANG_JS = '<script src="/assets/js/lang-menu.js" defer></script>';

/* Tira o seletor que já existe e deixa o marcador <!--LANG-SWITCH--> no lugar. */
function removeSwitch(html) {
  return html
    .replace(/<!--lang-->[\s\S]*?<!--\/lang-->/, '<!--LANG-SWITCH-->')
    // formatos antigos (link simples com a bandeira do outro idioma)
    .replace(/<li class="nav-lang">[\s\S]*?<\/li>/, '<!--LANG-SWITCH-->')
    .replace(/<a class="toolbar-lang"[\s\S]*?<\/a>\n?/, '<!--LANG-SWITCH-->')
    .replace(/<a class="lang-switch[^"]*"[\s\S]*?<\/a>/, '<!--LANG-SWITCH-->');
}

function switchMarkup(current, ptUrl, enUrl, extraClass) {
  const langs = {
    pt: { code: 'PT', name: 'Português', flag: 'br', href: ptUrl, hreflang: 'pt-BR' },
    en: { code: 'EN', name: 'English', flag: 'us', href: enUrl, hreflang: 'en' },
  };
  const cur = langs[current];
  const label = current === 'pt' ? 'Idioma: Português' : 'Language: English';
  const items = ['pt', 'en'].map((key) => {
    const l = langs[key];
    const currentAttr = key === current ? ' aria-current="true"' : '';
    return `<li><a href="${l.href}" hreflang="${l.hreflang}" lang="${l.hreflang}"${currentAttr}><span aria-hidden="true" class="flag flag-${l.flag}"></span>${l.name}</a></li>`;
  }).join('');
  return `<details class="lang-menu${extraClass}"><summary aria-label="${label}"><span aria-hidden="true" class="flag flag-${cur.flag}"></span>${cur.code}</summary><ul class="lang-list">${items}</ul></details>`;
}

/* Coloca o seletor: último item do menu, primeiro botão da barra do currículo
   ou no marcador <!--LANG-SWITCH--> (página de links e página em obras). */
function addSwitch(html, current, ptUrl, enUrl) {
  html = removeSwitch(html);
  const inNav = /<ul class="nav-links">[\s\S]*?<!--LANG-SWITCH-->[\s\S]*?<\/ul>/.test(html) || (!html.includes('<!--LANG-SWITCH-->') && /<ul class="nav-links">/.test(html));
  const inToolbar = !inNav && html.includes('<div class="toolbar-actions">');
  if (!html.includes('<!--LANG-SWITCH-->')) {
    if (inNav) html = html.replace(/(<ul class="nav-links">[\s\S]*?)<\/ul>/, '$1<!--LANG-SWITCH--></ul>');
    else if (inToolbar) html = html.replace('<div class="toolbar-actions">', '<div class="toolbar-actions">\n<!--LANG-SWITCH-->');
    else return html;
  }
  let markup;
  if (inNav) markup = `<li class="nav-lang">${switchMarkup(current, ptUrl, enUrl, '')}</li>`;
  else if (inToolbar) markup = switchMarkup(current, ptUrl, enUrl, '');
  else markup = switchMarkup(current, ptUrl, enUrl, html.includes('obras-tapes') ? ' lang-corner' : ' lang-switch');
  html = html.replace('<!--LANG-SWITCH-->', `<!--lang-->${markup}<!--/lang-->`);
  if (!html.includes('/assets/css/lang-menu.css')) html = html.replace('</head>', `${LANG_CSS}\n</head>`);
  if (!html.includes('/assets/js/lang-menu.js')) html = html.replace('</body>', `${LANG_JS}\n</body>`);
  return html;
}

/* Dados estruturados: endereços da própria página e idioma. */
function jsonLd(html, dict) {
  return html.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (all, a, body, b) => {
    let out = body.replace(/"inLanguage":\s*"pt-BR"/g, '"inLanguage": "en"');
    out = out.replace(/("(?:url|item)":\s*")https:\/\/joaoa\.com\.br([^"#]*)(")/g, (m, k, p, q) => k + SITE + (URLS[p] || p) + q);
    for (const [pt, en] of Object.entries(dict)) out = out.split(`"${pt}"`).join(`"${en}"`);
    return a + out + b;
  });
}

export function build(cfg) {
  const ptFile = path.join(ROOT, cfg.pt);
  const enFile = path.join(ROOT, cfg.en);
  let pt = fs.readFileSync(ptFile, 'utf8');

  // português: marcações de idioma e seletor "EN"
  const ptNext = cfg.noHreflang ? pt : addSwitch(addHreflang(pt, cfg.ptUrl, cfg.enUrl), 'pt', cfg.ptUrl, cfg.enUrl);
  if (ptNext !== pt) { fs.writeFileSync(ptFile, ptNext); pt = ptNext; }

  // inglês
  let en = pt.replace(/<html lang="pt-BR"/, '<html lang="en"');
  for (const [a, b] of cfg.raw || []) {
    if (!en.includes(a)) throw new Error(`[${cfg.pt}] trecho bruto não encontrado: ${a.slice(0, 80)}`);
    en = en.split(a).join(b);
  }
  // imagens de compartilhamento em inglês, quando existem (og-nome-en.jpg)
  en = en.replace(/\/assets\/img\/(og-[a-z0-9-]+?)\.jpg/g, (m, n) => (!n.endsWith('-en') && fs.existsSync(path.join(ROOT, 'assets/img', n + '-en.jpg')) ? '/assets/img/' + n + '-en.jpg' : m));
  // mensagem pronta do WhatsApp
  en = en.split('?text=Oi%20Jo%C3%A3o!').join('?text=Hi%20Jo%C3%A3o!');
  en = removeSwitch(en);
  en = absolutize(en, cfg.ptUrl);
  en = relink(en, URLS);
  // o relink também troca os endereços das marcações hreflang: regrava o bloco certo
  en = en.replace(/<link rel="alternate" hreflang="pt-BR"[^>]*\/><link rel="alternate" hreflang="en"[^>]*\/><link rel="alternate" hreflang="x-default"[^>]*\/>/, hreflangTags(cfg.ptUrl, cfg.enUrl));
  en = en.replace(new RegExp(`content="${SITE}${cfg.ptUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g'), `content="${SITE}${cfg.enUrl}"`);
  en = en.replace('<meta property="og:locale" content="pt_BR"/>', '<meta property="og:locale" content="en_US"/><meta property="og:locale:alternate" content="pt_BR"/>');
  en = jsonLd(en, { ...(cfg.jsonDict || {}) });
  const { html, missing } = translate(en, { ...COMMON, ...cfg.dict });
  en = addSwitch(html, 'en', cfg.ptUrl, cfg.enUrl);

  fs.mkdirSync(path.dirname(enFile), { recursive: true });
  fs.writeFileSync(enFile, en);
  const ignore = new Set([...KEEP, ...(cfg.keep || [])]);
  const left = missing.filter((t) => !ignore.has(t) && /[ãõçáéíóúâêôà]|\b(de|do|da|para|com|em|e|o|os|as|seu|sua|que|um|uma|não|ver|mais)\b/i.test(t));
  console.log(`${cfg.en}: ${left.length ? left.length + ' sem tradução' : 'ok'}`);
  left.forEach((t) => console.log('   · ' + t));
}

const names = process.argv.slice(2).length
  ? process.argv.slice(2)
  : fs.readdirSync(path.join(HERE, 'pages')).map((file) => file.replace(/\.mjs$/, ''));
for (const name of names) {
  const { default: cfg } = await import(`./pages/${name}.mjs?${Date.now()}`);
  build(cfg);
}
