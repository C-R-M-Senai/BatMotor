-- Roda só na primeira inicialização do volume em docker-entrypoint-initdb.d.
-- Shadow do Prisma Migrate precisa ser um banco diferente do DATABASE_URL principal.
CREATE DATABASE IF NOT EXISTS batmotor_shadow;
