/**
 * Extensão do tipo `Request` do Express para incluir o contexto de autenticação
 * preenchido pelo middleware `authenticate` após validar o JWT.
 */
import type { Role } from "./domain";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        /** ObjectId do utilizador (string). */
        userId: string;
        email: string;
        roles: Role[];
      };
    }
  }
}

export {};
