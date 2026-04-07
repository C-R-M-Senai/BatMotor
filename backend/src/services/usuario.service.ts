import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/password";

/** Lista todos os usuários (sem senha) — uso restrito a perfis de gestão. */
export function listUsuarios() {
  return prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      ativo: true,
      data_atual: true,
    },
  });
}

export function findUsuario(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      ativo: true,
      data_atual: true,
    },
  });
}

/**
 * Criação de usuário pela API: senha é armazenada com bcrypt.
 * Regra de negócio do cliente: contas criadas pela gestão/TI (sem tela pública de cadastro).
 */
export async function createUsuario(data: {
  nome: string;
  email: string;
  senha: string;
  cpf: string;
  ativo?: boolean;
}) {
  const senhaHash = await hashPassword(data.senha);
  return prisma.usuario.create({
    data: {
      nome: data.nome,
      email: data.email,
      senha: senhaHash,
      cpf: data.cpf,
      ativo: data.ativo ?? true,
    },
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      ativo: true,
      data_atual: true,
    },
  });
}

/** Atualização — se `senha` vier no body, substitui com hash. */
export async function updateUsuario(
  id: number,
  data: {
    nome?: string;
    email?: string;
    senha?: string;
    cpf?: string;
    ativo?: boolean;
  },
) {
  const senha =
    data.senha !== undefined ? await hashPassword(data.senha) : undefined;
  return prisma.usuario.update({
    where: { id },
    data: {
      nome: data.nome,
      email: data.email,
      cpf: data.cpf,
      ativo: data.ativo,
      ...(senha ? { senha } : {}),
    },
    select: {
      id: true,
      nome: true,
      email: true,
      cpf: true,
      ativo: true,
      data_atual: true,
    },
  });
}

export function deleteUsuario(id: number) {
  return prisma.usuario.delete({ where: { id } });
}
