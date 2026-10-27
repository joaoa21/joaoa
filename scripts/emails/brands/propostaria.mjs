/* Propostaria (propostaria.com.br): app de propostas comerciais. Cliente: o João fez a landing.
   Estes emails são um CONCEITO, não foram pedidos nem enviados pela Propostaria.
   Usa o exemplo da própria landing ("Reforma do apartamento 802", R$ 18.400,00). */
import { brandBuilder } from '../kit.mjs';

const SITE = 'https://propostaria.com.br';
export const brand = { slug: 'propostaria', name: 'Propostaria', kind: 'client', site: SITE };

export const build = brandBuilder(() => ({
  c: { bg: '#e9eae6', card: '#fcfcfa', text: '#1a1e2b', head: '#1a1e2b', muted: '#5e6371', accent: '#2440c8', onAccent: '#ffffff', kicker: '#6b3fa0', line: '#d5d9e2', tile: '#f1f2ef' },
  d: { bg: '#11131a', card: '#1a1d27', text: '#e7ebfb', head: '#ffffff', muted: '#9a9ea8', line: '#2c3040', tile: '#232737', accentText: '#b7a2e0' },
  f: { head: "'Instrument Sans', Helvetica, Arial, sans-serif", text: "'Instrument Sans', Helvetica, Arial, sans-serif", mono: "'Instrument Sans', Arial, sans-serif" },
  fontsLink: '<link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet">',
  radius: 10, btnRadius: 8, h1: 32, h1Weight: 600, h1Spacing: '-0.8px',
  logo: { file: 'logo.png', dark: 'logo-dark.png', w: 141, h: 40, alt: 'Propostaria' },
  footer: {
    pt: { tagline: 'Propostas que o cliente lê até o fim e assina.', reason: 'Você recebeu este email porque tem uma conta na Propostaria.' },
    en: { tagline: 'Proposals clients read to the end and sign.', reason: 'You are receiving this email because you have a Propostaria account.' },
  },
}));

export const emails = [
  {
    id: 'proposta-assinada',
    type: 'transactional',
    copy: {
      pt: {
        subject: 'Marina Alves assinou a proposta "Reforma do apartamento 802"',
        preheader: 'O sim veio assinado: R$ 18.400,00, com pagamento por Pix.',
        kicker: 'Proposta aceita', title: 'O sim veio assinado.',
        intro: '**Marina Alves** aceitou e assinou a proposta agora há pouco. O documento assinado já está guardado na sua conta.',
        alt: 'Uma proposta com a assinatura de Marina Alves e um carimbo de aprovado.',
        rows: [['Proposta', 'Reforma do apartamento 802'], ['Valor', 'R$ 18.400,00'], ['Pagamento escolhido', 'Pix'], ['Assinada em', '27 out. 2026, 10:14']],
        text: 'Próximo passo: combinar o início da obra com a Marina.',
        cta: 'Ver a proposta assinada',
      },
      en: {
        subject: 'Marina Alves signed the proposal "Apartment 802 renovation"',
        preheader: 'The yes came signed: R$ 18,400.00, paid by Pix.',
        kicker: 'Proposal accepted', title: 'The yes came signed.',
        intro: '**Marina Alves** accepted and signed your proposal a moment ago. The signed document is already saved in your account.',
        alt: 'A proposal signed by Marina Alves with an approved stamp.',
        rows: [['Proposal', 'Apartment 802 renovation'], ['Amount', 'R$ 18,400.00'], ['Payment method', 'Pix'], ['Signed on', 'Oct 27, 2026, 10:14 AM']],
        text: 'Next step: schedule the start of the work with Marina.',
        cta: 'View the signed proposal',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'assinada', alt: c.alt, bg: '#e9eae6' }),
      k.intro(c), k.rows(c.rows), k.text(c.text),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
  {
    id: 'primeira-proposta',
    type: 'onboarding',
    copy: {
      pt: {
        subject: 'Sua primeira proposta pode sair hoje',
        preheader: 'Do primeiro contato ao aceite, em três passos.',
        kicker: 'Boas-vindas', title: 'Do primeiro contato ao aceite, em três passos.',
        intro: 'Que bom ter você na Propostaria. A primeira proposta costuma levar poucos minutos:',
        alt: 'Três cartões numerados ligados por setas, o último com uma assinatura.',
        steps: [
          '**Escolha o seu ramo.** A proposta já vem com as seções certas para o seu tipo de serviço.',
          '**Monte e envie o link.** O cliente abre no celular, sem baixar PDF.',
          '**Receba o aceite.** Ele assina ali mesmo, e você sabe em que pé está cada proposta.',
        ],
        note: '**Dica:** defina desconto no Pix e parcelas no cartão. A proposta mostra as condições, e o cliente escolhe como pagar.',
        cta: 'Criar minha primeira proposta',
      },
      en: {
        subject: 'Your first proposal can go out today',
        preheader: 'From first contact to signed deal, in three steps.',
        kicker: 'Welcome', title: 'From first contact to signed deal, in three steps.',
        intro: 'Great to have you on Propostaria. Your first proposal usually takes just a few minutes:',
        alt: 'Three numbered cards linked by arrows, the last one with a signature.',
        steps: [
          '**Pick your industry.** The proposal starts with the right sections for your kind of service.',
          '**Build it and send the link.** Your client opens it on their phone, no PDF download.',
          '**Get the signature.** They sign right there, and you always know where each proposal stands.',
        ],
        note: '**Tip:** set a Pix discount and card installments. The proposal shows the terms and the client picks how to pay.',
        cta: 'Create my first proposal',
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: SITE }),
      k.open(),
      k.hero({ art: 'etapas', alt: c.alt, bg: '#fcfcfa' }),
      k.intro(c), k.steps(c.steps), k.note(c.note),
      k.cta({ href: SITE, label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
];
