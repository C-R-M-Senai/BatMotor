import mongoose from "mongoose";
import { EstoqueAtual } from "../models/index";

export async function listEstoqueAtual() {
  const rows = await EstoqueAtual.find()
    .populate({ path: "materia_prima_id", options: { lean: true } })
    .lean();

  return rows.map((r) => {
    const m = r.materia_prima_id as unknown as mongoose.FlattenMaps<{
      _id: mongoose.Types.ObjectId;
      nome: string;
      categoria: string;
      unidade: string;
      estoque_minimo: number;
      ativo: boolean;
    }>;
    const { _id, materia_prima_id, ...rest } = r;
    return {
      ...rest,
      id: String(_id),
      materia_prima_id: String(m._id),
      materia: {
        id: String(m._id),
        nome: m.nome,
        categoria: m.categoria,
        unidade: m.unidade,
        estoque_minimo: m.estoque_minimo,
        ativo: m.ativo,
      },
    };
  });
}
