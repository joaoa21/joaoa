/* Flora Sophia Botanicals (florasophiabotanicals.com): CBD "farm-to-you" do Oregon.
   Teste de design de email para a Blossom Ecom: um email promocional de early access VIP
   para o National CBD Day, com a escada de desconto 30/40/50% por valor do pedido.
   A copy veio pronta no briefing; a organização visual, as imagens e a hierarquia são minhas.
   Só em inglês (o teste é internacional); a versão "pt" repete a mesma copy. */
import { button, documentHtml, esc, rich } from '../lib.mjs';

const C = {
  bg: '#f1ecdf', card: '#fdfbf6', cream: '#f6f3e6',
  olive: '#3f4b38', oliveDeep: '#34402e', oliveLine: '#5b6a52',
  ink: '#22291d', text: '#3c4336', muted: '#6b7064', line: '#e3dccb',
  sage: '#8bb696', sageSoft: '#e4ecdc', salmon: '#e2a888', brown: '#59492d',
  onOlive: '#f6f3e6', onOliveSoft: '#d6d9c9',
  // modo escuro
  dBg: '#171a14', dCard: '#22271e', dText: '#ece8d9', dMuted: '#b3b4a6', dLine: '#3a4034', dTile: '#2b3127',
};
const FONT = "'Montserrat', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const SITE = 'https://www.florasophiabotanicals.com';
const SHOP = `${SITE}/collections/all`;
const BEST = `${SITE}/collections/best-sellers`;

export const brand = { slug: 'flora-sophia', name: 'Flora Sophia Botanicals', kind: 'test', site: SITE };

const DARK = `
    .dm-bg { background: ${C.dBg} !important; }
    .dm-card { background: ${C.dCard} !important; }
    .dm-text { color: ${C.dText} !important; }
    .dm-muted { color: ${C.dMuted} !important; }
    .dm-line { border-color: ${C.dLine} !important; }
    .dm-tile { background: ${C.dTile} !important; border-color: ${C.dLine} !important; }
    .dm-sage { color: ${C.sage} !important; }
    .dm-btn { background: ${C.sage} !important; color: ${C.ink} !important; }
    .dm-bar { background: #66795a !important; }
    .dm-badge { background: ${C.sage} !important; color: ${C.ink} !important; }
    .dm-btn-text { color: ${C.ink} !important; }`;

const FONTS = `<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">`;

// CSS extra: no celular o título do hero encolhe. O resto do layout não depende deste <style>
// (o Gmail e o email colado num rascunho o perdem): a largura é fluida e as colunas se ajustam sozinhas.
const CSS = `
  .kicker { font-family: ${FONT}; font-size: 11px; letter-spacing: 2.5px; text-transform: uppercase; font-weight: 600; }
  @media only screen and (max-width: 620px) {
    .hero-h1 { font-size: 36px !important; line-height: 42px !important; }
  }`;

const TABLE = 'role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"';
const SEP = 'style="border-collapse:separate;"';

const kicker = (text, color, extra = '') => `<p class="kicker${color === C.olive ? ' dm-sage' : ''}" style="margin:0 0 14px;font-family:${FONT};font-size:11px;line-height:16px;letter-spacing:2.5px;text-transform:uppercase;font-weight:600;color:${color};${extra}">${esc(text)}</p>`;
const h2 = (text, color = C.ink, cls = 'dm-text') => `<h2 class="${cls}" style="margin:0 0 14px;font-family:${FONT};font-size:28px;line-height:36px;font-weight:600;letter-spacing:-0.3px;color:${color};">${esc(text)}</h2>`;
const para = (text, color = C.text, cls = 'dm-text', size = 16) => `<p class="${cls}" style="margin:0;font-family:${FONT};font-size:${size}px;line-height:${Math.round(size * 1.65)}px;color:${color};">${rich(text, { link: C.olive })}</p>`;

/** Colunas fluidas: divs inline-block com max-width. Ficam lado a lado quando cabem e empilham
    sozinhas quando não cabem, sem media query. No Outlook do Windows uma tabela fantasma segura as colunas. */
function columns(cells, widths, align = 'center', valign = 'top') {
  const w = (i) => (Array.isArray(widths) ? widths[i] : widths);
  const open = (i) => (i ? `<!--[if mso]></td><td width="${w(i)}" valign="${valign}"><![endif]-->`
    : `<!--[if mso]><table role="presentation" cellpadding="0" cellspacing="0" border="0" align="${align}"><tr><td width="${w(0)}" valign="${valign}"><![endif]-->`);
  return `<div style="font-size:0;line-height:0;text-align:${align};">${cells.map((c, i) => `${open(i)}<div style="display:inline-block;width:100%;max-width:${w(i)}px;vertical-align:${valign};font-size:16px;line-height:normal;">${c}</div>`).join('')}<!--[if mso]></td></tr></table><![endif]--></div>`;
}

/** Faixa dos três degraus de desconto (empilha sozinha no celular). */
function tiers(items) {
  const cell = ({ pct, label, hot }) => `<div style="padding:0 5px 10px;">
        <table ${TABLE} ${SEP}><tr><td align="center" style="background:${hot ? C.salmon : C.oliveDeep};border:1px solid ${hot ? C.salmon : C.oliveLine};border-radius:14px;padding:18px 8px 16px;">
          <p style="margin:0 0 4px;font-family:${FONT};font-size:34px;line-height:38px;font-weight:600;letter-spacing:-1px;color:${hot ? C.ink : C.onOlive};">${esc(pct)}</p>
          <p style="margin:0;font-family:${FONT};font-size:11px;line-height:16px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;color:${hot ? C.brown : C.sage};">${esc(label)}</p>
        </td></tr></table>
      </div>`;
  return columns(items.map(cell), 170);
}

/** A escada: três barras que crescem até a última, de largura total. */
function ladder(items) {
  return `<table ${TABLE}>${items.map(({ at, pct, width, bg, color, cls = '' }) => `<tr>
        <td class="dm-text" width="56" valign="middle" style="padding:0 10px 10px 0;font-family:${FONT};font-size:15px;line-height:20px;font-weight:600;color:${C.ink};white-space:nowrap;">${esc(at)}</td>
        <td valign="middle" style="padding:0 0 10px;">
          <table role="presentation" width="${width}%" cellpadding="0" cellspacing="0" border="0" ${SEP}><tr><td class="${cls}" style="background:${bg};border-radius:8px;padding:11px 16px;font-family:${FONT};font-size:13px;line-height:18px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:${color};">${esc(pct)}</td></tr></table>
        </td></tr>`).join('')}</table>`;
}

/** Três produtos lado a lado (empilham no celular). */
function products(items, assets) {
  const cell = ({ art, alt, name, text, price, href }) => `<div style="padding:0 6px 22px;text-align:left;">
        <a href="${href}" style="display:block;text-decoration:none;"><img src="${assets}/${art}.jpg" width="164" height="164" alt="${esc(alt)}" style="display:block;width:100%;max-width:164px;height:auto;border:0;border-radius:14px;margin:0 auto;"></a>
        <p class="dm-text" style="margin:14px 0 4px;font-family:${FONT};font-size:15px;line-height:21px;font-weight:600;color:${C.ink};"><a href="${href}" style="color:${C.ink};text-decoration:none;"><span class="dm-text" style="color:${C.ink};">${esc(name)}</span></a></p>
        <p class="dm-muted" style="margin:0 0 8px;font-family:${FONT};font-size:13px;line-height:20px;color:${C.muted};">${esc(text)}</p>
        <p class="dm-sage" style="margin:0;font-family:${FONT};font-size:14px;line-height:20px;font-weight:600;color:${C.olive};">${esc(price)}</p>
      </div>`;
  return columns(items.map(cell), 172);
}

function render(c, assets) {
  // O Outlook (web e novo app) recolore o texto de links, sobretudo com o app em tema escuro.
  // Por isso a cor de todo texto de link fica também num <span> dentro do <a>.
  const cta = (href, label, dark) => {
    const color = dark ? C.ink : C.onOlive;
    const b = button({ href, label, bg: dark ? C.salmon : C.olive, color, radius: 10, font: FONT })
      .replace(`mso-hide:all;">${esc(label)}</a>`, `mso-hide:all;"><span${dark ? '' : ' class="dm-btn-text"'} style="color:${color};">${esc(label)}</span></a>`);
    return dark ? b : b.replace('class="btn"', 'class="btn dm-btn"');
  };
  return `
<!-- topo: só um respiro acima do cartão; o logo fica dentro do hero -->
<tr><td style="height:8px;line-height:8px;font-size:0;">&nbsp;</td></tr>

<tr><td class="dm-card" style="background:${C.card};border-radius:20px;">
  <table ${TABLE} ${SEP}>

    <!-- 1. hero -->
    <tr><td class="px" align="center" style="background:${C.olive};border-radius:20px 20px 0 0;padding:36px 44px 30px;text-align:center;">
      <!-- Logo único, creme, sobre o verde (que não muda no modo escuro). Sem troca de logos por CSS:
           o Gmail descarta o cabeçalho, e copiar a página num navegador em modo escuro grava qual logo
           estava escondido, então qualquer troca acaba mostrando os dois ou nenhum. -->
      <a href="${SITE}/" style="display:inline-block;"><img src="${assets}/logo-dark.png" width="200" height="20" alt="Flora Sophia" style="display:block;width:200px;height:20px;margin:0 auto;"></a>
      <table role="presentation" width="64" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:26px auto 30px;"><tr><td style="border-top:1px solid ${C.oliveLine};font-size:0;line-height:0;">&nbsp;</td></tr></table>
      ${kicker(c.hero.kicker, C.sage)}
      <h1 class="hero-h1" style="margin:0 0 14px;font-family:${FONT};font-size:46px;line-height:52px;font-weight:500;letter-spacing:-1px;color:${C.onOlive};">${esc(c.hero.title)}</h1>
      <p style="margin:0 0 28px;font-family:${FONT};font-size:17px;line-height:27px;color:${C.onOliveSoft};">${esc(c.hero.sub)}</p>
      ${tiers(c.hero.tiers)}
      <p style="margin:8px 0 22px;font-family:${FONT};font-size:14px;line-height:20px;letter-spacing:1px;text-transform:uppercase;font-weight:600;color:${C.onOlive};">${esc(c.hero.noCode)}</p>
      ${cta(SHOP, c.hero.cta, true)}
      <p style="margin:22px 0 0;font-family:${FONT};font-size:15px;line-height:23px;font-style:italic;color:${C.onOliveSoft};">${esc(c.hero.closing)}</p>
    </td></tr>
    <tr><td style="background:#eae3d1;font-size:0;line-height:0;"><img class="fluid" src="${assets}/hero.jpg" width="600" height="300" alt="${esc(c.hero.alt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>

    <!-- 2. a escada -->
    <tr><td class="px" style="padding:44px 48px 8px;">
      ${kicker(c.ladder.kicker, C.olive, 'margin-bottom:10px;')}
      ${h2(c.ladder.title)}
      ${para(c.ladder.text)}
    </td></tr>
    <tr><td class="px" style="padding:26px 48px 4px;">${ladder(c.ladder.rows)}</td></tr>
    <tr><td class="px" align="center" style="padding:18px 48px 44px;text-align:center;">${cta(SHOP, c.ladder.cta)}</td></tr>

    <!-- 3. produtos -->
    <tr><td class="px" style="padding:0 48px;"><table ${TABLE}><tr><td class="dm-line" style="border-top:1px solid ${C.line};font-size:0;line-height:0;">&nbsp;</td></tr></table></td></tr>
    <tr><td class="px" style="padding:40px 48px 8px;">
      ${kicker(c.products.kicker, C.olive, 'margin-bottom:10px;')}
      ${h2(c.products.title)}
      ${c.products.text ? para(c.products.text) : ''}
    </td></tr>
    <tr><td class="px" style="padding:12px 42px 0;">${products(c.products.items, assets)}</td></tr>
    <tr><td class="px" style="padding:4px 48px 0;">
      <table ${TABLE} ${SEP}><tr><td class="dm-tile" style="background:${C.sageSoft};border-radius:14px;padding:18px 22px;">
        ${c.products.math.map(([a, b, d], i) => columns([
          `<p class="dm-text" style="margin:0;padding:${i ? 10 : 0}px 12px 0 0;font-family:${FONT};font-size:14px;line-height:21px;color:${C.ink};">${rich(a)}</p>`,
          `<p class="dm-text" style="margin:0;padding:${i ? 10 : 0}px 0 0;font-family:${FONT};font-size:15px;line-height:21px;font-weight:600;color:${C.ink};white-space:nowrap;">${esc(b)} <span class="dm-badge" style="display:inline-block;background:${C.olive};color:${C.onOlive};border-radius:6px;padding:2px 8px;font-size:12px;line-height:18px;font-weight:700;letter-spacing:1px;margin-left:6px;">${esc(d)}</span></p>`,
        ], [300, 156], 'left', 'middle')).join('')}
      </td></tr></table>
    </td></tr>
    <tr><td class="px" align="center" style="padding:26px 48px 44px;text-align:center;">${cta(BEST, c.products.cta)}</td></tr>

    <!-- 4. fechamento -->
    <tr><td style="background:#6c8a5a;font-size:0;line-height:0;"><img class="fluid" src="${assets}/hand.jpg" width="600" height="220" alt="${esc(c.final.alt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>
    <tr><td class="px" align="center" style="background:${C.olive};border-radius:0 0 20px 20px;padding:40px 44px 44px;text-align:center;">
      ${kicker(c.final.kicker, C.sage)}
      ${h2(c.final.title, C.onOlive, '')}
      <p style="margin:0 0 18px;font-family:${FONT};font-size:16px;line-height:26px;color:${C.onOliveSoft};">${esc(c.final.text)}</p>
      <p style="margin:0 0 4px;font-family:Arial,sans-serif;font-size:20px;line-height:24px;letter-spacing:3px;color:${C.salmon};">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
      <p style="margin:0 0 26px;font-family:${FONT};font-size:14px;line-height:22px;color:${C.onOlive};"><strong>${esc(c.final.rating)}</strong> ${esc(c.final.ratingText)}</p>
      ${cta(SHOP, c.final.cta, true)}
    </td></tr>

  </table>
</td></tr>

<!-- rodapé -->
<tr><td class="px" align="center" style="padding:30px 40px 8px;text-align:center;">
  <p class="dm-muted" style="margin:0 0 16px;font-family:${FONT};font-size:10px;line-height:16px;letter-spacing:2px;text-transform:uppercase;font-weight:600;color:${C.muted};">${c.footer.trust.map((t) => `<span style="white-space:nowrap;">${esc(t)}</span>`).join(' &nbsp;&middot;&nbsp; ')}</p>
  <p class="dm-muted" style="margin:0 0 10px;font-family:${FONT};font-size:12px;line-height:19px;color:${C.muted};">${esc(c.footer.reason)}</p>
  <p class="dm-muted" style="margin:0 0 14px;font-family:${FONT};font-size:11px;line-height:17px;color:${C.muted};">${esc(c.footer.legal)}</p>
  <p class="dm-muted" style="margin:0 0 10px;font-family:${FONT};font-size:12px;line-height:18px;color:${C.muted};">${esc(c.footer.address)}</p>
  <p style="margin:0;font-family:${FONT};font-size:12px;line-height:18px;">${c.footer.links.map((l) => `<a href="#" style="color:${C.muted};text-decoration:underline;"><span class="dm-muted" style="color:${C.muted};text-decoration:underline;">${esc(l)}</span></a>`).join(` <span class="dm-muted" style="color:${C.muted};">&nbsp;&middot;&nbsp;</span> `)}</p>
</td></tr>`;
}

const copy = {
  subject: 'VIP early access: up to 50% off for National CBD Day',
  preheader: '30% off at $75, 40% at $125, 50% at $175. No code needed. Doors open to everyone else tomorrow.',
  hero: {
    kicker: 'VIP Early Access',
    title: 'The Sale Is Yours First.',
    sub: 'Up to 50% off National CBD Day Sale',
    tiers: [
      { pct: '30%', label: 'off orders $75+' },
      { pct: '40%', label: 'off orders $125+' },
      { pct: '50%', label: 'off orders $175+', hot: true },
    ],
    noCode: 'No code needed',
    cta: 'Shop Early Access',
    closing: 'Doors open to everyone else tomorrow. Today, the farm is all yours.',
    alt: 'Flora Sophia tinctures, salve and gummies lined up on a cream table, with a hand picking a red gummy from the jar.',
  },
  ladder: {
    kicker: 'How the sale works',
    title: 'Save More as Your Shelf Fills',
    text: 'This sale is a ladder. Every bottle you add moves your whole order toward a deeper discount, and at $175 the full 50% comes off everything in your cart. Stock a season of your routine once and save on all of it.',
    rows: [
      { at: '$75+', pct: '30% off', width: 58, bg: C.sage, color: C.ink },
      { at: '$125+', pct: '40% off', width: 79, bg: C.olive, color: C.onOlive, cls: 'dm-bar' },
      { at: '$175+', pct: '50% off everything', width: 100, bg: C.salmon, color: C.ink },
    ],
    cta: 'Unlock the 50% Tier',
  },
  products: {
    kicker: 'Best sellers',
    title: 'Three Ways to Reach Your Tier',
    text: '',
    items: [
      { art: 'tincture', alt: 'Amber dropper bottle of 47mg Full Spectrum CBD Tincture', name: '47mg Full Spectrum Tincture', text: 'Our most popular strength, for steady daily calm.', price: '$84.99', href: BEST },
      { art: 'salve', alt: 'Tin of Muscle, Joint & Nerve Full Spectrum CBD Salve', name: 'Muscle, Joint & Nerve Salve', text: 'Targeted relief right where you need it.', price: '$59.99', href: BEST },
      { art: 'gummies', alt: 'Jar of Cherry Lime 20mg CBD Gummies with a few gummies in front', name: 'Cherry Lime Gummies', text: 'Calm you can carry anywhere.', price: '$39.99', href: BEST },
    ],
    math: [
      ['**The tincture and salve together** already clear the 40% tier', '$144.98', '40% off'],
      ['**All three** unlock the full 50%', '$184.97', '50% off'],
    ],
    cta: 'Stock Your Shelf',
  },
  final: {
    kicker: 'Last call for first pick',
    title: 'Tomorrow the Doors Open Wide',
    text: 'You have first pick until tomorrow morning, when the doors open to everyone.',
    rating: '4.88 stars across 746 reviews',
    ratingText: 'say the shelf is worth filling while the window is yours.',
    cta: 'Claim Your Savings',
    alt: 'A hand holding a red Cherry Lime CBD gummy.',
  },
  footer: {
    trust: ['Farm-to-you from Oregon', '3rd-party lab-tested', '100% federally legal hemp'],
    reason: 'You are receiving this email as a Flora Sophia VIP. Early-access pricing is valid today only; the National CBD Day Sale opens to everyone tomorrow. Discounts apply automatically at checkout based on order subtotal.',
    legal: 'These statements have not been evaluated by the Food and Drug Administration. These products are not intended to diagnose, treat, cure, or prevent any disease.',
    address: 'Flora Sophia Botanicals · Oregon, USA',
    links: ['Unsubscribe', 'Manage preferences', 'View in browser'],
  },
};

export const emails = [
  {
    id: 'cbd-day',
    type: 'promo',
    copy: { en: copy, pt: copy },
    render: (lang, c, assets) => render(c, assets),
  },
];

/** HTML final de um email. */
export function build(email, lang, assets) {
  const c = email.copy[lang];
  return documentHtml({
    lang: 'en',
    title: c.subject,
    preheader: c.preheader,
    bg: C.bg,
    css: CSS,
    dark: DARK,
    body: email.render(lang, c, assets),
  })
    // contêiner fluido: até 600px, mas encolhe no celular mesmo sem o <style> (email colado, Gmail).
    // O Outlook do Windows continua preso aos 600px pela tabela fantasma do documentHtml.
    .replace('class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;"',
      'class="container" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;"')
    .replace('</head>', `${FONTS}\n</head>`);
}
