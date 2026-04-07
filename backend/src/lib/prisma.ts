/**
 * Cliente Prisma com adaptador MariaDB/MySQL.
 * Usado pelos **services**; as rotas não importam o Prisma diretamente.
 * Após `git clone`: `npx prisma generate` para gerar `src/generated/prisma`.
 */

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5,
});
const prisma = new PrismaClient({ adapter });

export { prisma };