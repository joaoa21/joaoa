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

/* Tira o seletor de idioma que já existe (para regravar com a versão atual). */
function removeSwitch(html) {
  return html
    .replace(/<li class="nav-lang">[\s\S]*?<\/li>/, '')
    .replace(/<a class="toolbar-lang"[\s\S]*?<\/a>\n?/, '')
    .replace(/<a class="lang-switch[^"]*"[\s\S]*?<\/a>/, '<!--LANG-SWITCH-->');
}

/* Seletor de idioma com a bandeira do idioma de destino: último item do menu,
   um botão na barra do currículo ou o espaço <!--LANG-SWITCH--> (página de links). */
function addSwitch(html, href, label, lang, name) {
  html = removeSwitch(html);
  const flag = `<span aria-hidden="true" class="flag flag-${lang === 'en' ? 'us' : 'br'}"></span>`;
  const attrs = `href="${href}" hreflang="${lang}" lang="${lang}" aria-label="${name}"`;
  const ul = html.match(/<ul class="nav-links">[\s\S]*?<\/ul>/);
  if (ul) return html.replace(ul[0], ul[0].replace(/<\/ul>$/, `<li class="nav-lang"><a ${attrs}>${flag}${label}</a></li></ul>`));
  if (html.includes('<div class="toolbar-actions">')) {
    return html.replace('<div class="toolbar-actions">', `<div class="toolbar-actions">\n<a class="toolbar-lang" ${attrs}>${flag}${label}</a>`);
  }
  if (html.includes('<!--LANG-SWITCH-->')) return html.replace('<!--LANG-SWITCH-->', `<a class="lang-switch" ${attrs}>${flag}${label}</a>`);
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
  const ptNext = cfg.noHreflang ? pt : addSwitch(addHreflang(pt, cfg.ptUrl, cfg.enUrl), cfg.enUrl, 'EN', 'en', 'English version');
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
  en = addSwitch(html, cfg.ptUrl, 'PT', 'pt-BR', 'Versão em português');

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
