// Dispara um email de teste com o HTML original (sem copiar e colar), pelo SMTP do Gmail.
// Sem dependências: fala SMTP direto com smtp.gmail.com:465 (TLS).
//
// Uso:
//   node scripts/emails/send-test.mjs <email-id | arquivo.html> [--to a@x.com,b@y.com] [--subject "..."] [--dry-run]
//
//   email-id    ex.: flora-sophia-cbd-day  (lê scripts/emails/export/<id>.html, ou o build em en/projects/...)
//   --to        destinatários separados por vírgula (padrão: a própria conta que envia)
//   --subject   assunto (padrão: o <title> do HTML, com "[TESTE]" na frente)
//   --dry-run   não envia: grava scripts/emails/export/<nome>.eml para conferir
//
// Conta: precisa de uma senha de app do Google (verificação em duas etapas ligada,
// https://myaccount.google.com/apppasswords). Não é a senha normal da conta.
//   SMTP_USER  o Gmail que envia (se faltar, o script pergunta)
//   SMTP_PASS  a senha de app (se faltar, o script pergunta sem mostrar o que você digita)
// A senha não é gravada em lugar nenhum.
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import tls from 'node:tls';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CRLF = '\r\n';

// ---- argumentos ----
const args = process.argv.slice(2);
const flag = (name) => { const i = args.indexOf(name); if (i < 0) return undefined; const v = args[i + 1]; args.splice(i, 2); return v; };
const dryRun = args.includes('--dry-run') && (args.splice(args.indexOf('--dry-run'), 1), true);
const toArg = flag('--to');
const subjectArg = flag('--subject');
const target = args[0];
if (!target) {
  console.log('Uso: node scripts/emails/send-test.mjs <email-id | arquivo.html> [--to a@x.com] [--subject "..."] [--dry-run]');
  process.exit(1);
}

function resolveFile(t) {
  const candidates = t.endsWith('.html')
    ? [path.resolve(t), path.join(ROOT, t)]
    : [path.join(ROOT, 'scripts/emails/export', `${t}.html`), path.join(ROOT, 'en/projects/email-design/emails', `${t}.html`)];
  const found = candidates.find((p) => fs.existsSync(p));
  if (!found) throw new Error(`Não achei o HTML de "${t}". Procurei em:\n  ${candidates.join('\n  ')}`);
  return found;
}
const file = resolveFile(target);
const html = fs.readFileSync(file, 'utf8');

// imagens locais não chegam a quem recebe: avisa antes de enviar
if (/src="https?:\/\/(127\.0\.0\.1|localhost)/.test(html)) {
  console.error('Este HTML aponta imagens para o servidor local (127.0.0.1). Gere de novo com: node scripts/emails/build.mjs');
  process.exit(1);
}

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&middot;/g, '·').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
const title = decode((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || 'Email de teste').trim();
const subject = subjectArg || `[TESTE] ${title}`;

// versão em texto puro: o corpo sem tags (fallback do multipart)
function toText(h) {
  const body = (h.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [, h])[1];
  return decode(body
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<div style="display:none[\s\S]*?<\/div>/i, '') // pré-cabeçalho escondido
    .replace(/<(br|\/p|\/h[1-6]|\/tr)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ ﻿͏]/g, ''))
    .split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
}

// ---- mensagem MIME ----
const b64lines = (s) => Buffer.from(s, 'utf8').toString('base64').replace(/.{1,76}/g, '$&' + CRLF);
const encWord = (s) => (/^[\x20-\x7e]*$/.test(s) ? s : `=?UTF-8?B?${Buffer.from(s, 'utf8').toString('base64')}?=`);

function buildMessage({ from, to }) {
  const boundary = `b_${crypto.randomBytes(12).toString('hex')}`;
  const domain = from.split('@')[1] || 'localhost';
  const headers = [
    `From: ${from}`,
    `To: ${to.join(', ')}`,
    `Subject: ${encWord(subject)}`,
    `Date: ${new Date().toUTCString().replace('GMT', '+0000')}`,
    `Message-ID: <${crypto.randomUUID()}@${domain}>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
  ];
  return [
    ...headers, '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    'Content-Transfer-Encoding: base64', '',
    b64lines(toText(html)),
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: base64', '',
    b64lines(html),
    `--${boundary}--`, '',
  ].join(CRLF);
}

// ---- entrada da senha sem eco ----
function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    if (!hidden || !process.stdin.isTTY) {
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
      rl.question(question, (a) => { rl.close(); resolve(a.trim()); });
      return;
    }
    process.stdout.write(question);
    const stdin = process.stdin;
    stdin.setRawMode(true); stdin.resume(); stdin.setEncoding('utf8');
    let value = '';
    const onData = (chunk) => {
      for (const ch of chunk) {
        if (ch === '\r' || ch === '\n') {
          stdin.setRawMode(false); stdin.pause(); stdin.off('data', onData);
          process.stdout.write('\n'); resolve(value); return;
        }
        if (ch === '\u0003') { process.stdout.write('\n'); process.exit(130); }
        if (ch === '\u007f' || ch === '\b') { value = value.slice(0, -1); continue; }
        value += ch;
      }
    };
    stdin.on('data', onData);
  });
}

// ---- SMTP mínimo ----
function smtp(host, port) {
  const socket = tls.connect({ host, port, servername: host });
  let buffer = '';
  const waiting = [];
  socket.setEncoding('utf8');
  socket.on('data', (d) => {
    buffer += d;
    let m;
    // uma resposta termina na linha "NNN texto" (sem hífen depois do código)
    while ((m = buffer.match(/^(?:\d{3}-[^\r\n]*\r\n)*(\d{3}) [^\r\n]*\r\n/))) {
      buffer = buffer.slice(m[0].length);
      waiting.shift()?.resolve({ code: Number(m[1]), text: m[0].trim() });
    }
  });
  socket.on('error', (e) => { while (waiting.length) waiting.shift().reject(e); });
  const reply = () => new Promise((resolve, reject) => waiting.push({ resolve, reject }));
  const expect = async (promise, codes, what) => {
    const r = await promise;
    if (!codes.includes(r.code)) throw new Error(`${what}: o servidor respondeu ${r.text}`);
    return r;
  };
  const cmd = (line, codes, what = line.split(' ')[0]) => { const p = reply(); socket.write(line + CRLF); return expect(p, codes, what); };
  return { greeting: () => expect(reply(), [220], 'conexão'), cmd, end: () => socket.end() };
}

async function send({ user, pass, to, message }) {
  const s = smtp('smtp.gmail.com', 465);
  try {
    await s.greeting();
    await s.cmd('EHLO joaoa.com.br', [250]);
    await s.cmd('AUTH LOGIN', [334]);
    await s.cmd(Buffer.from(user).toString('base64'), [334], 'usuário');
    await s.cmd(Buffer.from(pass).toString('base64'), [235], 'login (confira a senha de app)');
    await s.cmd(`MAIL FROM:<${user}>`, [250]);
    for (const r of to) await s.cmd(`RCPT TO:<${r}>`, [250, 251], `destinatário ${r}`);
    await s.cmd('DATA', [354]);
    // base64 não tem linhas começando com ".", então não precisa de dot-stuffing
    await s.cmd(message + CRLF + '.', [250], 'envio');
    await s.cmd('QUIT', [221]).catch(() => {});
  } finally {
    s.end();
  }
}

// ---- principal ----
const user = (process.env.SMTP_USER || (dryRun ? 'voce@gmail.com' : await ask('Gmail que envia: '))).trim();
const to = (toArg ? toArg.split(',') : [user]).map((s) => s.trim()).filter(Boolean);
const message = buildMessage({ from: user, to });

console.log(`HTML:      ${path.relative(ROOT, file)} (${Math.round(html.length / 1024)} KB)`);
console.log(`Assunto:   ${subject}`);
console.log(`Para:      ${to.join(', ')}`);

if (dryRun) {
  const out = path.join(ROOT, 'scripts/emails/export', `${path.basename(file, '.html')}.eml`);
  fs.writeFileSync(out, message);
  console.log(`Simulação: nada enviado. Mensagem gravada em ${path.relative(ROOT, out)}`);
  process.exit(0);
}

const pass = (process.env.SMTP_PASS || await ask('Senha de app (não aparece ao digitar): ', { hidden: true })).replace(/\s+/g, '');
if (!pass) { console.error('Sem senha, nada enviado.'); process.exit(1); }

try {
  await send({ user, pass, to, message });
  console.log('Enviado. Confira a caixa de entrada (e o spam, no primeiro envio).');
} catch (e) {
  console.error(`Não enviou: ${e.message}`);
  process.exit(1);
}
