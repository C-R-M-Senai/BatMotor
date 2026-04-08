import cors from "cors";
import express from "express";
import { registerRoutes } from "./routes/index";
import { errorHandler } from "./middlewares/errorHandler";

const DEFAULT_CORS_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:4173",
];

function parseCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS?.trim();
  if (!raw) return DEFAULT_CORS_ORIGINS;
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Fábrica da aplicação Express (sem subir a porta).
 * Separamos de `main.ts` para facilitar testes futuros e leitura didática.
 */
export function createApp() {
  const app = express();

  const allowedOrigins = parseCorsOrigins();
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin) {
          callback(null, true);
          return;
        }
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(null, false);
      },
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  );

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
