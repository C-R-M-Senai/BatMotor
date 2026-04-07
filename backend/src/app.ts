import express from "express";
import { registerRoutes } from "./routes/index";
import { errorHandler } from "./middlewares/errorHandler";

/**
 * Fábrica da aplicação Express (sem subir a porta).
 * Separamos de `main.ts` para facilitar testes futuros e leitura didática.
 */
export function createApp() {
  const app = express();
  app.use(express.json());

  registerRoutes(app);

  app.use(errorHandler);
  return app;
}
