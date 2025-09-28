// backend-node/src/routes/admin.auth.js
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "admintoken";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change-me";
const COOKIE_SECURE =
  String(process.env.ADMIN_COOKIE_SECURE || "false") === "true";

/**
 * Appelé par server.js APRÈS ensureSchema()
 */
export async function ensureSeedAdmin(pool) {
  const email = process.env.ADMIN_SEED_EMAIL;
  const pass = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !pass) {
    console.log("[AdminSeed] Pas de variables ADMIN_SEED_* -> seed ignoré");
    return;
  }

  // La table admin_users existe déjà (create dans ensureSchema côté server.js)
  const [[existing]] = await pool.query(
    "SELECT id FROM admin_users WHERE email = ?",
    [email]
  );
  if (existing) {
    console.log(`[AdminSeed] Admin déjà présent: ${email}`);
    return;
  }

  const hash = await bcrypt.hash(pass, 12);
  await pool.execute(
    "INSERT INTO admin_users (email, password_hash) VALUES (?,?)",
    [email, hash]
  );
  console.log(`[AdminSeed] Admin créé: ${email}`);
}

function setAuthCookie(res, payload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    path: "/",
    maxAge: 7 * 24 * 3600 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    path: "/",
  });
}

export function authMiddleware(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token)
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
}

// --- Routes d’auth ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res
      .status(400)
      .json({ ok: false, message: "Email/mot de passe requis" });

  const pool = req.app.get("db");
  const [[user]] = await pool.query(
    "SELECT * FROM admin_users WHERE email = ?",
    [email]
  );
  if (!user)
    return res
      .status(401)
      .json({ ok: false, message: "Identifiants invalides" });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok)
    return res
      .status(401)
      .json({ ok: false, message: "Identifiants invalides" });

  setAuthCookie(res, { id: user.id, email: user.email });
  res.json({ ok: true });
});

router.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({ ok: true, admin: req.admin });
});

export default router;
