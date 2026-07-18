# Changelog

Todas as mudancas notaveis do Basck Law serao documentadas aqui. O projeto segue [Semantic Versioning](https://semver.org/).

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
