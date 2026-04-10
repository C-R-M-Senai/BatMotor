import jwt from "jsonwebtoken";
import type { Role } from "../types/domain";
import { env } from "../config/env";

/** `sub` é o ObjectId do utilizador em string (MongoDB). */
export type JwtPayload = {
  sub: string;
  email: string;
  roles: Role[];
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.jwtSecret);
  if (
    typeof decoded !== "object" ||
    decoded === null ||
    !("sub" in decoded) ||
    !("email" in decoded) ||
    !("roles" in decoded)
  ) {
    throw new Error("Token inválido");
  }
  const { sub, email, roles } = decoded as Record<string, unknown>;
  let subStr: string;
  if (typeof sub === "string" && sub.length > 0) subStr = sub;
  else if (typeof sub === "number" && Number.isFinite(sub)) subStr = String(sub);
  else throw new Error("Token inválido");
  if (typeof email !== "string" || !Array.isArray(roles)) {
    throw new Error("Token inválido");
  }
  return { sub: subStr, email, roles: roles as Role[] };
}
