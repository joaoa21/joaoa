/* Maré Café: marca FICTÍCIA de café especial por assinatura (e-commerce).
   Carrinho abandonado e pedido enviado. Nomes, preços e endereços são inventados. */
import { brandBuilder } from '../kit.mjs';

const SITE = 'https://example.com/mare-cafe';
export const brand = { slug: 'mare', name: 'Maré Café', kind: 'fictional', site: SITE };

export const build = brandBuilder(() => ({
  c: { bg: '#f6efe6', card: '#fffaf3', text: '#3b2418', head: '#3b2418', muted: '#7a6152', accent: '#c8553d', onAccent: '#ffffff', kicker: '#c8553d', line: '#ead9c6', tile: '#f6efe6', stepBg: '#3b2418', stepText: '#f6efe6' },
  d: { bg: '#1c120d', card: '#2a1b14', text: '#f3e6d8', head: '#f6efe6', muted: '#c4ad9a', line: '#3d2a20', tile: '#33231a', accentText: '#ef8a72' },
  f: { head: "'DM Serif Display', Georgia, serif", text: "'Inter', Helvetica, Arial, sans-serif", mono: "'Inter', Arial, sans-serif" },
  fontsLink: '<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">',
  radius: 18, btnRadius: 999, h1: 36, h1Weight: 400, h1Spacing: '-0.3px',
  logo: { file: 'logo.png', dark: 'logo-dark.png', w: 129, h: 30, alt: 'Maré Café' },
  footer: {
    pt: { tagline: 'Café especial torrado na semana do envio.', address: 'Maré Café · Rua do Porto, 120 · Recife, PE' },
    en: { tagline: 'Specialty coffee roasted the week it ships.', address: 'Maré Café · 120 Harbor St. · Recife, Brazil' },
  },
}));

export const emails = [
  {
    id: 'carrinho',
    type: 'cart',
    copy: {
      pt: {
        subject: 'Seu café ficou esperando',
        preheader: 'O Catuaí Amarelo que você escolheu ainda está no carrinho. Frete grátis até domingo.',
        kicker: 'Ficou no carrinho', title: 'Seu café ficou esperando.',
        intro: 'Você separou um café e não chegou a finalizar. Ele ainda está reservado no seu carrinho:',
        alt: 'Um pacote de café marrom ao lado de uma xícara fumegante, sobre fundo terracota.',
        product: { name: 'Catuaí Amarelo · 250 g', detail: 'Notas de caramelo, laranja e cacau. Torra média.', price: 'R$ 54,90', alt: 'Pacote de café Maré, 250 g' },
        note: '**Frete grátis até domingo** em pedidos acima de R$ 99. Leve dois pacotes e já chega lá.',
        cta: 'Finalizar meu pedido',
      },
      en: {
        subject: 'Your coffee is still waiting',
        preheader: 'The Yellow Catuaí you picked is still in your cart. Free shipping through Sunday.',
        kicker: 'Still in your cart', title: 'Your coffee is still waiting.',
        intro: "You picked a coffee but didn't check out. It's still saved in your cart:",
        alt: 'A brown coffee bag next to a steaming cup, on a terracotta background.',
        product: { name: 'Yellow Catuaí · 250 g', detail: 'Notes of caramel, orange and cocoa. Medium roast.', price: 'R$ 54.90', alt: 'Maré coffee bag, 250 g' },
        note: '**Free shipping through Sunday** on orders over R$ 99. Two bags and you are there.',
        cta: 'Complete my order',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'carrinho', alt: c.alt, bg: '#c8553d' }),
      k.intro(c), k.product({ art: 'pacote', ...c.product }), k.note(c.note),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
  {
    id: 'pedido-enviado',
    type: 'transactional',
    copy: {
      pt: {
        subject: 'Seu pedido #4821 saiu para entrega',
        preheader: 'Torrado ontem, chega até quinta-feira. Acompanhe pelo código de rastreio.',
        kicker: 'Pedido #4821', title: 'Seu café já está a caminho.',
        intro: 'Torramos ontem e embalamos hoje de manhã. Agora é só esperar o cheiro chegar.',
        alt: 'Uma caixa de papelão com fita terracota sobre ondas, indicando movimento.',
        rowsTitle: 'Resumo do pedido',
        rows: [['Catuaí Amarelo · 250 g × 2', 'R$ 109,80'], ['Frete', 'Grátis'], ['**Total**', '**R$ 109,80**'], ['Previsão de entrega', 'Até qui., 30 out.']],
        steps: ['Abra o pacote só na hora de passar o café.', 'Guarde bem fechado, longe da luz e do calor.', 'Moa na hora: o aroma dura muito mais.'],
        cta: 'Acompanhar a entrega',
      },
      en: {
        subject: 'Your order #4821 is on its way',
        preheader: 'Roasted yesterday, arriving by Thursday. Track it with your tracking code.',
        kicker: 'Order #4821', title: 'Your coffee is on its way.',
        intro: 'We roasted it yesterday and packed it this morning. Now just wait for the smell to arrive.',
        alt: 'A cardboard box with terracotta tape over waves, suggesting movement.',
        rowsTitle: 'Order summary',
        rows: [['Yellow Catuaí · 250 g × 2', 'R$ 109.80'], ['Shipping', 'Free'], ['**Total**', '**R$ 109.80**'], ['Estimated delivery', 'By Thu, Oct 30']],
        steps: ['Open the bag only when you brew.', 'Keep it sealed, away from light and heat.', 'Grind right before brewing: the aroma lasts much longer.'],
        cta: 'Track my delivery',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'enviado', alt: c.alt, bg: '#2f6f73' }),
      k.intro(c), k.rows(c.rows, { title: c.rowsTitle }), k.steps(c.steps),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
];
