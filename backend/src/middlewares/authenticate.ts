import type { RequestHandler } from "express";
import { verifyToken } from "../utils/token";

/**
 * Autenticação JWT: lê o token em
 * 1) `Authorization: Bearer <token>` (recomendado, padrão REST), ou
 * 2) campo string `token` no JSON do body (útil em testes rápidos no Postman na aba Body).
 *
 * O token é o valor retornado por POST /auth/login — não é a senha de login.
 */
const msgSemToken =
  "Falta o JWT. Envie o cabeçalho Authorization: Bearer <token> " +
  "ou inclua no JSON do body a propriedade \"token\" com a string retornada por POST /auth/login " +
  "(a senha de login não serve).";

function readJwtFromRequest(req: Parameters<RequestHandler>[0]): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    const raw = header.slice("Bearer ".length).trim();
    if (raw) return raw;
  }
  const body = req.body;
  if (
    body &&
    typeof body === "object" &&
    !Array.isArray(body) &&
    typeof (body as { token?: unknown }).token === "string"
  ) {
    const t = (body as { token: string }).token.trim();
    if (t) return t;
  }
  return null;
}

export const authenticate: RequestHandler = (req, res, next) => {
  const raw = readJwtFromRequest(req);
  if (!raw) {
    return res.status(401).json({ error: msgSemToken });
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

/**
 * Se houver JWT válido, preenche `req.auth`; caso contrário segue sem erro (para rotas híbridas).
 */
export const optionalAuthenticate: RequestHandler = (req, res, next) => {
  const raw = readJwtFromRequest(req);
  if (!raw) {
    return next();
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
