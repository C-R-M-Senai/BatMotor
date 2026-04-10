/**
 * Corre no deploy (Render): migrate + seed.
 * No Render, falha cedo com mensagem clara se DATABASE_URL ainda for a do Docker local.
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(backendRoot, ".env"), override: false });

const url = process.env.DATABASE_URL ?? "";
const onRender = process.env.RENDER === "true";

if (!url.trim()) {
  console.error(
    "[BatMotor release] DATABASE_URL está vazia. No Render: serviço Web → Environment → crie DATABASE_URL com o MySQL na nuvem.",
  );
  process.exit(1);
}

if (onRender && /localhost|127\.0\.0\.1/i.test(url)) {
  console.error(`
[BatMotor release] DATABASE_URL usa localhost — no Render isso NUNCA funciona.

O build corre nos servidores do Render; lá não existe o teu Docker.

Correção: Render → o teu serviço API → Environment
  • Edita DATABASE_URL para algo como:
    mysql://USUARIO:SENHA@HOST_DO_FORNECEDOR:3306/NOME_BD
  • HOST tem de ser o hostname real (RDS, Aiven, PlanetScale, etc.), não localhost nem 127.0.0.1.
`);
  process.exit(1);
}

execSync("npx prisma migrate deploy && npx prisma db seed", {
  cwd: backendRoot,
  stdio: "inherit",
  env: process.env,
  shell: true,
});
