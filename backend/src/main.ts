import express, { Request, Response } from "express";
import { prisma } from "./lib/prisma";

const app = express();
app.use(express.json());

// Rota Usuarios
app.post("/users", async (req: Request, res: Response) => {
  try {
    const { nome, email, senha, cpf, ativo } = req.body;
    if (!nome || !email || !senha || !cpf) {
      return res.status(400).json({ error: "Campos obrigatórios" });
    }
    const newUser = await prisma.usuario.create({
      data: { nome, email, senha, cpf, ativo },
    });
    return res.status(201).json(newUser);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res
        .status(409)
        .json({ error: "Usuário já existe com esse cpf ou email" });
    }
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
app.get("/users", async (req: Request, res: Response) => {
  try {
    const listUsers = await prisma.usuario.findMany();
    return res.status(200).json(listUsers);
  } catch {
    return res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ erro: "Id inválido" });
    }
    const findOneUser = await prisma.usuario.findUnique({ where: { id } });
    if (!findOneUser) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    return res.status(200).json(findOneUser);
  } catch (error) {
    return res.status(500).json({ error: "Erro do servidor" });
  }
});

app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nome, email, senha } = req.body;
    if (isNaN(id)) {
      return res.status(404).json({ error: "Id inválido" });
    }
    if (!nome || !email || !senha) {
      return res.status(404).json({ error: "Campos obrigatórios" });
    }
    const atualizarUser = await prisma.usuario.update({
      where: { id },
      data: { nome, email, senha },
    });
    return res.status(200).json({
      usuario: atualizarUser,
      message: "Usuário atualizado com sucesso",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }
    if (error.code === "P2022") {
      return res.status(409).json({ error: "Email já cadastrado" });
    }
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Id inválido" });
    }
    const deletarUser = await prisma.usuario.delete({
      where: { id },
    });
    return res
      .status(200)
      .json({ usuario: deletarUser, message: "Usuário deletado com sucesso." });
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Usuário não encontrado" });
  }
});
// Fim rota usuario '-'
// rota perfil
app.post("/perfil", async (request: Request, response: Response) => {
  const { role, descricao } = request.body;

  // Se for GERENTE, verifica se já existe
  if (role === "GERENTE") {
    const gerenteExistente = await prisma.perfil.findFirst({
      where: { role: "GERENTE" },
    });

    if (gerenteExistente) {
      return response.status(400).json({
        erro: "Já existe um perfil GERENTE no sistema",
      });
    }
  }

  const newPerfil = await prisma.perfil.create({
    data: {
      role,
      descricao,
    },
  });
  return response.json(newPerfil);
});
app.get("/perfil", async (req: Request, res: Response) => {
  try {
    const findAllPerfil = await prisma.perfil.findMany();
    return res.status(200).json(findAllPerfil);
  } catch {
    return res.status(500).json({ error: "Erro ao buscar perfils" });
  }
});
app.get("/perfil/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Id inválido" });
    }
    const findOnePerfil = await prisma.perfil.findFirst({ where: { id } });
    if (!findOnePerfil) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }
    return res.status(200).json(findOnePerfil);
  } catch {
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
app.put("/perfil/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { role, descricao } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Id inválido" });
    }
    if (!role || !descricao) {
      return res.status(400).json({ error: "Campos Obrigatórios" });
    }
    const atualizarPerfil = await prisma.perfil.update({
      where: { id },
      data: { role, descricao },
    });
    return res.status(200).json({
      perfil: atualizarPerfil,
      message: "Perfil atualizado com sucesso",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Perfil já existe com essa role" });
    }
  }
});
app.delete("/perfil/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({ error: "Id inválido" });
    }
    const deletarPerfil = await prisma.perfil.delete({
      where: { id },
    });
    return res.status(200).json({
      perfil: deletarPerfil,
      message: "Perfil deletado com sucesso",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }
  }
});
// fim rota perfil
// Rota modulo
app.post("/modulos", async (req: Request, res: Response) => {
  try {
    const { nome, descricao } = req.body;

    if (!nome || !descricao) {
      return res.status(404).json({ error: "Campos obrigatórios" });
    }
    const newModulo = await prisma.modulo.create({
      data: { nome, descricao },
    });
    return res.status(201).json(newModulo);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Já existe modulo com esse nome" });
    }
  }
});
app.get("/modulos", async (req: Request, res: Response) => {
  try {
    const findAllModulos = await prisma.modulo.findMany();
    return res.status(200).json(findAllModulos);
  } catch {
    return res.status(500).json({ error: "Erro ao buscar modulos" });
  }
});
app.get("/modulos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Id inválido" });
    }
    const findOneModulo = await prisma.modulo.findFirst({ where: { id } });
    if (!findOneModulo) {
      return res.status(404).json({ error: "Modulo não encontrado" });
    }
    return res.status(200).json(findOneModulo);
  } catch {
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
app.put("/modulos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nome, descricao } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Id inválido" });
    }
    if (!nome || !descricao) {
      return res.status(400).json({ error: "Campos obrigatórios" });
    }
    const atualizarModulo = await prisma.modulo.update({
      where: { id },
      data: { nome, descricao },
    });
    return res.status(200).json({
      modulo: atualizarModulo,
      message: "Modulo atualizado com sucesso",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Modulo não encontrado" });
    }
    if (error.code === "P2022") {
      return res.status(409).json({ error: "Já existe modulo com esse nome" });
    }
  }
});
app.delete("/modulos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Id inválido" });
    }
    const deleteModulo = await prisma.modulo.delete({ where: { id } });
    return res.status(200).json({
      modulo: deleteModulo,
      message: "Modulo deletado com sucesso",
    });
  } catch (error: any) {
    return res.status(404).json({ error: "Modulo não encontrado" });
  }
});
// FIm rota modulo
// Rota usuário-perfil
app.post("/user-perfil", async (req: Request, res: Response) => {
  try {
    const { usuario_id, perfil_id } = req.body;

    if (!usuario_id || !perfil_id) {
      return res.status(400).json({ error: "Campos obrigatórios" });
    }
    const newUserPerfil = await prisma.usuarioPerfil.create({
      data: { usuario_id, perfil_id },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        perfil: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });
    return res.status(201).json(newUserPerfil);
  } catch (error: any) {
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Usuário ou perfil inválido" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Relacionamento já existe" });
    }
  }
});

// 
app.get("/user-perfil", async (request: Request, response: Response) => {
  const findAllUserPerfil = await prisma.usuarioPerfil.findMany({
    include: {
      usuario: {
        select: {
          id: true,
          nome: true,
          email: true,
        },
      },
      perfil: {
        select: {
          id: true,
          role: true,
          descricao: true,
        },
      },
    },
  });
  const resultado = findAllUserPerfil.map((up) => ({
    usuario: up.usuario,
    perfil: up.perfil,
  }));
  return response.json(resultado);
});

// GET por usuário_id e perfil_id
app.get("/user-perfil/:usuario_id/:perfil_id", async (req: Request, res: Response) => {
  try {
    const { usuario_id, perfil_id } = req.params;

    if (isNaN(Number(usuario_id)) || isNaN(Number(perfil_id))) {
      return res.status(400).json({ error: "IDs inválidos" });
    }

    const userPerfil = await prisma.usuarioPerfil.findUnique({
      where: {
        usuario_id_perfil_id: {
          usuario_id: Number(usuario_id),
          perfil_id: Number(perfil_id),
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        perfil: {
          select: {
            id: true,
            role: true,
            descricao: true,
          },
        },
      },
    });

    if (!userPerfil) {
      return res.status(404).json({ error: "Relacionamento não encontrado" });
    }

    return res.status(200).json(userPerfil);
  } catch (error) {
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

//  Atualizar relacionamento usuario-perfil
app.put("/user-perfil/:usuario_id/:perfil_id", async (req: Request, res: Response) => {
  try {
    const { usuario_id, perfil_id } = req.params;
    const { novo_usuario_id, novo_perfil_id } = req.body;

    if (isNaN(Number(usuario_id)) || isNaN(Number(perfil_id))) {
      return res.status(400).json({ error: "IDs inválidos" });
    }

    if (!novo_usuario_id && !novo_perfil_id) {
      return res.status(400).json({ error: "Informe pelo menos um novo ID" });
    }

    // Verificar se a relação atual existe
    const relacaoExistente = await prisma.usuarioPerfil.findUnique({
      where: {
        usuario_id_perfil_id: {
          usuario_id: Number(usuario_id),
          perfil_id: Number(perfil_id),
        },
      },
    });

    if (!relacaoExistente) {
      return res.status(404).json({ error: "Relacionamento não encontrado" });
    }

    // Como a chave é composta, precisamos deletar a antiga e criar uma nova
    const usuarioUpdate = novo_usuario_id ? Number(novo_usuario_id) : Number(usuario_id);
    const perfilUpdate = novo_perfil_id ? Number(novo_perfil_id) : Number(perfil_id);

    await prisma.usuarioPerfil.delete({
      where: {
        usuario_id_perfil_id: {
          usuario_id: Number(usuario_id),
          perfil_id: Number(perfil_id),
        },
      },
    });

    const relacaoAtualizada = await prisma.usuarioPerfil.create({
      data: {
        usuario_id: usuarioUpdate,
        perfil_id: perfilUpdate,
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        perfil: {
          select: {
            id: true,
            role: true,
            descricao: true,
          },
        },
      },
    });

    return res.status(200).json({
      relacionamento: relacaoAtualizada,
      message: "Relacionamento atualizado com sucesso",
    });
  } catch (error: any) {
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Usuário ou perfil inválido" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Esse relacionamento já existe" });
    }
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Deletar relacionamento usuario-perfil
app.delete("/user-perfil/:usuario_id/:perfil_id", async (req: Request, res: Response) => {
  try {
    const { usuario_id, perfil_id } = req.params;

    if (isNaN(Number(usuario_id)) || isNaN(Number(perfil_id))) {
      return res.status(400).json({ error: "IDs inválidos" });
    }

    const relacionamentoDeletado = await prisma.usuarioPerfil.delete({
      where: {
        usuario_id_perfil_id: {
          usuario_id: Number(usuario_id),
          perfil_id: Number(perfil_id),
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nome: true,
            email: true,
          },
        },
        perfil: {
          select: {
            id: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      relacionamento: relacionamentoDeletado,
      message: "Relacionamento deletado com sucesso",
    });
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Relacionamento não encontrado" });
    }
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

// Rota fornecedores > feito por george albuquerque
app.post("/fornecedores", async (req: Request, res: Response) => {
  try {
    const { nome, cnpj, email, telefone } = req.body;
    if (!nome || !cnpj || !email || !telefone) {
      return res.status(400).json({ error: "Campos obrigatórios" });
    }
    const newFornecedor = await prisma.fornecedor.create({
      data: {
        nome,
        cnpj,
        email,
        telefone,
      },
    });
    return res.json(newFornecedor);
  } catch (error) {
    return res.status(400).json({
      error: "CNPJ já cadastrado",
    });
  }
});

app.get("/fornecedores", async (req: Request, res: Response) => {
  const findAllFornecedor = await prisma.fornecedor.findMany();
  return res.json(findAllFornecedor);
});

app.get("/fornecedores/:id", async (req: Request, res: Response) => {
  try {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: Number(req.params.id) },
    });
    if (!fornecedor) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }
    return res.json(fornecedor);
  } catch (error) {
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
app.put("/fornecedores/:id", async (req: Request, res: Response) => {
  try {
    const { nome, email, telefone } = req.body;
    const atualizarFornecedor = await prisma.fornecedor.update({
      data: {
        nome,
        email,
        telefone,
      },
      where: {
        id: Number(req.params.id),
      },
    });
    return res.json(atualizarFornecedor);
  } catch (error) {
    if (error) {
      return res
        .status(404)
        .json({ error: "Atualize se necessario só o nome, email e telefone" });
    }
    res.status(500).json({
      error: "Erro no servidor",
    });
  }
});
app.delete("/fornecedores/:id", async (req: Request, res: Response) => {
  try {
    const deletarFornecedor = await prisma.fornecedor.delete({
      where: { id: Number(req.params.id) },
    });
    return res.json({
      fornecedor: deletarFornecedor,
      message: "Usuário deletado com sucesso!",
    });
  } catch (error: any) {
    if (error) {
      return res.status(404).json({ error: "Fornecedor não encontrado" });
    }
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
// fim rota fornecedor

// rota materia-fornecedor > feito por george albuquerque
app.post("/materia-fornecedor", async (req: Request, res: Response) => {
  try {
    const { materia_prima_id, fornecedor_id } = req.body;

    if (!materia_prima_id || !fornecedor_id) {
      return res.status(400).json({ error: "Campos obrigatórios" });
    }
    const relation = await prisma.materiaFornecedor.create({
      data: {
        materia_prima_id,
        fornecedor_id,
      },
    });
    return res.json(relation);
  } catch (erro: any) {
    if (erro.code === "P2002") {
      return res.status(400).json({ error: "Relação já existe" });
    }
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
app.get("/materia-fornecedor", async (req: Request, res: Response) => {
  try {
    const list = await prisma.materiaFornecedor.findMany({
      include: { materia: true, fornecedor: true },
    });
    return res.json(list);
  } catch (error) {
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
app.get(
  "/materia-fornecedor/:materiaid/:fornecedorid",
  async (req: Request, res: Response) => {
    try {
      const { materiaid, fornecedorid } = req.params;

      const relacao = await prisma.materiaFornecedor.findUnique({
        where: {
          materia_prima_id_fornecedor_id: {
            materia_prima_id: Number(materiaid),
            fornecedor_id: Number(fornecedorid),
          },
        },
        include: { materia: true, fornecedor: true },
      });

      if (!relacao) {
        return res.status(404).json({ error: "Relação não encontrada" });
      }
      return res.status(200).json(relacao);
    } catch (error) {
      return res.status(500).json({ error: "Erro no servidor" });
    }
  },
);

app.put(
  "/materia-fornecedor/:materiaid/:fornecedorid",
  async (req: Request, res: Response) => {
    try {
      const { materiaid, fornecedorid } = req.params;
      const { nova_materia_id, novo_fornecedor_id } = req.body;

      if (!nova_materia_id && !novo_fornecedor_id) {
        return res.status(400).json({ error: "Informe pelo menos um novo ID" });
      }

      // Verificar se a relação atual existe
      const relacaoExistente = await prisma.materiaFornecedor.findUnique({
        where: {
          materia_prima_id_fornecedor_id: {
            materia_prima_id: Number(materiaid),
            fornecedor_id: Number(fornecedorid),
          },
        },
      });

      if (!relacaoExistente) {
        return res.status(404).json({ error: "Relação não encontrada" });
      }

      // Como a chave é composta, precisamos deletar a antiga e criar uma nova
      const materiaUpdate = nova_materia_id
        ? Number(nova_materia_id)
        : Number(materiaid);
      const fornecedorUpdate = novo_fornecedor_id
        ? Number(novo_fornecedor_id)
        : Number(fornecedorid);

      await prisma.materiaFornecedor.delete({
        where: {
          materia_prima_id_fornecedor_id: {
            materia_prima_id: Number(materiaid),
            fornecedor_id: Number(fornecedorid),
          },
        },
      });

      const relacaoAtualizada = await prisma.materiaFornecedor.create({
        data: {
          materia_prima_id: materiaUpdate,
          fornecedor_id: fornecedorUpdate,
        },
        include: { materia: true, fornecedor: true },
      });

      return res.status(200).json({
        relacao: relacaoAtualizada,
        message: "Relação atualizada com sucesso",
      });
    } catch (error: any) {
      if (error.code === "P2003") {
        return res
          .status(400)
          .json({ error: "Materia prima ou fornecedor inválido" });
      }
      if (error.code === "P2002") {
        return res.status(409).json({ error: "Essa relação já existe" });
      }
      return res.status(500).json({ error: "Erro no servidor" });
    }
  },
);

app.delete(
  "/materia-fornecedor/:materiaid/:fornecedorid",
  async (req: Request, res: Response) => {
    try {
      const { materiaid, fornecedorid } = req.params;

      const relacaoDeletada = await prisma.materiaFornecedor.delete({
        where: {
          materia_prima_id_fornecedor_id: {
            materia_prima_id: Number(materiaid),
            fornecedor_id: Number(fornecedorid),
          },
        },
      });

      return res.status(200).json({
        relacao: relacaoDeletada,
        message: "Relação deletada com sucesso",
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        return res.status(404).json({ error: "Relação não encontrada" });
      }
      return res.status(500).json({ error: "Erro no servidor" });
    }
  },
);
// fim rota materia-fornecedor

// rota materia-prima
app.post("/materia-prima", async (req: Request, res: Response) => {
  try {
    const { nome, categoria, unidade, estoque_minimo, ativo } = req.body;

    if (!nome || !categoria || !unidade || estoque_minimo === undefined) {
      return res.status(400).json({ error: "Campos obrigatórios" });
    }

    const newMateria = await prisma.materiaPrima.create({
      data: {
        nome,
        categoria,
        unidade,
        estoque_minimo: Number(estoque_minimo),
        ativo,
      },
    });
    return res.status(201).json(newMateria);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Matéria-prima já existe" });
    }
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

app.get("/materia-prima", async (req: Request, res: Response) => {
  try {
    const list = await prisma.materiaPrima.findMany();
    return res.status(200).json(list);
  } catch {
    return res.status(500).json({ error: "Erro ao buscar matérias primas" });
  }
});

app.get("/materia-prima/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Id inválido" });

    const materia = await prisma.materiaPrima.findUnique({ where: { id } });
    if (!materia)
      return res.status(404).json({ error: "Matéria-prima não encontrada" });
    return res.status(200).json(materia);
  } catch {
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

app.put("/materia-prima/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { nome, categoria, unidade, estoque_minimo, ativo } = req.body;
    if (isNaN(id)) return res.status(400).json({ error: "Id inválido" });
    if (!nome || !categoria || !unidade || estoque_minimo === undefined) {
      return res.status(400).json({ error: "Campos obrigatórios" });
    }

    const updated = await prisma.materiaPrima.update({
      where: { id },
      data: {
        nome,
        categoria,
        unidade,
        estoque_minimo: Number(estoque_minimo),
        ativo,
      },
    });
    return res
      .status(200)
      .json({
        materia: updated,
        message: "Matéria-prima atualizada com sucesso",
      });
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Matéria-prima não encontrada" });
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

app.delete("/materia-prima/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Id inválido" });

    const deleted = await prisma.materiaPrima.delete({ where: { id } });
    return res
      .status(200)
      .json({
        materia: deleted,
        message: "Matéria-prima deletada com sucesso",
      });
  } catch (error: any) {
    if (error.code === "P2025")
      return res.status(404).json({ error: "Matéria-prima não encontrada" });
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
// fim rota materiaprima
// rota permissaomodulo - gustavo

app.post("/permissao-modulo", async (req: Request, res: Response) => {
  try {
    const { perfil_id, modulo_id, pode_ler, pode_criar, pode_atualizar, pode_excluir } = req.body;

    if (!perfil_id || !modulo_id) {
      return res.status(400).json({ error: "Campos perfil_id e modulo_id obrigatorios" });
    }

    const newPermissao = await prisma.permissaoModulo.create({
      data: {
        perfil_id: Number(perfil_id),
        modulo_id: Number(modulo_id),
        pode_ler: pode_ler ?? false,
        pode_criar: pode_criar ?? false,
        pode_atualizar: pode_atualizar ?? false,
        pode_excluir: pode_excluir ?? false,
      },
      include: {
        perfil: true,
        modulo: true,
      },
    });

    return res.status(201).json(newPermissao);
  } catch (error: any) {
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Perfil ou Modulo invalido" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({ error: "Permissão para esse perfil e modulo ja existe" });
    }
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

app.get("/permissao-modulo", async (req: Request, res: Response) => {
  try {
    const findAllPermissoes = await prisma.permissaoModulo.findMany({
      include: {
        perfil: true,
        modulo: true,
      },
    });
    return res.status(200).json(findAllPermissoes);
  } catch {
    return res.status(500).json({ error: "Erro ao buscar permissões" });
  }
});

app.get("/permissao-modulo/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Id invalido" });

    const findOnePermissao = await prisma.permissaoModulo.findUnique({
      where: { id },
      include: { perfil: true, modulo: true },
    });

    if (!findOnePermissao) return res.status(404).json({ error: "Permissão não encontrada" });

    return res.status(200).json(findOnePermissao);
  } catch {
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

app.put("/permissao-modulo/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { perfil_id, modulo_id, pode_ler, pode_criar, pode_atualizar, pode_excluir } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: "Id inválido" });

    const atualizarPermissao = await prisma.permissaoModulo.update({
      where: { id },
      data: {
        perfil_id: perfil_id ? Number(perfil_id) : undefined,
        modulo_id: modulo_id ? Number(modulo_id) : undefined,
        pode_ler,
        pode_criar,
        pode_atualizar,
        pode_excluir,
      },
      include: { perfil: true, modulo: true },
    });

    return res.status(200).json({
      permissao: atualizarPermissao,
      message: "Permissão atualizada com sucesso",
    });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Permissão não encontrada" });
    if (error.code === "P2003") return res.status(400).json({ error: "Perfil ou Modulo invalido" });
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

app.delete("/permissao-modulo/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Id invalido" });

    const deletarPermissao = await prisma.permissaoModulo.delete({ where: { id } });

    return res.status(200).json({
      permissao: deletarPermissao,
      message: "Permissão deletada com sucesso",
    });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Permissão não encontrada" });
    return res.status(500).json({ error: "Erro no servidor" });
  }
});
//fim rota permissaomodulo

// rota estoqueatual - gustavo
app.post("/movimentacao", async (req: Request, res: Response) => {
  try {
    const { materia_prima_id, tipo, quantidade, motivo, usuario_id } = req.body;

    if (!materia_prima_id || !tipo || quantidade === undefined || !usuario_id) {
      return res.status(400).json({ error: "Campos obrigatórios: Materia Prima, tipo, quantidade, usuario" });
    }

    if (tipo !== "ENTRADA" && tipo !== "SAIDA") {
      return res.status(400).json({ error: "O tipo deve ser 'Entrada' ou 'Saida'" });
    }

    const qtdNumero = Number(quantidade);
    const materiaIdNum = Number(materia_prima_id);

    // evitar estoque negativo na saidaa
    if (tipo === "SAIDA") {
      const estoqueAtual = await prisma.estoqueAtual.findUnique({
        where: { materia_prima_id: materiaIdNum }
      });
      
      if (!estoqueAtual || estoqueAtual.quantidade < qtdNumero) {
        return res.status(400).json({ error: "Estoque insuficiente para essa saida." });
      }
    }

    // registro movimentação no historico
    const newMovimentacao = await prisma.movimentacao.create({
      data: {
        materia_prima_id: materiaIdNum,
        tipo,
        quantidade: qtdNumero,
        motivo,
        usuario_id: Number(usuario_id),
      },
      include: {
        materia: true,
        usuario: { select: { id: true, nome: true, email: true } },
      },
    });

    // atualiza o estoque auto - aux ia
    await prisma.estoqueAtual.upsert({
      where: { materia_prima_id: materiaIdNum },
      update: {
        quantidade: tipo === "ENTRADA" ? { increment: qtdNumero } : { decrement: qtdNumero },
      },
      create: {
        materia_prima_id: materiaIdNum,
        quantidade: tipo === "ENTRADA" ? qtdNumero : 0, 
      },
    });

    return res.status(201).json(newMovimentacao);
  } catch (error: any) {
    if (error.code === "P2003") {
      return res.status(400).json({ error: "Materia-prima ou Usuário invalido" });
    }
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

app.get("/movimentacao", async (req: Request, res: Response) => {
  try {
    const listMovimentacoes = await prisma.movimentacao.findMany({
      include: {
        materia: true,
        usuario: { select: { id: true, nome: true, email: true } },
      },
      orderBy: { data_atual: 'desc' }
    });
    return res.status(200).json(listMovimentacoes);
  } catch {
    return res.status(500).json({ error: "Erro ao buscar movimentaçoes" });
  }
});

app.get("/movimentacao/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Id invalido" });

    const movimentacao = await prisma.movimentacao.findUnique({
      where: { id },
      include: {
        materia: true,
        usuario: { select: { id: true, nome: true, email: true } },
      },
    });

    if (!movimentacao) return res.status(404).json({ error: "Movimentação não encontrada" });

    return res.status(200).json(movimentacao);
  } catch {
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

app.put("/movimentacao/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { materia_prima_id, tipo, quantidade, motivo, usuario_id } = req.body;

    if (isNaN(id)) return res.status(400).json({ error: "Id inválido" });
    if (tipo && tipo !== "ENTRADA" && tipo !== "SAIDA") {
      return res.status(400).json({ error: "O tipo deve ser 'Entrada' ou 'Saida'" });
    }

    const atualizarMovimentacao = await prisma.movimentacao.update({
      where: { id },
      data: {
        materia_prima_id: materia_prima_id ? Number(materia_prima_id) : undefined,
        tipo,
        quantidade: quantidade !== undefined ? Number(quantidade) : undefined,
        motivo,
        usuario_id: usuario_id ? Number(usuario_id) : undefined,
      },
      include: { materia: true, usuario: { select: { id: true, nome: true } } },
    });

    return res.status(200).json({
      movimentacao: atualizarMovimentacao,
      message: "Movimentação atualizada",
    });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Movimentação não encontrada" });
    if (error.code === "P2003") return res.status(400).json({ error: "Materia-prima ou Usuario invalido" });
    return res.status(500).json({ error: "Erro no servidor" });
  }
});

app.delete("/movimentacao/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Id inválido" });

    const deletarMovimentacao = await prisma.movimentacao.delete({ where: { id } });

    return res.status(200).json({
      movimentacao: deletarMovimentacao,
      message: "Movimentação deletada",
    });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ error: "Movimentação não encontrada" });
    return res.status(500).json({ error: "Erro no servidor" });
  }
});


app.listen(3000, () => console.log("Servidor rodando na porta 3000."));
