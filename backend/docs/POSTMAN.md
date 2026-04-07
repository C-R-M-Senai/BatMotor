# Postman — BatMotor API

## Importar a coleção

1. Postman → **Import** → arquivo `backend/postman/BatMotor.postman_collection.json`.
2. Variáveis da coleção: `baseUrl` (padrão `http://localhost:3000`), `loginEmail`, `loginSenha`, IDs numéricos após criar dados.
3. Execute **POST Login** primeiro; o teste da requisição grava o `token` automaticamente. As outras pastas usam **Bearer Token** `{{token}}`.

## JSON válido no body (erros comuns)

- Todo **valor de texto** vai entre **aspas duplas** (`"email"` e `"admin@empresa.com"`).
- **Não** coloque vírgula depois do último campo antes do `}`.
- **Content-Type:** `application/json`.

### Seu exemplo corrigido

Errado (faltava aspas antes do e-mail e havia vírgula sobrando):

```json
{
  "email": admin@empresa.com",
  "senha": "senha12345",

}
```

Certo:

```json
{
  "email": "admin@empresa.com",
  "senha": "senha12345"
}
```

Isso **só funciona no login** se existir um `Usuario` com esse e-mail e senha cadastrada (bcrypt ou legado conforme o sistema). Após `npx prisma db seed`, o padrão do projeto está em `prisma/seed.ts` (hoje `admin@batmotor.com` / senha do seed); ajuste as variáveis `loginEmail` e `loginSenha` na coleção ou crie o usuário `admin@empresa.com` no banco.

## Ordem sugerida para testar o “sistema das tabelas”

1. **Login** → token.
2. **Almoxarifado:** criar **fornecedor** → criar **matéria-prima** → atualizar variáveis `fornecedor_id` e `materia_prima_id` com os ids retornados (ou use `GET` listagens).
3. **Matéria-fornecedor:** vínculo com os dois ids.
4. **Movimentação:** `tipo` **ENTRADA** ou **SAIDA**; `usuario_id` no body só para ADMIN.
5. **Usuários / Config:** exigem papel **ADMIN** no token (o seed já vincula o admin ao perfil ADMIN).

## Papéis nas rotas (resumo)

- Só **POST /auth/login** é público.
- **ADMIN:** perfis, módulos, permissões, user-perfil, CRUD `/teste`, CRUD completo de usuários.
- **ADMIN ou GERENTE:** escrita em fornecedores, matéria-prima, vínculo, PUT/DELETE movimentação; `GET /users`.
- **Qualquer autenticado:** leituras na maior parte do almoxarifado, `POST /movimentacao`.

Detalhes completos: `ESTRUTURA.md` e `README.md` na raiz do repositório.
