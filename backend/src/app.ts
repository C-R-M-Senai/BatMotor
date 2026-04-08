import express from "express";
import { registerRoutes } from "./routes/index";
import { errorHandler } from "./middlewares/errorHandler";

/**
 * Fábrica da aplicação Express (sem subir a porta).
 * Separamos de `main.ts` para facilitar testes futuros e leitura didática.
 */
export function createApp() {
  const app = express();
  /**
   * JSON: por padrão o Express só faz parse com `Content-Type: application/json`.
   * Postman/cURL às vezes mandam o body JSON sem esse header (ou como text/plain) —
   * aí `req.body` fica vazio e o middleware de JWT acha que “falta token”.
   *
   * Só NÃO tratamos como JSON quando é claramente form ou multipart (aí o parser abaixo lê).
   */
  app.use(
    express.json({
      type: (req) => {
        const ct = (req.headers["content-type"] ?? "")
          .split(";")[0]
          .trim()
          .toLowerCase();
        if (ct === "application/x-www-form-urlencoded") return false;
        if (ct.startsWith("multipart/")) return false;
        return true;
      },
    }),
  );
  app.use(express.urlencoded({ extended: true }));

  registerRoutes(app);

  app.use(errorHandler);
  return app;
}
