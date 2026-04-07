import jwt from "jsonwebtoken";
import type { Role } from "../generated/prisma/client";
import { env } from "../config/env";

/** Payload mínimo carregado no JWT após o login. */
export type JwtPayload = {
  sub: number;
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
  if (
    typeof sub !== "number" ||
    typeof email !== "string" ||
    !Array.isArray(roles)
  ) {
    throw new Error("Token inválido");
  }
  return { sub, email, roles: roles as Role[] };
}
