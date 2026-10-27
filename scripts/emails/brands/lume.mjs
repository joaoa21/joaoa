/* Atelier Lume: marca FICTÍCIA de moda. Lançamento de coleção e liquidação com cupom.
   Peças, preços e cupom são inventados. Visual editorial: serifa alta, preto e osso. */
import { brandBuilder } from '../kit.mjs';

const SITE = 'https://example.com/atelier-lume';
export const brand = { slug: 'lume', name: 'Atelier Lume', kind: 'fictional', site: SITE };

export const build = brandBuilder(() => ({
  c: { bg: '#f3efe8', card: '#fbf9f5', text: '#141414', head: '#141414', muted: '#6b665e', accent: '#141414', onAccent: '#f3efe8', kicker: '#b9785a', line: '#e2dccf', tile: '#f3efe8' },
  d: { bg: '#0e0e0e', card: '#171717', text: '#ece7dd', head: '#f3efe8', muted: '#a8a296', line: '#2b2b2b', tile: '#1f1f1f', accentText: '#d9a184' },
  f: { head: "'Bodoni Moda', Didot, Georgia, serif", text: "'Jost', Helvetica, Arial, sans-serif", mono: "'Jost', Arial, sans-serif" },
  fontsLink: '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500&family=Jost:wght@400;500&display=swap" rel="stylesheet">',
  radius: 0, btnRadius: 0, round: false, h1: 38, h1Weight: 500, h1Spacing: '-0.5px',
  darkExtra: '.btn { background: #f3efe8 !important; color: #141414 !important; }',
  logo: { file: 'logo.png', dark: 'logo-dark.png', w: 192, h: 20, alt: 'Atelier Lume' },
  footer: {
    pt: { tagline: 'Peças feitas em pequenas tiragens, em São Paulo.', address: 'Atelier Lume · Rua Augusta, 900 · São Paulo, SP' },
    en: { tagline: 'Pieces made in small runs in São Paulo.', address: 'Atelier Lume · 900 Augusta St. · São Paulo, Brazil' },
  },
}));

export const emails = [
  {
    id: 'colecao',
    type: 'launch',
    copy: {
      pt: {
        subject: 'Outono no Atelier Lume: a coleção Terra chegou',
        preheader: 'Linho, lã fria e tons de barro. Peças em tiragem pequena: quando acaba, acaba.',
        kicker: 'Nova coleção', title: 'Terra.',
        intro: 'Linho, lã fria e os tons do barro, da folha e da noite. A coleção de outono foi feita para atravessar a estação inteira, do dia mais quente ao primeiro frio.',
        alt: 'Três peças penduradas numa arara: um casaco cor de barro, um vestido preto e um casaco verde-sálvia.',
        tiles: [
          { eyebrow: 'Casaco', title: 'Casaco Barro', text: 'Lã fria · R$ 690' },
          { eyebrow: 'Vestido', title: 'Vestido Noite', text: 'Linho lavado · R$ 520' },
        ],
        text: 'Cada peça sai em tiragem pequena. Quando acaba, acaba.',
        cta: 'Ver a coleção',
      },
      en: {
        subject: 'Autumn at Atelier Lume: the Terra collection is here',
        preheader: 'Linen, light wool and clay tones. Small runs: when it is gone, it is gone.',
        kicker: 'New collection', title: 'Terra.',
        intro: 'Linen, light wool and the tones of clay, leaves and night. The autumn collection was made to carry you through the whole season, from the warmest day to the first chill.',
        alt: 'Three pieces on a clothes rail: a clay-colored coat, a black dress and a sage-green coat.',
        tiles: [
          { eyebrow: 'Coat', title: 'Clay Coat', text: 'Light wool · R$ 690' },
          { eyebrow: 'Dress', title: 'Night Dress', text: 'Washed linen · R$ 520' },
        ],
        text: 'Every piece is made in a small run. When it is gone, it is gone.',
        cta: 'Shop the collection',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'colecao', alt: c.alt, bg: '#e9e2d6' }),
      k.intro(c), k.tiles(c.tiles), k.text(c.text, { top: 8 }),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
  {
    id: 'sale',
    type: 'promo',
    copy: {
      pt: {
        subject: 'Só para quem assina: 30% em toda a coleção de verão',
        preheader: 'Use o cupom LUME30 até domingo. Peças de tiragem pequena, sem reposição.',
        kicker: 'Liquidação de verão', title: '30% em toda a coleção de verão.',
        intro: 'Antes de abrir para todo mundo, quem assina a nossa lista tem três dias de vantagem. As peças de verão não voltam ao estoque.',
        alt: 'Uma etiqueta de roupa com 30% escrito, sobre fundo preto.',
        coupon: { code: 'LUME30', label: 'Seu cupom, válido até domingo, 2 nov.' },
        text: 'Vale para peças da coleção de verão, enquanto houver estoque. Não acumula com outras promoções.',
        cta: 'Usar meu cupom',
      },
      en: {
        subject: 'Subscribers only: 30% off the entire summer collection',
        preheader: 'Use code LUME30 through Sunday. Small runs, no restocks.',
        kicker: 'Summer sale', title: '30% off the entire summer collection.',
        intro: 'Before it opens to everyone, our list gets a three-day head start. Summer pieces will not be restocked.',
        alt: 'A clothing tag that reads 30%, on a black background.',
        coupon: { code: 'LUME30', label: 'Your code, valid through Sunday, Nov 2.' },
        text: 'Valid on summer collection pieces while stock lasts. Cannot be combined with other offers.',
        cta: 'Use my code',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'sale', alt: c.alt, bg: '#141414' }),
      k.intro(c), k.coupon(c.coupon), k.text(c.text, { size: 13 }),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
];
