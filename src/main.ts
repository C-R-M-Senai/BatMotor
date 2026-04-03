import express, {Request, Response} from 'express';
import {prisma} from './lib/prisma';

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

app.post("/users", async(request:Request, response:Response) => {
  const {nome, email, senha, cpf, ativo} = request.body;
  const newUser = await prisma.usuario.create({
    data: {
      nome, email, senha, cpf, ativo
    }
  });
  return response.json(newUser);
});
app.get("/users", async(resquest:Request, response:Response) => {
  const listUsers = await prisma.usuario.findMany()
  return response.json(listUsers)
});
app.get("/users/:id", async(request:Request, response:Response) => {
  const oneUser = await prisma.usuario.findFirst();
  return response.json(oneUser);
})
app.put("/users/:id", async(request:Request, response:Response) => {
  const {nome, email, senha} = request.body;
  const atualizarUser = await prisma.usuario.update({
    data: {
      nome, email, senha
    },
    where: {
      id: Number(request.params.id)
    }
  });
  return response.json(atualizarUser);
})
app.delete("/users/:id", async(request:Request, response:Response) => {
  const deletarUser = await prisma.usuario.delete({
    where: {
      id: Number(request.params.id)
    }
  });
  return response.json(deletarUser);
})
// Fim rota usuario '-'
// rota perfil
app.post("/perfil", async (request:Request, response:Response) => {
  const {role, descricao} = request.body;
  const newPerfil = await prisma.perfil.create({
    data: {
      role, descricao
    }
  });
  return response.json(newPerfil);
})
app.get("/perfil", async(request:Request, response:Response)=>{
  const allPerfils = await prisma.perfil.findMany();
  return response.json(allPerfils);
})
app.get("/perfil/:id", async(request:Request, response:Response) => {
  const onePerfil = await prisma.perfil.findMany();
  return response.json(onePerfil);
})
app.put("/perfil/:id", async(request:Request, response:Response) => {
  const {role, descricao} = request.body;
  const atualizarPerfil = await prisma.perfil.update({
    data: {
      role, descricao
    },
    where: {id: Number(request.params.id)}
  });
  return response.json(atualizarPerfil);
})
app.delete("/perfil/:id", async(request:Request, response:Response) => {
  const deletarPerfil = await prisma.perfil.delete({
    where: {id: Number(request.params.id)}
  });
});
// fim rota perfil
// 


app.listen(3000, ()=> console.log("Servidor rodando na porta 3000."))

