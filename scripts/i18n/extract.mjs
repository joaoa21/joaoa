// Lista os textos traduzíveis de uma página: node scripts/i18n/extract.mjs <arquivo.html>
// Saída: um texto por linha (sem repetição), na ordem em que aparecem.
import fs from 'node:fs';
import { segments } from './lib.mjs';

const html = fs.readFileSync(process.argv[2], 'utf8');
const seen = new Set();
for (const { kind, text } of segments(html)) {
  if (seen.has(text)) continue;
  seen.add(text);
  console.log(`${kind}\t${text}`);
}
