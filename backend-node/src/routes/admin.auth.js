// -----------------------------------------------------------------------------
// ParentFacile – Auth Admin (JWT) : cookie HttpOnly +/ou Bearer
// -----------------------------------------------------------------------------
// Ce routeur émet un JWT à la connexion et accepte l'auth:
//  - via cookie HttpOnly (sécurisé contre XSS)
//  - via header Authorization: Bearer <token>
// Choix via .env ADMIN_TOKEN_STRATEGY: "cookie" | "bearer" | "both" (defaut both)
// Durée du token configurable: ADMIN_JWT_EXPIRES_IN (ex: "15m", "7d")
// -----------------------------------------------------------------------------

import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";

const router = Router();

// -----------------------------------------------------------------------------
// CONFIG .env
// -----------------------------------------------------------------------------
const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "admintoken";
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "change-me"; // ⚠️ changer en prod
const COOKIE_SECURE = String(process.env.ADMIN_COOKIE_SECURE || "false") === "true";
const COOKIE_DOMAIN = process.env.ADMIN_COOKIE_DOMAIN || undefined; // ex: .parentfacile.fr
const JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRES_IN || "7d";
const TOKEN_STRATEGY = (process.env.ADMIN_TOKEN_STRATEGY || "both").toLowerCase();

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function setAuthCookie(res, token) {
  // maxAge approx: si nombre de jours, 7d → 7 * 24h; sinon fallback 7j
  const defaultMs = 7 * 24 * 3600 * 1000;
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    path: "/",
    domain: COOKIE_DOMAIN,
    maxAge: defaultMs,
  });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: COOKIE_SECURE,
    path: "/",
    domain: COOKIE_DOMAIN,
  });
}

export function authMiddleware(req, res, next) {
  // 1) Header Authorization: Bearer <token>
  const auth = req.headers.authorization || "";
  const bearer = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  // 2) Cookie HttpOnly
  const cookieToken = req.cookies?.[COOKIE_NAME];
  const token = bearer || cookieToken;
  if (!token) return res.status(401).json({ ok: false, message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = { id: payload.id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }
}

/** Seed initial appelé par server.js après ensureSchema() */
export async function ensureSeedAdmin(pool) {
  const email = process.env.ADMIN_SEED_EMAIL;
  const pass = process.env.ADMIN_SEED_PASSWORD;
  if (!email || !pass) {
    console.log("[AdminSeed] Pas de variables ADMIN_SEED_* -> seed ignoré");
    return;
  }
  const [[existing]] = await pool.query("SELECT id FROM admin_users WHERE email = ?", [email]);
  if (existing) {
    console.log(`[AdminSeed] Admin déjà présent: ${email}`);
    return;
  }
  const hash = await bcrypt.hash(pass, 12);
  await pool.execute("INSERT INTO admin_users (email, password_hash) VALUES (?,?)", [email, hash]);
  console.log(`[AdminSeed] Admin créé: ${email}`);
}

// Limiteur anti brute-force basique
const loginLimiter = rateLimit({ windowMs: 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false });

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------
router.post(
  "/login",
  loginLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ ok: false, message: "Email/mot de passe requis" });

    const pool = req.app.get("db");
    const [[user]] = await pool.query("SELECT * FROM admin_users WHERE email = ?", [email]);
    if (!user) return res.status(401).json({ ok: false, message: "Identifiants invalides" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ ok: false, message: "Identifiants invalides" });

    const token = signAccessToken({ id: user.id, email: user.email });

    // Stratégie d'émission
    if (TOKEN_STRATEGY === "cookie" || TOKEN_STRATEGY === "both") {
      setAuthCookie(res, token);
    }

    // Toujours retourner un payload clair au frontend
    const resp = { ok: true };
    if (TOKEN_STRATEGY === "bearer" || TOKEN_STRATEGY === "both") {
      resp.token = token;
      resp.token_type = "Bearer";
      resp.expires_in = JWT_EXPIRES_IN; // indicatif pour le front
    }

    res.json(resp);
  })
);

router.post(
  "/logout",
  asyncHandler(async (_req, res) => {
    if (TOKEN_STRATEGY === "cookie" || TOKEN_STRATEGY === "both") clearAuthCookie(res);
    res.json({ ok: true });
  })
);

router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req, res) => {
    res.json({ ok: true, admin: req.admin });
  })
);

export default router;

