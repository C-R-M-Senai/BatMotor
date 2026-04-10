# Imagem da API BatMotor — para AWS (App Runner, ECS/Fargate, Elastic Beanstalk, EC2 + Docker), etc.
#
# Base de dados: use Amazon RDS MySQL (ou compatível) na mesma VPC / rede; defina DATABASE_URL no serviço.
# O MySQL do docker-compose local NÃO fica acessível na AWS — é só para desenvolvimento.
#
# Build (na pasta backend):
#   docker build -t batmotor-api .
# Run (exemplo — substitua DATABASE_URL pelo endpoint RDS):
#   docker run --rm -p 3000:3000 -e DATABASE_URL="mysql://..." -e JWT_SECRET="..." -e PORT=3000 batmotor-api

FROM node:22-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY prisma.config.ts ./
COPY scripts ./scripts
COPY src ./src

RUN chmod +x scripts/docker-entrypoint.sh \
  && npx prisma generate

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["./scripts/docker-entrypoint.sh"]
