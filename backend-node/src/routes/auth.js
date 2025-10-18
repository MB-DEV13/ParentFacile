// -----------------------------------------------------------------------------
// ParentFacile – Authentification publique (mock)
// -----------------------------------------------------------------------------
// Objectif
//  - Fournir une API d'auth simplifiée pour le front en phase de dev (sans DB)
//  - Endpoints : POST /register, POST /login, GET /me
//  - Réponses cohérentes { ok: boolean, ... } pour alignement front
//  - Valide les inputs, limite le brute-force, permet une latence simulée
//
// À terme
//  - Remplacer par une vraie implémentation branchée sur la DB/Users
//  - Gérer JWT + cookies sécurisés, refresh tokens, etc.
// -----------------------------------------------------------------------------

import { Router } from "express";
import { body, validationResult } from "express-validator";
import rateLimit from "express-rate-limit";

const router = Router();

// -----------------------------------------------------------------------------
// OPTIONS MOCK
// -----------------------------------------------------------------------------
const MOCK_LATENCY_MS = Number(process.env.MOCK_AUTH_LATENCY_MS || 0); // ex: 400

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Limiteur basique sur auth pour éviter le spam (à ajuster au besoin)
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 60 });

// Helpers validations
function sendValidation(res, req) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ ok: false, errors: errors.array() });
    return true;
  }
  return false;
}

// -----------------------------------------------------------------------------
// VALIDATIONS
// -----------------------------------------------------------------------------
const validateRegister = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password").isLength({ min: 8, max: 128 }).withMessage("Mot de passe (8-128)")
];

const validateLogin = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password").isLength({ min: 1 }).withMessage("Mot de passe requis")
];

// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

// POST /register – Mock
router.post(
  "/register",
  authLimiter,
  validateRegister,
  asyncHandler(async (req, res) => {
    if (sendValidation(res, req)) return;
    if (MOCK_LATENCY_MS) await sleep(MOCK_LATENCY_MS);

    const { email } = req.body;
    // Dans un vrai backend, on créerait l'utilisateur en DB + hash du mot de passe.

    return res.status(201).json({
      ok: true,
      message: "Inscription simulée",
      user: { id: 1, email },
    });
  })
);

// POST /login – Mock
router.post(
  "/login",
  authLimiter,
  validateLogin,
  asyncHandler(async (req, res) => {
    if (sendValidation(res, req)) return;
    if (MOCK_LATENCY_MS) await sleep(MOCK_LATENCY_MS);

    const { email } = req.body;
    // Dans un vrai backend, on comparerait le hash du mot de passe et émettrait un JWT.

    return res.json({
      ok: true,
      message: "Connexion simulée",
      // token simulé, à remplacer par un vrai JWT côté prod
      token: "mock-token",
      user: { id: 1, email },
    });
  })
);

// GET /me – Mock
router.get(
  "/me",
  authLimiter,
  asyncHandler(async (_req, res) => {
    if (MOCK_LATENCY_MS) await sleep(MOCK_LATENCY_MS);

    // En prod, on lirait le JWT (cookie ou Authorization) pour renvoyer l'utilisateur courant.
    return res.json({ ok: true, user: null });
  })
);

export default router;

