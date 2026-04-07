/**
 * Dados mínimos para desenvolvimento: perfil ADMIN + usuário admin@batmotor.com.
 * Execute: `npx prisma db seed` (com MySQL no ar e `.env` carregado).
 */
import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/utils/password";

const ADMIN_EMAIL = "admin@batmotor.com";
const ADMIN_SENHA_PLAIN = "adminbatmotor";
/** CPF fictício só para dev; único na tabela `Usuario`. */
const ADMIN_CPF = "00000000191";

async function main() {
  const senhaHash = await hashPassword(ADMIN_SENHA_PLAIN);

  let perfilAdmin = await prisma.perfil.findFirst({
    where: { role: "ADMIN" },
  });
  if (!perfilAdmin) {
    perfilAdmin = await prisma.perfil.create({
      data: {
        role: "ADMIN",
        descricao: "Administrador (seed)",
      },
    });
  }

  /**
   * Não usar só `upsert` por e-mail: se já existir outro usuário com o mesmo CPF de dev
   * (ex.: seed antigo `admin@empresa.com`), o `create` quebra com P2002 em `Usuario_cpf_key`.
   */
  const porEmail = await prisma.usuario.findUnique({
    where: { email: ADMIN_EMAIL },
  });
  const porCpf = await prisma.usuario.findUnique({
    where: { cpf: ADMIN_CPF },
  });

  let usuario;
  if (porEmail) {
    usuario = await prisma.usuario.update({
      where: { id: porEmail.id },
      data: {
        nome: "Administrador BatMotor",
        senha: senhaHash,
        ativo: true,
      },
    });
  } else if (porCpf) {
    usuario = await prisma.usuario.update({
      where: { id: porCpf.id },
      data: {
        email: ADMIN_EMAIL,
        nome: "Administrador BatMotor",
        senha: senhaHash,
        ativo: true,
      },
    });
  } else {
    usuario = await prisma.usuario.create({
      data: {
        email: ADMIN_EMAIL,
        nome: "Administrador BatMotor",
        senha: senhaHash,
        cpf: ADMIN_CPF,
        ativo: true,
      },
    });
  }

  const jaVinculado = await prisma.usuarioPerfil.findUnique({
    where: {
      usuario_id_perfil_id: {
        usuario_id: usuario.id,
        perfil_id: perfilAdmin.id,
      },
    },
  });
  if (!jaVinculado) {
    await prisma.usuarioPerfil.create({
      data: {
        usuario_id: usuario.id,
        perfil_id: perfilAdmin.id,
      },
    });
  }

  console.log(
    `[seed] Pronto: login com email "${ADMIN_EMAIL}" e a senha configurada no seed.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
