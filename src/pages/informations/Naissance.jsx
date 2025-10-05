// src/pages/informations/Naissance.jsx
import { Link } from "react-router-dom";

export default function Naissance() {
  const steps = [
    // 1 — Congé paternité / 2e parent en premier
    {
      title: "Congé paternité / 2e parent",
      detail:
        "À poser dans les 6 mois suivant la naissance (25 jours, 32 en cas de naissances multiples). L’employeur transmet les attestations de salaire à la CPAM pour les indemnités.",
      pro: "Employeur + CPAM",
      // 👉 Demande : uniquement un bouton vers le modèle présent dans ta page Documents
      doc: {
        type: "official",
        query: "Modèle congé paternité", // la recherche dans /documents s’appuiera sur ce terme
        extraLabel: "Modèle du congé paternité",
      },
    },

    // 2 — Déclaration de naissance (ok)
    {
      title: "Déclaration de naissance",
      detail:
        "À faire dans les 5 jours ouvrables suivant la naissance à la mairie du lieu de naissance. Permet d’obtenir l’acte de naissance.",
      pro: "Officier d’état civil en mairie",
      doc: {
        type: "local",
        note: "Déclaration réalisée directement à la mairie du lieu de naissance.",
      },
    },

    // 3 — Reconnaissance (ok)
    {
      title: "Reconnaissance anticipée / filiation",
      detail:
        "Si les parents ne sont pas mariés : la filiation paternelle peut être établie par reconnaissance (avant ou après la naissance).",
      pro: "Mairie (service état civil)",
      doc: { type: "local", note: "Formulaire fourni par votre mairie" },
    },

    // 4 — Livret de famille (ok)
    {
      title: "Inscription sur le livret de famille",
      detail:
        "L’officier d’état civil complète le livret existant ou en délivre un nouveau. Géré automatiquement par la mairie.",
      pro: "Mairie du lieu de naissance",
      doc: null,
    },

    // 5 — Sécurité sociale (rattachement) -> “Télécharger le document” (S3705)
    {
      title: "Sécurité sociale (rattachement de l’enfant)",
      detail:
        "Rattacher l’enfant à un ou aux deux parents. Démarche via votre compte ameli et/ou formulaire selon les cas.",
      pro: "CPAM (en ligne ou courrier)",
      // 👉 On pousse vers /documents avec une requête claire : “S3705”
      doc: { type: "official", query: "Rattachement enfant CPAM" },
    },

    // 6 — Mutuelle (ok)
    {
      title: "Mutuelle santé",
      detail:
        "Informer votre complémentaire santé pour ajouter l’enfant à votre contrat (copies d’acte de naissance/livret, selon mutuelle).",
      pro: "Mutuelle de santé (parent au choix)",
      doc: null,
    },

    // 7 — CAF (ok)
    {
      title: "CAF / prestations familiales",
      detail:
        "Déclarer la naissance pour déclencher la prime (si non déjà versée) et la PAJE (sous conditions). Démarches depuis votre espace caf.fr.",
      pro: "CAF (compte en ligne) ; accompagnement possible par PMI",
      doc: {
        type: "link",
        href: "/documents?q=CAF%20naissance",
        label: "Accéder aux démarches CAF",
      },
    },

    // 8 — Protection sociale complémentaire (ok)
    {
      title: "Protection sociale complémentaire (entreprise)",
      detail:
        "Informer votre employeur (mutuelle d’entreprise) et vérifier vos couvertures (prévoyance, etc.).",
      pro: "Service RH / employeur",
      doc: null,
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-[#B6D8F2] to-[#F4CFDF]">
      {/* Raccourcis (pills) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <Link
          to="/informations/grossesse"
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-white"
          style={{ borderColor: "#5784BA", color: "#1f2a44" }}
        >
          Grossesse
        </Link>
        <Link
          to="/informations/naissance"
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-white"
          style={{ borderColor: "#5784BA", color: "#1f2a44" }}
        >
          Naissance
        </Link>
        <Link
          to="/informations/1-3-ans"
          className="rounded-full border px-3 py-1.5 text-sm hover:bg-white"
          style={{ borderColor: "#5784BA", color: "#1f2a44" }}
        >
          1 à 3 ans
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          Parcours — Naissance
        </h1>

        <ul className="space-y-4">
          {steps.map((s, i) => (
            <li
              key={i}
              className="rounded-xl border p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="md:flex md:items-start md:justify-between gap-6">
                {/* Infos principales */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: "#F7F6CF", color: "#1f2a44" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-semibold">{s.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-2">{s.detail}</p>
                  {s.pro && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">
                        Professionnel à contacter :{" "}
                      </span>
                      {s.pro}
                    </p>
                  )}
                </div>

                {/* Actions à droite */}
                <div className="mt-3 md:mt-0 md:w-56 shrink-0 space-y-2">
                  {/* Cas “link” (interne vers /documents) */}
                  {s.doc?.type === "link" && s.doc.href ? (
                    <Link
                      to={s.doc.href}
                      target="_blank"
                      className="w-full inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium shadow hover:brightness-110 active:brightness-95 transition"
                      style={{ background: "#5784BA", color: "#fff" }}
                    >
                      {s.doc.label || "Accéder au document"}
                    </Link>
                  ) : null}

                  {/* Cas “official” : on redirige vers /documents?q=... */}
                  {s.doc?.type === "official" && s.doc.query ? (
                    <Link
                      to={`/documents?q=${encodeURIComponent(s.doc.query)}`}
                      className="w-full inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium shadow hover:brightness-110 active:brightness-95 transition"
                      style={{ background: "#5784BA", color: "#fff" }}
                    >
                      {/* Étape 1 : libellé spécifique demandé */}
                      {s.doc.extraLabel || "Télécharger le document"}
                    </Link>
                  ) : null}

                  {/* Cas “local” */}
                  {s.doc?.type === "local" ? (
                    <div className="rounded-lg border p-3 bg-slate-50 text-sm">
                      <div className="font-medium mb-1">
                        Document remis sur place
                      </div>
                      <p className="text-slate-600">
                        {s.doc.note || "Document fourni par votre mairie."}
                      </p>
                    </div>
                  ) : null}

                  {/* Aucun document */}
                  {!s.doc && (
                    <div className="text-xs text-slate-500 text-center">
                      Aucun document à télécharger
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Bande CTA */}
        <div
          className="mt-8 rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: "#F7F6CF" }}
        >
          <div>
            <h4 className="font-semibold">
              Besoin d’un acte ou d’une attestation ?
            </h4>
            <p className="text-sm text-slate-700">
              Retrouvez tous les PDF utiles après la naissance.
            </p>
          </div>
          <Link
            to="/documents"
            className="rounded-xl px-4 py-2 text-sm font-medium shadow"
            style={{ background: "#5784BA", color: "#fff" }}
          >
            Voir tous les documents
          </Link>
        </div>
      </div>
    </section>
  );
}
