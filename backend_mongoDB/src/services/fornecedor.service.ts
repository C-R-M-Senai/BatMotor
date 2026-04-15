import mongoose from "mongoose";
import { Fornecedor } from "../models/index";

export type FornecedorExtras = {
  nome_contato?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  categoria?: string | null;
  tipo_fornecedor?: string | null;
  data_inicio?: string | null;
  condicoes_pagamento?: string | null;
  observacoes?: string | null;
};

export function createFornecedor(
  data: {
    nome: string;
    cnpj: string;
    email?: string | null;
    telefone?: string | null;
    ativo?: boolean;
  } & FornecedorExtras,
) {
  return Fornecedor.create({
    nome: data.nome,
    cnpj: data.cnpj,
    email: data.email ?? null,
    telefone: data.telefone ?? null,
    ativo: data.ativo ?? true,
    nome_contato: data.nome_contato ?? null,
    endereco: data.endereco ?? null,
    cidade: data.cidade ?? null,
    estado: data.estado ?? null,
    categoria: data.categoria ?? null,
    tipo_fornecedor: data.tipo_fornecedor ?? null,
    data_inicio: data.data_inicio ?? null,
    condicoes_pagamento: data.condicoes_pagamento ?? null,
    observacoes: data.observacoes ?? null,
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
  } & FornecedorExtras,
) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Fornecedor.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
}

export function deleteFornecedor(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Fornecedor.findByIdAndDelete(id).lean();
}
