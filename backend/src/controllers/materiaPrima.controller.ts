import type { Request, Response } from "express";
import * as svc from "../services/materiaPrima.service";

export async function create(req: Request, res: Response) {
  const { nome, categoria, unidade, estoque_minimo, ativo } = req.body ?? {};
  if (!nome || !categoria || !unidade || estoque_minimo === undefined) {
    return res.status(400).json({ error: "Campos obrigatórios" });
  }
  const row = await svc.createMateriaPrima({
    nome,
    categoria,
    unidade,
    estoque_minimo: Number(estoque_minimo),
    ativo,
  });
  return res.status(201).json(row);
}

export async function list(_req: Request, res: Response) {
  const rows = await svc.listMateriaPrima();
  return res.status(200).json(rows);
}

export async function getById(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  const row = await svc.findMateriaPrima(id);
  if (!row) {
    return res.status(404).json({ error: "Matéria-prima não encontrada" });
  }
  return res.status(200).json(row);
}

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const { nome, categoria, unidade, estoque_minimo, ativo } = req.body ?? {};
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  if (!nome || !categoria || !unidade || estoque_minimo === undefined) {
    return res.status(400).json({ error: "Campos obrigatórios" });
  }
  const row = await svc.updateMateriaPrima(id, {
    nome,
    categoria,
    unidade,
    estoque_minimo: Number(estoque_minimo),
    ativo,
  });
  return res.status(200).json({
    materia: row,
    message: "Matéria-prima atualizada com sucesso",
  });
}

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Id inválido" });
  }
  const row = await svc.deleteMateriaPrima(id);
  return res.status(200).json({
    materia: row,
    message: "Matéria-prima deletada com sucesso",
  });
}
