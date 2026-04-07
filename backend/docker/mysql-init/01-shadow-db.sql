-- Banco separado para shadow do Prisma Migrate (nome alinhado ao .env.example).
-- Roda só na primeira inicialização do volume.
CREATE DATABASE IF NOT EXISTS prisma_migrate_shadow;
