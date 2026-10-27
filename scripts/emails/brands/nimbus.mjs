/* Nimbus: marca FICTÍCIA de conta digital (fintech). Resumo do mês e alerta de segurança.
   Valores, nomes e aparelhos são inventados. Visual escuro com verde-menta. */
import { brandBuilder } from '../kit.mjs';

const SITE = 'https://example.com/nimbus';
export const brand = { slug: 'nimbus', name: 'Nimbus', kind: 'fictional', site: SITE };

export const build = brandBuilder(() => ({
  c: { bg: '#e8f0ef', card: '#ffffff', bar: '#0b1d1f', text: '#14292b', head: '#0b1d1f', muted: '#4f6668', accent: '#0f8a6a', onAccent: '#ffffff', kicker: '#0f8a6a', line: '#d7e3e2', tile: '#f1f6f5', positive: '#0f8a6a', button: '#0b1d1f', link: '#0f8a6a' },
  d: { bg: '#061314', card: '#0b1d1f', text: '#dff3ef', head: '#ffffff', muted: '#9fb8b9', line: '#1b3b3e', tile: '#10292c', accentText: '#5ff2c1' },
  f: { head: "'Space Grotesk', Helvetica, Arial, sans-serif", text: "'Inter', Helvetica, Arial, sans-serif", mono: "'Space Grotesk', Arial, sans-serif" },
  fontsLink: '<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;600&display=swap" rel="stylesheet">',
  radius: 20, btnRadius: 12, h1: 32, h1Weight: 700, h1Spacing: '-1px',
  header: 'bar',
  darkExtra: '.btn { background: #5ff2c1 !important; color: #0b1d1f !important; }',
  logo: { file: 'logo-dark.png', dark: 'logo-dark.png', w: 109, h: 32, alt: 'Nimbus' },
  footer: {
    pt: { tagline: 'Nimbus: sua conta, sem tarifas escondidas.', reason: 'Você recebe este email porque tem uma conta Nimbus.' },
    en: { tagline: 'Nimbus: your account, no hidden fees.', reason: 'You get this email because you have a Nimbus account.' },
  },
}));

export const emails = [
  {
    id: 'resumo-mensal',
    type: 'report',
    copy: {
      pt: {
        subject: 'Seu outubro na Nimbus: você guardou R$ 820',
        preheader: 'Entradas, gastos por categoria e o quanto rendeu sua reserva no mês.',
        kicker: 'Resumo de outubro', title: 'Você guardou R$ 820 este mês.',
        intro: 'Bom mês, Júlia. Seus gastos ficaram 9% abaixo de setembro e a reserva seguiu rendendo todo dia.',
        alt: 'Gráfico de linha verde-menta subindo ao longo do mês.',
        stats: [{ label: 'Entrou', value: 'R$ 6.400' }, { label: 'Saiu', value: 'R$ 5.580', delta: '−9%' }, { label: 'Rendeu', value: 'R$ 48,30' }],
        rowsTitle: 'Onde você mais gastou',
        rows: [['Moradia', 'R$ 2.100'], ['Mercado', 'R$ 1.240'], ['Transporte', 'R$ 610'], ['Lazer', 'R$ 480']],
        cta: 'Ver o extrato completo',
      },
      en: {
        subject: 'Your October with Nimbus: you saved R$ 820',
        preheader: 'Income, spending by category and how much your savings earned this month.',
        kicker: 'October summary', title: 'You saved R$ 820 this month.',
        intro: 'Nice month, Júlia. Your spending was 9% lower than September and your savings kept earning every day.',
        alt: 'A mint-green line chart rising over the month.',
        stats: [{ label: 'In', value: 'R$ 6,400' }, { label: 'Out', value: 'R$ 5,580', delta: '−9%' }, { label: 'Earned', value: 'R$ 48.30' }],
        rowsTitle: 'Where you spent the most',
        rows: [['Housing', 'R$ 2,100'], ['Groceries', 'R$ 1,240'], ['Transport', 'R$ 610'], ['Leisure', 'R$ 480']],
        cta: 'See the full statement',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open({ top: false }),
      k.hero({ art: 'mes', alt: c.alt, bg: '#0b1d1f', top: false }),
      k.intro(c), k.stats(c.stats), k.rows(c.rows, { title: c.rowsTitle }),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
  {
    id: 'novo-acesso',
    type: 'security',
    copy: {
      pt: {
        subject: 'Novo acesso à sua conta Nimbus',
        preheader: 'Um aparelho novo entrou na sua conta. Foi você?',
        title: 'Foi você que entrou agora?', alt: 'Ícone de alerta',
        intro: 'Detectamos um acesso à sua conta Nimbus a partir de um aparelho que ainda não conhecíamos.',
        rows: [['Aparelho', 'iPhone 15 · App Nimbus'], ['Local aproximado', 'Recife, PE'], ['Quando', '27 out. 2026, 21:07']],
        text: 'Se foi você, pode ignorar este e-mail. Se não reconhece este acesso, bloqueie agora: leva menos de um minuto.',
        cta: 'Não fui eu: bloquear acesso',
        note: '**A Nimbus nunca pede sua senha** por e-mail, telefone ou mensagem.',
      },
      en: {
        subject: 'New sign-in to your Nimbus account',
        preheader: 'A new device signed in to your account. Was it you?',
        title: 'Was that you just now?', alt: 'Warning icon',
        intro: "We noticed a sign-in to your Nimbus account from a device we haven't seen before.",
        rows: [['Device', 'iPhone 15 · Nimbus app'], ['Approximate location', 'Recife, Brazil'], ['When', 'Oct 27, 2026, 9:07 PM']],
        text: "If it was you, you can ignore this email. If you don't recognize this sign-in, block it now: it takes less than a minute.",
        cta: "It wasn't me: block access",
        note: '**Nimbus will never ask for your password** by email, phone or text.',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open({ top: false }),
      k.badge({ art: 'icone-alerta', alt: c.alt }),
      k.intro({ title: c.title, text: c.intro, top: 24 }),
      k.rows(c.rows), k.text(c.text),
      k.cta({ href: SITE, label: c.cta }), k.space(8), k.note(c.note), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
];
