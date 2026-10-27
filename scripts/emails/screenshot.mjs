// Exporta um email em PNG (desktop, 2x) com Chrome headless, para enviar como imagem.
// Uso: node scripts/emails/screenshot.mjs <marca-id> [largura=720]   (SCHEME=dark grava <marca-id>-dark.png)
//   largura abaixo de 620 = celular: emula um aparelho móvel e grava <marca-id>-mobile[-dark].png
//   lê  http://127.0.0.1:4173/en/projects/email-design/emails/<marca-id>.html (preview do site rodando,
//   com os emails gerados por ASSETS_BASE=http://127.0.0.1:4173 node scripts/emails/build.mjs)
//   grava scripts/emails/export/<marca-id>.png (pasta ignorada pelo git)
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const id = process.argv[2];
if (!id) throw new Error('Informe o email: node scripts/emails/screenshot.mjs flora-sophia-cbd-day');
const width = Number(process.argv[3] || 720);
const url = process.env.EMAIL_URL || `http://127.0.0.1:4173/en/projects/email-design/emails/${id}.html`;
const scheme = process.env.SCHEME || 'light';
const mobile = width < 620;
const out = path.join(ROOT, 'scripts/emails/export', `${id}${mobile ? '-mobile' : ''}${scheme === 'dark' ? '-dark' : ''}.png`);
await fs.mkdir(path.dirname(out), { recursive: true });

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9500 + Math.floor(Math.random() * 200);
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'email-shot-'));
const chrome = spawn(CHROME, ['--headless=new', '--hide-scrollbars', `--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let wsUrl;
for (let i = 0; i < 150 && !wsUrl; i++) {
  try { wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
  if (!wsUrl) await sleep(200);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let n = 0;
const pending = new Map();
ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((res) => { const k = ++n; pending.set(k, res); ws.send(JSON.stringify({ id: k, method, params })); });
const ev = async (expression) => (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.value;

await send('Page.enable');
await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] });
await send('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 2, mobile });
await send('Page.navigate', { url });
await sleep(2500);
await ev('document.fonts.ready.then(() => true)');
await sleep(500);
if ((await ev('location.href')).startsWith('chrome-error')) {
  chrome.kill();
  throw new Error(`Não abriu ${url}. O preview do site está rodando (porta 4173)?`);
}
await ev("document.getElementById('theme-switch')?.remove(), true"); // o seletor da página não entra no PNG
const height = await ev('Math.ceil(document.documentElement.scrollHeight)');
await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 2, mobile });
await sleep(300);
const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width, height, scale: 1 } });
await fs.writeFile(out, Buffer.from(shot.data, 'base64'));
console.log(`${path.relative(ROOT, out)}  ${width * 2}x${height * 2}`);
ws.close();
chrome.kill();
await sleep(300);
await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
