// Cria uma cópia de um email com as imagens embutidas (data URI), para abrir em qualquer lugar
// sem depender de as imagens já estarem publicadas. Só para visualizar ou anexar: para enviar
// por uma plataforma de email, use o HTML normal, com as imagens hospedadas.
// Uso: node scripts/emails/inline.mjs <marca-id>
//   lê  en/projects/email-design/emails/<marca-id>.html
//   grava scripts/emails/export/<marca-id>.html          (o email limpo, imagens hospedadas: é o que se envia)
//         scripts/emails/export/<marca-id>-preview.html  (imagens embutidas)
// Nos dois, sai o trecho <!--web-only-->…<!--/web-only--> (ex.: o seletor claro/escuro da página).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const id = process.argv[2];
if (!id) throw new Error('Informe o email: node scripts/emails/inline.mjs flora-sophia-cbd-day');
const page = fs.readFileSync(path.join(ROOT, 'en/projects/email-design/emails', `${id}.html`), 'utf8');
const html = page.replace(/<!--web-only-->[\s\S]*?<!--\/web-only-->\s*/g, '');
const clean = path.join(ROOT, 'scripts/emails/export', `${id}.html`);
fs.mkdirSync(path.dirname(clean), { recursive: true });
if (/127\.0\.0\.1/.test(html)) {
  console.log('Imagens no servidor local: o email limpo não foi gravado (gere com node scripts/emails/build.mjs para enviar).');
} else {
  fs.writeFileSync(clean, html);
  console.log(`${path.relative(ROOT, clean)}  email limpo, ${Math.round(html.length / 1024)} KB`);
}
const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif' };
let count = 0;
const out = html.replace(/(?:https:\/\/joaoa\.com\.br|http:\/\/127\.0\.0\.1:4173)(\/assets\/email-design\/[^"')\s]+)/g, (m, rel) => {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) throw new Error(`Imagem não encontrada: ${rel}`);
  count++;
  return `data:${types[path.extname(file)]};base64,${fs.readFileSync(file).toString('base64')}`;
});
const target = path.join(ROOT, 'scripts/emails/export', `${id}-preview.html`);
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, out);
console.log(`${path.relative(ROOT, target)}  ${count} imagens embutidas, ${Math.round(out.length / 1024)} KB`);
