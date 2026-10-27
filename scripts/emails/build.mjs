// Gera o HTML de cada email, em português e em inglês, a partir de scripts/emails/brands/*.mjs.
//   português: projetos/email-design/emails/<marca>-<id>.html
//   inglês:    en/projects/email-design/emails/<marca>-<id>.html
// As imagens apontam para https://joaoa.com.br/assets/email-design/<marca>/ (endereço absoluto,
// como num email de verdade). Para ver no computador antes de publicar:
//   ASSETS_BASE=http://127.0.0.1:4173 node scripts/emails/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = (process.env.ASSETS_BASE || 'https://joaoa.com.br').replace(/\/$/, '');
const OUT = { pt: 'projetos/email-design/emails', en: 'en/projects/email-design/emails' };

const dir = path.join(ROOT, 'scripts/emails/brands');
const index = [];
for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()) {
  const mod = await import(pathToFileURL(path.join(dir, file)).href);
  const assets = `${BASE}/assets/email-design/${mod.brand.slug}`;
  for (const email of mod.emails) {
    for (const lang of ['pt', 'en']) {
      const target = path.join(ROOT, OUT[lang], `${mod.brand.slug}-${email.id}.html`);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, mod.build(email, lang, assets));
    }
    index.push({ brand: mod.brand.slug, id: email.id, type: email.type, subject: email.copy.pt.subject });
  }
}
fs.writeFileSync(path.join(ROOT, 'scripts/emails/index.json'), JSON.stringify(index, null, 2) + '\n');
console.log(`${index.length} emails x 2 idiomas (imagens: ${BASE})`);
