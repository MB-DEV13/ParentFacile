// src/routes/docs.js
import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import archiver from "archiver";

/**
 * Routeur documents.
 * - Métadonnées depuis MySQL (table `documents`)
 * - Fichiers lus sur disque: backend-node/public/pdfs/
 *
 * Expose:
 *   GET  /api/docs            -> liste
 *   GET  /api/docs/:id/preview  -> aperçu inline
 *   GET  /api/docs/:id/download -> téléchargement
 *   GET  /api/docs/zip          -> zip de tous les PDFs connus en DB
 */
export default function createDocsRouter(pool, pdfDirAbs) {
  const router = Router();

  // Sécurise le nom de fichier
  const safe = (name) => path.basename(name || "");

  // GET /api/docs -> liste + public_url calculée
  router.get("/", async (_req, res) => {
    try {
      const [rows] = await pool.execute(`
        SELECT id, doc_key, label, tag, sort_order AS \`order\`,
               file_name, file_size, mime_type, public_url
        FROM documents
        ORDER BY 
          CASE tag 
            WHEN 'Grossesse' THEN 0
            WHEN 'Naissance' THEN 1
            WHEN '1–3 ans' THEN 2
            ELSE 99
          END,
          sort_order, label
      `);

      const docs = rows.map((r) => ({
        ...r,
        // si public_url stockée -> on la renvoie, sinon on calcule l’URL locale
        public_url:
          (r.public_url && r.public_url.trim()) ||
          `/pdfs/${encodeURIComponent(r.file_name)}`,
      }));

      res.json({ documents: docs });
    } catch (err) {
      console.error("GET /api/docs error:", err);
      res.status(500).json({ ok: false, message: "Erreur chargement docs" });
    }
  });

  // GET /api/docs/:id/preview -> inline
  router.get("/:id/preview", async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT file_name, mime_type FROM documents WHERE id = ?",
        [req.params.id]
      );
      if (!rows.length)
        return res.status(404).json({ error: "Document introuvable" });

      const fileName = safe(rows[0].file_name);
      const filePath = path.join(pdfDirAbs, fileName);
      if (!fs.existsSync(filePath))
        return res.status(404).json({ error: "Fichier manquant" });

      res.setHeader("Content-Type", rows[0].mime_type || "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="${fileName}"`);
      return res.sendFile(filePath);
    } catch (e) {
      console.error("Preview error:", e);
      res.status(500).json({ error: "Erreur aperçu" });
    }
  });

  // GET /api/docs/:id/download -> attachment
  router.get("/:id/download", async (req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT file_name, mime_type FROM documents WHERE id = ?",
        [req.params.id]
      );
      if (!rows.length)
        return res.status(404).json({ error: "Document introuvable" });

      const fileName = safe(rows[0].file_name);
      const filePath = path.join(pdfDirAbs, fileName);
      if (!fs.existsSync(filePath))
        return res.status(404).json({ error: "Fichier manquant" });

      res.setHeader("Content-Type", rows[0].mime_type || "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      return res.sendFile(filePath);
    } catch (e) {
      console.error("Download error:", e);
      res.status(500).json({ error: "Erreur téléchargement" });
    }
  });

  // GET /api/docs/zip -> zip depuis les fichiers présents en DB
  router.get("/zip", async (_req, res) => {
    try {
      const [rows] = await pool.execute(
        "SELECT label, sort_order, file_name FROM documents ORDER BY sort_order, label"
      );
      if (!rows.length)
        return res.status(404).json({ error: "Aucun document" });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="parentfacile-documents.zip"'
      );

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.on("error", (err) => {
        throw err;
      });
      archive.pipe(res);

      for (const d of rows) {
        const fileName = safe(d.file_name);
        const filePath = path.join(pdfDirAbs, fileName);
        if (fs.existsSync(filePath)) {
          const order = String(d.sort_order ?? 99).padStart(2, "0");
          const safeName = `${order} - ${d.label}.pdf`.replace(
            /[\\/:*?"<>|]/g,
            "_"
          );
          archive.file(filePath, { name: safeName });
        }
      }

      await archive.finalize();
    } catch (e) {
      console.error("ZIP error:", e);
      if (!res.headersSent)
        res.status(500).json({ error: "Echec génération ZIP" });
    }
  });

  return router;
}
