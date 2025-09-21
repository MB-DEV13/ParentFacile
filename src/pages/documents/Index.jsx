import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  fetchDocuments,
  downloadDocument,
  downloadAllZip,
  previewDocument,
} from "../../services/api";

// Assure-toi que l'image est bien à ce chemin :
import family2 from "../../assets/images/family_2.png";

const TAGS_UI = ["Grossesse", "Naissance", "1–3 ans"];

// Couleurs d’étiquette par tag
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

// Ordre de groupe pour le tri chronologique par défaut
const GROUP_ORDER = { Grossesse: 0, Naissance: 1, "1–3 ans": 2 };

/**
 * Documents “mock” pour remplir la page si l’API n’en renvoie pas tous.
 * Noms et contenus factices (les fichiers seront simulés par le backend,
 * ou juste prévisualisés si tu poses de vrais PDFs).
 */
const LOCAL_DOCS = [
  // --- GROSSESSE ---
  {
    id: "grossesse-declaration",
    label: "Déclaration de grossesse (CPAM/CAF)",
    tag: "Grossesse",
    order: 10,
    file: "declaration_grossesse.pdf",
  },
  {
    id: "grossesse-suivi",
    label: "Calendrier de suivi médical – Grossesse",
    tag: "Grossesse",
    order: 20,
    file: "calendrier_suivi.pdf",
  },
  {
    id: "grossesse-conge",
    label: "Dossier congé maternité (salariée)",
    tag: "Grossesse",
    order: 30,
    file: "conge_maternite.pdf",
  },
  {
    id: "grossesse-paje",
    label: "PAJE – déclaration de situation",
    tag: "Grossesse",
    order: 40,
    file: "paje_declaration.pdf",
  },

  // --- NAISSANCE ---
  {
    id: "naissance-acte",
    label: "Demande d’acte de naissance",
    tag: "Naissance",
    order: 50,
    file: "acte_naissance.pdf",
  },
  {
    id: "naissance-reconnaissance",
    label: "Reconnaissance anticipée",
    tag: "Naissance",
    order: 60,
    file: "reconnaissance_anticipee.pdf",
  },
  {
    id: "naissance-rattachement",
    label: "Rattachement Sécurité sociale (enfant)",
    tag: "Naissance",
    order: 70,
    file: "rattachement_cpam.pdf",
  },
  {
    id: "naissance-mutuelle",
    label: "Ajout à la mutuelle (formulaire type)",
    tag: "Naissance",
    order: 80,
    file: "mutuelle_ajout.pdf",
  },

  // --- 1–3 ANS ---
  {
    id: "0-3-vaccins",
    label: "Attestation vaccinale (carnet de santé)",
    tag: "1–3 ans",
    order: 90,
    file: "attestation_vaccins.pdf",
  },
  {
    id: "0-3-cmg",
    label: "Complément de libre choix du mode de garde (CMG)",
    tag: "1–3 ans",
    order: 100,
    file: "cmg.pdf",
  },
  {
    id: "0-3-contrat-creche",
    label: "Contrat d’accueil crèche / assistante maternelle (modèle)",
    tag: "1–3 ans",
    order: 110,
    file: "contrat_garde.pdf",
  },
  {
    id: "3-ans-inscription",
    label: "Dossier inscription maternelle (modèle)",
    tag: "1–3 ans",
    order: 120,
    file: "inscription_maternelle.pdf",
  },
];

export default function DocsIndex() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // URL <-> UI
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [activeTag, setActiveTag] = useState(searchParams.get("tag") || "");

  // refléter les changements d’URL (ex: recherche depuis le header)
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setActiveTag(searchParams.get("tag") || "");
  }, [searchParams]);

  // pousser les changements UI dans l’URL (léger debounce)
  useEffect(() => {
    const t = setTimeout(() => {
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (activeTag) p.set("tag", activeTag);
      setSearchParams(p, { replace: true });
    }, 150);
    return () => clearTimeout(t);
  }, [q, activeTag, setSearchParams]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchDocuments(); // peut renvoyer vide
        if (!mounted) return;

        // On fusionne l'API + nos docs locaux, on normalise, on déduplique (par id/label)
        const apiList = (data?.documents || []).map((d, i) => ({
          ...d,
          tag: normalizeTag(d.tag),
          _idx: i,
        }));

        const localList = LOCAL_DOCS.map((d, i) => ({
          ...d,
          tag: normalizeTag(d.tag),
          _idx: 1000 + i, // garde un ordre d'arrivée distinct
        }));

        const merged = [...apiList, ...localList];

        // déduplication : garde la version API si conflit
        const seen = new Map();
        for (const d of merged) {
          const key = (d.id || d.label).toLowerCase();
          if (!seen.has(key) || seen.get(key).__source === "local") {
            seen.set(key, {
              ...d,
              __source: apiList.includes(d) ? "api" : "local",
            });
          }
        }
        const list = Array.from(seen.values());
        setDocs(list);
      } catch (e) {
        setError(e);
        // fallback total (si API plante)
        setDocs(
          LOCAL_DOCS.map((d, i) => ({
            ...d,
            tag: normalizeTag(d.tag),
            _idx: i,
          }))
        );
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  // recherche + filtre + tri (chronologique par défaut)
  const filtered = useMemo(() => {
    let arr = docs;

    const term = q.trim().toLowerCase();
    if (term) {
      arr = arr.filter(
        (d) =>
          String(d.label || "")
            .toLowerCase()
            .includes(term) ||
          String(d.tag || "")
            .toLowerCase()
            .includes(term)
      );
    }

    if (activeTag) {
      arr = arr.filter((d) => normalizeTag(d.tag) === activeTag);
    }

    // Tri par groupe (Grossesse -> Naissance -> 1–3 ans), puis order, puis label
    arr = [...arr].sort((a, b) => {
      const ga = GROUP_ORDER[normalizeTag(a.tag)] ?? 99;
      const gb = GROUP_ORDER[normalizeTag(b.tag)] ?? 99;
      if (ga !== gb) return ga - gb;
      const oa = a.order ?? 999;
      const ob = b.order ?? 999;
      if (oa !== ob) return oa - ob;
      return String(a.label).localeCompare(String(b.label));
    });

    return arr;
  }, [docs, q, activeTag]);

  return (
    <section className="py-16" style={{ background: "#F7F6CF" }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header + actions */}
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

        {/* Image bandeau – sûre et responsive */}
        <div className="mb-6 rounded-2xl overflow-hidden shadow-sm">
          <img
            src={family2} // ta nouvelle image importée
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
                key={doc.id || doc.label}
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
                    onClick={() =>
                      doc.file
                        ? previewDocument(doc.file)
                        : downloadDocument(doc.id)
                    }
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
