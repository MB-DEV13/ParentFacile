/**
 * Page : Admin — Messages
 * - Data chargée via useApi(fetchAllAdminMessages)
 * - Bouton logout conservé
 * - UI pastel identique
 */

import { Link, useNavigate } from "react-router-dom";
import useApi from "../../hooks/useApi";
import { fetchAllAdminMessages, adminLogout } from "../../services/adminApi";

export default function AdminMessages() {
  const navigate = useNavigate();

  const { data, loading, error } = useApi(fetchAllAdminMessages, []);
  const list = data?.messages || [];

  async function onLogout() {
    try {
      await adminLogout();
    } finally {
      navigate("/admin/login");
    }
  }

  return (
    <main
      className="py-12"
      style={{ background: "linear-gradient(135deg, #9AC8EB 0%, #F4CFDF 100%)" }}
    >
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Admin — Messages
          </h1>
          <div className="flex gap-2">
            <Link
              to="/admin"
              className="rounded-xl px-3 py-1.5 text-sm border"
              style={{ borderColor: "#5784BA", color: "#5784BA" }}
            >
              ← Dashboard
            </Link>
            <button
              onClick={onLogout}
              className="rounded-xl px-3 py-1.5 text-sm border"
              style={{ borderColor: "#5784BA", color: "#5784BA" }}
            >
              Se déconnecter
            </button>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Tous les messages</h2>

          {loading ? (
            <p>Chargement…</p>
          ) : error ? (
            <p className="text-red-600">{String(error.message || error)}</p>
          ) : list.length === 0 ? (
            <p className="text-slate-600">Aucun message.</p>
          ) : (
            <ul className="space-y-3">
              {list.map((m) => (
                <li key={m.id} className="rounded-xl border p-3 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">
                      {m.subject || "(Sans sujet)"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(m.created_at).toLocaleString("fr-FR")}
                    </div>
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    De :{" "}
                    <a
                      href={`mailto:${m.email}`}
                      className="font-mono underline hover:opacity-80"
                    >
                      {m.email}
                    </a>
                  </div>
                  <p className="text-sm mt-2 whitespace-pre-wrap">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}


