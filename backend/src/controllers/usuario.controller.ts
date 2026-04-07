import type { Request, Response } from "express";
import { Role } from "../generated/prisma/client";
import * as usuarioService from "../services/usuario.service";

export async function list(_req: Request, res: Response) {
  const rows = await usuarioService.listUsuarios();
  return res.status(200).json(rows);
}

/**
 * Um FUNCIONARIO só pode consultar o próprio cadastro; ADMIN e GERENTE veem qualquer ID.
 */
export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  const auth = req.auth!;
  const canSeeAll =
    auth.roles.includes(Role.ADMIN) || auth.roles.includes(Role.GERENTE);
  if (!canSeeAll && auth.userId !== id) {
    return res.status(403).json({ error: "Sem permissão para ver este usuário" });
  }
  const row = await usuarioService.findUsuario(id);
  if (!row) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  return res.status(200).json(row);
}

export async function create(req: Request, res: Response) {
  const { nome, email, senha, cpf, ativo } = req.body ?? {};
  if (!nome || !email || !senha || !cpf) {
    return res.status(400).json({ error: "Campos obrigatórios: nome, email, senha, cpf" });
  }
  const row = await usuarioService.createUsuario({
    nome,
    email,
    senha,
    cpf,
    ativo,
  });
  return res.status(201).json(row);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  const { nome, email, senha, cpf, ativo } = req.body ?? {};
  const row = await usuarioService.updateUsuario(id, {
    nome,
    email,
    senha,
    cpf,
    ativo,
  });
  return res.status(200).json({
    usuario: row,
    message: "Usuário atualizado com sucesso",
  });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  const row = await usuarioService.deleteUsuario(id);
  return res.status(200).json({
    usuario: row,
    message: "Usuário deletado com sucesso.",
  });
}
