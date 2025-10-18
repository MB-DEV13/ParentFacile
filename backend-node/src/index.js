// ------------------------------------------------------------
// ParentFacile – Serveur Express léger (frontend/docs/auth API)
// ------------------------------------------------------------
// Objectif : point d’entrée simplifié pour servir les routes publiques,
// avec sécurité, CORS dynamique, et logs de développement.
//
// Ce fichier est utile pour des environnements légers
// (tests, frontend intégré, preview) sans toute la logique MySQL/Nodemailer.
// ------------------------------------------------------------

import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "node:path";

import buildCors from "./middleware/cors.js";
import docsRouter from "./routes/docs.js";
import authRouter from "./routes/auth.js";

// ------------------------------------------------------------
// CONFIGURATION DE BASE
// ------------------------------------------------------------
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5174);

// ------------------------------------------------------------
// MIDDLEWARES GLOBAUX
// ------------------------------------------------------------

// Sécurité HTTP (en-têtes sécurisés : noSniff, XSS, etc.)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// JSON body parser
app.use(express.json({ limit: "256kb" }));

// Logger HTTP (dev friendly)
app.use(morgan("dev"));

// CORS dynamique (supporte cookies et whitelist depuis .env)
app.use(buildCors(process.env.ALLOWED_ORIGINS));

// ------------------------------------------------------------
// RESSOURCES STATIQUES
// ------------------------------------------------------------
// Sert les PDF publics (ex: ressources documentaires)
app.use(
  "/pdfs",
  express.static(path.join(process.cwd(), "public", "pdfs"), {
    immutable: true,
    maxAge: "7d",
  })
);

// ------------------------------------------------------------
// ROUTES
// ------------------------------------------------------------

// Routes publiques
app.use("/api/docs", docsRouter);
app.use("/api/auth", authRouter);

// Route racine de santé simple
app.get("/", (_req, res) => res.json({ ok: true, name: "ParentFacile API" }));

// ------------------------------------------------------------
// DEMARRAGE DU SERVEUR
// ------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 ParentFacile API en écoute sur http://localhost:${PORT}`);
});

