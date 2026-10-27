// Prévias dos emails para a página "Email Design": claro, escuro e celular, em WebP.
//   assets/email-design/previews/<marca>-<id>-<idioma>-{claro,escuro,celular}.webp
// Monta cada email numa pasta temporária com as imagens lidas do disco (file://), então não
// depende do site rodando nem dos HTMLs gerados (que apontam para joaoa.com.br).
//   node scripts/emails/previews.mjs [marca ...]
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const only = process.argv.slice(2);
const index = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/emails/index.json'), 'utf8'))
  .filter((e) => !only.length || only.includes(e.brand));
const OUT = path.join(ROOT, 'assets/email-design/previews');
await fs.mkdir(OUT, { recursive: true });
const modules = {};
const moduleFor = async (brand) => (modules[brand] ??= await import(pathToFileURL(path.join(ROOT, 'scripts/emails/brands', `${brand}.mjs`)).href));
const VARIANTS = [
  { name: 'claro', width: 640, dark: false },
  { name: 'escuro', width: 640, dark: true },
  { name: 'celular', width: 390, dark: false },
];

const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const port = 9700 + Math.floor(Math.random() * 200);
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'email-prev-'));
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
await send('Page.enable');

for (const email of index) {
  const mod = await moduleFor(email.brand);
  const def = mod.emails.find((e) => e.id === email.id);
  const assets = pathToFileURL(path.join(ROOT, 'assets/email-design', email.brand)).href;
  for (const lang of ['pt', 'en']) {
    const html = path.join(profile, `${email.brand}-${email.id}-${lang}.html`);
    await fs.writeFile(html, mod.build(def, lang, assets));
    for (const v of VARIANTS) {
      await send('Emulation.setDeviceMetricsOverride', { width: v.width, height: 900, deviceScaleFactor: 2, mobile: v.width < 600 });
      await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: v.dark ? 'dark' : 'light' }] });
      await send('Page.navigate', { url: pathToFileURL(html).href });
      await sleep(1800);
      const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
      const png = path.join(profile, 'shot.png');
      await fs.writeFile(png, Buffer.from(shot.data, 'base64'));
      const out = path.join(OUT, `${email.brand}-${email.id}-${lang}-${v.name}.webp`);
      // metade da largura capturada (2x → 1x e meio de nitidez), WebP qualidade 78
      execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-i', png, '-vf', `scale=${Math.round(v.width * 1.5)}:-1`, '-c:v', 'libwebp', '-quality', '78', out]);
    }
    console.log(`${email.brand}-${email.id} (${lang})`);
  }
}
ws.close();
chrome.kill();
await sleep(300);
await fs.rm(profile, { recursive: true, force: true }).catch(() => {});
