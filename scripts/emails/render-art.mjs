// Renderiza as artes dos emails (scripts/emails/art/<marca>.html) em PNG 2x, com Chrome headless.
// Cada <section data-art="nome" data-w="600" data-h="320"> vira assets/email-design/<marca>/<nome>.png.
// data-w="auto" usa a largura do conteúdo (logos).
// Uso: node scripts/emails/render-art.mjs kompres
// PNG (e não WebP) porque o Outlook para Windows não mostra WebP.
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const brand = process.argv[2];
if (!brand) throw new Error('Informe a marca: node scripts/emails/render-art.mjs kompres');
const source = path.join(ROOT, 'scripts/emails/art', `${brand}.html`);
const out = path.join(ROOT, 'assets/email-design', brand);
await fs.mkdir(out, { recursive: true });

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9300 + Math.floor(Math.random() * 200);
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'email-art-'));
const chrome = spawn(CHROME, ['--headless=new', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 150 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(200);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res) => { const n = ++id; pending.set(n, res); ws.send(JSON.stringify({ id: n, method, params })); });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value;

await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', { width: 1400, height: 1000, deviceScaleFactor: 2, mobile: false });
// fundo transparente: os logos saem sem fundo
await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
await send('Page.navigate', { url: pathToFileURL(source).href });
await sleep(2500);
await ev(`document.fonts.ready.then(() => { document.body.style.background = 'transparent'; return true; })`);

const arts = await ev(`[...document.querySelectorAll('section[data-art]')].map((s) => { const r = s.getBoundingClientRect(); return { name: s.dataset.art, x: r.x + scrollX, y: r.y + scrollY, w: s.dataset.w === 'auto' ? Math.ceil(r.width) : Number(s.dataset.w), h: Number(s.dataset.h) }; })`);
for (const a of arts) {
  const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: a.x, y: a.y, width: a.w, height: a.h, scale: 1 } });
  await fs.writeFile(path.join(out, `${a.name}.png`), Buffer.from(shot.data, 'base64'));
  console.log(`assets/email-design/${brand}/${a.name}.png  ${a.w * 2}x${a.h * 2}`);
}
ws.close();
chrome.kill();
await sleep(300);
await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
