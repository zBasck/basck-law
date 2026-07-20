# Changelog — Basck Law

Todas as alteracoes relevantes do projeto sao documentadas aqui.
O versionamento segue SemVer.

## [1.2.3] - 2026-07-20

### Corrigido
- **ReferenceError: global is not defined** — os 9 arquivos JSX usavam `global.BasckApi`, `global.BasckUI` etc. (variavel Node.js). No navegador isso e ReferenceError logo no primeiro script. Substituido por `window.` (11 referencias nos 5 arquivos do frontend).
## [1.1.2] - 2026-07-20

### Corrigido
- **Tela preta definitiva**: substituido o Babel-standalone no navegador por pre-compilacao
  com esbuild no servidor. O bundle.js agora e JS puro, sem JSX, sem import.
- **Cache do navegador em HTML**: removida a dependencia do Babel-standalone CDN, que
  ocasionalmente retornava HTML quando offline e quebrava o app.
- **SPA fallback**: agora so redireciona rotas que NAO tem extensao, evitando que
  arquivos estaticos caiam no fallback do index.html.
- **Ordem dos middlewares**: express.static agora vem antes do SPA fallback, garantindo
  que /dist/bundle.js, /css/app.css e /js/* sejam servidos corretamente.

### Adicionado
- **backend/build-bundle.js**: novo modulo que compila os 6 JSX em
  frontend/dist/bundle.js usando esbuild (binario nativo, ~50ms).
- **esbuild** como dependencia de desenvolvimento.

### Mudado
- **frontend/index.html**: removido o script do Babel-standalone. O app agora
  carrega apenas React, ReactDOM e /dist/bundle.js.
- **Comando npm start**: agora roda o build do bundle antes de subir o servidor
  (automatico, transparente para o usuario).

## [1.1.1] - 2026-07-19

### Corrigido
- **Tela preta**: o index.html da v1.1.0 carregava 5 arquivos JSX como <script src>,
  mas o navegador executa JSX como JS puro e quebrava. Solucao: concatenar os 6 JSX
  em frontend/dist/bundle.jsx (Babel-standalone compila on-the-fly).

## [1.1.0] - 2026-07-19

### Adicionado
- Calculo automatico de prazos em dias uteis (CPC art. 219) com auditoria.
- Busca global Ctrl+K (clientes, casos, prazos, tarefas).
- Rate limit no endpoint /api/auth/login (5 tentativas/minuto).
- Borda vermelha em prazos criticos (<= 3 dias) no Dashboard e em Prazos.
- Badge de versao no rodape do app.
- Migracoes aditivas de schema.

## [1.0.0] - 2026-07-18

### Adicionado
- Backend Node 22+ com node:sqlite (zero dependencia nativa, zero build).
- 7 models, 7 controllers, 22 rotas REST, autenticacao JWT.
- Frontend React 18 via CDN, 8 views, tema dark premium, 6 modais de CRUD.
- Upload de documentos (25 MB), busca, exportacao CSV, dashboard com KPIs.

[1.1.2]: https://github.com/zBasck/basck-law/releases/tag/v1.1.2
[1.1.1]: https://github.com/zBasck/basck-law/releases/tag/v1.1.1
[1.1.0]: https://github.com/zBasck/basck-law/releases/tag/v1.1.0
[1.0.0]: https://github.com/zBasck/basck-law/releases/tag/v1.0.0
