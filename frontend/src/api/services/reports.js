import { api, getUseMock } from "../client.js";
import { mockDb, mockDelay, mockStockSummary } from "../mock/store.js";
import { stockSummaryFromMaterials } from "../batmotorAdapters.js";
import { fetchMaterials } from "./materials.js";

export async function fetchMinStockAlerts() {
  if (getUseMock()) {
    await mockDelay();
    return mockDb.materials.filter((m) => Number(m.currentStock) <= Number(m.minStock));
  }
  try {
    const { data } = await api.get("/relatorios/estoque-baixo");
    const itens = Array.isArray(data?.itens) ? data.itens : [];
    return itens.map((r) => ({
      id: r.materia_prima_id,
      name: r.nome,
      category: r.categoria,
      unit: r.unidade,
      minStock: r.estoque_minimo,
      currentStock: r.quantidade_atual,
      active: true,
      deficit: r.deficit
    }));
  } catch {
    const materials = await fetchMaterials();
    return materials.filter((m) => Number(m.currentStock) <= Number(m.minStock));
  }
}

export async function fetchStockSummary() {
  if (getUseMock()) {
    await mockDelay();
    return mockStockSummary();
  }
  const materials = await fetchMaterials();
  return stockSummaryFromMaterials(materials);
}
