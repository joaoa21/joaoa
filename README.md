# João Alberto — redesign v2

Site estático em HTML, CSS e JavaScript. Branch de trabalho: redesign-v2.

## Estrutura

- Home: index.html, style.css, main.js e blob.js.
- Ajustes exclusivos da Home mobile: assets/css/mobile-home.css.
- Projetos: projetos/; iGaming, identidade visual, sites e campanha OAB/PE.
- Estilos e interações compartilhados: assets/css e assets/js.
- Currículo e página de links: cv/ e links/.
- Imagens originais da OAB: projetos/oab/assets; miniaturas: assets/thumbs dentro dessa pasta.
- Variações antigas preservadas sem sobrescrever as atuais: assets/originais/.
- Rotas antigas: _redirects. O host precisa oferecer suporte a esse formato.

## Verificação

Execute node scripts/check-site.mjs para conferir referências locais, âncoras, maiúsculas/minúsculas e sintaxe JavaScript.

Execute node scripts/preview.mjs e abra http://127.0.0.1:4173 para testar (inclui os redirecionamentos antigos); abrir os HTML diretamente pelo explorador não suporta os módulos e caminhos absolutos do site.

## Conteúdo

Todas as 127 imagens da pasta joaoa foram conferidas por SHA-256 e preservadas na v2 (inclusive as já existentes e as variações antigas). As páginas de ferramentas usam os textos, links e ilustrações que já faziam parte do projeto. A categoria Identidade Visual apresenta a campanha OAB/PE, que possui material disponível. Não foram inventados clientes, resultados ou novos trabalhos.

As galerias ampliam as peças com um diálogo acessível. Feche pelo botão ou pela tecla Escape.

## Publicação

O trabalho está salvo localmente. Publicar exige enviar a branch ao repositório e usar o fluxo de hospedagem do projeto. O sitemap usa o domínio joaoa.com.br.
