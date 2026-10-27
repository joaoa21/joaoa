/* Trackik (app.trackik.com.br): analytics de sites focado em privacidade.
   Produto do João. O resumo semanal usa um site e números de exemplo. */
import { brandBuilder } from '../kit.mjs';

const SITE = 'https://app.trackik.com.br';
export const brand = { slug: 'trackik', name: 'Trackik', kind: 'own', site: SITE };

export const build = brandBuilder(() => ({
  c: { bg: '#f6f6f8', card: '#ffffff', bar: '#09090c', text: '#1d1d26', head: '#09090c', muted: '#5b5b6b', accent: '#5850ec', onAccent: '#ffffff', kicker: '#5850ec', line: '#e7e7ec', tile: '#f6f6f8', positive: '#15803d' },
  d: { bg: '#09090c', card: '#141418', text: '#e6e6ee', head: '#ffffff', muted: '#a1a1b0', line: '#24242c', tile: '#1b1b22', accentText: '#9d9cff' },
  f: { head: "'Geist', Helvetica, Arial, sans-serif", text: "'Geist', Helvetica, Arial, sans-serif", mono: "'Geist Mono', 'Courier New', monospace" },
  fontsLink: '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&family=Geist+Mono:wght@500&display=swap" rel="stylesheet">',
  radius: 14, btnRadius: 10, h1: 32, h1Weight: 700, h1Spacing: '-1px',
  header: 'bar',
  logo: { file: 'logo-dark.png', dark: 'logo-dark.png', w: 112, h: 34, alt: 'Trackik' },
  footer: {
    pt: { tagline: 'Analytics sem cookies e sem guardar IP.', reason: 'Você recebe este resumo porque tem um site no Trackik.' },
    en: { tagline: 'Analytics with no cookies and no stored IPs.', reason: 'You get this summary because you have a site on Trackik.' },
  },
}));

export const emails = [
  {
    id: 'resumo-semanal',
    type: 'report',
    copy: {
      pt: {
        subject: 'Sua semana no Trackik: seusite.com.br',
        preheader: '1.284 visitantes, 12% a mais que na semana passada. Veja o que puxou o crescimento.',
        kicker: 'Resumo semanal · 20 a 26 out.', title: 'Semana em alta.',
        intro: 'O **seusite.com.br** teve a melhor semana do mês. Sábado e domingo concentraram as visitas.',
        alt: 'Gráfico de barras das visitas da semana, com os dois últimos dias mais altos.',
        stats: [{ label: 'Visitantes', value: '1.284', delta: '+12%' }, { label: 'Visitas', value: '1.937', delta: '+8%' }, { label: 'Cliques', value: '4.560', delta: '+15%' }],
        pagesTitle: 'Páginas mais vistas',
        pages: [['/', '612'], ['/criacao-de-sites/', '341'], ['/blog/site-lento-5-causas/', '208'], ['/projetos/', '176']],
        sourcesTitle: 'De onde vieram',
        sources: [['Google', '48%'], ['Direto', '27%'], ['Instagram', '14%'], ['LinkedIn', '11%']],
        cta: 'Ver o painel completo',
      },
      en: {
        subject: 'Your week on Trackik: yoursite.com',
        preheader: '1,284 visitors, 12% more than last week. See what drove the growth.',
        kicker: 'Weekly summary · Oct 20–26', title: 'A week on the rise.',
        intro: '**yoursite.com** had its best week of the month. Saturday and Sunday brought most of the visits.',
        alt: 'Bar chart of visits during the week, with the last two days highest.',
        stats: [{ label: 'Visitors', value: '1,284', delta: '+12%' }, { label: 'Visits', value: '1,937', delta: '+8%' }, { label: 'Clicks', value: '4,560', delta: '+15%' }],
        pagesTitle: 'Top pages',
        pages: [['/', '612'], ['/web-design/', '341'], ['/blog/slow-website/', '208'], ['/projects/', '176']],
        sourcesTitle: 'Where they came from',
        sources: [['Google', '48%'], ['Direct', '27%'], ['Instagram', '14%'], ['LinkedIn', '11%']],
        cta: 'Open the full dashboard',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open({ top: false }),
      k.hero({ art: 'grafico', alt: c.alt, bg: '#09090c', top: false }),
      k.intro(c), k.stats(c.stats),
      k.rows(c.pages, { title: c.pagesTitle }), k.rows(c.sources, { title: c.sourcesTitle }),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
  {
    id: 'mapa-de-calor',
    type: 'launch',
    copy: {
      pt: {
        subject: 'Novo no Trackik: veja onde as pessoas clicam',
        preheader: 'O mapa de calor mostra os cliques em cima da sua página de verdade.',
        kicker: 'Novidade', title: 'Mapa de calor: os cliques, em cima da página.',
        intro: 'Agora dá para ver **onde** as pessoas clicam, não só quantas vezes. O Trackik abre a sua página no painel e pinta os pontos mais clicados.',
        alt: 'Uma página de site com manchas de calor sobre o botão principal e os cartões.',
        bullets: ['**Nada para configurar:** os cliques já eram registrados automaticamente.', 'Descubra se o botão principal está sendo visto.', 'Compare páginas e encontre o que ninguém usa.'],
        cta: 'Abrir o mapa de calor',
      },
      en: {
        subject: 'New on Trackik: see where people click',
        preheader: 'The heatmap shows clicks on top of your actual page.',
        kicker: "What's new", title: 'Heatmaps: clicks, right on the page.',
        intro: 'You can now see **where** people click, not just how often. Trackik opens your page inside the dashboard and paints the most-clicked spots.',
        alt: 'A website page with heat spots over the main button and the cards.',
        bullets: ['**Nothing to set up:** clicks were already tracked automatically.', 'Find out whether your main button gets noticed.', 'Compare pages and spot what nobody uses.'],
        cta: 'Open the heatmap',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open({ top: false }),
      k.hero({ art: 'mapa', alt: c.alt, bg: '#eceaf9', top: false }),
      k.intro(c), k.bullets(c.bullets),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
];
