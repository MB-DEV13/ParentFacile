import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import archiver from "archiver";

const router = Router();

// Charge le manifest JSON sans import assertions
const manifestPath = path.join(process.cwd(), "src", "docs.manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

// GET /api/docs -> liste des documents
router.get("/", (_req, res) => {
  const docs = [...manifest.documents].sort(
    (a, b) => (a.order || 999) - (b.order || 999)
  );
  res.json({ documents: docs });
});

// GET /api/docs/:id/download -> renvoie le fichier PDF
router.get("/:id/download", (req, res) => {
  const doc = manifest.documents.find((d) => d.id === req.params.id);
  if (!doc) return res.status(404).json({ error: "Document introuvable" });

  const filePath = path.join(process.cwd(), "public", "pdfs", doc.file);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Fichier manquant" });
  }

  res.setHeader("Content-Disposition", `attachment; filename="${doc.file}"`);
  res.sendFile(filePath);
});

// GET /api/docs/zip -> stream d'un ZIP contenant tous les PDFs
router.get("/zip", async (_req, res) => {
  try {
    const docs = [...manifest.documents].sort(
      (a, b) => (a.order || 999) - (b.order || 999)
    );

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

    const base = path.join(process.cwd(), "public", "pdfs");
    for (const d of docs) {
      const filePath = path.join(base, d.file);
      if (fs.existsSync(filePath)) {
        const order = String(d.order ?? 99).padStart(2, "0");
        const safe = `${order} - ${d.label}.pdf`.replace(/[\\/:*?"<>|]/g, "_");
        archive.file(filePath, { name: safe });
      }
    }

    await archive.finalize();
  } catch (e) {
    console.error(e);
    if (!res.headersSent) {
      res.status(500).json({ error: "Echec génération ZIP" });
    }
  }
});

export default router;
