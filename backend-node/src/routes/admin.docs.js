// backend-node/src/routes/admin.docs.js
import { Router } from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { authMiddleware } from "./admin.auth.js";

const router = Router();

// Dossier des PDF (même logique que server.js)
const pdfDir = path.join(process.cwd(), "public", "pdfs");
fs.mkdirSync(pdfDir, { recursive: true });

// Multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, pdfDir),
  filename: (_req, file, cb) => {
    const base = path
      .parse(file.originalname)
      .name.replace(/[^\w\s.-]/g, "_")
      .replace(/\s+/g, "_");
    const stamp = Date.now();
    cb(null, `${base}_${stamp}.pdf`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf")
      return cb(new Error("Seuls les PDF"));
    cb(null, true);
  },
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// Toutes ces routes nécessitent d'être connecté (cookie JWT)
router.use(authMiddleware);

/* =========================
   LISTE
========================= */
router.get("/", async (req, res) => {
  const pool = req.app.get("db");
  const [rows] = await pool.execute(
    `SELECT id, doc_key, label, tag, sort_order AS \`order\`,
            file_name, file_size, mime_type, public_url, created_at
     FROM documents
     ORDER BY tag, sort_order, label`
  );
  res.json({ ok: true, documents: rows });
});

/* =========================
   AJOUT
========================= */
router.post("/", upload.single("file"), async (req, res) => {
  const pool = req.app.get("db");
  try {
    const { label, tag, sort_order, doc_key } = req.body || {};
    if (!label || !tag || !doc_key) {
      if (req.file)
        fs.existsSync(req.file.path) && fs.unlinkSync(req.file.path);
      return res
        .status(400)
        .json({ ok: false, message: "label, tag, doc_key requis" });
    }
    if (!req.file) {
      return res.status(400).json({ ok: false, message: "PDF manquant" });
    }

    const file_name = req.file.filename;
    const file_size = req.file.size || 0;
    const mime_type = "application/pdf";
    const public_url = `/pdfs/${file_name}`;
    const order = Number(sort_order || 999);

    const [result] = await pool.execute(
      `INSERT INTO documents (doc_key, label, tag, sort_order, file_name, file_size, mime_type, public_url)
       VALUES (?,?,?,?,?,?,?,?)`,
      [doc_key, label, tag, order, file_name, file_size, mime_type, public_url]
    );

    res.json({ ok: true, id: result.insertId, public_url, file_name });
  } catch (e) {
    console.error("Upload error:", e);
    res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

/* =========================
   MISE À JOUR (PUT)
   - Champs modifiables: label, tag, sort_order, doc_key
   - Fichier PDF optionnel (remplacement)
========================= */
router.put("/:id", upload.single("file"), async (req, res) => {
  const pool = req.app.get("db");
  const id = Number(req.params.id || 0);
  if (!id) return res.status(400).json({ ok: false, message: "ID invalide" });

  try {
    // Document existant
    const [[doc]] = await pool.query(
      `SELECT id, file_name FROM documents WHERE id = ? LIMIT 1`,
      [id]
    );
    if (!doc)
      return res.status(404).json({ ok: false, message: "Introuvable" });

    const { label, tag, sort_order, doc_key } = req.body || {};

    // Prépare la MAJ
    const fields = [];
    const values = [];

    if (label != null) {
      fields.push("label = ?");
      values.push(label);
    }
    if (tag != null) {
      fields.push("tag = ?");
      values.push(tag);
    }
    if (sort_order != null) {
      fields.push("sort_order = ?");
      values.push(Number(sort_order));
    }
    if (doc_key != null) {
      fields.push("doc_key = ?");
      values.push(doc_key);
    }

    // Nouveau fichier ?
    if (req.file) {
      // Supprime l'ancien si présent
      if (doc.file_name) {
        const oldPath = path.join(pdfDir, doc.file_name);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch {}
        }
      }
      const file_name = req.file.filename;
      const file_size = req.file.size || 0;
      const mime_type = "application/pdf";
      const public_url = `/pdfs/${file_name}`;

      fields.push(
        "file_name = ?",
        "file_size = ?",
        "mime_type = ?",
        "public_url = ?"
      );
      values.push(file_name, file_size, mime_type, public_url);
    }

    if (!fields.length) {
      return res.json({ ok: true, message: "Aucune modification" });
    }

    values.push(id);
    await pool.execute(
      `UPDATE documents SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ ok: true, message: "Document mis à jour" });
  } catch (e) {
    console.error("Update error:", e);
    res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

/* =========================
   SUPPRESSION
========================= */
router.delete("/:id", async (req, res) => {
  const pool = req.app.get("db");
  try {
    const [[doc]] = await pool.query(
      "SELECT file_name FROM documents WHERE id = ?",
      [req.params.id]
    );
    if (!doc)
      return res.status(404).json({ ok: false, message: "Introuvable" });

    await pool.execute("DELETE FROM documents WHERE id = ?", [req.params.id]);

    const full = path.join(pdfDir, doc.file_name);
    if (fs.existsSync(full)) {
      try {
        fs.unlinkSync(full);
      } catch {}
    }

    res.json({ ok: true });
  } catch (e) {
    console.error("Delete error:", e);
    res.status(500).json({ ok: false, message: "Erreur serveur" });
  }
});

export default router;
