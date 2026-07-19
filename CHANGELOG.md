# Changelog

Todas as mudancas notaveis do Basck Law serao documentadas aqui. O projeto segue [Semantic Versioning](https://semver.org/).

## [1.1.1] - 2026-07-19

### Corrigido
- **Tela preta com `Unexpected token '<'` em todos os .js**: a v1.1.0 carregava 5 arquivos JSX (`api.js`, `auth.js`, `ui.js`, `modals.js`, `busca.js`) como `<script src="...">` (JS puro) atraves do Babel-standalone, mas o conteudo continha JSX (`<div>`, `<form>`, etc). O navegador tentava parsear `<` como JavaScript e quebrava.
- **Solucao**: build automatico de um unico `frontend/dist/bundle.jsx` concatenando os 6 arquivos JSX (api, auth, modals, ui, busca, app). O `index.html` agora carrega apenas `<script type="text/babel" data-presets="react" src="/dist/bundle.jsx">`, que o Babel compila de uma vez sem deixar nenhum `<` escapar.
- O build acontece automaticamente em `npm start` (via `backend/build-bundle.js`). Zero comandos manuais.

### Adicionado
- `backend/build-bundle.js`: script de build que concatena os 6 JSX em `frontend/dist/bundle.jsx` na inicializacao do servidor.
- `frontend/dist/.gitkeep`: garante que a pasta de build seja versionada mesmo antes do primeiro start.

### Mudancas
- `package.json` bumped para `1.1.1`.
- `frontend/index.html` reduzido de 6 tags `<script>` para 1 unica tag do bundle.

## [1.1.0] - 2026-07-18

### Adicionado
- **Calculo automatico de prazos em dias uteis** (CPC art. 219) via `POST /api/prazos/calcular`
  - Suporta contagem em dias uteis ou corridos
  - Considera feriados nacionais federais + Páscoa, Carnaval, Corpus Christi
  - Auditoria completa do calculo (passo-a-passo) salva em `calculo_detalhes`
  - Endpoint permite salvar o prazo calculado ja vinculado a um caso
- **Busca global com Ctrl+K / Cmd+K**
  - Modal busca por clientes, casos, prazos e tarefas
  - Atalho de teclado funciona em qualquer lugar do app
  - Navegacao por setas + Enter para abrir
- **Rate limit no login**: 5 tentativas por minuto por IP (protecao basica contra forca bruta). Retorna 429 com headers `X-RateLimit-*`.
- **Indicador visual de prazo critico**: borda lateral vermelha em prazos com vencimento <= 3 dias (Dashboard e view de Prazos).
- **Badge de versao** no canto inferior direito do app.
- **Endpoint de busca**: `GET /api/busca?q=...` retorna resultados agrupados por entidade.
- **Health check** agora retorna a versao do `package.json`.
- **Migracoes aditivas de schema** no `init.js` (tolerantes a "duplicate column" para upgrades sem perder dados).
- **`asyncHandler`** middleware para captura robusta de erros em controllers async.

### Mudancas
- `package.json` bumped para `1.1.0`.
- Schema ganha colunas `calculo_detalhes` e `calculo_regra` em `prazos` (via migracao aditiva).
- Frontend agora usa `BasckApi.busca()`, `BasckApi.prazos.calcular()` (no proximo front).

## [1.0.1] - 2026-07-18

### Corrigido
- Tela preta no carregamento: o `<script>` do `app.js` tinha `data-type="module"`, que faz o Babel-standalone **ignorar** o script. Removido o atributo.
- Adicionado handler global de erro visivel para a proxima vez que algo falhar na inicializacao.
- Adicionado loader de boot "Basck Law" que some quando o React monta.

## [1.0.0] - 2026-07-18

### Adicionado
- MVP inicial: backend Express + SQLite (`node:sqlite` nativo do Node 22+), frontend React 18 via CDN, autenticacao JWT, CRUD de clientes/casos/prazos/tarefas/documentos/lancamentos financeiros, dashboard, busca, exportacao CSV.
