/* Kompres (kompres.com.br): ferramentas de imagem e PDF que rodam no navegador.
   Produto do João: os emails são um conceito do que ele mandaria para quem assina as novidades.
   Só recursos que existem de verdade no site; os links levam às ferramentas reais. */
import { button, documentHtml, esc, rich } from '../lib.mjs';

const C = {
  lime: '#b8f55a', ink: '#0c0c0d', green: '#3d7000', paper: '#f2f0eb', card: '#ffffff',
  text: '#1f1f1f', muted: '#5c5c5a', line: '#e4e1d9',
  // modo escuro
  dBg: '#0c0c0d', dCard: '#161618', dText: '#e8eaed', dMuted: '#a3a3a0', dLine: '#2a2a2d',
};
const HEAD = "'Syne', 'Arial Black', Arial, sans-serif";
const TEXT = "'Inter', Helvetica, Arial, sans-serif";
const MONO = "'DM Mono', 'Courier New', monospace";
const SITE = 'https://kompres.com.br';

export const brand = { slug: 'kompres', name: 'Kompres', kind: 'own', site: SITE };

const DARK = `
    .dm-bg { background: ${C.dBg} !important; }
    .dm-card { background: ${C.dCard} !important; }
    .dm-text { color: ${C.dText} !important; }
    .dm-muted { color: ${C.dMuted} !important; }
    .dm-line { border-color: ${C.dLine} !important; }
    .dm-tile { background: #1e1e21 !important; border-color: ${C.dLine} !important; }
    .dm-green { color: ${C.lime} !important; }`;

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Inter:wght@400;600&family=DM+Mono:wght@500&display=swap" rel="stylesheet">`;

const T = {
  pt: {
    footer: 'Você recebeu este email porque assinou as novidades do Kompres.',
    unsubscribe: 'Descadastrar',
    browser: 'Ver no navegador',
    tagline: 'Ferramentas de imagem e PDF que rodam no seu navegador.',
  },
  en: {
    footer: 'You are receiving this email because you subscribed to Kompres updates.',
    unsubscribe: 'Unsubscribe',
    browser: 'View in browser',
    tagline: 'Image and PDF tools that run in your browser.',
  },
};

/** Moldura comum: logo, imagem de topo, conteúdo e rodapé. */
function layout({ lang, art, artAlt, artBg, kicker, title, intro, content, cta, after = '', assets }) {
  const t = T[lang];
  const body = `
<tr><td class="px" align="center" style="padding:8px 40px 24px;text-align:center;">
  <a href="${SITE}/" style="display:inline-block;"><img class="logo-light" src="${assets}/logo.png" width="168" height="28" alt="Kompres" style="width:168px;height:28px;"><img class="logo-dark" src="${assets}/logo-dark.png" width="168" height="28" alt="Kompres" style="width:168px;height:28px;"></a>
</td></tr>
<tr><td class="dm-card" style="background:${C.card};border-radius:20px;overflow:hidden;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td style="background:${artBg};border-radius:20px 20px 0 0;"><img class="fluid" src="${assets}/${art}.png" width="600" height="320" alt="${esc(artAlt)}" style="width:100%;max-width:600px;height:auto;border-radius:20px 20px 0 0;"></td></tr>
    <tr><td class="px" style="padding:36px 40px 8px;">
      <p class="dm-green" style="margin:0 0 12px;font-family:${MONO};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${C.green};">${esc(kicker)}</p>
      <h1 class="h1 dm-text" style="margin:0 0 16px;font-family:${HEAD};font-size:36px;line-height:42px;font-weight:800;letter-spacing:-0.5px;color:${C.ink};">${esc(title)}</h1>
      <p class="dm-muted" style="margin:0;font-family:${TEXT};font-size:17px;line-height:27px;color:${C.muted};">${rich(intro, { link: C.green })}</p>
    </td></tr>
    ${content}
    <tr><td class="px" align="center" style="padding:12px 40px 40px;text-align:center;">
      ${button({ href: cta.href, label: cta.label, bg: C.lime, color: C.ink, font: TEXT })}
    </td></tr>
    ${after}
  </table>
</td></tr>
<tr><td class="px" style="padding:28px 40px 8px;text-align:center;">
  <p class="dm-muted" style="margin:0 0 6px;font-family:${TEXT};font-size:13px;line-height:20px;color:${C.muted};">${esc(t.tagline)}</p>
  <p class="dm-muted" style="margin:0 0 12px;font-family:${TEXT};font-size:12px;line-height:18px;color:${C.muted};">${esc(t.footer)}</p>
  <p style="margin:0;font-family:${TEXT};font-size:12px;line-height:18px;"><a class="dm-muted" href="#" style="color:${C.muted};text-decoration:underline;">${esc(t.unsubscribe)}</a> <span class="dm-muted" style="color:${C.muted};">&nbsp;·&nbsp;</span> <a class="dm-muted" href="#" style="color:${C.muted};text-decoration:underline;">${esc(t.browser)}</a></p>
</td></tr>`;
  return body;
}

const bullets = (items) => `
    <tr><td class="px" style="padding:24px 40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${items.map((item) => `<tr>
          <td width="28" valign="top" style="padding:2px 0 14px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="20" height="20" align="center" style="width:20px;height:20px;background:${C.lime};border-radius:10px;font-family:Arial,sans-serif;font-size:12px;line-height:20px;font-weight:bold;color:${C.ink};">&#10003;</td></tr></table></td>
          <td class="dm-text" valign="top" style="padding:0 0 14px 8px;font-family:${TEXT};font-size:16px;line-height:24px;color:${C.text};">${rich(item)}</td>
        </tr>`).join('')}
      </table>
    </td></tr>`;

const steps = (items) => `
    <tr><td class="px" style="padding:24px 40px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${items.map((item, i) => `<tr>
          <td width="44" valign="top" style="padding:0 0 16px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="32" height="32" align="center" style="width:32px;height:32px;background:${C.ink};border-radius:8px;font-family:${MONO};font-size:15px;line-height:32px;color:${C.lime};">${i + 1}</td></tr></table></td>
          <td class="dm-text" valign="top" style="padding:5px 0 16px 6px;font-family:${TEXT};font-size:16px;line-height:24px;color:${C.text};">${rich(item)}</td>
        </tr>`).join('')}
      </table>
    </td></tr>`;

const note = (text) => `
    <tr><td class="px" style="padding:0 40px 40px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr>
        <td class="dm-tile" style="background:${C.paper};border:1px solid ${C.line};border-radius:14px;padding:18px 20px;font-family:${TEXT};font-size:15px;line-height:23px;color:${C.text};"><span class="dm-text">${rich(text)}</span></td>
      </tr></table>
    </td></tr>`;

/** Grade 2x2 de ferramentas (vira uma coluna no celular). */
const tiles = (items) => {
  const cell = ({ title, text, href }) => `<td class="stack stack-gap" width="50%" valign="top" style="padding:0 6px 12px;">
          <a href="${href}" style="display:block;text-decoration:none;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;"><tr>
            <td class="dm-tile" style="background:${C.paper};border:1px solid ${C.line};border-radius:14px;padding:18px 18px 16px;">
              <p class="dm-text" style="margin:0 0 6px;font-family:${HEAD};font-size:17px;line-height:22px;font-weight:700;color:${C.ink};">${esc(title)} <span class="dm-green" style="color:${C.green};">&rarr;</span></p>
              <p class="dm-muted" style="margin:0;font-family:${TEXT};font-size:14px;line-height:21px;color:${C.muted};">${esc(text)}</p>
            </td></tr></table></a>
        </td>`;
  const rows = [];
  for (let i = 0; i < items.length; i += 2) rows.push(`<tr>${cell(items[i])}${items[i + 1] ? cell(items[i + 1]) : '<td class="stack" width="50%"></td>'}</tr>`);
  return `
    <tr><td class="px" style="padding:24px 34px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows.join('')}</table>
    </td></tr>`;
};

/* ---------- os emails ---------- */
export const emails = [
  {
    id: 'remover-fundo',
    type: 'launch',
    copy: {
      pt: {
        subject: 'Novo no Kompres: remova o fundo de qualquer imagem',
        preheader: 'Com IA, direto no navegador, sem enviar a foto para nenhum servidor.',
        artAlt: 'Antes e depois: um frasco de produto com fundo bege de um lado e com fundo transparente do outro.',
        kicker: 'Nova ferramenta',
        title: 'Fundo removido em segundos.',
        intro: 'Foto de produto para a loja, foto de perfil, recorte para uma arte: agora o Kompres tira o fundo da imagem e entrega um **PNG transparente**, pronto para usar.',
        bullets: [
          '**A IA roda no seu navegador:** a foto não sai do seu computador.',
          'Recorte pronto para o site, a loja virtual ou o post.',
          'Grátis e sem cadastro.',
        ],
        cta: 'Remover fundo agora',
        note: '**Dica:** em fotos de produto, fundo liso e boa luz deixam o recorte ainda mais preciso.',
      },
      en: {
        subject: 'New on Kompres: remove the background from any image',
        preheader: 'AI-powered, right in your browser. Your photo never leaves your device.',
        artAlt: 'Before and after: a product bottle on a beige background on one side and on a transparent background on the other.',
        kicker: 'New tool',
        title: 'Background gone in seconds.',
        intro: 'Product shots for your store, a profile picture, a cut-out for a design: Kompres now removes the background and gives you a **transparent PNG**, ready to use.',
        bullets: [
          '**The AI runs in your browser:** your photo never leaves your computer.',
          'A clean cut-out for your website, online store or social post.',
          'Free, no sign-up.',
        ],
        cta: 'Remove a background',
        note: '**Tip:** for product photos, a plain background and good lighting make the cut-out even sharper.',
      },
    },
    render(lang, c, assets) {
      return layout({
        lang, assets, art: 'remover-fundo', artAlt: c.artAlt, artBg: C.ink,
        kicker: c.kicker, title: c.title, intro: c.intro,
        content: bullets(c.bullets),
        cta: { href: `${SITE}/remover-fundo/`, label: c.cta },
        after: note(c.note),
      });
    },
  },
  {
    id: 'tamanho-maximo',
    type: 'tip',
    copy: {
      pt: {
        subject: 'Dica: imagens no peso exato que você precisa',
        preheader: 'Diga o limite (ex.: 200 KB) e o Kompres encontra a melhor qualidade que cabe nele.',
        artAlt: 'Um arquivo de imagem de 2 MB virando um arquivo de 200 KB.',
        kicker: 'Dica rápida',
        title: 'Defina o peso. O Kompres faz o resto.',
        intro: 'Muito site, email e plataforma de anúncio limita o tamanho dos arquivos. Em vez de testar qualidade por qualidade, informe o limite e o Kompres comprime cada imagem até caber.',
        steps: [
          'Arraste as imagens para o Kompres. Podem ser várias de uma vez.',
          'Em **Tamanho máximo por arquivo**, digite o limite. Por exemplo: 200 KB.',
          'Confira o resultado e clique em **Baixar ZIP** para levar todas de uma vez.',
        ],
        cta: 'Comprimir imagens',
        note: '**Referência:** para banners de site, 200 KB costuma ser um bom limite. Em emails, mire em menos de 100 KB por imagem.',
      },
      en: {
        subject: 'Tip: images at the exact file size you need',
        preheader: 'Set a limit (say, 200 KB) and Kompres finds the best quality that fits.',
        artAlt: 'A 2 MB image file turning into a 200 KB file.',
        kicker: 'Quick tip',
        title: 'Set the size. Kompres does the rest.',
        intro: 'Lots of websites, email tools and ad platforms cap file sizes. Instead of trying one quality setting after another, set the limit and Kompres compresses each image until it fits.',
        steps: [
          'Drop your images into Kompres. As many as you like at once.',
          'Under **maximum size per file** (Tamanho máximo por arquivo), type the limit. For example: 200 KB.',
          'Check the result and hit **Download ZIP** (Baixar ZIP) to grab them all at once.',
        ],
        cta: 'Compress images',
        note: '**Rule of thumb:** for website banners, 200 KB is usually a good limit. For emails, aim for under 100 KB per image.',
      },
    },
    render(lang, c, assets) {
      return layout({
        lang, assets, art: 'tamanho-alvo', artAlt: c.artAlt, artBg: C.lime,
        kicker: c.kicker, title: c.title, intro: c.intro,
        content: steps(c.steps),
        cta: { href: `${SITE}/`, label: c.cta },
        after: note(c.note),
      });
    },
  },
  {
    id: 'pdf',
    type: 'newsletter',
    copy: {
      pt: {
        subject: 'Tudo o que o Kompres faz com PDF',
        preheader: 'Comprimir, dividir, juntar imagens e mais, sem enviar o arquivo para lugar nenhum.',
        artAlt: 'Várias páginas soltas e um documento PDF já organizado.',
        kicker: 'Ferramentas de PDF',
        title: 'Seus PDFs, resolvidos no navegador.',
        intro: 'Contrato pesado demais para o email, uma página que precisa sair, fotos que viram um documento só: o Kompres resolve sem instalar nada e sem enviar o arquivo para servidor.',
        tiles: [
          { title: 'Comprimir PDF', text: 'Deixe o arquivo leve para mandar por email.', path: '/pdf/comprimir/' },
          { title: 'Dividir PDF', text: 'Separe as páginas em arquivos diferentes.', path: '/pdf/dividir/' },
          { title: 'JPG para PDF', text: 'Junte fotos num documento só.', path: '/pdf/jpg-para-pdf/' },
          { title: 'PDF para JPG', text: 'Exporte cada página como imagem.', path: '/pdf/pdf-para-jpg/' },
        ],
        more: 'E tem mais: **assinar, numerar, girar e organizar páginas** também estão lá.',
        cta: 'Ver as ferramentas de PDF',
      },
      en: {
        subject: 'Everything Kompres does with PDFs',
        preheader: 'Compress, split, merge images and more, without uploading your file anywhere.',
        artAlt: 'Several loose pages and an organized PDF document.',
        kicker: 'PDF tools',
        title: 'Your PDFs, sorted in the browser.',
        intro: 'A contract too heavy to email, one page that has to go, photos that should be a single document: Kompres handles it with nothing to install and no upload to a server.',
        tiles: [
          { title: 'Compress PDF', text: 'Make the file light enough to email.', path: '/pdf/comprimir/' },
          { title: 'Split PDF', text: 'Break pages out into separate files.', path: '/pdf/dividir/' },
          { title: 'JPG to PDF', text: 'Turn photos into one document.', path: '/pdf/jpg-para-pdf/' },
          { title: 'PDF to JPG', text: 'Export every page as an image.', path: '/pdf/pdf-para-jpg/' },
        ],
        more: 'There is more: **sign, number, rotate and reorder pages** are all there too.',
        cta: 'See the PDF tools',
      },
    },
    render(lang, c, assets) {
      const more = `
    <tr><td class="px" style="padding:4px 40px 8px;">
      <p class="dm-muted" style="margin:0;font-family:${TEXT};font-size:16px;line-height:24px;color:${C.muted};">${rich(c.more)}</p>
    </td></tr>`;
      return layout({
        lang, assets, art: 'pdf', artAlt: c.artAlt, artBg: C.card,
        kicker: c.kicker, title: c.title, intro: c.intro,
        content: tiles(c.tiles.map((x) => ({ ...x, href: `${SITE}${x.path}` }))) + more,
        cta: { href: `${SITE}/pdf/`, label: c.cta },
      });
    },
  },
];

/** HTML final de um email. */
export function build(email, lang, assets) {
  const c = email.copy[lang];
  return documentHtml({
    lang: lang === 'pt' ? 'pt-BR' : 'en',
    title: c.subject,
    preheader: c.preheader,
    bg: C.paper,
    dark: DARK,
    body: email.render(lang, c, assets),
  }).replace('</head>', `${FONTS}\n</head>`);
}
