import { getUseMock } from "../client.js";
import { mockDb, mockDelay, mockStockSummary } from "../mock/store.js";
import { stockSummaryFromMaterials } from "../batmotorAdapters.js";
import { fetchMaterials } from "./materials.js";

export async function fetchMinStockAlerts() {
  if (getUseMock()) {
    await mockDelay();
    return mockDb.materials.filter((m) => Number(m.currentStock) <= Number(m.minStock));
  }
  const materials = await fetchMaterials();
  return materials.filter((m) => Number(m.currentStock) <= Number(m.minStock));
}

export async function fetchStockSummary() {
  if (getUseMock()) {
    await mockDelay();
    return mockStockSummary();
  }
  const materials = await fetchMaterials();
  return stockSummaryFromMaterials(materials);
}
