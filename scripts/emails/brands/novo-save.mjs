/* Novo Save (novosave.com.br): portal de games do João. Newsletter com posts reais do site
   (títulos e links) e o destaque de um guia que existe. Visual de game: cantos retos, borda grossa. */
import { brandBuilder } from '../kit.mjs';

const SITE = 'https://novosave.com.br';
export const brand = { slug: 'novo-save', name: 'Novo Save', kind: 'own', site: SITE };

export const build = brandBuilder(() => ({
  c: { bg: '#f5f3ed', card: '#ffffff', text: '#111111', head: '#111111', muted: '#5c6158', accent: '#b7f34a', onAccent: '#111111', kicker: '#3f6a0c', line: '#dcd8cc', tile: '#f5f3ed', link: '#3f6a0c', stepBg: '#111111', stepText: '#b7f34a' },
  d: { bg: '#111111', card: '#1a1a1a', text: '#f5f3ed', head: '#f5f3ed', muted: '#9ca3af', line: '#2e2e2e', tile: '#0a0a0a', accentText: '#b7f34a' },
  f: { head: "'Archivo', 'Arial Black', Arial, sans-serif", text: "'Inter', Helvetica, Arial, sans-serif", mono: "'Archivo', Arial, sans-serif" },
  fontsLink: '<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800&family=Inter:wght@400;600&display=swap" rel="stylesheet">',
  radius: 0, btnRadius: 0, round: false, h1: 32, h1Weight: 800, h1Upper: true, h1Spacing: '-0.3px',
  cardBorder: '2px solid #111111',
  darkExtra: '.dm-card { border-color: #b7f34a !important; }',
  logo: { file: 'logo.png', dark: 'logo-dark.png', w: 114, h: 24, alt: 'Novo Save' },
  footer: {
    pt: { tagline: 'Notícias, guias e reviews de games, sem enrolação.', reason: 'Você recebeu este email porque assinou a newsletter do Novo Save.' },
    en: { tagline: 'Gaming news, guides and reviews, straight to the point.', reason: 'You are receiving this email because you subscribed to the Novo Save newsletter.' },
  },
}));

export const emails = [
  {
    id: 'save-da-semana',
    type: 'newsletter',
    copy: {
      pt: {
        subject: 'Save da semana: GTA 6, Enshrouded e dinheiro no GTA Online',
        preheader: 'O trailer de lançamento de GTA 6, Enshrouded fora do acesso antecipado e mais.',
        kicker: 'Press start · Save da semana', title: 'O que rolou nos games.',
        intro: 'Os quatro posts que mais valeram a leitura nesta semana no Novo Save.',
        alt: 'Um controle de videogame em pixel art verde sobre fundo preto quadriculado.',
        tiles: [
          { eyebrow: 'Notícia', title: 'GTA 6 ganha trailer de lançamento', text: 'A 35 dias da estreia, o que o trailer mostra.', path: '/gta-6-trailer-lancamento/' },
          { eyebrow: 'Notícia', title: 'Enshrouded deixa o acesso antecipado', text: 'Versão 1.0 em 15 de outubro, também no PS5.', path: '/enshrouded-1-0-lancamento/' },
          { eyebrow: 'Guia', title: 'GTA Online: dinheiro jogando solo', text: 'As melhores formas de lucrar sem grupo em 2026.', path: '/gta-online-dinheiro-solo/' },
          { eyebrow: 'Recomendação', title: 'Extraction shooters para jogar sozinho', text: 'Do mais tranquilo ao mais punitivo.', path: '/melhores-extraction-shooters-solo/' },
        ],
        cta: 'Ler tudo no Novo Save',
      },
      en: {
        subject: 'Save of the week: GTA 6, Enshrouded and GTA Online cash',
        preheader: "GTA 6's launch trailer, Enshrouded leaves early access and more.",
        kicker: 'Press start · Save of the week', title: 'What happened in gaming.',
        intro: 'The four stories most worth your time on Novo Save this week.',
        alt: 'A green pixel-art game controller on a black grid background.',
        tiles: [
          { eyebrow: 'News', title: 'GTA 6 gets its launch trailer', text: '35 days before release: what the trailer shows.', path: '/gta-6-trailer-lancamento/' },
          { eyebrow: 'News', title: 'Enshrouded leaves early access', text: 'Version 1.0 on October 15, PS5 included.', path: '/enshrouded-1-0-lancamento/' },
          { eyebrow: 'Guide', title: 'GTA Online: money playing solo', text: 'The best ways to earn without a crew in 2026.', path: '/gta-online-dinheiro-solo/' },
          { eyebrow: 'Pick', title: 'Extraction shooters to play solo', text: 'From the most relaxed to the most punishing.', path: '/melhores-extraction-shooters-solo/' },
        ],
        cta: 'Read it all on Novo Save',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'semana', alt: c.alt, bg: '#111111' }),
      k.intro(c), k.tiles(c.tiles.map((t) => ({ ...t, href: `${SITE}${t.path}` }))),
      k.cta({ href: `${SITE}/`, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
  {
    id: 'extraction-shooters',
    type: 'content',
    copy: {
      pt: {
        subject: 'Quer jogar extraction shooter sem grupo? Comece por aqui',
        preheader: 'Tarkov no PvE, ARC Raiders, Escape from Duckov e mais, do mais tranquilo ao mais punitivo.',
        kicker: 'Recomendação', title: 'Entrar, saquear e sair vivo. Sozinho.',
        intro: 'Separamos os extraction shooters que funcionam bem sem grupo e dissemos para quem cada um serve.',
        alt: 'Mapa tático com uma rota pontilhada até o ponto de extração.',
        steps: [
          '**Nunca jogou o gênero:** Escape from Duckov.',
          '**Quer o desafio completo, sem outros jogadores:** Tarkov no PvE.',
          '**Quer jogar online sem virar alvo o tempo todo:** ARC Raiders.',
          '**Gosta de simulação e missões táticas:** Gray Zone Warfare ou Incursion Red River.',
        ],
        cta: 'Ler a recomendação completa',
      },
      en: {
        subject: 'Want to play extraction shooters without a squad? Start here',
        preheader: 'Tarkov PvE, ARC Raiders, Escape from Duckov and more, from relaxed to punishing.',
        kicker: 'Our pick', title: 'Drop in, loot, get out alive. Solo.',
        intro: 'We rounded up the extraction shooters that work well without a squad and who each one is for.',
        alt: 'A tactical map with a dotted route to the extraction point.',
        steps: [
          '**Never played the genre:** Escape from Duckov.',
          '**Want the full challenge without other players:** Tarkov PvE.',
          "**Want to play online without being hunted all the time:** ARC Raiders.",
          '**Into simulation and tactical missions:** Gray Zone Warfare or Incursion Red River.',
        ],
        cta: 'Read the full pick',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'guia', alt: c.alt, bg: '#2e3a2e' }),
      k.intro(c), k.steps(c.steps),
      k.cta({ href: `${SITE}/melhores-extraction-shooters-solo/`, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
];
