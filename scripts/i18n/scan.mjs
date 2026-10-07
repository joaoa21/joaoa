// Procura textos em português que sobraram nas páginas em inglês: node scripts/i18n/scan.mjs
// Aponta também falsos positivos (palavras como "do" em inglês); use como lista para revisar.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { segments } from './lib.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../en');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : e.name.endsWith('.html') ? [path.join(d, e.name)] : []);
const ok = /João|Jogo de Ouro|Agência Birow|Abacaxi Comunicação|Descomplica|Pernambuco|Brasileirão|Copa do Brasil|Rádio Jornal|Recife Ordinário|Supercopa|Fortune|Natal Fortunes|Clube de Ouro|clube de ouro|'[^']*'|Piñata|R\$|Croácia|Corinthians|França|Almir|Fernanda|Renova|Mega Adesivação|Caravana|Pofexô|Apelão|Comunicação|SINAPI/;
const pt = /[ãõçâêôàáéíóú]|\b(de|do|da|dos|das|para|com|em|um|uma|não|seu|sua|você|mais|ver|que|nos|nas|pelo|pela|são|também)\b/i;
for (const f of walk(ROOT)) {
  const html = fs.readFileSync(f, 'utf8');
  const hits = [...new Set(segments(html).map((s) => s.text))].filter((t) => pt.test(t.replace(ok, '')));
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  const jsonHits = scripts.flatMap((s) => [...s.matchAll(/"(name|description|text|headline)":\s*"([^"]*)"/g)].map((m) => m[2])).filter((t) => pt.test(t.replace(ok, '')));
  if (hits.length || jsonHits.length) console.log(path.relative(ROOT, f), [...hits, ...jsonHits.map((t) => 'JSON: ' + t)]);
}
