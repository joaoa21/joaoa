# João Alberto — portfólio

Site pessoal em HTML, CSS e JavaScript, sem etapa de build. Publicado em [joaoa.com.br](https://joaoa.com.br) pelo Netlify a partir da branch `main`.

## Páginas

| Rota | Arquivos | O que é |
| --- | --- | --- |
| `/` | `index.html`, `style.css`, `main.js`, `blob.js` | Home, com o blob 3D e as animações de entrada (`assets/js/home-motion.js`) |
| `/projetos/` | `projetos/index.html` | Hub com todas as categorias |
| `/projetos/igaming/` | `projetos/igaming/` | Peças de CRM e gamificação, emails em HTML e o Clube de Ouro |
| `/projetos/oab/` | `projetos/oab/` | Case da campanha OAB/PE 2024 |
| `/projetos/sites/` | `projetos/sites/` | Índice e cases do Kompres e do Email Generator |
| `/projetos/identidade-visual/` | `projetos/identidade-visual/` | Página "em obras" (`noindex`) até os cases ficarem prontos |
| `/links/` | `links/` | Página de links para a bio (`noindex`) |
| `/cv/` | `cv/` | Currículo, com versão ATS para impressão/PDF em uma página (`noindex, nofollow`) |
| 404 / 403 | `404.html`, `403.html`, `error.*` | Páginas de erro com a TV animada |

## Estrutura compartilhada

- **Estilos** em `assets/css/`:
  - `hub.css`: base das páginas internas (navegação, HUD, cards, botões).
  - `case.css`: cases e galerias.
  - `portfolio.css`: visualizador de peças.
  - `contact-socials.css`: bloco de redes sociais.
  - `igaming.css`, `sites.css` e `obras.css`: estilos das páginas específicas.
  - `mobile-home.css`: ajustes da home no celular.
- **Scripts** em `assets/js/`:
  - `blob-core.js`: núcleo do blob em Three.js (renderizador, shader, mouse, loop), usado pela home, projetos, links e páginas de erro.
  - `blob-hub.js`: posição e comportamento do blob no hub de projetos.
  - `hub.js`: navegação, Lenis e animações do hub.
  - `case.js`: animações dos cases (OAB e sites).
  - `igaming-motion.js` e `club-preview.js`: página de iGaming e modal do Clube de Ouro.
  - `gallery.js`: ampliação das peças num `<dialog>` acessível.
  - `nav.js`: menu.
- **Imagens**: cada projeto guarda os originais em `assets/` e as miniaturas em `assets/thumbs/`. As galerias carregam as miniaturas, e o original só baixa quando a peça é ampliada.
- **Rotas antigas** ficam em `_redirects`: `/portfolio/*` vai para `/projetos/igaming/*`, e o HTML antigo da OAB, para o case novo.

## Animações

Todas as páginas usam GSAP 3 (ScrollTrigger e SplitText) e Lenis, carregados do jsDelivr.

O conteúdo animado começa escondido por CSS só quando o JavaScript está ativo: `html.js:not(.reduce-motion):not(.motion-fallback)`. Cada página agenda um *fallback* no `<head>` que mostra tudo se o script não assumir a tempo. Com "reduzir movimento" ativado no sistema, nada é animado. As peças das galerias só aparecem depois que a imagem carregou.

## Rodar localmente

```bash
node scripts/preview.mjs
```

Abra http://127.0.0.1:4173. O servidor aplica os `_redirects` e serve a 404. Abrir os arquivos direto pelo explorador não funciona, por causa dos módulos e dos caminhos absolutos.

```bash
node scripts/check-site.mjs
```

Esse comando confere referências locais, âncoras, maiúsculas e minúsculas em caminhos, sintaxe JavaScript e se o bloco de redes sociais é igual em todas as páginas.

## Publicação

O Netlify publica a branch `main` automaticamente a cada push, servindo a raiz do repositório. Para testar mudanças maiores, trabalhe numa branch e abra um deploy preview antes de levar para a `main`.

O analytics só carrega no domínio publicado (`joaoa.com.br`), então testes locais e deploy previews não entram na contagem.
