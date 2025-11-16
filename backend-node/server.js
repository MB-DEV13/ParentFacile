// -----------------------------------------------------------------------------
// ParentFacile – Serveur Node.js Express API
// -----------------------------------------------------------------------------

import "dotenv/config.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/swagger.js";

import createDocsRouter from "./src/routes/docs.js";
import adminAuthRouter, { ensureSeedAdmin } from "./src/routes/admin.auth.js";
import adminDocsRouter from "./src/routes/admin.docs.js";
import createAdminMessagesRouter from "./src/routes/admin.messages.js";

// --------------------------------------------------
// APP INIT
// --------------------------------------------------
const app = express();

// --------------------------------------------------
// CORS
// --------------------------------------------------
const allowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowed.length ? allowed : true,
    credentials: true,
  })
);

// --------------------------------------------------
// Parsers
// --------------------------------------------------
app.use(express.json());
app.use(cookieParser());

// --------------------------------------------------
// SWAGGER UI (documentation auto)
// --------------------------------------------------
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --------------------------------------------------
// FICHIERS PDF
// --------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PDF_DIR = path.join(__dirname, "public", "pdfs");
fs.mkdirSync(PDF_DIR, { recursive: true });

app.use("/pdfs", express.static(PDF_DIR));

// --------------------------------------------------
// BASE DE DONNÉES
// --------------------------------------------------
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 5,
});

app.set("db", pool);

async function ensureSchema() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(190) NOT NULL,
      subject VARCHAR(190) NOT NULL,
      message TEXT NOT NULL,
      email_sent TINYINT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      sent_at TIMESTAMP NULL DEFAULT NULL
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS documents (
      id INT AUTO_INCREMENT PRIMARY KEY,
      doc_key VARCHAR(191) UNIQUE NOT NULL,
      label VARCHAR(255) NOT NULL,
      tag VARCHAR(50) NOT NULL,
      sort_order INT DEFAULT 999,
      file_name VARCHAR(255) NOT NULL,
      file_size INT DEFAULT 0,
      mime_type VARCHAR(100) DEFAULT 'application/pdf',
      public_url VARCHAR(600) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(190) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// --------------------------------------------------
// SMTP
// --------------------------------------------------
const useSsl = Number(process.env.SMTP_PORT || 0) === 465;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: useSsl,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

// --------------------------------------------------
// Rate limit global
// --------------------------------------------------
app.use(rateLimit({ windowMs: 60_000, max: 100 }));

// --------------------------------------------------
// VALIDATION Contact
// --------------------------------------------------
const validateContact = [
  body("email").isEmail(),
  body("subject").trim().isLength({ min: 2, max: 190 }),
  body("message").trim().isLength({ min: 10, max: 5000 }),
  body("hp").optional().custom((v) => (v ? Promise.reject("bot") : true)),
];

app.options("/api/contact", cors());

// --------------------------------------------------
// ROUTES PUBLIQUES
// --------------------------------------------------

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Vérifier l'état de l'API et de la base de données
 *     tags:
 *       - Public
 *     responses:
 *       200:
 *         description: API joignable (+ état DB)
 */
app.get("/health", async (_req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS ok");
    res.json({
      ok: true,
      db: rows?.[0]?.ok === 1,
      env: process.env.NODE_ENV || "development",
    });
  } catch {
    res.json({
      ok: true,
      db: false,
      env: process.env.NODE_ENV || "development",
    });
  }
});

/**
 * @openapi
 * /api/contact:
 *   post:
 *     summary: Envoyer un message via le formulaire Contact
 *     tags:
 *       - Public
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: parent@example.com
 *               subject:
 *                 type: string
 *                 example: Besoin d'information sur un document
 *               message:
 *                 type: string
 *                 example: Bonjour, je voudrais savoir si...
 *     responses:
 *       200:
 *         description: Message enregistré + email envoyé
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
app.post("/api/contact", validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ ok: false, errors: errors.array() });
  }

  const { email, subject, message } = req.body;
  let insertedId = null;

  try {
    const [result] = await pool.execute(
      "INSERT INTO messages (email, subject, message) VALUES (?,?,?)",
      [email, subject, message]
    );
    insertedId = result.insertId;
  } catch {
    return res.status(500).json({ ok: false, message: "Erreur serveur (DB)" });
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_TO,
      subject: `ParentFacile – ${subject}`,
      replyTo: email,
      text: `De: ${email}\n\n${message}`,
    });

    await pool.execute(
      "UPDATE messages SET email_sent = 1, sent_at = CURRENT_TIMESTAMP WHERE id = ?",
      [insertedId]
    );

    return res.json({ ok: true, id: String(insertedId) });
  } catch {
    return res.status(500).json({ ok: false, message: "Erreur serveur (email)" });
  }
});

// --------------------------------------------------
// ROUTES
// --------------------------------------------------
app.use("/api/docs", createDocsRouter(pool, PDF_DIR));
app.use("/api/admin/auth", adminAuthRouter);
app.use("/api/admin/docs", adminDocsRouter);
app.use("/api/admin/messages", createAdminMessagesRouter(pool));

// --------------------------------------------------
// 404 & ERRORS
// --------------------------------------------------
app.use((req, res) => res.status(404).json({ ok: false, message: "Not found" }));

app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ ok: false, message: "Erreur serveur" });
});

// --------------------------------------------------
// DÉMARRAGE (Jest compatible)
// --------------------------------------------------
const port = Number(process.env.PORT || 4000);
const isJest = !!process.env.JEST_WORKER_ID || process.env.NODE_ENV === "test";
const isMain = import.meta.url === pathToFileURL(process.argv[1]).href;

async function bootstrap() {
  await ensureSchema();
  await ensureSeedAdmin(pool);
  console.log(`API http://localhost:${port}`);
}

if (isMain && !isJest) {
  app.listen(port, () => {
    bootstrap();
  });
}

export default app;
