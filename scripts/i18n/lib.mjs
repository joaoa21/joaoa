// Ferramentas para gerar as páginas em inglês a partir das páginas em português.
const norm = (s) => s.replace(/\s+/g, ' ').trim();
const hasLetters = (s) => /[A-Za-zÀ-ÿ]/.test(s);
const TRANSLATABLE_ATTRS = ['alt', 'aria-label', 'title', 'placeholder', 'data-label', 'data-caption'];
const META_NAMES = /^(description|og:title|og:description|og:image:alt|og:site_name|twitter:title|twitter:description|twitter:image:alt)$/;

/* Percorre o HTML e devolve os trechos traduzíveis (texto entre tags e atributos). */
export function segments(html) {
  const out = [];
  const skipBlocks = /<(script|style)\b[\s\S]*?<\/\1>/gi;
  const stripped = html.replace(skipBlocks, (m) => ' '.repeat(m.length));
  // textos entre tags
  for (const m of stripped.matchAll(/>([^<>]+)</g)) {
    const t = norm(m[1]);
    if (t && hasLetters(t)) out.push({ kind: 'text', text: t });
  }
  // atributos traduzíveis
  for (const m of stripped.matchAll(/<[a-zA-Z][^>]*>/g)) {
    const tag = m[0];
    for (const attr of TRANSLATABLE_ATTRS) {
      const v = tag.match(new RegExp(`\\s${attr}="([^"]*)"`));
      if (v && hasLetters(v[1])) out.push({ kind: attr, text: norm(v[1]) });
    }
    if (/^<meta/i.test(tag)) {
      const key = (tag.match(/\s(?:name|property)="([^"]*)"/) || [])[1];
      const content = (tag.match(/\scontent="([^"]*)"/) || [])[1];
      if (key && META_NAMES.test(key) && content && hasLetters(content)) out.push({ kind: 'meta:' + key, text: norm(content) });
    }
  }
  return out;
}

/* Aplica um dicionário { português: inglês } aos trechos, preservando espaços e tags. */
export function translate(html, dict) {
  const map = new Map(Object.entries(dict).map(([k, v]) => [norm(k), v]));
  const missing = new Set();
  const swap = (raw) => {
    const t = norm(raw);
    if (!t || !hasLetters(t)) return raw;
    if (map.has(t)) {
      const lead = raw.match(/^\s*/)[0];
      const trail = raw.match(/\s*$/)[0];
      return lead + map.get(t) + trail;
    }
    missing.add(t);
    return raw;
  };
  // protege <script> e <style>
  const blocks = [];
  let out = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (m) => { blocks.push(m); return `\u0000${blocks.length - 1}\u0000`; });
  out = out.replace(/>([^<>]+)</g, (m, txt) => '>' + swap(txt) + '<');
  out = out.replace(/<[a-zA-Z][^>]*>/g, (tag) => {
    let t = tag;
    for (const attr of TRANSLATABLE_ATTRS) {
      t = t.replace(new RegExp(`(\\s${attr}=")([^"]*)(")`), (all, a, v, b) => a + swap(v) + b);
    }
    if (/^<meta/i.test(t)) {
      const key = (t.match(/\s(?:name|property)="([^"]*)"/) || [])[1];
      if (key && META_NAMES.test(key)) t = t.replace(/(\scontent=")([^"]*)(")/, (all, a, v, b) => a + swap(v) + b);
    }
    return t;
  });
  out = out.replace(/\u0000(\d+)\u0000/g, (m, i) => blocks[Number(i)]);
  return { html: out, missing: [...missing] };
}

/* Troca caminhos relativos por absolutos (a página em inglês fica em outra pasta). */
export function absolutize(html, ptUrl) {
  const base = new URL(ptUrl, 'https://joaoa.com.br');
  return html.replace(/(\s(?:src|href|data-full|data-src|poster|srcset)=")([^"]+)(")/g, (all, a, v, b) => {
    if (/^(https?:|\/|#|mailto:|tel:|data:|javascript:)/i.test(v)) return all;
    const abs = new URL(v, base);
    return a + abs.pathname + abs.search + abs.hash + b;
  });
}

/* Troca links internos portugueses pelos equivalentes em inglês. */
export function relink(html, urlMap) {
  const entries = Object.entries(urlMap).sort((x, y) => y[0].length - x[0].length);
  return html.replace(/(\shref=")([^"]+)(")/g, (all, a, v, b) => {
    const url = v.replace(/^https:\/\/joaoa\.com\.br/, '');
    const [path, hash = ''] = url.split('#');
    for (const [pt, en] of entries) {
      if (path === pt) return a + (v.startsWith('https://') ? 'https://joaoa.com.br' : '') + en + (hash ? '#' + hash : '') + b;
    }
    return all;
  });
}
