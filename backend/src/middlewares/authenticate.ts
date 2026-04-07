import type { RequestHandler } from "express";
import { verifyToken } from "../utils/token";

/**
 * Lê o header `Authorization: Bearer <token>` e popula `req.auth`.
 *
 * Uso: encadeie antes das rotas que exigem usuário logado.
 * Respostas 401 são padronizadas para o frontend tratar (redirecionar ao login, etc.).
 */
export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não informado" });
  }
  const raw = header.slice("Bearer ".length).trim();
  if (!raw) {
    return res.status(401).json({ error: "Token não informado" });
  }
  try {
    const payload = verifyToken(raw);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      roles: payload.roles,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};
