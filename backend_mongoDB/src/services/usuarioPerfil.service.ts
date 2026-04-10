import mongoose from "mongoose";
import { UsuarioPerfil } from "../models/index";

export function createUsuarioPerfil(data: {
  usuario_id: string;
  perfil_id: string;
}) {
  return UsuarioPerfil.create({
    usuario_id: new mongoose.Types.ObjectId(data.usuario_id),
    perfil_id: new mongoose.Types.ObjectId(data.perfil_id),
  });
}

export function listUsuarioPerfis() {
  return UsuarioPerfil.find()
    .populate({
      path: "usuario_id",
      select: "nome email",
      options: { lean: true },
    })
    .populate({
      path: "perfil_id",
      select: "role descricao",
      options: { lean: true },
    })
    .lean();
}

export function findUsuarioPerfil(usuarioId: string, perfilId: string) {
  if (
    !mongoose.Types.ObjectId.isValid(usuarioId) ||
    !mongoose.Types.ObjectId.isValid(perfilId)
  ) {
    return null;
  }
  return UsuarioPerfil.findOne({
    usuario_id: new mongoose.Types.ObjectId(usuarioId),
    perfil_id: new mongoose.Types.ObjectId(perfilId),
  })
    .populate({
      path: "usuario_id",
      select: "nome email",
      options: { lean: true },
    })
    .populate({
      path: "perfil_id",
      select: "role descricao",
      options: { lean: true },
    })
    .lean();
}

export async function updateUsuarioPerfil(
  usuarioId: string,
  perfilId: string,
  body: { novo_usuario_id?: string; novo_perfil_id?: string },
) {
  if (
    !mongoose.Types.ObjectId.isValid(usuarioId) ||
    !mongoose.Types.ObjectId.isValid(perfilId)
  ) {
    throw new Error("Ids inválidos");
  }
  const usuarioUpdate = body.novo_usuario_id ?? usuarioId;
  const perfilUpdate = body.novo_perfil_id ?? perfilId;
  if (
    !mongoose.Types.ObjectId.isValid(usuarioUpdate) ||
    !mongoose.Types.ObjectId.isValid(perfilUpdate)
  ) {
    throw new Error("Ids inválidos");
  }

  await UsuarioPerfil.deleteOne({
    usuario_id: new mongoose.Types.ObjectId(usuarioId),
    perfil_id: new mongoose.Types.ObjectId(perfilId),
  });

  return UsuarioPerfil.create({
    usuario_id: new mongoose.Types.ObjectId(usuarioUpdate),
    perfil_id: new mongoose.Types.ObjectId(perfilUpdate),
  });
}

export function deleteUsuarioPerfil(usuarioId: string, perfilId: string) {
  if (
    !mongoose.Types.ObjectId.isValid(usuarioId) ||
    !mongoose.Types.ObjectId.isValid(perfilId)
  ) {
    return Promise.resolve(null);
  }
  return UsuarioPerfil.findOneAndDelete({
    usuario_id: new mongoose.Types.ObjectId(usuarioId),
    perfil_id: new mongoose.Types.ObjectId(perfilId),
  }).lean();
}
