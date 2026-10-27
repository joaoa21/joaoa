/* Peças de HTML de email, à prova de Gmail, Apple Mail e Outlook (Windows, motor do Word).
   - Layout em tabelas de 600px e estilos inline (o Gmail ignora boa parte do <style>).
   - Botão em VML dentro de <!--[if mso]> para o Outlook mostrar o botão arredondado.
   - Modo escuro: meta color-scheme + @media (prefers-color-scheme: dark) e [data-ogsc]
     (Outlook.com), com classes dm-* nos elementos que trocam de cor.
   - Pré-cabeçalho escondido, texto alternativo em toda imagem e empilhamento no celular. */

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Texto com **negrito** e [link](url), já escapado. */
export function rich(text, { link = 'inherit' } = {}) {
  return esc(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((https?:\/\/[^)]+)\)/g, `<a href="$2" style="color:${link};text-decoration:underline;">$1</a>`);
}

/** Botão: VML para o Outlook, <a> com padding para o resto. Largura calculada pelo texto. */
export function button({ href, label, bg, color, radius = 10, font, size = 16, width }) {
  const w = width ?? Math.max(180, Math.round(label.length * size * 0.62 + 56));
  const arc = Math.round((radius / 48) * 100);
  return `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${esc(href)}" style="height:48px;v-text-anchor:middle;width:${w}px;" arcsize="${arc}%" stroke="f" fillcolor="${bg}">
<w:anchorlock/>
<center style="color:${color};font-family:Arial,sans-serif;font-size:${size}px;font-weight:bold;">${esc(label)}</center>
</v:roundrect>
<![endif]-->
<!--[if !mso]><!-- --><a href="${esc(href)}" class="btn" style="display:inline-block;background:${bg};color:${color};font-family:${font};font-size:${size}px;font-weight:700;line-height:48px;text-align:center;text-decoration:none;border-radius:${radius}px;padding:0 28px;mso-hide:all;">${esc(label)}</a><!--<![endif]-->`;
}

/** Documento completo. `dark` recebe as regras do modo escuro (sem o @media). */
export function documentHtml({ lang, title, preheader, bg, css = '', dark = '', body }) {
  // espaços "invisíveis" depois do pré-cabeçalho: o Gmail não puxa o começo do email para a prévia
  const filler = '&#8199;&#65279;&#847; '.repeat(60);
  return `<!doctype html>
<html lang="${lang}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)}</title>
<!--[if mso]>
<noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
<style>td,th,div,p,a,h1,h2,h3{font-family:Arial,sans-serif !important;}</style>
<![endif]-->
<style>
  :root { color-scheme: light dark; supported-color-schemes: light dark; }
  body { margin: 0; padding: 0; width: 100% !important; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
  table { border-collapse: collapse; mso-table-lspace: 0; mso-table-rspace: 0; }
  img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; display: block; }
  a { text-decoration: none; }
  .logo-dark { display: none; max-height: 0; overflow: hidden; mso-hide: all; }
  ${css}
  @media only screen and (max-width: 620px) {
    .container { width: 100% !important; }
    .px { padding-left: 24px !important; padding-right: 24px !important; }
    .stack { display: block !important; width: 100% !important; max-width: 100% !important; }
    .stack-gap { padding: 0 0 12px !important; }
    .h1 { font-size: 30px !important; line-height: 36px !important; }
    .fluid { width: 100% !important; height: auto !important; }
  }
  @media (prefers-color-scheme: dark) {
    .logo-light { display: none !important; }
    .logo-dark { display: block !important; max-height: none !important; overflow: visible !important; }
    ${dark}
  }
  [data-ogsc] .logo-light { display: none !important; }
  [data-ogsc] .logo-dark { display: block !important; max-height: none !important; }
  ${dark.replace(/(^|\})\s*\./g, '$1 [data-ogsc] .')}
</style>
</head>
<body class="dm-bg" style="margin:0;padding:0;background:${bg};">
<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:${bg};opacity:0;">${esc(preheader)} ${filler}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="dm-bg" style="background:${bg};">
<tr><td align="center" style="padding:24px 12px;">
<!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;">
${body}
</table>
<!--[if mso]></td></tr></table><![endif]-->
</td></tr>
</table>
</body>
</html>
`;
}
