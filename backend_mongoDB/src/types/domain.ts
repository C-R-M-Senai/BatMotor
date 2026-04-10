/** Espelha enums do domínio BatMotor (antes em Prisma / MySQL). */

export enum Role {
  ADMIN = "ADMIN",
  GERENTE = "GERENTE",
  FUNCIONARIO = "FUNCIONARIO",
}

export enum TipoMovimentacao {
  ENTRADA = "ENTRADA",
  SAIDA = "SAIDA",
  AJUSTE = "AJUSTE",
}
