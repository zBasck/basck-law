# Changelog

Todas as mudanças notáveis do Basck Law são registradas aqui.
O projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.1] — 2026-07-18

### Corrigido
- **Tela preta ao abrir o app**: o `app.js` tinha `data-type="module"` no `<script>`, o que fazia o Babel-standalone ignorar o arquivo silenciosamente. Removido o `data-type="module"` e o React agora monta corretamente.
- Adicionado **handler global de erro** que exibe uma caixa visível quando o app falha ao iniciar (antes a tela ficava preta sem nenhuma indicação do erro).
- Adicionado **loader de boot** "Basck Law" para dar feedback visual enquanto o React carrega.

## [1.0.0] — 2026-07-18

### Adicionado
- Backend Node 22+ com `node:sqlite` nativo (sem compilação, sem prebuild).
- API REST com 22 endpoints: auth, clientes, casos, prazos, tarefas, documentos, financeiro.
- Frontend React 18 com 8 views (Dashboard, Casos, Prazos, Tarefas, Clientes, Documentos, Financeiro, Configurações).
- Tema dark premium jurídico (paleta tinta + dourado, fontes Cormorant Garamond + Inter).
- Upload de documentos (até 25 MB) com multer.
- Exportação de relatório financeiro em CSV.
- Autenticação JWT, hash de senha com PBKDF2, validações de entrada.
- Persistência local em SQLite (`backend/db/basck.db` criado automaticamente).
