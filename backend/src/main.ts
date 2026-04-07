/**
 * Ponto de entrada do servidor HTTP.
 *
 * O código que existia antes neste arquivo foi reorganizado em:
 * - `src/routes/` — mapeamento URL → controller (com JWT e papéis).
 * - `src/controllers/` — recebe HTTP, valida entrada básica, chama serviço.
 * - `src/services/` — regras de negócio e chamadas ao Prisma.
 * - `src/middlewares/` — autenticação JWT e autorização por perfil.
 *
 * O arquivo antigo monolítico foi preservado com o nome `main.legado.ts` para comparação em aula.
 */
import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();

app.listen(env.port, () => {
  console.log(`API BatMotor na porta ${env.port}`);
  console.log(`Login: POST /auth/login  (JSON: email, senha)`);
});
