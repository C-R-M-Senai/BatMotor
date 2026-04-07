import type { Request, Response } from "express";
import * as authService from "../services/auth.service";

/**
 * POST /auth/login — rota pública.
 * Corpo JSON: { "email": "...", "senha": "..." }
 * Resposta: { token, user } — o front deve guardar o token e enviar `Authorization: Bearer ...` nas demais rotas.
 */
export async function login(req: Request, res: Response) {
  const { email, senha } = req.body ?? {};
  if (!email || !senha) {
    return res.status(400).json({ error: "Informe e-mail e senha" });
  }
  const result = await authService.login(String(email), String(senha));
  return res.status(200).json(result);
}
