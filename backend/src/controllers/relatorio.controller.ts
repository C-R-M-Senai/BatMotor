import type { Request, Response } from "express";
import * as svc from "../services/relatorio.service";

/** GET /relatorios/estoque-baixo — dados para relatório / alertas à equipe de compras. */
export async function estoqueBaixo(_req: Request, res: Response) {
  const rows = await svc.listEstoqueAbaixoMinimo();
  return res.status(200).json({
    gerado_em: new Date().toISOString(),
    total_alertas: rows.length,
    itens: rows,
  });
}
