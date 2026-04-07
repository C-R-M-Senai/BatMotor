import type { Request, Response } from "express";
import { TipoMovimentacao } from "../generated/prisma/client";
import * as svc from "../services/movimentacao.service";

export async function create(req: Request, res: Response) {
  const { materia_prima_id, tipo, quantidade, motivo, usuario_id } =
    req.body ?? {};
  if (
    materia_prima_id == null ||
    tipo == null ||
    quantidade === undefined ||
    quantidade === null
  ) {
    return res.status(400).json({
      error:
        "Campos obrigatórios: materia_prima_id, tipo (ENTRADA|SAIDA), quantidade",
    });
  }
  if (tipo !== TipoMovimentacao.ENTRADA && tipo !== TipoMovimentacao.SAIDA) {
    return res.status(400).json({ error: "tipo deve ser ENTRADA ou SAIDA" });
  }
  const auth = req.auth!;
  const row = await svc.createMovimentacao(
    {
      materia_prima_id: Number(materia_prima_id),
      tipo,
      quantidade: Number(quantidade),
      motivo,
      usuario_id:
        usuario_id != null && usuario_id !== ""
          ? Number(usuario_id)
          : undefined,
    },
    { userId: auth.userId, roles: auth.roles },
  );
  return res.status(201).json(row);
}

export async function list(_req: Request, res: Response) {
  const rows = await svc.listMovimentacoes();
  return res.status(200).json(rows);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  const row = await svc.findMovimentacao(id);
  if (!row) {
    return res.status(404).json({ error: "Movimentação não encontrada" });
  }
  return res.status(200).json(row);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { materia_prima_id, tipo, quantidade, motivo, usuario_id } =
    req.body ?? {};
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  if (
    tipo != null &&
    tipo !== TipoMovimentacao.ENTRADA &&
    tipo !== TipoMovimentacao.SAIDA
  ) {
    return res.status(400).json({ error: "tipo deve ser ENTRADA ou SAIDA" });
  }
  const row = await svc.updateMovimentacao(id, {
    materia_prima_id:
      materia_prima_id != null ? Number(materia_prima_id) : undefined,
    tipo,
    quantidade:
      quantidade !== undefined && quantidade !== null
        ? Number(quantidade)
        : undefined,
    motivo,
    usuario_id:
      usuario_id != null && usuario_id !== ""
        ? Number(usuario_id)
        : undefined,
  });
  return res.status(200).json({
    movimentacao: row,
    message: "Movimentação atualizada",
  });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  const row = await svc.deleteMovimentacao(id);
  return res.status(200).json({
    movimentacao: row,
    message: "Movimentação deletada",
  });
}
