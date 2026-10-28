/* Kit de blocos de email com tema por marca (cores, fontes, cantos, cabeçalho).
   Cada marca em scripts/emails/brands/ define um tema e monta seus emails com estes blocos;
   o resultado passa por documentHtml (lib.mjs), que cuida do modo escuro, do pré-cabeçalho
   e do Outlook. Regras de email: tabelas, estilos inline, 600px, imagens com alt. */
import { button, documentHtml, esc, rich } from './lib.mjs';

const TABLE = 'role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"';
const SEP = 'style="border-collapse:separate;"';

/** Rodapé padrão por idioma (a marca pode trocar os textos). */
export const FOOTER = {
  pt: { unsubscribe: 'Descadastrar', browser: 'Ver no navegador' },
  en: { unsubscribe: 'Unsubscribe', browser: 'View in browser' },
};

export function createKit(theme) {
  const { c, d, f } = theme; // c: cores claras, d: cores do modo escuro, f: fontes
  const R = theme.radius ?? 16;
  const pad = theme.pad ?? 40;
  const px = `padding-left:${pad}px;padding-right:${pad}px;`;

  const dark = `
    .dm-bg { background: ${d.bg} !important; }
    .dm-card { background: ${d.card} !important; }
    .dm-text { color: ${d.text} !important; }
    .dm-head { color: ${d.head ?? d.text} !important; }
    .dm-muted { color: ${d.muted} !important; }
    .dm-line { border-color: ${d.line} !important; }
    .dm-tile { background: ${d.tile} !important; border-color: ${d.line} !important; }
    .dm-accent { color: ${d.accentText ?? c.accent} !important; }
    ${theme.darkExtra ?? ''}`;

  const k = {
    theme,
    /** Cabeçalho com o logo (centralizado), claro e escuro. */
    header({ href }) {
      const { logo } = theme;
      // O Gmail descarta o <style>: o logo escuro já nasce escondido no estilo inline (e sem alt),
      // e o @media de modo escuro o mostra com !important.
      const hide = 'display:none;max-height:0;overflow:hidden;mso-hide:all;';
      const img = (file, cls) => `<img class="${cls}" src="${theme.assets}/${file}" width="${logo.w}" height="${logo.h}" alt="${cls === 'logo-dark' ? '' : esc(logo.alt)}" style="${cls === 'logo-dark' ? hide : ''}width:${logo.w}px;height:${logo.h}px;margin:0 auto;">`;
      if (theme.header === 'bar')
        return `<tr><td align="center" style="background:${c.bar};border-radius:${R}px ${R}px 0 0;padding:22px ${pad}px;text-align:center;"><a href="${href}" style="display:inline-block;">${img(logo.dark ?? logo.file, 'logo-bar')}</a></td></tr>`;
      return `<tr><td class="px" align="center" style="padding:8px ${pad}px 24px;text-align:center;"><a href="${href}" style="display:inline-block;">${img(logo.file, 'logo-light')}${img(logo.dark ?? logo.file, 'logo-dark')}</a></td></tr>`;
    },
    /** Abre o cartão de conteúdo. `top` = arredondar os cantos de cima. */
    open({ top = true } = {}) {
      const r = top ? `${R}px ${R}px ${R}px ${R}px` : `0 0 ${R}px ${R}px`;
      const border = theme.cardBorder ? `border:${theme.cardBorder};` : '';
      return `<tr><td class="dm-card" style="background:${c.card};border-radius:${r};${border}"><table ${TABLE} ${SEP}>`;
    },
    close: () => `</table></td></tr>`,
    hero({ art, alt, bg, top = true, ext = 'png' }) {
      const r = top && theme.header !== 'bar' ? `${R}px ${R}px 0 0` : '0';
      return `<tr><td style="background:${bg ?? c.card};border-radius:${r};font-size:0;line-height:0;"><img class="fluid" src="${theme.assets}/${art}.${ext}" width="600" height="320" alt="${esc(alt)}" style="width:100%;max-width:600px;height:auto;border-radius:${r};"></td></tr>`;
    },
    /** Selo/ícone pequeno no lugar da imagem de topo (emails transacionais). */
    badge({ art, alt, size = 64 }) {
      return `<tr><td class="px" style="padding:40px ${pad}px 0;${px}"><img src="${theme.assets}/${art}.png" width="${size}" height="${size}" alt="${esc(alt)}" style="width:${size}px;height:${size}px;"></td></tr>`;
    },
    /** Abertura: selo, título e parágrafo (`intro`; `text` só quando não há `intro`). */
    intro({ kicker, title, intro, text, top = 36 }) {
      const lead = intro ?? text;
      return `<tr><td class="px" style="padding:${top}px ${pad}px 8px;">
      ${kicker ? `<p class="dm-accent" style="margin:0 0 12px;font-family:${f.mono ?? f.text};font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${c.kicker ?? c.accent};">${esc(kicker)}</p>` : ''}
      <h1 class="h1 dm-head" style="margin:0 0 16px;font-family:${f.head};font-size:${theme.h1 ?? 34}px;line-height:${(theme.h1 ?? 34) + 6}px;font-weight:${theme.h1Weight ?? 700};letter-spacing:${theme.h1Spacing ?? '-0.5px'};${theme.h1Upper ? 'text-transform:uppercase;' : ''}color:${c.head};">${esc(title)}</h1>
      ${lead ? `<p class="dm-muted" style="margin:0;font-family:${f.text};font-size:17px;line-height:27px;color:${c.muted};">${rich(lead, { link: c.link ?? c.accent })}</p>` : ''}
    </td></tr>`;
    },
    text(t, { size = 16, top = 16 } = {}) {
      return `<tr><td class="px" style="padding:${top}px ${pad}px 0;"><p class="dm-text" style="margin:0;font-family:${f.text};font-size:${size}px;line-height:${Math.round(size * 1.55)}px;color:${c.text};">${rich(t, { link: c.link ?? c.accent })}</p></td></tr>`;
    },
    bullets(items) {
      return `<tr><td class="px" style="padding:24px ${pad}px 8px;"><table ${TABLE}>${items.map((item) => `<tr>
        <td width="30" valign="top" style="padding:2px 0 14px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="20" height="20" align="center" style="width:20px;height:20px;background:${c.accent};border-radius:${theme.round === false ? 2 : 10}px;font-family:Arial,sans-serif;font-size:12px;line-height:20px;font-weight:bold;color:${c.onAccent};">&#10003;</td></tr></table></td>
        <td class="dm-text" valign="top" style="padding:0 0 14px 8px;font-family:${f.text};font-size:16px;line-height:24px;color:${c.text};">${rich(item)}</td></tr>`).join('')}</table></td></tr>`;
    },
    steps(items) {
      return `<tr><td class="px" style="padding:24px ${pad}px 8px;"><table ${TABLE}>${items.map((item, i) => `<tr>
        <td width="46" valign="top" style="padding:0 0 16px;"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td width="32" height="32" align="center" style="width:32px;height:32px;background:${c.stepBg ?? c.head};border-radius:${theme.round === false ? 0 : 8}px;font-family:${f.mono ?? f.text};font-size:15px;line-height:32px;font-weight:bold;color:${c.stepText ?? c.card};">${i + 1}</td></tr></table></td>
        <td class="dm-text" valign="top" style="padding:5px 0 16px 6px;font-family:${f.text};font-size:16px;line-height:24px;color:${c.text};">${rich(item)}</td></tr>`).join('')}</table></td></tr>`;
    },
    /** Grade de 2 colunas (empilha no celular). Itens: { title, text, href?, eyebrow? } */
    tiles(items) {
      const cell = (x) => {
        const inner = `<table ${TABLE} ${SEP}><tr><td class="dm-tile" style="background:${c.tile};border:1px solid ${c.line};border-radius:${Math.max(0, R - 4)}px;padding:18px;">
          ${x.eyebrow ? `<p class="dm-accent" style="margin:0 0 6px;font-family:${f.mono ?? f.text};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${c.kicker ?? c.accent};">${esc(x.eyebrow)}</p>` : ''}
          <p class="dm-head" style="margin:0 0 6px;font-family:${f.head};font-size:17px;line-height:22px;font-weight:700;color:${c.head};">${esc(x.title)}${x.href ? ` <span class="dm-accent" style="color:${c.accent};">&rarr;</span>` : ''}</p>
          <p class="dm-muted" style="margin:0;font-family:${f.text};font-size:14px;line-height:21px;color:${c.muted};">${esc(x.text)}</p></td></tr></table>`;
        return `<td class="stack stack-gap" width="50%" valign="top" style="padding:0 6px 12px;">${x.href ? `<a href="${esc(x.href)}" style="display:block;text-decoration:none;">${inner}</a>` : inner}</td>`;
      };
      const rows = [];
      for (let i = 0; i < items.length; i += 2) rows.push(`<tr>${cell(items[i])}${items[i + 1] ? cell(items[i + 1]) : '<td class="stack" width="50%"></td>'}</tr>`);
      return `<tr><td class="px" style="padding:24px ${pad - 6}px 4px;"><table ${TABLE}>${rows.join('')}</table></td></tr>`;
    },
    /** Números em destaque. Itens: { value, label, delta? } */
    stats(items) {
      const w = Math.floor(100 / items.length);
      return `<tr><td class="px" style="padding:24px ${pad - 6}px 4px;"><table ${TABLE}><tr>${items.map((s) => `<td class="stack stack-gap" width="${w}%" valign="top" style="padding:0 6px 12px;"><table ${TABLE} ${SEP}><tr><td class="dm-tile" style="background:${c.tile};border:1px solid ${c.line};border-radius:${Math.max(0, R - 4)}px;padding:18px;">
        <p class="dm-muted" style="margin:0 0 8px;font-family:${f.mono ?? f.text};font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${c.muted};">${esc(s.label)}</p>
        <p class="dm-head" style="margin:0;font-family:${f.head};font-size:28px;line-height:32px;font-weight:700;color:${c.head};">${esc(s.value)}</p>
        ${s.delta ? `<p class="dm-accent" style="margin:6px 0 0;font-family:${f.text};font-size:13px;line-height:18px;font-weight:600;color:${c.positive ?? c.accent};">${esc(s.delta)}</p>` : ''}
      </td></tr></table></td>`).join('')}</tr></table></td></tr>`;
    },
    /** Lista com rótulo e valor (recibo, ranking, detalhes). */
    rows(items, { title } = {}) {
      return `<tr><td class="px" style="padding:24px ${pad}px 8px;">
      ${title ? `<p class="dm-muted" style="margin:0 0 10px;font-family:${f.mono ?? f.text};font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:${c.muted};">${esc(title)}</p>` : ''}
      <table ${TABLE}>${items.map(([a, b], i) => `<tr>
        <td class="dm-text dm-line" style="padding:12px 0;border-top:1px solid ${c.line};${i === items.length - 1 ? `border-bottom:1px solid ${c.line};` : ''}font-family:${f.text};font-size:15px;line-height:22px;color:${c.text};">${rich(a)}</td>
        <td class="dm-head dm-line" align="right" style="padding:12px 0 12px 12px;border-top:1px solid ${c.line};${i === items.length - 1 ? `border-bottom:1px solid ${c.line};` : ''}font-family:${f.text};font-size:15px;line-height:22px;font-weight:600;color:${c.head};white-space:nowrap;">${rich(b)}</td></tr>`).join('')}</table></td></tr>`;
    },
    /** Código de verificação em destaque. */
    code(value, { label } = {}) {
      return `<tr><td class="px" style="padding:24px ${pad}px 4px;"><table ${TABLE} ${SEP}><tr><td class="dm-tile" align="center" style="background:${c.tile};border:1px solid ${c.line};border-radius:${Math.max(0, R - 4)}px;padding:22px;">
        ${label ? `<p class="dm-muted" style="margin:0 0 8px;font-family:${f.text};font-size:13px;line-height:18px;color:${c.muted};">${esc(label)}</p>` : ''}
        <p class="dm-head" style="margin:0;font-family:${f.mono ?? 'Courier New, monospace'};font-size:34px;line-height:40px;letter-spacing:10px;font-weight:700;color:${c.head};">${esc(value)}</p></td></tr></table></td></tr>`;
    },
    /** Produto com imagem, nome e preço (e-commerce). */
    product({ art, alt, name, detail, price }) {
      return `<tr><td class="px" style="padding:24px ${pad}px 4px;"><table ${TABLE} ${SEP}><tr>
        <td class="stack" width="160" valign="middle" style="padding:0 20px 12px 0;"><img src="${theme.assets}/${art}.png" width="160" height="160" alt="${esc(alt)}" style="width:160px;height:160px;border-radius:${Math.max(0, R - 6)}px;"></td>
        <td class="stack" valign="middle" style="padding:0 0 12px;">
          <p class="dm-head" style="margin:0 0 6px;font-family:${f.head};font-size:20px;line-height:26px;font-weight:700;color:${c.head};">${esc(name)}</p>
          <p class="dm-muted" style="margin:0 0 10px;font-family:${f.text};font-size:15px;line-height:22px;color:${c.muted};">${esc(detail)}</p>
          <p class="dm-head" style="margin:0;font-family:${f.text};font-size:18px;line-height:24px;font-weight:700;color:${c.head};">${esc(price)}</p></td></tr></table></td></tr>`;
    },
    /** Cupom recortado. */
    coupon({ code, label }) {
      return `<tr><td class="px" style="padding:24px ${pad}px 4px;"><table ${TABLE} ${SEP}><tr><td align="center" style="border:2px dashed ${c.accent};border-radius:${Math.max(0, R - 4)}px;padding:20px;">
        <p class="dm-muted" style="margin:0 0 6px;font-family:${f.text};font-size:13px;line-height:18px;color:${c.muted};">${esc(label)}</p>
        <p class="dm-head" style="margin:0;font-family:${f.mono ?? f.head};font-size:28px;line-height:34px;letter-spacing:4px;font-weight:700;color:${c.head};">${esc(code)}</p></td></tr></table></td></tr>`;
    },
    note(t) {
      return `<tr><td class="px" style="padding:8px ${pad}px 0;"><table ${TABLE} ${SEP}><tr><td class="dm-tile" style="background:${c.tile};border:1px solid ${c.line};border-radius:${Math.max(0, R - 4)}px;padding:18px 20px;font-family:${f.text};font-size:15px;line-height:23px;color:${c.text};"><span class="dm-text">${rich(t, { link: c.link ?? c.accent })}</span></td></tr></table></td></tr>`;
    },
    /** Botão centralizado. */
    cta({ href, label, secondary }) {
      const b = button({ href, label, bg: c.button ?? c.accent, color: c.onAccent, radius: theme.btnRadius ?? 10, font: f.text });
      const link = secondary ? `<p style="margin:16px 0 0;font-family:${f.text};font-size:14px;line-height:20px;"><a class="dm-accent" href="${esc(secondary.href)}" style="color:${c.link ?? c.accent};text-decoration:underline;">${esc(secondary.label)}</a></p>` : '';
      return `<tr><td class="px" align="center" style="padding:28px ${pad}px 8px;text-align:center;">${b}${link}</td></tr>`;
    },
    space: (h = 32) => `<tr><td style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</td></tr>`,
    signature({ name, role }) {
      return `<tr><td class="px" style="padding:24px ${pad}px 0;"><p class="dm-text" style="margin:0;font-family:${f.text};font-size:16px;line-height:24px;color:${c.text};">${esc(name)}<br><span class="dm-muted" style="color:${c.muted};font-size:14px;">${esc(role)}</span></p></td></tr>`;
    },
    footer(lang, { tagline, reason, address } = {}) {
      const t = { ...FOOTER[lang], ...(theme.footer?.[lang] ?? {}) };
      return `<tr><td class="px" align="center" style="padding:28px ${pad}px 8px;text-align:center;">
        ${tagline ?? t.tagline ? `<p class="dm-muted" style="margin:0 0 6px;font-family:${f.text};font-size:13px;line-height:20px;color:${c.footer ?? c.muted};">${esc(tagline ?? t.tagline)}</p>` : ''}
        ${reason ?? t.reason ? `<p class="dm-muted" style="margin:0 0 6px;font-family:${f.text};font-size:12px;line-height:18px;color:${c.footer ?? c.muted};">${esc(reason ?? t.reason)}</p>` : ''}
        ${address ?? t.address ? `<p class="dm-muted" style="margin:0 0 12px;font-family:${f.text};font-size:12px;line-height:18px;color:${c.footer ?? c.muted};">${esc(address ?? t.address)}</p>` : ''}
        <p style="margin:0;font-family:${f.text};font-size:12px;line-height:18px;"><a class="dm-muted" href="#" style="color:${c.footer ?? c.muted};text-decoration:underline;">${esc(t.unsubscribe)}</a> <span class="dm-muted" style="color:${c.footer ?? c.muted};">&nbsp;·&nbsp;</span> <a class="dm-muted" href="#" style="color:${c.footer ?? c.muted};text-decoration:underline;">${esc(t.browser)}</a></p>
      </td></tr>`;
    },
    /** Documento final. */
    doc({ lang, subject, preheader, rows }) {
      return documentHtml({
        lang: lang === 'pt' ? 'pt-BR' : 'en', title: subject, preheader, bg: c.bg, dark,
        css: theme.css ?? '', body: rows.join('\n'),
      }).replace('</head>', `${theme.fontsLink ?? ''}\n</head>`);
    },
  };
  return k;
}

/** build() padrão de uma marca: tema (que depende do endereço das imagens) + linhas de cada email. */
export function brandBuilder(themeFor) {
  return function build(email, lang, assets) {
    const k = createKit({ ...themeFor(assets), assets });
    const copy = email.copy[lang];
    return k.doc({ lang, subject: copy.subject, preheader: copy.preheader, rows: email.rows(k, copy, lang) });
  };
}
