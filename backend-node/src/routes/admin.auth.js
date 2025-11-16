// -----------------------------------------------------------------------------
// Auth Admin par JWT (compte unique)
// Endpoints :
//   POST /api/admin/auth/login
//   GET  /api/admin/auth/me
//   POST /api/admin/auth/logout
// Exporte : authMiddleware, ensureSeedAdmin
// -----------------------------------------------------------------------------

import { Router } from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const router = Router();

/* -------------------------------------------------------------------------- */
/*                               SWAGGER DOCS                                  */
/* -------------------------------------------------------------------------- */

/**
 * @openapi
 * tags:
 *   - name: Admin Auth
 *     description: Authentification administrateur (login, session, logout)
 */

/**
 * @openapi
 * /api/admin/auth/login:
 *   post:
 *     summary: Connexion administrateur (email + mot de passe)
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@parentfacile.fr
 *               password:
 *                 type: string
 *                 example: Admin1234!
 *     responses:
 *       200:
 *         description: Connexion réussie (cookie HttpOnly créé)
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Identifiants incorrects
 */

/**
 * @openapi
 * /api/admin/auth/me:
 *   get:
 *     summary: Vérifier si l’administrateur est connecté (via cookie JWT)
 *     tags: [Admin Auth]
 *     responses:
 *       200:
 *         description: Renvoie l'utilisateur admin ou null
 */

/**
 * @openapi
 * /api/admin/auth/logout:
 *   post:
 *     summary: Déconnexion administrateur (suppression cookie JWT)
 *     tags: [Admin Auth]
 *     responses:
 *       200:
 *         description: Déconnecté
 */

/* -------------------------------------------------------------------------- */
/*                              CONFIG ENV                                     */
/* -------------------------------------------------------------------------- */

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  process.env.ADMIN_SEED_EMAIL ||
  "admin@parentfacile.fr";

const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";

const JWT_SECRET =
  process.env.ADMIN_JWT_SECRET ||
  process.env.JWT_SECRET ||
  "change-me-in-prod";

const JWT_EXPIRES =
  process.env.ADMIN_JWT_EXPIRES_IN ||
  process.env.JWT_EXPIRES ||
  "2d";

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME || "admintoken";
const COOKIE_SECURE =
  String(process.env.ADMIN_COOKIE_SECURE || "").toLowerCase() === "true";

const TOKEN_STRATEGY =
  (process.env.ADMIN_TOKEN_STRATEGY || "both").toLowerCase();

const MOCK_LATENCY_MS = Number(process.env.MOCK_AUTH_LATENCY_MS || 0);

if (!ADMIN_EMAIL) console.warn("[adminAuth] ADMIN_EMAIL manquant.");
if (!JWT_SECRET) console.warn("[adminAuth] JWT_SECRET manquant.");
if (!ADMIN_PASSWORD_HASH && !ADMIN_PASSWORD) {
  console.warn("[adminAuth] Aucun ADMIN_PASSWORD_HASH ni ADMIN_PASSWORD — fallback DB.");
}

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure: COOKIE_SECURE,
  path: "/",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

function sendValidation(res, req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ ok: false, errors: errors.array() });
    return true;
  }
  return false;
}

function signJwt(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function readJwtFromReq(req) {
  if (TOKEN_STRATEGY === "cookie" || TOKEN_STRATEGY === "both") {
    const cookieToken = req.cookies?.[COOKIE_NAME];
    if (cookieToken) return cookieToken;
  }
  if (TOKEN_STRATEGY === "bearer" || TOKEN_STRATEGY === "both") {
    const auth = req.headers.authorization || "";
    if (auth.startsWith("Bearer ")) return auth.slice(7);
  }
  return null;
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
}

/* -------------------------------------------------------------------------- */
/*                           MIDDLEWARE AUTH                                   */
/* -------------------------------------------------------------------------- */

export function authMiddleware(req, res, next) {
  const raw = readJwtFromReq(req);
  if (!raw) {
    return res.status(401).json({ ok: false, message: "Non autorisé (token manquant)" });
  }
  try {
    const decoded = jwt.verify(raw, JWT_SECRET);
    if (decoded?.role !== "admin") {
      return res.status(401).json({ ok: false, message: "Non autorisé (rôle invalide)" });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ ok: false, message: "Token invalide ou expiré" });
  }
}

/* ------------------------------ VALIDATIONS -------------------------------- */

const validateLogin = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password").isLength({ min: 1 }).withMessage("Mot de passe requis"),
];

/* -------------------------------------------------------------------------- */
/*                                   ROUTES                                   */
/* -------------------------------------------------------------------------- */

router.post(
  "/login",
  authLimiter,
  validateLogin,
  asyncHandler(async (req, res) => {
    if (sendValidation(res, req)) return;
    if (MOCK_LATENCY_MS) await sleep(MOCK_LATENCY_MS);

    const { email, password } = req.body;

    if (String(email).toLowerCase() !== String(ADMIN_EMAIL).toLowerCase()) {
      return res.status(401).json({ ok: false, message: "Identifiants invalides" });
    }

    let isValid = false;

    if (ADMIN_PASSWORD_HASH) {
      isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    } else if (ADMIN_PASSWORD) {
      isValid = password === ADMIN_PASSWORD;
    } else {
      const pool = req.app.get("db");
      try {
        const [[row]] = await pool.query(
          "SELECT password_hash FROM admin_users WHERE email = ? LIMIT 1",
          [ADMIN_EMAIL]
        );
        if (row?.password_hash) isValid = await bcrypt.compare(password, row.password_hash);
      } catch {}
    }

    if (!isValid) return res.status(401).json({ ok: false, message: "Identifiants invalides" });

    const token = signJwt({ sub: "admin", email: ADMIN_EMAIL, role: "admin" });

    if (TOKEN_STRATEGY === "cookie" || TOKEN_STRATEGY === "both") {
      setAuthCookie(res, token);
    }

    return res.json({
      ok: true,
      message: "Connexion réussie",
      user: { id: "admin", email: ADMIN_EMAIL, role: "admin" },
      token: TOKEN_STRATEGY !== "cookie" ? token : undefined,
    });
  })
);

router.get(
  "/me",
  authLimiter,
  asyncHandler(async (req, res) => {
    if (MOCK_LATENCY_MS) await sleep(MOCK_LATENCY_MS);

    const raw = readJwtFromReq(req);
    if (!raw) return res.json({ ok: true, user: null });

    try {
      jwt.verify(raw, JWT_SECRET);
      return res.json({ ok: true, user: { id: "admin", email: ADMIN_EMAIL, role: "admin" } });
    } catch {
      return res.json({ ok: true, user: null });
    }
  })
);

router.post(
  "/logout",
  authLimiter,
  asyncHandler(async (_req, res) => {
    if (MOCK_LATENCY_MS) await sleep(MOCK_LATENCY_MS);

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      sameSite: "lax",
      secure: COOKIE_SECURE,
      path: "/",
    });

    return res.json({ ok: true, message: "Déconnecté" });
  })
);

/* -------------------------------------------------------------------------- */
/*                                 SEED ADMIN                                 */
/* -------------------------------------------------------------------------- */

export async function ensureSeedAdmin(pool) {
  const seedEmail = process.env.ADMIN_SEED_EMAIL || ADMIN_EMAIL;
  const seedPassword = process.env.ADMIN_SEED_PASSWORD || ADMIN_PASSWORD;

  if (!seedEmail || !seedPassword) {
    console.warn("[seed admin] Email/mot de passe de seed non fournis — ignoré.");
    return;
  }

  const [[exists]] = await pool.query(
    "SELECT id FROM admin_users WHERE email = ? LIMIT 1",
    [seedEmail]
  );

  if (exists) {
    console.log("[seed admin] Déjà présent:", seedEmail);
    return;
  }

  const hash = await bcrypt.hash(seedPassword, 10);
  await pool.execute(
    "INSERT INTO admin_users (email, password_hash) VALUES (?,?)",
    [seedEmail, hash]
  );

  console.log("[seed admin] Créé:", seedEmail);
}

export default router;


