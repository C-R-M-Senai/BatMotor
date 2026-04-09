import { prisma } from "../lib/prisma";

/**
 * Insumos ativos com saldo abaixo do mínimo de segurança (alerta para compras / reabastecimento).
 */
export async function listEstoqueAbaixoMinimo() {
  const materias = await prisma.materiaPrima.findMany({
    where: { ativo: true },
    include: { estoque: true },
    orderBy: { nome: "asc" },
  });

  return materias
    .map((m) => {
      const quantidade_atual = m.estoque?.quantidade ?? 0;
      return {
        materia_prima_id: m.id,
        nome: m.nome,
        categoria: m.categoria,
        unidade: m.unidade,
        estoque_minimo: m.estoque_minimo,
        quantidade_atual,
        deficit: m.estoque_minimo - quantidade_atual,
      };
    })
    .filter((r) => r.quantidade_atual < r.estoque_minimo);
}
