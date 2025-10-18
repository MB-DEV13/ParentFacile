/**
 * Admin API — ParentFacile
 * -------------------------------------------------
 * - API_BASE : VITE_API_URL (sans trailing slash) ou vide (proxy Vite en dev).
 * - request() : fetch avec timeout + erreurs JSON lisibles.
 * - withBase() : construit des URLs fiables en dev/prod.
 * - Exports : identiques à ta version (login/logout/me/docs/messages).
 */

const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
const DEFAULT_TIMEOUT = 12000;

/** Concatène API_BASE + path (et gère les URLs déjà absolues) */
function withBase(path) {
  if (!path) return API_BASE || "";
  if (/^https?:\/\//i.test(path)) return path; // déjà absolue

  if (API_BASE) return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  // en dev (proxy Vite), on garde un chemin relatif à la racine
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Helper fetch générique (JSON) avec timeout et erreurs propres.
 * Ajoute credentials: 'include' pour les routes d'admin (cookies/session).
 */
async function request(url, options = {}) {
  const { timeout = DEFAULT_TIMEOUT, ...rest } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      credentials: "include",
      headers: { Accept: "application/json", ...(rest.headers || {}) },
      signal: controller.signal,
      ...rest,
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const data = isJson ? await res.json().catch(() => ({})) : await res.text();

    if (!res.ok) {
      const message =
        (isJson && (data?.message || data?.error)) ||
        (typeof data === "string" && data) ||
        `HTTP ${res.status} – ${res.statusText}`;

      const err = new Error(message);
      err.status = res.status;
      err.payload = isJson ? data : { raw: data };
      throw err;
    }

    return isJson ? data : { raw: data };
  } finally {
    clearTimeout(id);
  }
}

/* =========================
 *        AUTH
 * =======================*/

/** POST /api/admin/auth/login */
export const adminLogin = (email, password) =>
  request(withBase("/api/admin/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

/** POST /api/admin/auth/logout */
export const adminLogout = () =>
  request(withBase("/api/admin/auth/logout"), {
    method: "POST",
  });

/** GET /api/admin/auth/me */
export const adminMe = () => request(withBase("/api/admin/auth/me"));

/* =========================
 *        DOCS
 * =======================*/

/** GET /api/admin/docs */
export const adminListDocs = () => request(withBase("/api/admin/docs"));

/**
 * POST /api/admin/docs
 * payload: { label, tag, sort_order?, doc_key, file(File) }
 */
export const adminUploadDoc = (payload) => {
  const fd = new FormData();
  fd.append("label", payload.label);
  fd.append("tag", payload.tag);
  fd.append("sort_order", String(payload.sort_order ?? 999));
  fd.append("doc_key", payload.doc_key);
  fd.append("file", payload.file);

  return request(withBase("/api/admin/docs"), {
    method: "POST",
    body: fd,
  });
};

/** DELETE /api/admin/docs/:id */
export const adminDeleteDoc = (id) =>
  request(withBase(`/api/admin/docs/${encodeURIComponent(id)}`), {
    method: "DELETE",
  });

/**
 * PUT /api/admin/docs/:id
 * payload peut contenir: { label?, tag?, sort_order?, doc_key?, file? }
 */
export const adminUpdateDoc = (id, payload = {}) => {
  const fd = new FormData();
  if (payload.label != null) fd.append("label", payload.label);
  if (payload.tag != null) fd.append("tag", payload.tag);
  if (payload.sort_order != null)
    fd.append("sort_order", String(payload.sort_order));
  if (payload.doc_key != null) fd.append("doc_key", payload.doc_key);
  if (payload.file) fd.append("file", payload.file);

  return request(withBase(`/api/admin/docs/${encodeURIComponent(id)}`), {
    method: "PUT",
    body: fd,
  });
};

/* =========================
 *      MESSAGES
 * =======================*/

/** GET /api/admin/messages?limit= */
export const fetchAdminMessages = (limit = 3) =>
  request(
    withBase(`/api/admin/messages?limit=${encodeURIComponent(limit)}`)
  );

/** GET /api/admin/messages/all */
export const fetchAllAdminMessages = () =>
  request(withBase("/api/admin/messages/all"));

