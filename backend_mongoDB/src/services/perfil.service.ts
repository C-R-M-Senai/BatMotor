import mongoose from "mongoose";
import { Role } from "../types/domain";
import { Perfil } from "../models/index";

export async function createPerfil(data: {
  role: Role;
  descricao?: string | null;
}) {
  if (data.role === Role.GERENTE) {
    const exists = await Perfil.findOne({ role: Role.GERENTE }).lean();
    if (exists) {
      const err = new Error("Já existe um perfil GERENTE no sistema");
      (err as Error & { status: number }).status = 400;
      throw err;
    }
  }

  return Perfil.create({
    role: data.role,
    descricao: data.descricao ?? null,
  });
}

export function listPerfis() {
  return Perfil.find().lean();
}

export function findPerfil(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Perfil.findById(id).lean();
}

export function updatePerfil(
  id: string,
  data: { role?: Role; descricao?: string | null },
) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Perfil.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
}

export function deletePerfil(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Perfil.findByIdAndDelete(id).lean();
}
