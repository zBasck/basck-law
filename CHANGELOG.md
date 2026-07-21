# Changelog — Basck Law

Todas as alteracoes relevantes do projeto sao documentadas aqui.
O versionamento segue SemVer.

## [1.2.6] - 2026-07-20

### Corrigido
- **`isPositiveInt is not a function`** no `controllers/compromissos.js`: funcao nao estava
  exportada em `middleware/validacoes.js`. Adicionada. Tambem movido o `require('./erros')`
  para o topo do arquivo (estava no final).
- **`Coluna invalida`** ao mover para "Em revisao" no Kanban: o model usava `revisao` mas
  o frontend enviava `em_revisao`. Padronizado para `em_revisao` no `models/kanban.js`.
- **`numero_oab obrigatorio`** no monitoramento de OAB: o form enviava `numero` mas o
  controller esperava `numero_oab`. Renomeado o campo no `OabForm`.
- **Sem select de tribunais** em Integrações: o backend retornava `{id, nome}` e o form
  tentava ler `t.sigla`. Corrigido para `t.id`. Lista de tribunais ampliada de 9 para 27
  (inclui STF, STJ, TST, 6 TRFs, 10 TJs, 4 TRTs e OAB).
- **Compromissos nao salvavam**: enums de `tipo` estavam dessincronizados (backend aceitava
  `prazo_judicial`/`sessao`, frontend enviava `prazo_fatal`). Sincronizado.
- **Kanban nao espelhava tarefas**: adicionado `inicializarTarefas` no `KanbanModel`,
  hooks em `TarefaModel.criar/atualizar/concluir/remover` para criar/mover/remover o
  cartao kanban espelhado, e migration aditiva para `kanban_coluna`/`kanban_posicao` em
  `tarefas`. Agora tarefas criadas aparecem no Kanban e vice-versa.

## [1.2.5] - 2026-07-20
## [1.2.5] - 2026-07-20

### Corrigido
- **React error #130 nas abas Compromissos/Kanban/Integrações**: o  definia as 3 views mas a exportação  só listava as 8 views antigas. Adicionadas  no export.
- **ReferenceError: global is not defined** (ressurgiu na v1.2.4): 10 referências a  substituídas por  em . O navegador não tem  (só Node.js tem), daí o  quebrava antes de renderizar.

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

## [1.2.7] - 2026-07-21

### Corrigido
- Integrações: `consultar()` agora chama o DataJud CNJ de verdade (HTTPS nativo, API Key, query por `numeroProcesso`, tratamento de 401/404/timeout). Sem credencial, mostra mensagem clara pedindo a chave.
- Integrações: adicionado `verificarOabUm()` (controller já chamava, mas o método não existia no model — causava 500).
- Integrações: `IntegracaoForm` agora envia `tipo_credencial: "api_key"` por padrão (controller rejeitava sem isso).

### Mudanças
- OAB Nacional: como não há API pública de consulta por número/UF, valida o formato e orienta consulta manual em https://cna.oab.org.br.
