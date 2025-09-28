// backend-node/src/routes/admin.messages.js
import { Router } from "express";
import { authMiddleware } from "./admin.auth.js";

/**
 * Routeur des messages admin.
 * GET /api/admin/messages?limit=3
 * GET /api/admin/messages/all
 */
export default function createAdminMessagesRouter(pool) {
  const router = Router();

  // toutes les routes ici sont protégées
  router.use(authMiddleware);

  // Liste limitée (par défaut 3)
  router.get("/", async (req, res) => {
    try {
      const limit = Math.min(
        Math.max(parseInt(req.query.limit || "3", 10), 1),
        100
      );

      const [rows] = await pool.execute(
        `SELECT id, email, subject, message, created_at
         FROM messages
         ORDER BY created_at DESC
         LIMIT ?`,
        [limit]
      );

      res.json({ ok: true, messages: rows });
    } catch (e) {
      console.error("GET /api/admin/messages error:", e);
      res.status(500).json({ ok: false, message: "Erreur serveur (messages)" });
    }
  });

  // Liste complète (cap à 500 pour éviter l’explosion)
  router.get("/all", async (_req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT id, email, subject, message, created_at
         FROM messages
         ORDER BY created_at DESC
         LIMIT 500`
      );

      res.json({ ok: true, messages: rows });
    } catch (e) {
      console.error("GET /api/admin/messages/all error:", e);
      res
        .status(500)
        .json({ ok: false, message: "Erreur serveur (messages all)" });
    }
  });

  return router;
}
