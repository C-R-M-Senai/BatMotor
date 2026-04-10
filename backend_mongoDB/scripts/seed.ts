/**
 * Dados iniciais: perfis ADMIN, GERENTE, FUNCIONARIO e utilizadores de exemplo.
 * Requer MongoDB em execução e MONGODB_URI no .env.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { Role } from "../src/types/domain";
import { connectDb, disconnectDb } from "../src/lib/db";
import {
  MateriaPrima,
  Perfil,
  Usuario,
  UsuarioPerfil,
} from "../src/models/index";
import { hashPassword } from "../src/utils/password";

const usuariosSeed = [
  {
    email: "admin@batmotor.com",
    senha: "adminbatmotor",
    nome: "Administrador BatMotor",
    cpf: "00000000191",
    role: Role.ADMIN,
  },
  {
    email: "gerente.dev@batmotor.local",
    senha: "gerentebatmotor",
    nome: "Gerente (dev)",
    cpf: "11144477735",
    role: Role.GERENTE,
  },
  {
    email: "funcionario.dev@batmotor.local",
    senha: "funcionariobatmotor",
    nome: "Funcionário Almoxarifado (dev)",
    cpf: "39053344705",
    role: Role.FUNCIONARIO,
  },
];

async function ensurePerfil(role: Role, descricao: string) {
  let p = await Perfil.findOne({ role }).lean();
  if (!p) {
    const created = await Perfil.create({ role, descricao });
    p = created.toObject();
  }
  return p;
}

async function ensureUsuarioDev(input: {
  email: string;
  senhaPlain: string;
  nome: string;
  cpf: string;
}) {
  const porEmail = await Usuario.findOne({ email: input.email }).lean();
  const porCpf = await Usuario.findOne({ cpf: input.cpf }).lean();

  if (porEmail) {
    return Usuario.findByIdAndUpdate(
      porEmail._id,
      { nome: input.nome, ativo: true },
      { new: true },
    );
  }
  if (porCpf) {
    return Usuario.findByIdAndUpdate(
      porCpf._id,
      {
        email: input.email,
        nome: input.nome,
        ativo: true,
      },
      { new: true },
    );
  }
  const senhaHash = await hashPassword(input.senhaPlain);
  return Usuario.create({
    email: input.email,
    nome: input.nome,
    senha: senhaHash,
    cpf: input.cpf,
    ativo: true,
  });
}

async function vincularPerfil(
  usuarioId: mongoose.Types.ObjectId,
  perfilId: mongoose.Types.ObjectId,
) {
  const existe = await UsuarioPerfil.findOne({
    usuario_id: usuarioId,
    perfil_id: perfilId,
  }).lean();
  if (!existe) {
    await UsuarioPerfil.create({ usuario_id: usuarioId, perfil_id: perfilId });
  }
}

async function main() {
  await connectDb();

  const perfilPorRole = new Map<Role, { _id: mongoose.Types.ObjectId }>();

  for (const role of [Role.ADMIN, Role.GERENTE, Role.FUNCIONARIO]) {
    const p = await ensurePerfil(role, `Perfil ${role} (seed)`);
    perfilPorRole.set(role, { _id: p._id as mongoose.Types.ObjectId });
  }

  for (const u of usuariosSeed) {
    const usuario = await ensureUsuarioDev({
      email: u.email,
      senhaPlain: u.senha,
      nome: u.nome,
      cpf: u.cpf,
    });
    const perfil = perfilPorRole.get(u.role);
    if (usuario && perfil) {
      await vincularPerfil(usuario._id, perfil._id);
    }
  }

  const mpDev = await MateriaPrima.findOne({
    nome: "Parafuso M8 zincado (dev)",
  }).lean();
  if (!mpDev) {
    await MateriaPrima.create({
      nome: "Parafuso M8 zincado (dev)",
      categoria: "Fixação",
      unidade: "UN",
      estoque_minimo: 100,
      ativo: true,
    });
    console.log("[seed] Matéria-prima de exemplo criada.");
  }

  console.log("[seed] Utilizadores (login → JWT):");
  for (const u of usuariosSeed) {
    console.log(`  • ${u.role.padEnd(12)} ${u.email} / ${u.senha}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDb();
  });
