// frontend/src/services/adminApi.js
const API = import.meta.env.VITE_API_URL || "";

const withBase = (p) => `${API}${p.startsWith("/") ? p : `/${p}`}`;

const fetchJson = async (url, opts = {}) => {
  const res = await fetch(url, { credentials: "include", ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Erreur requête");
  return data;
};

// ---- Auth
export const adminLogin = (email, password) =>
  fetchJson(withBase("/api/admin/auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

export const adminLogout = () =>
  fetchJson(withBase("/api/admin/auth/logout"), { method: "POST" });

export const adminMe = () => fetchJson(withBase("/api/admin/auth/me"));

// ---- Docs
export const adminListDocs = () => fetchJson(withBase("/api/admin/docs"));

export const adminUploadDoc = (payload) => {
  const fd = new FormData();
  fd.append("label", payload.label);
  fd.append("tag", payload.tag);
  fd.append("sort_order", String(payload.sort_order ?? 999));
  fd.append("doc_key", payload.doc_key);
  fd.append("file", payload.file);
  return fetchJson(withBase("/api/admin/docs"), { method: "POST", body: fd });
};

export const adminDeleteDoc = (id) =>
  fetchJson(withBase(`/api/admin/docs/${id}`), { method: "DELETE" });

// ---- Messages
export const fetchAdminMessages = (limit = 3) =>
  fetchJson(withBase(`/api/admin/messages?limit=${encodeURIComponent(limit)}`));

export const fetchAllAdminMessages = () =>
  fetchJson(withBase("/api/admin/messages/all"));
