import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchDocuments,
  downloadDocument,
  previewDocument,
  downloadAllZip,
} from "../services/api";
import hero from "../assets/images/hero-placeholder.png";

function normalizeTag(tag) {
  if (!tag) return "";
  return tag
    .replace(/^0[\s–-]?3\s?ans$/i, "1–3 ans")
    .replace(/^3\s?ans$/i, "1–3 ans");
}

export default function Home() {
  const [docs, setDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchDocuments();
        if (!mounted) return;
        const list = (data?.documents || []).map((d, i) => ({
          ...d,
          tag: normalizeTag(d.tag),
          _idx: i,
        }));
        setDocs(list);
      } finally {
        if (mounted) setLoadingDocs(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const recent = useMemo(
    () =>
      [...docs]
        .sort((a, b) => {
          const da = a.updatedAt ? Date.parse(a.updatedAt) : a._idx;
          const db = b.updatedAt ? Date.parse(b.updatedAt) : b._idx;
          return db - da;
        })
        .slice(0, 3),
    [docs]
  );

  const steps = [
    {
      num: "01",
      label: "Grossesse",
      title: "Grossesse",
      body: "Déclarations, suivi médical, congés, allocations : toutes les étapes avec liens officiels et pièces à fournir.",
      slug: "grossesse",
    },
    {
      num: "02",
      label: "Naissance",
      title: "Naissance",
      body: "Reconnaissance, acte de naissance, sécurité sociale, mutuelle, prime de naissance, modes de garde.",
      slug: "naissance",
    },
    {
      num: "03",
      label: "1 à 3 ans",
      title: "1 à 3 ans",
      body: "Vaccinations, PAJE/CAF, crèche/assistante maternelle, rentrée en maternelle, attestations utiles.",
      slug: "1-3-ans",
    },
  ];

  return (
    <>
      {/* HERO */}
      <section className="relative bg-gradient-to-r from-[#B6D8F2] to-[#F4CFDF]">
        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-center py-14">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              Toutes vos démarches parentales, réunies en un seul endroit.
            </h1>
            <p className="mt-3 text-slate-700">
              De la grossesse aux 3 ans, ParentFacile centralise les étapes,
              documents PDF et numéros utiles.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/informations"
                className="rounded-xl px-4 py-2 text-sm font-medium shadow"
                style={{ background: "#5784BA", color: "#fff" }}
              >
                Voir le parcours
              </Link>
              <Link
                to="/documents"
                className="rounded-xl px-4 py-2 text-sm font-medium border"
                style={{ borderColor: "#5784BA", color: "#5784BA" }}
              >
                Télécharger des documents
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-lg">
            <img
              src={hero}
              alt="Famille / illustration"
              className="w-full h-64 sm:h-80 object-cover"
            />
            <div
              className="absolute bottom-4 left-4 bg-white/90 rounded-xl px-3 py-1 text-xs font-semibold"
              style={{ color: "#5784BA" }}
            >
              Démarches basées sur les normes FR
            </div>
          </div>
        </div>
      </section>

      {/* INFORMATIONS / TIMELINE */}
      <section id="infos" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <span
              className="text-xs font-semibold tracking-wider uppercase"
              style={{ color: "#5784BA" }}
            >
              Notre parcours
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2">
              Informations essentielles, étape par étape
            </h2>
            <p className="text-slate-600 mt-2">
              Une vue d’ensemble claire puis le détail de chaque démarche avec
              documents téléchargeables.
            </p>
          </div>

          {/* Conteneur avec trait vertical unique */}
          <div className="relative">
            {/* Trait vertical global */}
            <div className="hidden md:block absolute left-[260px] top-0 bottom-0 w-px bg-slate-200" />

            {/* Grille */}
            <div className="grid md:grid-cols-[240px_40px_minmax(0,1fr)] gap-x-10 gap-y-16">
              {steps.map((step, idx) => (
                <div className="contents" key={idx}>
                  {/* Colonne 1 */}
                  <div className="flex items-start gap-3 pt-[2px]">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "#B6D8F2" }}
                    >
                      {step.num}
                    </div>
                    <div className="font-medium">{step.label}</div>
                  </div>

                  {/* Colonne 2 : pastille alignée à gauche du trait */}
                  <div className="relative">
                    <div
                      className="absolute -left-7.5 top-[0.45rem] h-5 w-5 rounded-full ring-4"
                      style={{
                        background: "#9AC8EB",
                        boxShadow: "0 0 0 4px #E5E7EB inset",
                      }}
                    />
                  </div>

                  {/* Colonne 3 */}
                  <div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{step.body}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        to="/documents"
                        className="text-xs rounded-lg px-3 py-1.5 border"
                        style={{ borderColor: "#5784BA", color: "#5784BA" }}
                      >
                        Voir les documents
                      </Link>
                      <Link
                        to={`/informations/${step.slug}`}
                        className="text-xs rounded-lg px-3 py-1.5"
                        style={{ background: "#F4CFDF" }}
                      >
                        Guide détaillé
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BANDE DOCUMENTS CTA */}
      <section className="py-10" style={{ background: "#F7F6CF" }}>
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div>
            <h3 className="text-xl font-semibold">Documents à télécharger</h3>
            <p className="text-slate-700 text-sm">
              Classés chronologiquement pour aller à l’essentiel.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/documents"
              className="rounded-xl px-4 py-2 text-sm font-medium border"
              style={{ borderColor: "#5784BA", color: "#5784BA" }}
            >
              Voir les documents
            </Link>
            <button
              onClick={downloadAllZip}
              className="rounded-xl px-4 py-2 text-sm font-medium shadow"
              style={{ background: "#5784BA", color: "#fff" }}
            >
              Tout télécharger (ZIP)
            </button>
          </div>
        </div>
      </section>

      {/* CARROUSEL DOCUMENTS RÉCENTS */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl font-semibold">
                Derniers documents ajoutés
              </h3>
              <p className="text-slate-600 text-sm">
                Un aperçu des nouveautés, vous en trouverez plus dans la page
                Documents.
              </p>
            </div>
            <Link
              to="/documents?sort=recent"
              className="text-sm font-medium rounded-lg px-3 py-2 border"
              style={{ borderColor: "#5784BA", color: "#5784BA" }}
            >
              Tout voir
            </Link>
          </div>

          {loadingDocs ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-slate-600">Aucun document pour le moment.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recent.map((doc) => (
                <article
                  key={doc.id || doc.label}
                  className="rounded-2xl border bg-white p-4 flex flex-col shadow-sm"
                >
                  <div
                    className="text-xs font-medium w-fit rounded-md px-2 py-1 mb-2"
                    style={{ background: "#B6D8F2", color: "#1f2a44" }}
                  >
                    {doc.tag}
                  </div>
                  <h4 className="font-semibold leading-snug flex-1">
                    {doc.label}
                  </h4>
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
    </>
  );
}
