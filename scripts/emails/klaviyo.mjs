// Cópia de um email pronta para colar no editor de HTML da Klaviyo: os links do rodapé
// viram as tags da Klaviyo (a Klaviyo recusa o HTML sem o link de descadastro).
// Não mexe no email do site nem no export limpo.
// Uso: node scripts/emails/klaviyo.mjs <marca-id>
//   lê   scripts/emails/export/<marca-id>.html  (gerado por node scripts/emails/inline.mjs <marca-id>)
//   grava scripts/emails/export/<marca-id>-klaviyo.html
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const id = process.argv[2];
if (!id) throw new Error('Informe o email: node scripts/emails/klaviyo.mjs flora-sophia-cbd-day');
const src = path.join(ROOT, 'scripts/emails/export', `${id}.html`);
if (!fs.existsSync(src)) throw new Error(`Não achei ${path.relative(ROOT, src)}. Gere antes com: node scripts/emails/inline.mjs ${id}`);
let html = fs.readFileSync(src, 'utf8');

// texto do link no rodapé -> tag da Klaviyo que devolve a URL
const TAGS = {
  'Unsubscribe': '{% unsubscribe_link %}',
  'Manage preferences': '{% manage_preferences_link %}',
  'View in browser': '{% web_view_link %}',
};
const found = [];
for (const [label, tag] of Object.entries(TAGS)) {
  const re = new RegExp(`<a href="#"([^>]*>(?:<span[^>]*>)?${label}(?:</span>)?</a>)`);
  if (re.test(html)) { html = html.replace(re, `<a href="${tag}"$1`); found.push(label); }
}
if (!found.includes('Unsubscribe')) throw new Error('Não achei o link "Unsubscribe" com href="#" no rodapé.');

const out = path.join(ROOT, 'scripts/emails/export', `${id}-klaviyo.html`);
fs.writeFileSync(out, html);
console.log(`${path.relative(ROOT, out)}  links trocados: ${found.join(', ')}`);
