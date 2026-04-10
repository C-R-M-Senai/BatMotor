import mongoose from "mongoose";
import { Fornecedor } from "../models/index";

export function createFornecedor(data: {
  nome: string;
  cnpj: string;
  email?: string | null;
  telefone?: string | null;
  ativo?: boolean;
}) {
  return Fornecedor.create({
    nome: data.nome,
    cnpj: data.cnpj,
    email: data.email ?? null,
    telefone: data.telefone ?? null,
    ativo: data.ativo ?? true,
  });
}

export function listFornecedores() {
  return Fornecedor.find().lean();
}

export function findFornecedor(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Fornecedor.findById(id).lean();
}

export function updateFornecedor(
  id: string,
  data: {
    nome?: string;
    email?: string | null;
    telefone?: string | null;
    ativo?: boolean;
  },
) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Fornecedor.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
}

export function deleteFornecedor(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Fornecedor.findByIdAndDelete(id).lean();
}
