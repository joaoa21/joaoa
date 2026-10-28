// Catálogo da página "Email Design": grupos, tipos e os emails de cada grupo, em PT e EN.
// Usado por page.mjs (escreve os cards na página em português) e por
// scripts/i18n/pages/emaildesign.mjs (dicionário da página em inglês).
// Marcas que não estão em GROUPS (ex.: testes de outras conversas) ficam fora da página.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/* Filtros da página: cada tipo de email cai em um deles. */
export const FILTERS = [
  { id: 'marketing', pt: 'Marketing', en: 'Marketing' },
  { id: 'lifecycle', pt: 'Ciclo de vida', en: 'Lifecycle' },
  { id: 'transactional', pt: 'Transacional', en: 'Transactional' },
];

export const TYPES = {
  launch: { pt: 'Lançamento', en: 'Launch', filter: 'marketing' },
  promo: { pt: 'Promoção', en: 'Promotion', filter: 'marketing' },
  newsletter: { pt: 'Newsletter', en: 'Newsletter', filter: 'marketing' },
  content: { pt: 'Conteúdo', en: 'Content', filter: 'marketing' },
  gamification: { pt: 'Gamificação', en: 'Gamification', filter: 'marketing' },
  tip: { pt: 'Dica de uso', en: 'Product tip', filter: 'lifecycle' },
  welcome: { pt: 'Boas-vindas', en: 'Welcome', filter: 'lifecycle' },
  onboarding: { pt: 'Onboarding', en: 'Onboarding', filter: 'lifecycle' },
  cart: { pt: 'Carrinho abandonado', en: 'Abandoned cart', filter: 'lifecycle' },
  reminder: { pt: 'Lembrete', en: 'Reminder', filter: 'lifecycle' },
  report: { pt: 'Relatório', en: 'Report', filter: 'lifecycle' },
  transactional: { pt: 'Transacional', en: 'Transactional', filter: 'transactional' },
  security: { pt: 'Segurança', en: 'Security', filter: 'transactional' },
};

/* Emails reais de CRM (já publicados na página de iGaming, só em português). */
const REAL = [
  { n: '01', type: 'promo', pt: 'Menino de Ouro: super odd no tênis', en: 'Menino de Ouro: boosted odds on tennis' },
  { n: '02', type: 'promo', pt: 'Le Bunny chegou: 10 giros grátis', en: 'Le Bunny is here: 10 free spins' },
  { n: '03', type: 'promo', pt: 'Promoção relâmpago no Aviator', en: 'Aviator flash promotion' },
  { n: '04', type: 'content', pt: 'Hoje é dia de bola rolando', en: "Game day: today's matches" },
  { n: '05', type: 'gamification', pt: 'Torneio Liga das Nações', en: 'Nations League Tournament' },
  { n: '06', type: 'promo', pt: 'Coelho de Ouro: 50% de cashback', en: 'Coelho de Ouro: 50% cashback' },
  { n: '07', type: 'gamification', pt: 'Missão Aviator', en: 'Aviator mission' },
  { n: '08', type: 'promo', pt: 'Giros extras na recarga', en: 'Extra spins on top-ups' },
];

export const GROUPS = [
  {
    id: 'crm',
    pt: { title: 'CRM em produção', text: 'Campanhas da rotina de CRM de uma plataforma de entretenimento, disparadas para a base pelo Smartico: promoções, torneios, missões e o conteúdo do dia.' },
    en: { title: 'CRM in production', text: 'Campaigns from the CRM routine of an entertainment platform, sent to its user base through Smartico: promotions, tournaments, missions and the daily content.' },
    real: true,
  },
  {
    id: 'saas',
    pt: { title: 'Produto e SaaS', text: 'Lançamento de recurso, dica de uso, relatório semanal e emails de conta: a comunicação que acompanha a pessoa do cadastro ao uso diário.' },
    en: { title: 'Product and SaaS', text: 'Feature launches, product tips, weekly reports and account emails: the messages that follow people from sign-up to daily use.' },
    brands: ['kompres', 'email-generator', 'trackik', 'authik', 'propostaria'],
  },
  {
    id: 'ecommerce',
    pt: { title: 'E-commerce', text: 'Carrinho abandonado, pedido a caminho, coleção nova e liquidação: os momentos em que o email mais pesa na venda.' },
    en: { title: 'E-commerce', text: 'Abandoned cart, order on its way, new collection and sale: the moments where email drives the most revenue.' },
    brands: ['mare', 'lume', 'flora-sophia'],
  },
  {
    id: 'finance',
    pt: { title: 'Finanças e seguros', text: 'Resumo do mês, alerta de acesso, renovação e boas-vindas. Assuntos em que clareza e confiança vêm antes de qualquer oferta.' },
    en: { title: 'Finance and insurance', text: 'Monthly summary, sign-in alert, renewal and welcome. Topics where clarity and trust come before any offer.' },
    brands: ['nimbus', 'ms-corretora'],
  },
  {
    id: 'content',
    pt: { title: 'Conteúdo e newsletter', text: 'Curadoria da semana e guias que levam o leitor de volta ao site, com hierarquia clara entre destaque e lista.' },
    en: { title: 'Content and newsletter', text: 'Weekly picks and guides that bring readers back to the site, with a clear hierarchy between the lead story and the list.' },
    brands: ['novo-save'],
  },
];

/* Largura e altura de um WebP (VP8, VP8L ou VP8X), para o width/height das imagens. */
function webpSize(file) {
  const b = fs.readFileSync(file);
  const kind = b.toString('ascii', 12, 16);
  if (kind === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  if (kind === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
}

const PREVIEWS = '/assets/email-design/previews';

/** Grupos com os emails prontos para a página: textos em PT e EN, imagens e endereços. */
export async function catalog() {
  const out = [];
  for (const g of GROUPS) {
    const items = [];
    if (g.real) {
      for (const r of REAL) {
        const src = `/projetos/igaming/assets/emails/email-${r.n}.webp`;
        const [w, h] = webpSize(path.join(ROOT, src));
        items.push({
          key: `crm-${r.n}`, type: r.type, brand: { pt: 'CRM', en: 'CRM' },
          subject: { pt: r.pt, en: r.en },
          html: `/projetos/igaming/emails/email-${r.n}.html`,
          img: { light: src, w, h },
        });
      }
    } else {
      for (const slug of g.brands) {
        const mod = await import(pathToFileURL(path.join(ROOT, 'scripts/emails/brands', `${slug}.mjs`)).href);
        for (const e of mod.emails) {
          const base = `${PREVIEWS}/${slug}-${e.id}-pt`;
          const [w, h] = webpSize(path.join(ROOT, `${base}-claro.webp`));
          items.push({
            key: `${slug}-${e.id}`, type: e.type, brand: { pt: mod.brand.name, en: mod.brand.name },
            subject: { pt: e.copy.pt.subject, en: e.copy.en.subject },
            html: `/projetos/email-design/emails/${slug}-${e.id}.html`,
            img: { light: `${base}-claro.webp`, dark: `${base}-escuro.webp`, mobile: `${base}-celular.webp`, w, h },
          });
        }
      }
    }
    out.push({ ...g, items });
  }
  return out;
}

/** Textos repetidos dos cards (rótulos e alt das imagens) em PT → EN, para o make.mjs. */
export function cardText(item, lang) {
  const t = TYPES[item.type];
  const s = item.subject[lang];
  return lang === 'pt'
    ? { type: t.pt, alt: `Prévia do email "${s}"`, open: `Abrir a prévia do email "${s}"` }
    : { type: t.en, alt: `Preview of the email "${s}"`, open: `Open the preview of the email "${s}"` };
}
