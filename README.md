# BatMotor

API backend para gestão de almoxarifado (usuários, perfis, matérias-primas, fornecedores, estoque e movimentações), com autenticação JWT e autorização por papéis.

Este documento descreve **o que existe na pasta `backend`**, **o que instalar**, **como subir o ambiente** e **o mapa das rotas HTTP**.

> **Repositório aberto:** não coloque aqui (nem no Git) senhas reais, e-mails corporativos, segredos de JWT ou URLs de produção. Use o `.env` só na sua máquina ou em cofre de secrets; o README fica só com o **formato** das variáveis e fluxos genéricos. Vale revisar o **`backend/.env.example`**: em repo público, mantenha apenas **placeholders** (ex.: `sua_senha`, `ALTERE_EM_PRODUCAO`), nunca credenciais da empresa.

---

## Visão geral da stack (`backend`)

| Camada | Tecnologia |
|--------|------------|
| Runtime | Node.js (ES modules) |
| Framework HTTP | Express 5 |
| Linguagem | TypeScript |
| Execução em dev | `tsx` (watch em `src/main.ts`) |
| Banco de dados | MySQL 8 (Docker) |
| ORM | Prisma **7.6.0** (schema em `prisma/`, URLs em `prisma.config.ts`) |
| Auth | JWT (`jsonwebtoken`) + senhas com `bcrypt` |

O cliente Prisma é gerado em `backend/src/generated/prisma` (não editar à mão). O Prisma 7 exige *driver adapter* para MySQL; o projeto usa `@prisma/adapter-mariadb` (protocolo MySQL contra o servidor **MySQL** do Docker, não o produto MariaDB Server).

---

## Pré-requisitos

- **Node.js** (recomendado: versão LTS alinhada ao time; o projeto usa features modernas de TS/ESM).
- **npm** (vem com o Node).
- **Docker** e **Docker Compose**, para subir o MySQL local sem conflitar com uma instalação MySQL na porta 3306 do host.

---

## Estrutura de pastas do `backend`

```
backend/
├── docker-compose.yml      # MySQL 8: porta host 3307 → 3306 no container
├── docker/
│   └── mysql-init/         # SQL executado só na 1ª inicialização do volume
├── prisma/
│   ├── schema.prisma       # Modelos e enums (provider mysql no datasource)
│   ├── migrations/         # Histórico de migrações SQL
│   └── seed.ts             # Usuário admin de desenvolvimento
├── prisma.config.ts        # URLs do banco + caminho de migrações + comando de seed
├── package.json
├── tsconfig.json
├── .env.example            # Modelo de variáveis (copiar para .env)
├── docs/
│   └── ESTRUTURA.md        # Fluxo detalhado request → controller → service
└── src/
    ├── main.ts             # Sobe o servidor (porta via env)
    ├── app.ts              # Express + rotas + error handler
    ├── routes/index.ts     # Todas as rotas e middlewares de auth
    ├── controllers/        # Entrada HTTP
    ├── services/           # Regras de negócio + Prisma
    ├── middlewares/        # JWT, autorização por Role, erros
    ├── lib/prisma.ts       # Instância PrismaClient + adapter MySQL
    ├── config/env.ts       # PORT, JWT_SECRET, JWT_EXPIRES_IN
    ├── utils/              # bcrypt wrapper, token, asyncHandler
    ├── types/              # Extensão do Express (ex.: req.auth)
    └── main.legado.ts      # Referência da versão monolítica (excluído do tsconfig)
```

---

## Configuração do ambiente

### 1. Variáveis de ambiente

Na pasta `backend`:

```bash
cp .env.example .env
```

Ajuste se necessário. **Não commite o `.env`** (credenciais e `JWT_SECRET`).

Principais variáveis (nomes e exemplos de formato estão no **`.env.example`** do `backend`; valores reais vêm do time / do seu ambiente):

- **`DATABASE_URL`** — URL MySQL da aplicação (usuário, senha, host, porta, nome do banco).
- **`SHADOW_DATABASE_URL`** — URL de um **outro** banco usado pelo Prisma Migrate (não pode ser o mesmo nome/URL principal).
- **`DATABASE_HOST`**, **`DATABASE_PORT`**, **`DATABASE_USER`**, **`DATABASE_PASSWORD`**, **`DATABASE_NAME`** — usadas pelo adapter em `src/lib/prisma.ts` (a porta publicada no host costuma ser diferente da 3306 interna do container, se houver mapeamento).
- **`JWT_SECRET`** — segredo para **assinar** tokens (não é o Bearer que o cliente envia após o login).
- **`JWT_EXPIRES_IN`** — tempo de vida do token (ex.: `8h`).
- **`PORT`** — opcional; padrão **3000** em `config/env.ts`.

### 2. MySQL com Docker

Crie o `.env` a partir do `.env.example` **antes** do `compose up`, para definir `MYSQL_*`, porta publicada (`MYSQL_PORT_HOST`) e as URLs do Prisma com os **mesmos** usuários/senhas/bancos.

Na pasta `backend`:

```bash
docker compose up -d
```

- Imagem: **`mysql:8`**. Usuário/senha/banco padrão no compose são **placeholders de desenvolvimento**; troque tudo em ambiente real.
- Nome do banco da aplicação, usuário e senha: conforme **`MYSQL_*`** no compose e o que o time definiu (não documente credenciais reais neste README).
- **Host:** em desenvolvimento costuma ser `127.0.0.1`. **Porta no host:** a que estiver mapeada no compose (ex.: `3307:3306` para não conflitar com outro MySQL na máquina).

O diretório `docker/mysql-init/` contém SQL rodado só na **primeira** subida do volume (por exemplo criação do banco usado como **shadow** do Migrate, separado do banco da aplicação).

Se você mudou o nome do banco depois que o volume já existia, pode ser necessário `docker compose down -v` e subir de novo (apaga dados do volume local).

### 3. Dependências Node

```bash
cd backend
npm install
```

### 4. Prisma: gerar client e aplicar migrações

```bash
npx prisma generate
npx prisma migrate deploy
```

Em desenvolvimento, se preferir fluxo interativo: `npx prisma migrate dev` (cuidado em bases compartilhadas).

### 5. Seed do administrador (desenvolvimento)

Cria/atualiza perfil **ADMIN**, usuário e vínculo **UsuarioPerfil** (evita conflito de CPF com seed antigo):

```bash
npx prisma db seed
# ou
npm run db:seed
```

O **e-mail e a senha** do usuário criado pelo seed são definidos **somente** no arquivo `prisma/seed.ts` (ou por política interna do time). Não publique esses valores aqui; cada ambiente pode usar credenciais diferentes.

---

## Executar a API

```bash
cd backend
npm run dev
```

Por padrão a API sobe na porta **3000** (ou `PORT` no `.env`). O console indica o `POST /auth/login`.

> O script `npm start` aponta para `node server.js`; o fluxo diário do repositório é **`npm run dev`** com `tsx`.

---

## Autenticação e autorização

### Login (rota pública)

`POST /auth/login` — corpo JSON (use um usuário que exista **no seu banco**; exemplo só ilustra o formato):

```json
{
  "email": "seu.usuario@dominio.com",
  "senha": "informe_a_senha_cadastrada"
}
```

Resposta típica: `{ "token": "...", "user": { "id", "nome", "email", "roles" } }`.

### Demais rotas

Enviar cabeçalho:

```http
Authorization: Bearer <token>
```

Os **papéis** (`ADMIN`, `GERENTE`, `FUNCIONARIO`) vêm de `UsuarioPerfil` → `Perfil.role` e são colocados no JWT no login.

Regras gerais (detalhes em `src/routes/index.ts` e `docs/ESTRUTURA.md`):

- **ADMIN** — configuração do sistema: perfis, módulos, permissões, vínculo usuário–perfil, CRUD de `/teste`, CRUD completo de usuários (`POST/PUT/DELETE /users`).
- **ADMIN ou GERENTE** — alterações em cadastros de almoxarifado (POST/PUT/DELETE em fornecedores, matéria-prima, vínculo matéria–fornecedor; PUT/DELETE em movimentações). Listagens GET de usuários também liberadas para esses dois papéis.
- **Qualquer autenticado** — leituras amplas de almoxarifado e **registro de movimentação** (`POST /movimentacao`). O campo `usuario_id` no corpo **só é aceito para ADMIN**; para os demais o sistema usa o id do token.

---

## Mapa de rotas HTTP

Prefixo: raiz da API (ex.: `http://localhost:3000`). Todas abaixo **exigem JWT**, exceto **`POST /auth/login`**.

### Autenticação

| Método | Rota | Papéis |
|--------|------|--------|
| POST | `/auth/login` | *(público)* |

### Usuários

| Método | Rota | Papéis |
|--------|------|--------|
| GET | `/users` | ADMIN, GERENTE |
| GET | `/users/:id` | autenticado |
| POST | `/users` | ADMIN |
| PUT | `/users/:id` | ADMIN |
| DELETE | `/users/:id` | ADMIN |

### Perfis, módulos, vínculos e permissões

| Método | Rota | Papéis |
|--------|------|--------|
| POST, GET | `/perfil`, `/perfil/:id` | ADMIN |
| PUT, DELETE | `/perfil/:id` | ADMIN |
| POST, GET | `/modulos`, `/modulos/:id` | ADMIN |
| PUT, DELETE | `/modulos/:id` | ADMIN |
| POST, GET | `/user-perfil`, `/user-perfil/:usuario_id/:perfil_id` | ADMIN |
| PUT, DELETE | `/user-perfil/:usuario_id/:perfil_id` | ADMIN |
| POST, GET | `/permissao-modulo`, `/permissao-modulo/:id` | ADMIN |
| PUT, DELETE | `/permissao-modulo/:id` | ADMIN |

### Almoxarifado

| Método | Rota | Observação |
|--------|------|------------|
| POST | `/fornecedores` | ADMIN, GERENTE |
| GET | `/fornecedores`, `/fornecedores/:id` | autenticado |
| PUT, DELETE | `/fornecedores/:id` | ADMIN, GERENTE |
| POST | `/materia-fornecedor` | ADMIN, GERENTE `(materiaid/fornecedorid nos params)` |
| GET | `/materia-fornecedor`, `/materia-fornecedor/:materiaid/:fornecedorid` | autenticado |
| PUT, DELETE | `/materia-fornecedor/:materiaid/:fornecedorid` | ADMIN, GERENTE |
| POST | `/materia-prima` | ADMIN, GERENTE |
| GET | `/materia-prima`, `/materia-prima/:id` | autenticado |
| PUT, DELETE | `/materia-prima/:id` | ADMIN, GERENTE |

### Movimentação e estoque

| Método | Rota | Observação |
|--------|------|------------|
| POST | `/movimentacao` | autenticado (`usuario_id` no body só ADMIN) |
| GET | `/movimentacao`, `/movimentacao/:id` | autenticado |
| PUT, DELETE | `/movimentacao/:id` | ADMIN, GERENTE |
| GET | `/estoque-atual` | autenticado |

### Modelo de exemplo (`Teste`)

| Método | Rota | Papéis |
|--------|------|--------|
| GET, POST | `/teste`, `/teste/:id` | ADMIN |
| PUT, DELETE | `/teste/:id` | ADMIN |

---

## Modelagem de dados (resumo)

Definida em `backend/prisma/schema.prisma`:

- **Usuario**, **Perfil**, **UsuarioPerfil**, **Role** (ADMIN | GERENTE | FUNCIONARIO)
- **Modulo**, **PermissaoModulo**
- **MateriaPrima**, **Fornecedor**, **MateriaFornecedor**
- **EstoqueAtual**, **Movimentacao** (**TipoMovimentacao:** ENTRADA | SAIDA)
- **Teste** (CRUD de exemplo / didático)

---

## Ferramentas de banco (DBeaver, etc.)

- Host, porta, nome do banco, usuário e senha: os **mesmos** que você configurou no **Docker** e no **`.env`** (não repetir no README).
- Confira se o **nome do schema/banco** no cliente é exatamente o de `MYSQL_DATABASE` (evite typos no nome da conexão).
- Preferir **`127.0.0.1`** em vez de `localhost` se houver problema de IPv6 no Windows.
- Se aparecer erro de handshake / “0 bytes”, tente desativar SSL nas propriedades do driver (`useSSL=false`).

---

## Documentação adicional

- **`backend/docs/ESTRUTURA.md`** — fluxo da requisição pelas camadas e política de papéis em texto corrido.

---

## Licença

Conforme `backend/package.json` (campo `license` do projeto).
