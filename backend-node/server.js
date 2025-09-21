// server.js
import "dotenv/config.js";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import nodemailer from "nodemailer";
import mysql from "mysql2/promise";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

import createDocsRouter from "./src/routes/docs.js";

// --------------------------------------------------
// APP INIT
// --------------------------------------------------
const app = express();

// ---------- CORS ----------
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

// ---------- Body parser ----------
app.use(express.json());

// ---------- Chemin PDF robuste ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public/pdfs à partir de la localisation réelle de server.js
const PDF_DIR = path.join(__dirname, "public", "pdfs");
if (!fs.existsSync(PDF_DIR)) {
  console.error("[PDF] Dossier introuvable:", PDF_DIR);
} else {
  console.log("[PDF] Dossier servi depuis:", PDF_DIR);
}

// ---------- Serveur statique pour les PDF ----------
app.use("/pdfs", express.static(PDF_DIR));

// ---------- MySQL ----------
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  waitForConnections: true,
  connectionLimit: 5,
});

// Crée les tables si besoin
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
  console.log("MySQL OK: tables messages & documents prêtes");
}

// ---------- SMTP / Nodemailer ----------
const useSsl = Number(process.env.SMTP_PORT || 0) === 465;
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: useSsl,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});
async function verifySmtp() {
  try {
    await transporter.verify();
    console.log("SMTP OK: prêt à envoyer des emails");
  } catch (err) {
    console.error("SMTP KO:", err?.message || err);
  }
}

// ---------- Anti-spam ----------
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------- Validation ----------
const validateContact = [
  body("email").isEmail().withMessage("Email invalide"),
  body("subject")
    .trim()
    .isLength({ min: 2, max: 190 })
    .withMessage("Sujet invalide"),
  body("message")
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Message invalide"),
  body("hp")
    .optional()
    .custom((v) => (v ? Promise.reject("bot") : true)),
];

// Préflight CORS
app.options("/api/contact", cors());

// --------------------------------------------------
// ROUTES
// --------------------------------------------------

// Santé
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

// Contact
app.post("/api/contact", limiter, validateContact, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ ok: false, errors: errors.array() });

  const { email, subject, message } = req.body;

  let insertedId = null;
  try {
    const [result] = await pool.execute(
      "INSERT INTO messages (email, subject, message) VALUES (?,?,?)",
      [email, subject, message]
    );
    insertedId = result.insertId;
  } catch (err) {
    console.error("DB insert error:", err);
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
  } catch (err) {
    console.error("Erreur envoi email:", err);
    return res
      .status(500)
      .json({ ok: false, message: "Erreur serveur (envoi email)" });
  }
});

// --------- Documents (montage du routeur) ---------
app.use("/api/docs", createDocsRouter(pool, PDF_DIR));

// 404
app.use((req, res) =>
  res.status(404).json({ ok: false, message: "Not found" })
);

// Handler erreurs
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ ok: false, message: "Erreur serveur" });
});

// --------------------------------------------------
// DEMARRAGE
// --------------------------------------------------
const port = Number(process.env.PORT || 4000);
app.listen(port, async () => {
  try {
    await ensureSchema();
  } catch (e) {
    console.error("Erreur ensureSchema:", e?.message || e);
  }
  await verifySmtp();
  console.log(`API http://localhost:${port}`);
});
