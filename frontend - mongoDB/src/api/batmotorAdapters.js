/**
 * =============================================================================
 * batmotorAdapters.js — CAMADA ANTI-DESALINHAMENTO (API ↔ React)
 * =============================================================================
 * O backend devolve convenções Prisma/PT (ex.: nome, estoque_minimo, usuarioPerfis).
 * Os componentes e estado local muitas vezes usam inglês curto (name, minStock).
 * Cada função map* ou normalize* aqui existe para **um só lugar** alterar quando
 * o contrato JSON mudar — evita espalhar row.nome vs row.name por dezenas de ficheiros.
 *
 * pickPrimaryBackendRole: se o utilizador tiver vários perfis, escolhe um “principal”
 * na ordem ADMIN > GERENTE > FUNCIONARIO (coerente com authorize no backend).
 * Guia: docs/GUIA_PEDAGOGICO_BATMOTOR.md
 * =============================================================================
 */

/**
 * Mongo com `.lean()` devolve `_id`; respostas após `toJSON()` no modelo usam `id`.
 * Usar sempre isto ao mapear listagens para o React.
 */
export function leanId(row) {
  if (!row || typeof row !== "object") return "";
  if (row.id != null && String(row.id).trim() !== "") return String(row.id);
  if (row._id != null && String(row._id).trim() !== "") return String(row._id);
  return "";
}

/** Prioridade para exibição quando o usuário tem vários perfis. */
export function pickPrimaryBackendRole(roles) {
  const r = Array.isArray(roles) ? roles : [];
  if (r.includes("ADMIN")) return "ADMIN";
  if (r.includes("GERENTE")) return "GERENTE";
  if (r.includes("FUNCIONARIO")) return "FUNCIONARIO";
  return "";
}

/** Extrai roles a partir de GET /users (usuarioPerfis). */
export function rolesFromUsuarioPerfis(usuarioPerfis) {
  if (!Array.isArray(usuarioPerfis)) return [];
  return usuarioPerfis.map((up) => up?.perfil?.role).filter(Boolean);
}

/**
 * @param {object} data — JSON de POST /auth/login
 */
export function normalizeAuthSuccess(data) {
  const u = data.user ?? {};
  const roles = Array.isArray(u.roles) ? u.roles : [];
  const primary = pickPrimaryBackendRole(roles);

  let accountKind = "";
  if (primary === "ADMIN") accountKind = "admin";
  else if (primary === "GERENTE") accountKind = "manager";
  else if (primary === "FUNCIONARIO") accountKind = "employee";

  const profileRole =
    primary === "ADMIN" ? "admin" : primary === "GERENTE" ? "gerente" : primary === "FUNCIONARIO" ? "funcionario" : "";

  return {
    token: data.token,
    user: {
      id: leanId(u) || u.id,
      name: u.nome ?? u.name ?? "Usuário",
      email: u.email ?? "",
      accountKind: accountKind || undefined,
      profileRole,
      roles
    }
  };
}

export function mapMaterialFromApi(row, saldo) {
  const stock = typeof saldo === "number" ? saldo : 0;
  return {
    id: leanId(row),
    name: row.nome,
    category: row.categoria,
    unit: row.unidade,
    minStock: row.estoque_minimo,
    currentStock: stock,
    active: row.ativo !== false
  };
}

export function mapSupplierFromApi(row) {
  const phone = row.telefone ?? "";
  const email = row.email ?? "";
  const id = leanId(row);
  return {
    id,
    name: row.nome,
    cnpj: row.cnpj ?? "",
    email,
    phone,
    contact: phone || email,
    contactPerson: "",
    status: row.ativo === false ? "inactive" : "active",
    active: row.ativo !== false,
    city: "",
    state: "",
    address: "",
    category: "",
    code: id || "",
    supplierType: "",
    since: "",
    paymentTerms: "",
    notes: ""
  };
}

export function mapMovementTypeToApi(uiType) {
  if (uiType === "IN") return "ENTRADA";
  if (uiType === "OUT") return "SAIDA";
  if (uiType === "ADJ") return "AJUSTE";
  return "ENTRADA";
}

export function mapMovementFromApi(row) {
  let type = "IN";
  if (row.tipo === "SAIDA") type = "OUT";
  else if (row.tipo === "AJUSTE") type = "ADJ";
  const mid = row.materia_prima_id;
  const materialId =
    mid == null
      ? ""
      : typeof mid === "object"
        ? leanId(mid) || ""
        : String(mid);
  return {
    id: leanId(row),
    type,
    materialId,
    quantity: row.quantidade,
    notes: row.motivo ?? row.observacao ?? "",
    createdAt: row.data_atual ?? row.created_at ?? row.createdAt ?? row.updated_at ?? row.updatedAt,
    raw: row
  };
}

export function mapUserFromApi(row) {
  const rolesFromLinks = (row.usuarioPerfis ?? []).map((up) => up.perfil?.role).filter(Boolean);
  const roles = rolesFromLinks.length
    ? rolesFromLinks
    : Array.isArray(row.roles)
      ? row.roles.filter(Boolean)
      : [];
  const primary = pickPrimaryBackendRole(roles);
  return {
    id: leanId(row),
    name: row.nome,
    email: row.email,
    cpf: row.cpf,
    accountKind:
      primary === "ADMIN" ? "admin" : primary === "GERENTE" ? "manager" : primary === "FUNCIONARIO" ? "employee" : "",
    profileRole:
      primary === "ADMIN" ? "admin" : primary === "GERENTE" ? "gerente" : primary === "FUNCIONARIO" ? "funcionario" : "",
    ativo: row.ativo,
    roles
  };
}

export function stockSummaryFromMaterials(materials) {
  const byMaterial = materials.map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    quantity: Number(m.currentStock) || 0,
    minStock: Number(m.minStock) || 0
  }));
  return {
    totalItems: materials.length,
    totalStock: byMaterial.reduce((sum, item) => sum + item.quantity, 0),
    byMaterial
  };
}
