// Página Email Design. Os textos dos cards (assuntos, tipos, alt) saem do mesmo catálogo
// que escreve a página em português: scripts/emails/catalog.mjs.
import { catalog, cardText, FILTERS } from '../../emails/catalog.mjs';

const cards = {};
for (const group of await catalog()) {
  cards[group.pt.title] = group.en.title;
  cards[group.pt.text] = group.en.text;
  if (group.badge) cards[group.badge.pt] = group.badge.en;
  for (const item of group.items) {
    const pt = cardText(item, 'pt');
    const en = cardText(item, 'en');
    cards[item.subject.pt] = item.subject.en;
    cards[pt.type] = en.type;
    cards[pt.alt] = en.alt;
    cards[pt.open] = en.open;
  }
}
for (const f of FILTERS) cards[f.pt] = f.en;
// nos atributos (alt, aria-label) as aspas aparecem como &quot;
for (const [pt, en] of Object.entries(cards)) if (pt.includes('"')) cards[pt.replace(/"/g, '&quot;')] = en.replace(/"/g, '&quot;');

export default {
  pt: 'projetos/email-design/index.html',
  en: 'en/projects/email-design/index.html',
  ptUrl: '/projetos/email-design/',
  enUrl: '/en/projects/email-design/',
  // emails e prévias na versão em inglês (os reais de CRM só existem em português)
  raw: [
    ['/projetos/email-design/emails/', '/en/projects/email-design/emails/'],
    ['-pt-claro.webp', '-en-claro.webp'],
    ['-pt-escuro.webp', '-en-escuro.webp'],
    ['-pt-celular.webp', '-en-celular.webp'],
  ],
  dict: {
    ...cards,
    'Email Design: emails HTML para CRM e marketing | João Alberto': 'Email Design: HTML emails for CRM and marketing | João Alberto',
    'Portfólio de email design de João Alberto: emails HTML responsivos, com modo escuro e compatíveis com o Outlook, para CRM, lançamentos, transacionais e newsletters.': 'Email design portfolio by João Alberto: responsive HTML emails with dark mode and Outlook support, for CRM, launches, transactional emails and newsletters.',
    'Emails HTML de João Alberto no modo claro, no escuro e no celular': 'HTML emails by João Alberto in light mode, dark mode and on mobile',
    'Email Design': 'Email Design',
    'Emails HTML que funcionam do Gmail ao Outlook, no modo claro e no escuro. Campanhas de CRM em produção e sequências para SaaS, e-commerce, finanças e conteúdo.': 'HTML emails that work from Gmail to Outlook, in light and dark mode. CRM campaigns in production and sequences for SaaS, e-commerce, finance and content.',
    'Em cada email': 'In every email',
    'HTML para email': 'Email HTML',
    'Layout em tabelas e estilos inline, pensado para Gmail, Apple Mail e Outlook.': 'Table-based layout and inline styles, built for Gmail, Apple Mail and Outlook.',
    'Outlook no Windows': 'Outlook on Windows',
    'Botões em VML e ajustes condicionais para o Outlook desktop, que ignora boa parte do CSS.': 'VML buttons and conditional fixes for desktop Outlook, which ignores much of CSS.',
    'Modo escuro': 'Dark mode',
    'Cores e logo próprios para o modo escuro, inclusive no Outlook.com e no app do Outlook.': 'Dedicated dark-mode colors and logo, including Outlook.com and the Outlook app.',
    'Responsivo': 'Responsive',
    'Colunas que empilham, imagens fluidas e textos ajustados para telas pequenas.': 'Columns that stack, fluid images and type tuned for small screens.',
    'Acessibilidade': 'Accessibility',
    'Texto alternativo nas imagens, idioma declarado, pré-cabeçalho e leitura mesmo com as imagens bloqueadas.': 'Alt text on images, declared language, preheader and a readable email even with images blocked.',
    'CRM e ciclo de vida': 'CRM and lifecycle',
    'Boas-vindas, onboarding, carrinho abandonado, transacionais, segurança e newsletters.': 'Welcome, onboarding, abandoned cart, transactional, security and newsletters.',
    'Filtrar emails por tipo': 'Filter emails by type',
    'Todos': 'All',
    'Ver o HTML': 'View the HTML',
    'Versão do email': 'Email version',
    'Claro': 'Light',
    'Escuro': 'Dark',
    'Celular': 'Mobile',
    'Fechar a prévia': 'Close the preview',
    'CRM': 'CRM',
    'Maré Café': 'Maré Café',
  },
  jsonDict: {
    'Email Design | João Alberto': 'Email Design | João Alberto',
    'Portfólio de email design de João Alberto: emails HTML responsivos, com modo escuro e compatíveis com o Outlook, para CRM, lançamentos, transacionais e newsletters.': 'Email design portfolio by João Alberto: responsive HTML emails with dark mode and Outlook support, for CRM, launches, transactional emails and newsletters.',
    'Email HTML': 'HTML email',
  },
};
