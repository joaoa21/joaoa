/* MS Corretora de Seguros (mscorretoraseguros.com.br). Cliente: o João fez o site.
   Estes emails são um CONCEITO, não foram pedidos nem enviados pela corretora.
   Coberturas reais do site: auto, moto, viagem, residencial, empresarial e vida.
   Cliente, veículo e datas são fictícios. */
import { brandBuilder } from '../kit.mjs';

const SITE = 'https://mscorretoraseguros.com.br';
export const brand = { slug: 'ms-corretora', name: 'MS Corretora', kind: 'client', site: SITE };

export const build = brandBuilder(() => ({
  c: { bg: '#eef1f7', card: '#ffffff', bar: '#0c1f4a', text: '#1a1a2e', head: '#0c1f4a', muted: '#5d6573', accent: '#c05508', onAccent: '#ffffff', kicker: '#c05508', line: '#d6dcea', tile: '#f3f6fc' },
  d: { bg: '#07122b', card: '#0f1c3d', text: '#e8eefb', head: '#ffffff', muted: '#a9b4cc', line: '#22335c', tile: '#152a55', accentText: '#f59a52' },
  f: { head: "'Bricolage Grotesque', Helvetica, Arial, sans-serif", text: "'DM Sans', Helvetica, Arial, sans-serif", mono: "'DM Sans', Arial, sans-serif" },
  fontsLink: '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">',
  radius: 12, btnRadius: 8, h1: 32, h1Weight: 700, h1Spacing: '-0.6px',
  header: 'bar',
  logo: { file: 'logo-dark.png', dark: 'logo-dark.png', w: 85, h: 26, alt: 'MS Corretora de Seguros' },
  footer: {
    pt: { tagline: 'MS Corretora de Seguros: auto, moto, viagem, residencial, empresarial e vida.', reason: 'Você recebeu este email porque é cliente da MS Corretora.' },
    en: { tagline: 'MS Insurance Brokers: car, motorcycle, travel, home, business and life.', reason: 'You are receiving this email because you are an MS Insurance Brokers client.' },
  },
}));

export const emails = [
  {
    id: 'renovacao',
    type: 'reminder',
    copy: {
      pt: {
        subject: 'Carlos, seu seguro auto vence em 30 dias',
        preheader: 'Renove com antecedência e evite ficar sem cobertura. A gente cota com as parceiras para você.',
        kicker: 'Lembrete de renovação', title: 'Seu seguro auto vence em 30 dias.',
        intro: 'Olá, Carlos. Para você não ficar nenhum dia sem proteção, já podemos cotar a renovação com as seguradoras parceiras e trazer a melhor opção.',
        alt: 'Um carro azul-marinho ao lado de um calendário com um dia marcado em laranja.',
        rowsTitle: 'Sua apólice',
        rows: [['Veículo', 'Onix Plus 2022'], ['Cobertura', 'Compreensiva'], ['Vencimento', '26 nov. 2026']],
        text: 'Mudou algo no último ano? Novo endereço, outro motorista ou garagem diferente: conte para a gente na cotação.',
        cta: 'Cotar a renovação',
      },
      en: {
        subject: 'Carlos, your car insurance expires in 30 days',
        preheader: "Renew early and never go uncovered. We'll get quotes from our partner insurers for you.",
        kicker: 'Renewal reminder', title: 'Your car insurance expires in 30 days.',
        intro: "Hi Carlos. So you're never without cover for a single day, we can already get renewal quotes from our partner insurers and bring you the best option.",
        alt: 'A navy car next to a calendar with one day marked in orange.',
        rowsTitle: 'Your policy',
        rows: [['Vehicle', 'Onix Plus 2022'], ['Coverage', 'Comprehensive'], ['Expires', 'Nov 26, 2026']],
        text: 'Anything changed this year? A new address, another driver or a different garage: let us know in the quote.',
        cta: 'Get a renewal quote',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open({ top: false }),
      k.hero({ art: 'renovacao', alt: c.alt, bg: '#e8eefb', top: false }),
      k.intro(c), k.rows(c.rows, { title: c.rowsTitle }), k.text(c.text),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
  {
    id: 'boas-vindas',
    type: 'welcome',
    copy: {
      pt: {
        subject: 'Bem-vindo à MS Corretora',
        preheader: 'Seu seguro está com a gente. Veja o que mais podemos proteger.',
        kicker: 'Boas-vindas', title: 'Agora você tem uma corretora do seu lado.',
        intro: 'Obrigado pela confiança. A partir de hoje, renovação, dúvida ou sinistro: é só chamar a gente, que cuidamos da conversa com a seguradora.',
        alt: 'Um escudo laranja com um sinal de aprovado, cercado por ícones de carro, casa, coração e avião.',
        tiles: [
          { title: 'Seguro auto e moto', text: 'Cobertura para o dia a dia e para a estrada.' },
          { title: 'Seguro residencial', text: 'Proteção para a casa e o que tem dentro.' },
          { title: 'Seguro de vida', text: 'Tranquilidade para quem depende de você.' },
          { title: 'Seguro viagem', text: 'Assistência para viajar sem preocupação.' },
        ],
        more: 'Tem empresa? Fazemos **seguro empresarial** também.',
        cta: 'Falar com a MS Corretora',
      },
      en: {
        subject: 'Welcome to MS Insurance Brokers',
        preheader: "Your policy is with us. Here's what else we can protect.",
        kicker: 'Welcome', title: 'You now have a broker on your side.',
        intro: 'Thanks for trusting us. From today on, renewals, questions or claims: just reach out and we handle the conversation with the insurer.',
        alt: 'An orange shield with a check mark, surrounded by car, house, heart and plane icons.',
        tiles: [
          { title: 'Car and motorcycle', text: 'Cover for daily driving and the open road.' },
          { title: 'Home insurance', text: 'Protection for your home and what is inside.' },
          { title: 'Life insurance', text: 'Peace of mind for the people who rely on you.' },
          { title: 'Travel insurance', text: 'Assistance so you can travel worry-free.' },
        ],
        more: 'Run a business? We do **business insurance** too.',
        cta: 'Talk to MS Insurance Brokers',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open({ top: false }),
      k.hero({ art: 'boas-vindas', alt: c.alt, bg: '#0c1f4a', top: false }),
      k.intro(c), k.tiles(c.tiles), k.text(c.more, { top: 8 }),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
];
