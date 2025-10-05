// src/pages/documents/Index.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchDocuments,
  downloadDocument,
  downloadAllZip,
  previewDocument,
} from "../../services/api";

import family2 from "../../assets/images/family_2.png";

const TAGS_UI = ["Grossesse", "Naissance", "1–3 ans"];
const GROUP_ORDER = { Grossesse: 0, Naissance: 1, "1–3 ans": 2 };

function normalizeTag(tag) {
  if (!tag) return "";
  return tag
    .replace(/^0[\s–-]?3\s?ans$/i, "1–3 ans")
    .replace(/^3\s?ans$/i, "1–3 ans");
}

function tagColor(tag) {
  switch (normalizeTag(tag)) {
    case "Grossesse":
      return { background: "#9AC8EB", color: "#1f2a44" };
    case "Naissance":
      return { background: "#F7F6CF", color: "#1f2a44" };
    case "1–3 ans":
      return { background: "#F4CFDF", color: "#1f2a44" };
    default:
      return { background: "#B6D8F2", color: "#1f2a44" };
  }
}

/* ===========================
   Helpers recherche "tolérante"
   - suppression des accents / casse
   - ponctuation/espaces souples
   - tolère 1 caractère d’écart (typo)
=========================== */
function normalizeStr(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD") // sépare les accents
    .replace(/[\u0300-\u036f]/g, "") // retire les accents
    .replace(/[^a-z0-9\s-]/g, " ") // supprime ponctuation
    .replace(/\s+/g, " ") // espaces multiples -> un seul
    .trim();
}

// tolérance <= 1 édition (insertion/suppression/substitution)
function withinOneEdit(a, b) {
  if (a === b) return true;
  const la = a.length,
    lb = b.length;
  if (Math.abs(la - lb) > 1) return false;

  // s'assurer que a est la plus courte
  if (la > lb) return withinOneEdit(b, a);

  let i = 0,
    j = 0,
    edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    edits++;
    if (edits > 1) return false;

    if (la === lb) {
      // substitution
      i++;
      j++;
    } else {
      // insertion dans b (ou suppression de b)
      j++;
    }
  }
  // si une lettre traine à la fin -> 1 édition
  return true;
}

function fuzzyIncludes(hay, needle) {
  const H = normalizeStr(hay);
  const N = normalizeStr(needle);
  if (!N) return true;

  // correspondance directe (insensible aux accents)
  if (H.includes(N)) return true;

  // comparaison token par token avec tolérance de 1 faute
  const hTokens = H.split(" ");
  const nTokens = N.split(" ");

  // On accepte si CHAQUE token recherché "colle" à AU MOINS un token du doc
  return nTokens.every((nTok) =>
    hTokens.some((hTok) => hTok.includes(nTok) || withinOneEdit(hTok, nTok))
  );
}

export default function DocsIndex() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "");

  // URL -> UI
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setActiveTag(searchParams.get("tag") || "");
  }, [searchParams]);

  // UI -> URL (petit debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (activeTag) p.set("tag", activeTag);
      setSearchParams(p, { replace: true });
    }, 150);
    return () => clearTimeout(t);
  }, [q, activeTag, setSearchParams]);

  // Fetch depuis la DB (via API)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchDocuments(); // { documents: [...] }
        if (!mounted) return;
        setDocs(
          (data?.documents || []).map((d) => ({
            ...d,
            tag: normalizeTag(d.tag),
          }))
        );
      } catch (e) {
        setError(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Filtre + tri (avec fuzzyIncludes)
  const filtered = useMemo(() => {
    let arr = docs;
    const term = q; // on envoie brut à fuzzyIncludes, il normalise

    if (term && term.trim()) {
      arr = arr.filter(
        (d) =>
          fuzzyIncludes(d.label || "", term) || fuzzyIncludes(d.tag || "", term)
      );
    }

    if (activeTag) arr = arr.filter((d) => d.tag === activeTag);

    return [...arr].sort((a, b) => {
      const ga = GROUP_ORDER[a.tag] ?? 99;
      const gb = GROUP_ORDER[b.tag] ?? 99;
      if (ga !== gb) return ga - gb;
      const oa = a.order ?? 999;
      const ob = b.order ?? 999;
      if (oa !== ob) return oa - ob;
      return String(a.label).localeCompare(String(b.label), "fr");
    });
  }, [docs, q, activeTag]);

  return (
    <section className="py-16" style={{ background: "#F7F6CF" }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-end justify-between gap-6 mb-6 sm:mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">
              Documents à télécharger
            </h2>
            <p className="text-slate-700 mt-1 text-base">
              Classés chronologiquement pour aller à l’essentiel.
            </p>
          </div>
          <button
            type="button"
            onClick={downloadAllZip}
            className="hidden sm:inline-block rounded-xl px-4 py-2 text-sm font-medium shadow cursor-pointer hover:brightness-110 active:brightness-95 transition"
            style={{ background: "#5784BA", color: "#fff" }}
            title="Télécharger tous les PDF en ZIP"
          >
            Tout télécharger (ZIP)
          </button>
        </div>

        {/* Bandeau */}
        <div className="mb-6 rounded-2xl overflow-hidden shadow-sm">
          <img
            src={family2}
            alt="Famille - documents utiles"
            className="w-full max-h-72 object-contain object-center"
            loading="eager"
            decoding="async"
          />
        </div>

        {/* Recherche + Filtres */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un document (titre, tag)…"
              className="w-full rounded-xl border bg-white border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ outlineColor: "#5784BA" }}
              aria-label="Rechercher dans les documents"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTag("")}
              className={`rounded-full px-3 py-1.5 text-sm border ${
                activeTag === ""
                  ? "bg-white shadow font-medium"
                  : "hover:bg-white"
              }`}
            >
              Tous
            </button>
            {TAGS_UI.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setActiveTag(t === activeTag ? "" : t)}
                className={`rounded-full px-3 py-1.5 text-sm border ${
                  activeTag === t
                    ? "bg-white shadow font-medium"
                    : "hover:bg-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Contenu */}
        {loading && <p>Chargement…</p>}
        {error && (
          <p className="text-red-600">
            Erreur: {String(error.message || error)}
          </p>
        )}
        {!loading && !error && filtered.length === 0 && (
          <p className="text-slate-600">Aucun document trouvé.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((doc) => (
              <article
                key={doc.id}
                className="rounded-2xl border bg-white p-4 flex flex-col shadow-sm"
              >
                <div
                  className="text-xs font-medium w-fit rounded-md px-2 py-1 mb-2"
                  style={tagColor(doc.tag)}
                >
                  {normalizeTag(doc.tag)}
                </div>

                <h3 className="font-semibold leading-snug flex-1">
                  {doc.label}
                </h3>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => previewDocument(doc.public_url, doc.id)}
                    className="text-sm underline cursor-pointer hover:opacity-80 transition"
                    title="Ouvrir l’aperçu PDF"
                  >
                    Aperçu
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadDocument(doc.id)}
                    className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium cursor-pointer hover:opacity-90 active:opacity-95 transition"
                    style={{ background: "#9AC8EB" }}
                    title="Télécharger le PDF"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14" />
                      <path d="M19 12l-7 7-7-7" />
                    </svg>
                    PDF
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
