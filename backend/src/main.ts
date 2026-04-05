import express, { Request, Response } from "express";
import { prisma } from "./lib/prisma";

const app = express();
app.use(express.json());

// Rotas testes para se basear

// app.get("/test", async (request:Request, response: Response)=>{
//   const tests = await prisma.teste.findMany();
//   return response.json(tests)
// })
// app.get("/test/:id", async (request: Request, response:Response) => {
//   const oneTest = await prisma.teste.findFirst();
//   return response.json(oneTest);
// })
// app.post("/test", async(request:Request, response: Response) => {
//   const {nome, email, senha} = request.body
//   const newTest = await prisma.teste.create({
//     data: {
//       nome, email, senha
//     }
//   })
//   return response.json(newTest)
// })
// app.put("/test/:id", async(request:Request, response:Response) => {
//   const {nome, email, senha} = request.body

//   const updateTest = await prisma.teste.update({
//     data: {
//       nome, email, senha
//     },
//     where: {
//       id: Number(request.params.id)
//     }
//   });
//   return response.json(updateTest);
// })
// app.delete("/test/:id", async(request: Request, response:Response) => {
//   await prisma.teste.delete({
//     where: {id: Number(request.params.id)}
//   })
// })

// Rota Usuarios
app.post("/users", async (req: Request, res: Response) => {
  try {
    const {nome, email, senha, cpf, ativo} = req.body;
    if(!nome || !email || !senha || !cpf) {
      return res.status(400).json({error: "Campos obrigatórios"});
    }
    const newUser = await prisma.usuario.create({
      data: {nome, email, senha, cpf, ativo},
    });
    return res.status(201).json(newUser);
 } catch (error: any) {
  if(error.code === "P2002") {
    return res.status(409).json({error: "Usuário já existe com esse cpf ou email"})
  }
  return res.status(500).json({error: "Erro no servidor"})
 }
});
app.get("/users", async (req: Request, res: Response) => {
 try {
   const listUsers = await prisma.usuario.findMany();
   return res.status(200).json(listUsers);
 } catch {
  return res.status(500).json({error: "Erro ao buscar usuários."})
 }
});
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
     if (isNaN(id)) {
      return res.status(400).json({erro: "Id inválido"});
     }
     const findOneUser = await prisma.usuario.findUnique({where: {id}})
     if(!findOneUser) {
      return res.status(404).json({error: "Usuário não encontrado"})
     }
     return res.status(200).json(findOneUser)
  } catch (error) {
    return res.status(500).json({error: "Erro do servidor"})
  }
});

app.put("/users/:id", async (req: Request, res: Response) => {
  try{
    const id = Number(req.params.id);
    const {nome, email, senha} = req.body;
    if(isNaN(id)) {
      return res.status(404).json({error: "Id inválido"})
    }
    if(!nome || !email || !senha) {
      return res.status(404).json({error: "Campos obrigatórios"});
    }
    const atualizarUser = await prisma.usuario.update({
      where: {id},
      data: {nome, email, senha},
    });
    return res.status(200).json({usuario: atualizarUser, message: "Usuário atualizado com sucesso"});
  } catch (error: any ){
    if(error.code === 'P2025') {
      return res.status(404).json({error: "Usuário não encontrado"})
    }
    if(error.code === "P2022") {
      return res.status(409).json({error: "Email já cadastrado"})
    }
    return res.status(500).json({error: "Erro no servidor"})
  }
});
app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if(isNaN(id)) {
      return res.status(400).json({error: "Id inválido"})
    }
    const deletarUser = await prisma.usuario.delete({
      where: {id},
    });
    return res.status(200).json({usuario: deletarUser, message: "Usuário deletado com sucesso."})
  } catch (error: any) {
    if(error.code === "P2025")
      return res.status(404).json({error: "Usuário não encontrado"})
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
  return res.status(500).json({error: "Erro ao buscar perfils"})
 }
});
app.get("/perfil/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if(isNaN(id)) {
      return res.status(400).json({error: "Id inválido"});
    }
    const findOnePerfil = await prisma.perfil.findFirst({where: {id}});
    if(!findOnePerfil) {
      return res.status(404).json({error: "Perfil não encontrado"});
    }
    return res.status(200).json(findOnePerfil);
  } catch {
    return res.status(500).json({error: "Erro no servidor"})
  }
});
app.put("/perfil/:id", async (req: Request, res: Response) => {
  try{
    const id = Number(req.params.id);
    const {role, descricao} = req.body;

    if(isNaN(id)) {
      return res.status(400).json({error: "Id inválido"})
    }
    if(!role || !descricao) {
      return res.status(400).json({error: "Campos Obrigatórios"})
    }
    const atualizarPerfil = await prisma.perfil.update({
      where: {id},
      data: {role, descricao},
    });
    return res.status(200).json({perfil: atualizarPerfil, message: "Perfil atualizado com sucesso"});
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({error: "Perfil não encontrado"});
    }
    if(error.code === "P2002") {
      return res.status(409).json({error: "Perfil já existe com essa role"});
    }
  }
});
app.delete("/perfil/:id", async (req: Request, res: Response) => {
  try {
   const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(404).json({error: "Id inválido"})
    }
    const deletarPerfil = await prisma.perfil.delete({
      where: {id},
    });
    return res.status(200).json({
      perfil: deletarPerfil,
      message: "Perfil deletado com sucesso"
    });
  } catch (error: any) {
    if (error.code === "P2025"){
      return res.status(404).json({error: "Perfil não encontrado"})
    }   
  }
});
// fim rota perfil
// Rota modulo
app.post("/modulos", async (req: Request, res: Response) => {
  try {
    const {nome, descricao} = req.body;

    if(!nome || !descricao) { 
      return res.status(404).json({error: "Campos obrigatórios"})
    }
    const newModulo = await prisma.modulo.create({
      data: {nome, descricao},
    })
    return res.status(201).json(newModulo)
  } catch (error:any) {
    if(error.code === "P2002") {
      return res.status(409).json({error: "Já existe modulo com esse nome"});
    }
  }
});
app.get("/modulos", async (req: Request, res: Response) => {
  try {
    const findAllModulos = await prisma.modulo.findMany();
    return res.status(200).json(findAllModulos);
  } catch {
    return res.status(500).json({error: "Erro ao buscar modulos"})
  }
});
app.get("/modulos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if(isNaN(id)) {
      return res.status(400).json({error: "Id inválido"});
    }
    const findOneModulo = await prisma.modulo.findFirst({where: {id}});
    if(!findOneModulo) {
      return res.status(404).json({error: "Modulo não encontrado"})
    }
      return res.status(200).json(findOneModulo)
  } catch {
    return res.status(500).json({error: "Erro no servidor"})
  }
});
app.put("/modulos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const {nome, descricao} = req.body;

    if(isNaN(id)) {
      return res.status(400).json({error: "Id inválido"})
    }
    if(!nome || !descricao) {
      return res.status(400).json({error: "Campos obrigatórios"})
    }
    const atualizarModulo = await prisma.modulo.update({
      where: {id},
      data: {nome, descricao},
    })
    return res.status(200).json({
      modulo: atualizarModulo,
      message: "Modulo atualizado com sucesso"
    });
  } catch (error: any) {
    if(error.code === "P2025") {
      return res.status(404).json({error: "Modulo não encontrado"})
    }
    if (error.code === "P2022") {
      return res.status(409).json({error: "Já existe modulo com esse nome"})
    }
  }
});
app.delete("/modulos/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id)
    if(isNaN(id)) {
      return res.status(400).json({error: "Id inválido"});
    }
    const deleteModulo = await prisma.modulo.delete({where: {id}});
    return res.status(200).json({
      modulo: deleteModulo,
      message: "Modulo deletado com sucesso"
    });
  } catch (error: any) {
    return res.status(404).json({error: "Modulo não encontrado"})
  }
});
// FIm rota modulo
// Rota usuário-perfil
app.post("/user-perfil", async (req: Request, res: Response) => {
  try{
    const {usuario_id, perfil_id} = req.body;

    if(!usuario_id || !perfil_id) {
      return res.status(400).json({error: "Campos obrigatórios"})
    }
    const newUserPerfil = await prisma.usuarioPerfil.create({
      data: {usuario_id, perfil_id},
      include: {
        usuario: {
          select: {
            id: true, nome: true, email: true
          },
        }, perfil: {
            select: {
              id: true, role: true
          },
        },
      },
    });
    return res.status(201).json(newUserPerfil);
  } catch (error: any) {
    if (error.code === "P2003") {
      return res.status(400).json({error: "Usuário ou perfil inválido"})
    }
    if(error.code === "P2002") {
      return res.status(409).json({error: "Relacionamento já existe"})
    }
  }
});

// Em construção não mexer
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

// Em construção não mexer
app.get("/user-perfil/:id", async (req: Request, res: Response) => {})
 

// Rota fornecedores > feito por george albuquerque 
  app.post("/fornecedores", async (req:Request, res:Response) => {
    try{
      const {nome, cnpj, email, telefone} = req.body;
      if(!nome || !cnpj ||!email ||!telefone) {
        return res.status(400).json({error: "Campos obrigatórios"});
      }
      const newFornecedor = await prisma.fornecedor.create({
        data: {
          nome, cnpj, email, telefone
        },
      });
      return res.json(newFornecedor)
    } catch (error){
      return res.status(400).json({
        error: "CNPJ já cadastrado"
      })
    }
  });

  app.get("/fornecedores", async(req:Request, res:Response) => {
    const findAllFornecedor = await prisma.fornecedor.findMany();
    return res.json(findAllFornecedor);
  })
  
  app.get("/fornecedores/:id", async(req:Request, res:Response) => {
    try {
      const fornecedor = await prisma.fornecedor.findUnique({
        where: {id: Number(req.params.id)},
      })
      if(!fornecedor) {
        return res.status(404).json({error: "Fornecedor não encontrado"})
      }
      return res.json(fornecedor)
    } catch(error) {
      return res.status(500).json({error: "Erro no servidor"})
    }
  });
  app.put("/fornecedores/:id", async(req:Request, res:Response) => {
    try {
      const {nome, email, telefone} = req.body;
      const atualizarFornecedor = await prisma.fornecedor.update({
        data: {
          nome, email, telefone
        },
        where: {
          id: Number(req.params.id),
        },
      });
      return res.json(atualizarFornecedor);
    } catch(error) {
      if(error){
        return res.status(404).json({error: "Atualize se necessario só o nome, email e telefone"})
      }
      res.status(500).json({
        error: "Erro no servidor"
      })
    }
  });
  app.delete("/fornecedores/:id", async(req:Request, res:Response) => {
    try{
      const deletarFornecedor = await prisma.fornecedor.delete({
        where: {id: Number(req.params.id)},
      });
      return res.json({ message: "Usuário deletado com sucesso!" });
    } catch (error: any) {
      if(error){
        return res.status(404).json({error: "Fornecedor não encontrado"})
      }
      return res.status(500).json({error:"Erro no servidor"})
    }
  })






app.listen(3000, () => console.log("Servidor rodando na porta 3000."));
