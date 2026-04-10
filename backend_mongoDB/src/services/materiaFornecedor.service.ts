import mongoose from "mongoose";
import { MateriaFornecedor } from "../models/index";

export function createMateriaFornecedor(data: {
  materia_prima_id: string;
  fornecedor_id: string;
}) {
  return MateriaFornecedor.create({
    materia_prima_id: new mongoose.Types.ObjectId(data.materia_prima_id),
    fornecedor_id: new mongoose.Types.ObjectId(data.fornecedor_id),
  });
}

export async function listMateriaFornecedor() {
  return MateriaFornecedor.find()
    .populate({ path: "materia_prima_id", options: { lean: true } })
    .populate({ path: "fornecedor_id", options: { lean: true } })
    .lean();
}

export async function findMateriaFornecedor(
  materiaPrimaId: string,
  fornecedorId: string,
) {
  if (
    !mongoose.Types.ObjectId.isValid(materiaPrimaId) ||
    !mongoose.Types.ObjectId.isValid(fornecedorId)
  ) {
    return null;
  }
  return MateriaFornecedor.findOne({
    materia_prima_id: new mongoose.Types.ObjectId(materiaPrimaId),
    fornecedor_id: new mongoose.Types.ObjectId(fornecedorId),
  })
    .populate({ path: "materia_prima_id", options: { lean: true } })
    .populate({ path: "fornecedor_id", options: { lean: true } })
    .lean();
}

export async function updateMateriaFornecedor(
  materiaId: string,
  fornecedorId: string,
  body: { nova_materia_id?: string; novo_fornecedor_id?: string },
) {
  if (
    !mongoose.Types.ObjectId.isValid(materiaId) ||
    !mongoose.Types.ObjectId.isValid(fornecedorId)
  ) {
    throw new Error("Ids inválidos");
  }
  const materiaUpdate = body.nova_materia_id ?? materiaId;
  const fornecedorUpdate = body.novo_fornecedor_id ?? fornecedorId;
  if (
    !mongoose.Types.ObjectId.isValid(materiaUpdate) ||
    !mongoose.Types.ObjectId.isValid(fornecedorUpdate)
  ) {
    throw new Error("Ids inválidos");
  }

  await MateriaFornecedor.deleteOne({
    materia_prima_id: new mongoose.Types.ObjectId(materiaId),
    fornecedor_id: new mongoose.Types.ObjectId(fornecedorId),
  });

  return MateriaFornecedor.create({
    materia_prima_id: new mongoose.Types.ObjectId(materiaUpdate),
    fornecedor_id: new mongoose.Types.ObjectId(fornecedorUpdate),
  });
}

export function deleteMateriaFornecedor(
  materiaPrimaId: string,
  fornecedorId: string,
) {
  if (
    !mongoose.Types.ObjectId.isValid(materiaPrimaId) ||
    !mongoose.Types.ObjectId.isValid(fornecedorId)
  ) {
    return Promise.resolve(null);
  }
  return MateriaFornecedor.findOneAndDelete({
    materia_prima_id: new mongoose.Types.ObjectId(materiaPrimaId),
    fornecedor_id: new mongoose.Types.ObjectId(fornecedorId),
  }).lean();
}
