/**
 * Camada de API do Batmotor: HTTP (backend) + mock local (VITE_USE_MOCK).
 * `setApiMode` no client ainda permite gravar preferência local (local/remote) se precisar no futuro.
 *
 * Estrutura:
 * - client.js — axios + env + getUseMock / setApiMode
 * - mock/* — dados fictícios e helpers só para mock
 * - services/* — um arquivo por domínio (auth, materials, …)
 */

export {
  api,
  API_BASE_URL,
  USE_MOCK_FROM_ENV,
  getUseMock,
  setApiMode,
  clearApiModePreference,
  getApiModePreference,
  getResolvedApiMode
} from "./client.js";

export { loginRequest } from "./services/auth.js";
export { fetchMaterials, createMaterial, updateMaterial, deleteMaterial } from "./services/materials.js";
export { fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } from "./services/suppliers.js";
export { fetchMovements, createMovement } from "./services/movements.js";
export {
  fetchMinStockAlerts,
  fetchStockSummary,
  fetchMovimentacoesPorDia,
  sendLowStockAlertEmail
} from "./services/reports.js";
export { fetchUsers, createUser, deleteUser } from "./services/users.js";
