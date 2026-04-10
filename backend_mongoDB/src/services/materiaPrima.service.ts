import mongoose from "mongoose";
import { MateriaPrima } from "../models/index";

export function createMateriaPrima(data: {
  nome: string;
  categoria: string;
  unidade: string;
  estoque_minimo: number;
  ativo?: boolean;
}) {
  return MateriaPrima.create({
    nome: data.nome,
    categoria: data.categoria,
    unidade: data.unidade,
    estoque_minimo: data.estoque_minimo,
    ativo: data.ativo ?? true,
  });
}

export async function listMateriaPrima(filters?: {
  categoria?: string;
  busca?: string;
  ativo?: boolean;
}) {
  const q: mongoose.FilterQuery<typeof MateriaPrima> = {};
  if (filters?.categoria?.trim()) {
    q.categoria = filters.categoria.trim();
  }
  if (filters?.ativo !== undefined) {
    q.ativo = filters.ativo;
  }
  const busca = filters?.busca?.trim();
  if (busca) {
    q.$or = [
      { nome: { $regex: busca, $options: "i" } },
      { categoria: { $regex: busca, $options: "i" } },
    ];
  }
  return MateriaPrima.find(q).sort({ nome: 1 }).lean();
}

export function findMateriaPrima(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return MateriaPrima.findById(id).lean();
}

export function updateMateriaPrima(
  id: string,
  data: {
    nome?: string;
    categoria?: string;
    unidade?: string;
    estoque_minimo?: number;
    ativo?: boolean;
  },
) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Promise.resolve(null);
  }
  return MateriaPrima.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
}

export function deleteMateriaPrima(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Promise.resolve(null);
  }
  return MateriaPrima.findByIdAndDelete(id).lean();
}
