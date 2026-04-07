import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Utilitário para envolver handlers `async` e encaminhar erros ao `next(err)`.
 *
 * Sem isso, um `throw` ou `reject` dentro de uma rota async pode não chegar ao
 * middleware de tratamento de erros do Express.
 */
/**
 * Aceita handlers que retornem `res.json()` (Promise com valor) ou `void`;
 * o Express não exige `void`, mas o TypeScript restringe — por isso `Promise<unknown>`.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    void Promise.resolve(fn(req, res, next)).catch(next);
  };
}
