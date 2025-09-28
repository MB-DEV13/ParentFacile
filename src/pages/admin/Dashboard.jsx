// src/pages/admin/Dashboard.jsx
import { useEffect, useState } from "react";
import {
  adminDeleteDoc,
  adminListDocs,
  adminLogout,
  adminUploadDoc,
  fetchAdminMessages,
} from "../../services/adminApi";
import { Link, useNavigate } from "react-router-dom";

const TAGS = ["Grossesse", "Naissance", "1–3 ans"];

function slugify(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminDashboard() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // Derniers messages (bloc bas)
  const [lastMsgs, setLastMsgs] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [errMsgs, setErrMsgs] = useState("");

  const [form, setForm] = useState({
    label: "",
    tag: "Grossesse",
    sort_order: 999,
    doc_key: "",
    file: null,
  });

  function setField(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setMsg("");
    setErr("");
  }

  // Charger docs
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await adminListDocs();
        setList(data.documents || []);
      } catch (e) {
        setErr(e.message || "Erreur chargement documents");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Charger derniers messages
  useEffect(() => {
    (async () => {
      try {
        setLoadingMsgs(true);
        const data = await fetchAdminMessages(3);
        setLastMsgs(data.messages || []);
        setErrMsgs("");
      } catch (_e) {
        setErrMsgs("Erreur chargement des messages");
      } finally {
        setLoadingMsgs(false);
      }
    })();
  }, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!form.label || !form.doc_key || !form.file) {
      setErr("Label, doc_key et PDF requis.");
      return;
    }
    try {
      setSending(true);
      await adminUploadDoc(form);
      setMsg("Document ajouté !");
      setForm({
        label: "",
        tag: "Grossesse",
        sort_order: 999,
        doc_key: "",
        file: null,
      });
      const data = await adminListDocs();
      setList(data.documents || []);
    } catch (e) {
      setErr(e.message || "Erreur ajout document");
    } finally {
      setSending(false);
    }
  }

  async function onDelete(id) {
    if (!confirm("Supprimer ce document ?")) return;
    try {
      await adminDeleteDoc(id);
      setList((arr) => arr.filter((d) => d.id !== id));
    } catch (e) {
      alert(e.message || "Erreur suppression");
    }
  }

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
      style={{
        background: "linear-gradient(135deg, #9AC8EB 0%, #F4CFDF 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Admin – Dashboard
          </h1>
          <button
            onClick={onLogout}
            className="rounded-xl px-3 py-1.5 text-sm border"
            style={{ borderColor: "#5784BA", color: "#5784BA" }}
          >
            Se déconnecter
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulaire */}
          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Ajouter un PDF</h2>
            <form className="space-y-3" onSubmit={onSubmit}>
              <div>
                <label className="text-sm font-medium">Titre (label)</label>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm"
                  value={form.label}
                  placeholder="Ex: Déclaration de grossesse (CPAM/CAF)"
                  onChange={(e) => {
                    const v = e.target.value;
                    setField("label", v);
                    if (!form.doc_key) setField("doc_key", slugify(v));
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Tag</label>
                  <select
                    className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                    value={form.tag}
                    onChange={(e) => setField("tag", e.target.value)}
                  >
                    {TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Ordre</label>
                  <input
                    type="number"
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                    value={form.sort_order}
                    onChange={(e) =>
                      setField("sort_order", Number(e.target.value))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Clé doc (doc_key)</label>
                <input
                  className="w-full rounded-xl border px-3 py-2 text-sm font-mono"
                  value={form.doc_key}
                  onChange={(e) => setField("doc_key", slugify(e.target.value))}
                  placeholder="ex: declaration-grossesse"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Fichier PDF</label>
                <input
                  type="file"
                  accept="application/pdf"
                  className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
                  onChange={(e) =>
                    setField("file", e.target.files?.[0] || null)
                  }
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
                  style={{ background: "#5784BA", color: "#fff" }}
                >
                  {sending ? "Envoi…" : "Ajouter"}
                </button>
                {err && <p className="text-red-600 text-sm mt-2">{err}</p>}
                {msg && <p className="text-green-700 text-sm mt-2">{msg}</p>}
              </div>
            </form>
          </section>

          {/* Liste */}
          <section className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-3">Documents</h2>
            {loading ? (
              <p>Chargement…</p>
            ) : list.length === 0 ? (
              <p className="text-slate-600">Aucun document.</p>
            ) : (
              <ul className="space-y-3">
                {list.map((d) => (
                  <li
                    key={d.id}
                    className="border rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="text-xs px-2 py-1 rounded-md bg-slate-100">
                      {d.tag}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{d.label}</div>
                      <div className="text-xs text-slate-500">
                        {d.label} — ordre {d.order}
                      </div>
                    </div>

                    <a
                      href={d.public_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs underline"
                    >
                      Ouvrir
                    </a>
                    <button
                      onClick={() => onDelete(d.id)}
                      className="text-xs rounded-lg px-2 py-1 border"
                    >
                      Supprimer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Derniers messages reçus */}
        <section className="mt-10 bg-white rounded-2xl shadow p-6">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Derniers messages reçus</h3>
            <Link to="/admin/messages" className="text-sm underline">
              Voir tous
            </Link>
          </div>

          {loadingMsgs ? (
            <p className="text-sm text-slate-500 mt-3">Chargement…</p>
          ) : errMsgs ? (
            <p className="text-sm text-red-600 mt-3">{errMsgs}</p>
          ) : lastMsgs.length === 0 ? (
            <p className="text-sm text-slate-500 mt-3">
              Aucun message pour l’instant.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {lastMsgs.map((m) => (
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
                    De : <span className="font-mono">{m.email}</span>
                  </div>
                  <p className="text-sm mt-2 line-clamp-3">{m.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
