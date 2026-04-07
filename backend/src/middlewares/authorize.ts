import type { RequestHandler } from "express";
import { Role } from "../generated/prisma/client";

/**
 * ADMIN pode tudo neste middleware: se o usuário tem role ADMIN, liberamos
 * imediatamente (regra de negócio pedida: administrador vê e altera o sistema inteiro).
 */
function hasAnyAllowedRole(userRoles: Role[], ...allowed: Role[]): boolean {
  if (userRoles.includes(Role.ADMIN)) return true;
  return allowed.some((r) => userRoles.includes(r));
}

/**
 * Exige usuário autenticado (use após `authenticate`).
 */
export const requireAuth: RequestHandler = (req, res, next) => {
  if (!req.auth) {
    return res.status(401).json({ error: "Não autenticado" });
  }
  next();
};

/**
 * Exige pelo menos uma das roles informadas (ADMIN sempre passa).
 */
export function requireRole(...allowed: Role[]): RequestHandler {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    if (!hasAnyAllowedRole(req.auth.roles, ...allowed)) {
      return res.status(403).json({
        error:
          "Sem permissão para esta ação. Verifique o perfil do usuário (ADMIN / GERENTE / FUNCIONARIO).",
      });
    }
    next();
  };
}
