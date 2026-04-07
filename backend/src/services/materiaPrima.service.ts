import { prisma } from "../lib/prisma";

export function createMateriaPrima(data: {
  nome: string;
  categoria: string;
  unidade: string;
  estoque_minimo: number;
  ativo?: boolean;
}) {
  return prisma.materiaPrima.create({
    data: {
      nome: data.nome,
      categoria: data.categoria,
      unidade: data.unidade,
      estoque_minimo: data.estoque_minimo,
      ativo: data.ativo ?? true,
    },
  });
}

export function listMateriaPrima() {
  return prisma.materiaPrima.findMany();
}

export function findMateriaPrima(id: number) {
  return prisma.materiaPrima.findUnique({ where: { id } });
}

export function updateMateriaPrima(
  id: number,
  data: {
    nome?: string;
    categoria?: string;
    unidade?: string;
    estoque_minimo?: number;
    ativo?: boolean;
  },
) {
  return prisma.materiaPrima.update({
    where: { id },
    data,
  });
}

export function deleteMateriaPrima(id: number) {
  return prisma.materiaPrima.delete({ where: { id } });
}
