import mongoose from "mongoose";
import { Teste } from "../models/index";

export function listTeste() {
  return Teste.find().lean();
}

export function findTeste(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return Teste.findById(id).lean();
}

export function createTeste(data: { nome: string; email: string; senha: string }) {
  return Teste.create(data);
}

export function updateTeste(
  id: string,
  data: { nome?: string; email?: string; senha?: string },
) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Teste.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
}

export function deleteTeste(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return Promise.resolve(null);
  return Teste.findByIdAndDelete(id).lean();
}
