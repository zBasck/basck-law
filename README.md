# Basck Law

Plataforma SaaS jurídica para advogados autônomos e pequenos escritórios — gestão de casos, clientes, prazos, tarefas, documentos e financeiro em um único lugar.

## ✨ Funcionalidades

- **Autenticação completa** — cadastro, login, JWT, proteção de rotas
- **Casos** — pastas digitais com cliente, tribunal, área, valor da causa, status
- **Prazos** — com tipo de contagem (dias úteis ou corridos), prioridade e conclusão
- **Tarefas** — checklist do escritório, vinculadas opcionalmente a casos
- **Clientes** — cadastro completo com documento, contato, endereço
- **Documentos** — upload de PDFs/DOCs/imagens, download, controle de espaço
- **Financeiro** — honorários, despesas e reembolsos; resumo recebido/pendente; exportação CSV
- **Dashboard** — KPIs ao vivo, prazos críticos, casos recentes
- **Configurações** — perfil, OAB, plano

## 🧱 Stack

- **Backend:** Node.js 22+ (com `node:sqlite` nativo), Express 4, JWT, Multer, PBKDF2 (hash de senhas)
- **Frontend:** React 18 (via CDN), Babel-standalone, CSS puro com tema dark premium
- **Banco:** SQLite (arquivo único em `backend/db/basck.db`, criado automaticamente)
- **Zero dependências nativas** — não precisa de Visual Studio Build Tools nem Python para compilar

## 📋 Pré-requisitos

- **Node.js 22 ou superior** (recomendado: LTS 22+). Baixe em https://nodejs.org/
- npm (já vem com o Node)

## 🚀 Como rodar

```bash
# 1. Instale as dependências
npm install

# 2. Inicie o servidor
npm start
```

O servidor sobe em `http://localhost:3000`. Abra no navegador e cadastre sua conta — o banco SQLite é criado automaticamente na primeira execução.

Para mudar a porta ou outras configurações, copie `.env.example` para `.env` e ajuste:

```bash
cp .env.example .env
# edite .env com seu editor favorito
```

## 📁 Estrutura

```
basck-law/
├── backend/
│   ├── server.js              # servidor Express
│   ├── config/upload.js       # multer (upload de arquivos)
│   ├── db/
│   │   ├── schema.sql         # schema do banco
│   │   └── init.js            # inicialização (node:sqlite)
│   ├── models/                # 7 modelos (cliente, caso, prazo, etc.)
│   ├── controllers/           # 7 controllers REST
│   ├── routes/                # 7 rotas REST
│   └── middleware/            # auth (JWT), erros, validações
├── frontend/
│   ├── index.html             # shell HTML
│   ├── css/app.css            # tema dark
│   └── js/
│       ├── api.js             # cliente HTTP
│       ├── auth.js            # tela de login/cadastro
│       ├── ui.js              # 8 views
│       ├── modals.js          # formulários modais
│       └── app.js             # roteamento + toasts
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 🔌 API

Todos os endpoints (exceto `/api/saude` e `/api/auth/cadastro|login`) exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/saude` | Health check |
| POST | `/api/auth/cadastro` | Criar conta |
| POST | `/api/auth/login` | Login (retorna JWT) |
| GET / PUT | `/api/auth/perfil` | Ver / atualizar perfil |
| GET / POST | `/api/clientes` | Listar / criar clientes |
| GET / PUT / DELETE | `/api/clientes/:id` | CRUD de um cliente |
| GET / POST | `/api/casos` | Listar / criar casos |
| GET | `/api/casos/estatisticas` | KPIs de casos |
| GET / PUT / DELETE | `/api/casos/:id` | CRUD de um caso |
| GET / POST | `/api/prazos` | Listar / criar prazos |
| GET | `/api/prazos/proximos?dias=7` | Prazos a vencer |
| POST | `/api/prazos/:id/concluir` | Marcar como concluído |
| POST | `/api/prazos/:id/reabrir` | Reabrir prazo |
| GET / POST | `/api/tarefas` | Listar / criar tarefas |
| POST | `/api/tarefas/:id/concluir` | Concluir tarefa |
| GET / POST | `/api/documentos` | Listar / upload (multipart `arquivo`) |
| GET | `/api/documentos/espaco` | Espaço usado em bytes |
| GET | `/api/documentos/:id/download` | Download de arquivo |
| GET / POST | `/api/financeiro` | Listar / criar lançamentos |
| GET | `/api/financeiro/resumo` | KPIs financeiros |
| GET | `/api/financeiro/exportar.csv` | Exportar CSV (com BOM UTF-8) |
| POST | `/api/financeiro/:id/marcar-pago` | Dar baixa |

## 💾 Onde ficam os dados

- **Banco:** `backend/db/basck.db` (SQLite, 1 arquivo). Faça backup copiando esse arquivo.
- **Uploads:** `backend/uploads/` — arquivos enviados pelos usuários.

Para resetar tudo, basta apagar o `.db` e reiniciar `npm start`.

## 🔒 Segurança

- Senhas são hashadas com **PBKDF2-SHA512** (100k iterações, salt aleatório)
- Tokens JWT com expiração configurável (padrão: 7 dias)
- Em produção, troque `JWT_SECRET` no `.env` por um valor aleatório forte (32+ caracteres)
- Validação básica nos controllers (campos obrigatórios, formatos, enum)

## 🚧 Roadmap (próximas versões)

- Cálculo automático de prazos em dias úteis (feriados nacionais)
- Busca global (Ctrl+K)
- Notificações por e-mail para prazos próximos
- Integração Google Calendar / WhatsApp / DJEn / CNJ
- Módulo de equipe multi-usuário
- PWA / app mobile
