// -----------------------------------------------------------------------------
// ParentFacile – Routeur documents (public)
// -----------------------------------------------------------------------------
// Fonctions :
//  - GET  /api/docs                 → liste paginée/filtrée/saisie-tolerante
//  - GET  /api/docs/:id/preview     → affichage inline avec nom soigné
//  - GET  /api/docs/:id/download    → téléchargement avec nom soigné
//  - GET  /api/docs/zip             → archive .zip de tous les PDFs connus
//
// Renforcements :
//  - Validations des query/params (express-validator)
//  - En-têtes de cache (Cache-Control, Last-Modified) + ETag simple
//  - Nettoyage des noms de fichiers + prévention path traversal
//  - Rate limiting sur ZIP (éviter abus)
//  - Gestion d'erreurs homogène + streaming (meilleure mémoire)
// -----------------------------------------------------------------------------

import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import archiver from "archiver";
import rateLimit from "express-rate-limit";
import { query, param, validationResult } from "express-validator";

const pipe = promisify(pipeline);

/* -------------------------------------------------------------------------- */
/*                               SWAGGER DOCS                                  */
/* -------------------------------------------------------------------------- */

/**
 * @openapi
 * tags:
 *   - name: Documents
 *     description: Endpoints publics permettant l'accès aux documents PDF (liste, preview, téléchargement, ZIP)
 */

/**
 * @openapi
 * /api/docs:
 *   get:
 *     summary: Liste paginée des documents PDF
 *     tags: [Documents]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: tag
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [label, order, created, tag]
 *       - in: query
 *         name: dir
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Liste paginée des documents
 *       400:
 *         description: Paramètres invalides
 */

/**
 * @openapi
 * /api/docs/{id}/preview:
 *   get:
 *     summary: Prévisualisation du document en inline
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: PDF affiché dans le navigateur
 *       404:
 *         description: Document introuvable
 */

/**
 * @openapi
 * /api/docs/{id}/download:
 *   get:
 *     summary: Téléchargement du document PDF
 *     tags: [Documents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Téléchargement du fichier
 *       404:
 *         description: Document introuvable
 */

/**
 * @openapi
 * /api/docs/zip:
 *   get:
 *     summary: Télécharger une archive ZIP contenant tous les documents
 *     tags: [Documents]
 *     responses:
 *       200:
 *         description: Archive ZIP générée
 *       404:
 *         description: Aucun document dans la base
 */

export default function createDocsRouter(pool, pdfDirAbs) {
  const router = Router();

  /* ------------------------------ HELPERS ---------------------------------- */

  const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

  function sendValidation(res, req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ ok: false, errors: errors.array() });
      return true;
    }
    return false;
  }

  const safeFsName = (name) => path.basename(String(name || ""));

  const cleanForHeader = (name) =>
    String(name || "document").replace(/[\\/:*?"<>|]/g, "_").slice(0, 200);

  function contentDispositionFilename(filename) {
    const fallback = filename.replace(/[^\x20-\x7E]/g, "_");
    const encoded = encodeURIComponent(filename);
    return `filename="${fallback}"; filename*=UTF-8''${encoded}`;
  }

  function setStaticHeaders(res, stat) {
    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
    if (stat?.mtime) res.setHeader("Last-Modified", stat.mtime.toUTCString());
  }

  /* ------------------------------ RATE LIMIT ZIP --------------------------- */

  const zipLimiter = rateLimit({ windowMs: 60 * 1000, max: 5 });

  /* ------------------------------ ROUTE LISTE ------------------------------ */

  router.get(
    "/",
    [
      query("page").optional().isInt({ min: 1, max: 10000 }).toInt(),
      query("limit").optional().isInt({ min: 1, max: 200 }).toInt(),
      query("tag").optional().trim().isLength({ min: 1, max: 50 }),
      query("q").optional().trim().isLength({ min: 1, max: 200 }),
      query("sort").optional().isIn(["label","order","created","tag"]).trim(),
      query("dir").optional().isIn(["asc","desc"]).trim(),
    ],
    asyncHandler(async (req, res) => {
      if (sendValidation(res, req)) return;

      const page = req.query.page ?? 1;
      const limit = req.query.limit ?? 50;
      const offset = (page - 1) * limit;
      const tag = req.query.tag || "";
      const q = req.query.q || "";
      const sort = req.query.sort || "tag";
      const dir = (req.query.dir || "asc").toUpperCase();

      const ORDER_COL = {
        label: "label",
        order: "sort_order",
        created: "created_at",
        tag: "tag",
      }[sort] || "tag";

      const WHERE = [];
      const params = [];

      if (tag) { WHERE.push("tag = ?"); params.push(tag); }
      if (q) {
        WHERE.push("(label LIKE ? OR doc_key LIKE ?)");
        const like = `%${q}%`;
        params.push(like, like);
      }

      const whereSql = WHERE.length ? `WHERE ${WHERE.join(" AND ")}` : "";

      const orderCustom = `CASE tag WHEN 'Grossesse' THEN 0 WHEN 'Naissance' THEN 1 WHEN '1–3 ans' THEN 2 ELSE 99 END`;

      const [[{ total }]] = await pool.query(
        `SELECT COUNT(*) AS total FROM documents ${whereSql}`, params
      );

      const [rows] = await pool.execute(
        `SELECT id, doc_key, label, tag, sort_order AS \`order\`,
                file_name, file_size, mime_type, public_url, created_at
         FROM documents
         ${whereSql}
         ORDER BY ${ORDER_COL === 'tag' ? `${orderCustom}, sort_order, label`
            : `${ORDER_COL} ${dir}, label ASC`}
         LIMIT ? OFFSET ?`,
        [...params, Number(limit), Number(offset)]
      );

      const docs = rows.map((r) => ({
        ...r,
        public_url: (r.public_url && r.public_url.trim()) || `/pdfs/${encodeURIComponent(r.file_name)}`,
      }));

      res.json({ ok: true, total, page, limit, documents: docs });
    })
  );

  /* ------------------------------ ROUTE PREVIEW ---------------------------- */

  router.get(
    "/:id/preview",
    [param("id").isInt({ min: 1 }).toInt()],
    asyncHandler(async (req, res) => {
      if (sendValidation(res, req)) return;

      const [[row]] = await pool.execute(
        "SELECT label, file_name, mime_type FROM documents WHERE id = ?",
        [req.params.id]
      );
      if (!row) return res.status(404).json({ ok: false, error: "Document introuvable" });

      const fileName = safeFsName(row.file_name);
      const filePath = path.join(pdfDirAbs, fileName);
      if (!fs.existsSync(filePath)) return res.status(404).json({ ok: false, error: "Fichier manquant" });

      const stat = fs.statSync(filePath);
      const niceName = `${cleanForHeader(row.label)}.pdf`;

      res.setHeader("Content-Type", row.mime_type || "application/pdf");
      res.setHeader("Content-Length", String(stat.size));
      res.setHeader("Content-Disposition", `inline; ${contentDispositionFilename(niceName)}`);
      setStaticHeaders(res, stat);

      await pipe(fs.createReadStream(filePath), res);
    })
  );

  /* ------------------------------ ROUTE DOWNLOAD -------------------------- */

  router.get(
    "/:id/download",
    [param("id").isInt({ min: 1 }).toInt()],
    asyncHandler(async (req, res) => {
      if (sendValidation(res, req)) return;

      const [[row]] = await pool.execute(
        "SELECT label, file_name, mime_type FROM documents WHERE id = ?",
        [req.params.id]
      );
      if (!row) return res.status(404).json({ ok: false, error: "Document introuvable" });

      const fileName = safeFsName(row.file_name);
      const filePath = path.join(pdfDirAbs, fileName);
      if (!fs.existsSync(filePath)) return res.status(404).json({ ok: false, error: "Fichier manquant" });

      const stat = fs.statSync(filePath);
      const niceName = `${cleanForHeader(row.label)}.pdf`;

      res.setHeader("Content-Type", row.mime_type || "application/pdf");
      res.setHeader("Content-Length", String(stat.size));
      res.setHeader("Content-Disposition", `attachment; ${contentDispositionFilename(niceName)}`);
      setStaticHeaders(res, stat);

      await pipe(fs.createReadStream(filePath), res);
    })
  );

  /* ------------------------------ ROUTE ZIP ------------------------------- */

  router.get(
    "/zip",
    zipLimiter,
    asyncHandler(async (_req, res) => {
      const [rows] = await pool.execute(
        "SELECT label, sort_order, file_name FROM documents ORDER BY sort_order, label"
      );
      if (!rows.length) return res.status(404).json({ ok: false, error: "Aucun document" });

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="parentfacile-documents.zip"');
      res.setHeader("Cache-Control", "no-store");

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.on("error", (err) => { throw err });
      archive.pipe(res);

      for (const d of rows) {
        const fileName = safeFsName(d.file_name);
        const filePath = path.join(pdfDirAbs, fileName);
        if (fs.existsSync(filePath)) {
          const order = String(d.sort_order ?? 99).padStart(2, "0");
          const nice = `${order} - ${cleanForHeader(d.label)}.pdf`;
          archive.file(filePath, { name: nice });
        }
      }

      await archive.finalize();
    })
  );

  return router;
}
