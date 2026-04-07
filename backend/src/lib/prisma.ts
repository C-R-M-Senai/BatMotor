/**
 * Cliente Prisma com adaptador MariaDB/MySQL.
 * Usado pelos **services**; as rotas não importam o Prisma diretamente.
 * Após `git clone`: `npx prisma generate` para gerar `src/generated/prisma`.
 */

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

/**
 * A porta tem de bater com o host (ex.: Docker `3307:3306` → aqui 3307 em localhost).
 * Sem `port`, o driver costuma usar 3306 e o pool fica em timeout se o MySQL só estiver na 3307.
 */
const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT) || 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };