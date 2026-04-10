#!/bin/sh
set -e
cd /app

# Migrações ao arrancar o contentor (RDS / MySQL na nuvem). Desativa com SKIP_MIGRATE_ON_START=1.
if [ "${SKIP_MIGRATE_ON_START}" != "1" ]; then
  npx prisma migrate deploy
fi

exec npm run start
