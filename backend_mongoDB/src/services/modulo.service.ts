import mongoose from "mongoose";
import { Modulo } from "../models/index";

export function createModulo(data: { nome: string; descricao?: string | null }) {
  return Modulo.create({
    nome: data.nome,
    descricao: data.descricao ?? null,
  });
}

export function listModulos() {
  return Modulo.find().lean();
}

export function findModulo(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Modulo.findById(id).lean();
}

export function updateModulo(
  id: string,
  data: { nome?: string; descricao?: string | null },
) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Modulo.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
}

export function deleteModulo(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Modulo.findByIdAndDelete(id).lean();
}
