/* Authik: login dos produtos do João. Emails transacionais que ele manda em nome de cada
   produto (aqui, do Trackik): confirmação de e-mail e aviso de senha alterada.
   Fatos reais: a troca de senha encerra as outras sessões da conta. */
import { brandBuilder } from '../kit.mjs';

export const brand = { slug: 'authik', name: 'Authik', kind: 'own', site: 'https://app.authik.com.br' };

export const build = brandBuilder(() => ({
  c: { bg: '#f6f6f8', card: '#ffffff', text: '#1d1d26', head: '#111117', muted: '#5b5b6b', accent: '#5850ec', onAccent: '#ffffff', kicker: '#5850ec', line: '#e7e7ec', tile: '#f6f6f8' },
  d: { bg: '#09090c', card: '#141418', text: '#e6e6ee', head: '#ffffff', muted: '#a1a1b0', line: '#24242c', tile: '#1b1b22', accentText: '#9d9cff' },
  f: { head: "'Geist', Helvetica, Arial, sans-serif", text: "'Geist', Helvetica, Arial, sans-serif", mono: "'Geist Mono', 'Courier New', monospace" },
  fontsLink: '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;600;700&family=Geist+Mono:wght@500;700&display=swap" rel="stylesheet">',
  radius: 14, btnRadius: 10, h1: 28, h1Weight: 700, h1Spacing: '-0.6px',
  logo: { file: 'logo.png', dark: 'logo-dark.png', w: 92, h: 30, alt: 'Authik' },
  footer: {
    pt: { tagline: 'E-mail automático do Trackik, enviado pelo Authik.', reason: 'Você recebeu este e-mail porque ele está ligado a uma conta no Trackik.' },
    en: { tagline: 'An automated Trackik email, sent by Authik.', reason: 'You received this email because it is linked to a Trackik account.' },
  },
}));

export const emails = [
  {
    id: 'confirmar-email',
    type: 'transactional',
    copy: {
      pt: {
        subject: 'Confirme seu e-mail no Trackik',
        preheader: 'Falta só um clique para ativar sua conta.',
        title: 'Confirme seu e-mail', alt: 'Ícone de envelope',
        intro: 'Olá, Ana. Falta só um passo para ativar sua conta no **Trackik**: confirme que este e-mail é seu.',
        cta: 'Confirmar e-mail',
        fallback: 'Se o botão não funcionar, copie e cole este endereço no navegador: https://app.trackik.com.br/verificar-email?token=…',
        note: 'Não criou uma conta no Trackik? Pode ignorar este e-mail. Sem a confirmação, nenhuma conta é ativada.',
      },
      en: {
        subject: 'Confirm your email on Trackik',
        preheader: "You're one click away from activating your account.",
        title: 'Confirm your email', alt: 'Envelope icon',
        intro: "Hi Ana. One last step to activate your **Trackik** account: confirm that this email is yours.",
        cta: 'Confirm email',
        fallback: "If the button doesn't work, copy and paste this address into your browser: https://app.trackik.com.br/verificar-email?token=…",
        note: "Didn't sign up for Trackik? You can ignore this email. Without confirmation, no account is activated.",
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: 'https://app.trackik.com.br' }),
      k.open(),
      k.badge({ art: 'icone-email', alt: c.alt }),
      k.intro({ title: c.title, text: c.intro, top: 24 }),
      k.cta({ href: 'https://app.trackik.com.br/verificar-email', label: c.cta }),
      k.text(c.fallback, { size: 13, top: 20 }), k.space(16), k.note(c.note), k.space(32),
      k.close(), k.footer(lang),
    ],
  },
  {
    id: 'senha-alterada',
    type: 'security',
    copy: {
      pt: {
        subject: 'A senha da sua conta no Trackik foi alterada',
        preheader: 'Se foi você, está tudo certo. Se não foi, proteja sua conta agora.',
        title: 'Sua senha foi alterada', alt: 'Ícone de cadeado',
        intro: 'A senha da sua conta no **Trackik** acabou de ser trocada. Por segurança, encerramos as sessões abertas em outros aparelhos.',
        rows: [['Conta', 'ana@exemplo.com'], ['Quando', '27 out. 2026, 14:32']],
        text: 'Foi você? Então não precisa fazer nada.',
        cta: 'Não fui eu: redefinir senha',
      },
      en: {
        subject: 'Your Trackik password was changed',
        preheader: "If it was you, you're all set. If not, secure your account now.",
        title: 'Your password was changed', alt: 'Padlock icon',
        intro: 'The password for your **Trackik** account was just changed. For your security, we signed out every other device.',
        rows: [['Account', 'ana@example.com'], ['When', 'Oct 27, 2026, 2:32 PM']],
        text: 'Was it you? Then there is nothing else to do.',
        cta: "It wasn't me: reset password",
      },
    },
    rows: (k, c, lang) => [
      k.header({ href: 'https://app.trackik.com.br' }),
      k.open(),
      k.badge({ art: 'icone-senha', alt: c.alt }),
      k.intro({ title: c.title, text: c.intro, top: 24 }),
      k.rows(c.rows), k.text(c.text),
      k.cta({ href: 'https://app.trackik.com.br/redefinir-senha', label: c.cta }), k.space(36),
      k.close(), k.footer(lang),
    ],
  },
];
