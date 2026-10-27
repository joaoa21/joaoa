/* Email Generator (emailgenerator.com.br): gerador de emails HTML e de links de WhatsApp.
   Produto do João. Só recursos que existem: os oito modelos e os avisos antes de enviar. */
import { brandBuilder } from '../kit.mjs';

const SITE = 'https://emailgenerator.com.br';
export const brand = { slug: 'email-generator', name: 'Email Generator', kind: 'own', site: SITE };

export const build = brandBuilder(() => ({
  c: { bg: '#f4f1ea', card: '#fffdf8', text: '#191713', head: '#191713', muted: '#4a463e', accent: '#1d3fd6', onAccent: '#ffffff', kicker: '#c8451f', line: '#d8d3c6', tile: '#f4f1ea', positive: '#128c4b' },
  d: { bg: '#12110f', card: '#1b1a17', text: '#ece7dc', head: '#f4f1ea', muted: '#b3ad9f', line: '#34312b', tile: '#23211d', accentText: '#9db0ff' },
  f: { head: "'Fraunces', Georgia, serif", text: "'Archivo', Helvetica, Arial, sans-serif", mono: "'Archivo', Helvetica, Arial, sans-serif" },
  fontsLink: '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600&family=Archivo:wght@400;600;700&display=swap" rel="stylesheet">',
  radius: 8, btnRadius: 4, h1: 36, h1Weight: 600,
  logo: { file: 'logo.png', dark: 'logo-dark.png', w: 175, h: 30, alt: 'Email Generator' },
  footer: {
    pt: { tagline: 'Emails HTML que funcionam no Gmail e no Outlook.', reason: 'Você recebeu este email porque assinou as novidades do Email Generator.' },
    en: { tagline: 'HTML emails that work in Gmail and Outlook.', reason: 'You are receiving this email because you subscribed to Email Generator updates.' },
  },
}));

export const emails = [
  {
    id: 'modelos',
    type: 'launch',
    copy: {
      pt: {
        subject: 'Oito modelos de email, um clique para trocar',
        preheader: 'Cartões, Newsletter, Vitrine, Convite e mais: mude o layout sem perder o que já escreveu.',
        kicker: 'Modelos', title: 'Troque o layout. O texto fica.',
        intro: 'O Email Generator agora tem **oito modelos**. Escolha um, preencha uma vez e experimente os outros: textos, links e imagens vão junto.',
        alt: 'Quatro miniaturas de email, cada uma com um layout e uma cor diferentes.',
        tiles: [
          { eyebrow: 'Para avisos', title: 'Cartões', text: 'Blocos separados, fáceis de escanear.' },
          { eyebrow: 'Para conteúdo', title: 'Newsletter', text: 'Várias matérias num email só.' },
          { eyebrow: 'Para vender', title: 'Vitrine', text: 'Produtos lado a lado, com preço.' },
          { eyebrow: 'Para eventos', title: 'Convite', text: 'Data, local e confirmação.' },
        ],
        more: 'E ainda: **Gradiente, Minimalista, Cupom e Carta pessoal**.',
        cta: 'Abrir o gerador',
      },
      en: {
        subject: 'Eight email templates, one click to switch',
        preheader: 'Cards, Newsletter, Showcase, Invitation and more: change the layout without losing what you wrote.',
        kicker: 'Templates', title: 'Switch the layout. Keep the copy.',
        intro: 'Email Generator now has **eight templates**. Pick one, fill it in once and try the others: your text, links and images come along.',
        alt: 'Four email thumbnails, each with a different layout and color.',
        tiles: [
          { eyebrow: 'For updates', title: 'Cards', text: 'Separate blocks, easy to scan.' },
          { eyebrow: 'For content', title: 'Newsletter', text: 'Several stories in one email.' },
          { eyebrow: 'For sales', title: 'Showcase', text: 'Products side by side, with prices.' },
          { eyebrow: 'For events', title: 'Invitation', text: 'Date, place and RSVP.' },
        ],
        more: 'Plus: **Gradient, Minimal, Coupon and Personal letter**.',
        cta: 'Open the generator',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'modelos', alt: c.alt, bg: '#191713' }),
      k.intro(c), k.tiles(c.tiles), k.text(c.more, { top: 8 }),
      k.cta({ href: `${SITE}/`, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
  {
    id: 'avisos',
    type: 'tip',
    copy: {
      pt: {
        subject: 'Antes de enviar, o gerador confere o seu email',
        preheader: 'Link de descadastro, texto alternativo, botão sem link: ele aponta e leva ao campo certo.',
        kicker: 'Dica', title: 'Erros pegos antes do envio.',
        intro: 'Email com problema não tem "desfazer" depois que sai. Por isso o Email Generator confere o que costuma passar batido e mostra um aviso com o atalho para o campo.',
        alt: 'Uma lista de conferência com itens aprovados e dois avisos, ao lado de um selo de email.',
        bullets: ['**Link de descadastro** no rodapé, que a lei e os provedores exigem.', '**Texto alternativo** nas imagens, para quem lê com as imagens bloqueadas.', '**Botão sem link** e endereços inválidos.'],
        note: '**E no Outlook?** Os botões saem em VML, o formato que o Outlook para Windows entende. Ficam arredondados lá também.',
        cta: 'Montar um email',
      },
      en: {
        subject: 'Before you send, the generator checks your email',
        preheader: 'Unsubscribe link, alt text, buttons with no link: it flags them and takes you to the field.',
        kicker: 'Tip', title: 'Mistakes caught before you hit send.',
        intro: "There's no undo once an email is out. So Email Generator checks what usually slips through and shows a warning with a shortcut to the field.",
        alt: 'A checklist with passed items and two warnings, next to an email seal.',
        bullets: ['An **unsubscribe link** in the footer, required by law and by inbox providers.', '**Alt text** on images, for people reading with images blocked.', '**Buttons with no link** and invalid URLs.'],
        note: '**What about Outlook?** Buttons are built in VML, the format Outlook for Windows understands. They stay rounded there too.',
        cta: 'Build an email',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'avisos', alt: c.alt, bg: '#f4f1ea' }),
      k.intro(c), k.bullets(c.bullets), k.note(c.note),
      k.cta({ href: `${SITE}/`, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
];
