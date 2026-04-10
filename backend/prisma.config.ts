/// <reference types="node" />

/**
 * Carrega sempre `backend/.env`, mesmo que o comando seja corrido na raiz do monorepo
 * (`npx prisma ...` sem `cd backend`). Evita P1001 por `DATABASE_URL` errado/ausente.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

const backendRoot = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendRoot, ".env") });

const dbUrl = process.env["DATABASE_URL"] ?? "";
/** Render define `RENDER=true`; aí `localhost` na URL é quase sempre cópia errada do `.env` local. */
if (process.env["RENDER"] === "true" && /localhost|127\.0\.0\.1/i.test(dbUrl)) {
  throw new Error(
    "[BatMotor] No Render, DATABASE_URL não pode usar localhost. No painel do serviço → Environment, " +
      "defina DATABASE_URL com o host MySQL na nuvem (ex.: …amazonaws.com:3306/…), não o Docker da tua máquina.",
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
    shadowDatabaseUrl: process.env["SHADOW_DATABASE_URL"] || undefined,
  },
});
