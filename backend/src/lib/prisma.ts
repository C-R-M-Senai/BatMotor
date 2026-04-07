/**
 * Prisma 7.6 + MySQL 8 (Docker, host `localhost:3307`).
 * O client exige um *driver adapter*; para MySQL a Prisma 7 expõe `@prisma/adapter-mariadb`
 * (protocolo MySQL contra o servidor MySQL — alinhado ao `mysql:8` do compose).
 *
 * Usado pelos services. Após clone: `npx prisma generate`.
 */

import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

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
