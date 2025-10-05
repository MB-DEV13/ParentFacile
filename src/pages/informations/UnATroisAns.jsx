// src/pages/informations/UnATroisAns.jsx
import { Link } from "react-router-dom";

export default function UnATroisAns() {
  const steps = [
    {
      title: "Vaccinations obligatoires",
      detail:
        "Suivre le calendrier vaccinal (11 vaccins obligatoires avant 2 ans). Conserver les certificats pour la crèche/école.",
      pro: "Médecin traitant ou PMI",
      // Certificat noté dans le carnet de santé, délivré par le pro de santé → pas de PDF national à télécharger
      doc: {
        type: "local",
        note: "Certificat vaccinal dans le carnet de santé (délivré par le médecin).",
      },
    },
    {
      title: "Suivi de santé",
      detail:
        "Visites obligatoires à 9, 24 et 36 mois. Un certificat de santé est rempli et transmis à la PMI.",
      pro: "Médecin traitant ou PMI",
      // Certificats fournis/remplis par le médecin (pages du carnet de santé) → pas de PDF à télécharger
      doc: {
        type: "local",
        note: "Certificat de santé rempli par le médecin (PMI).",
      },
    },
    {
      title: "Modes de garde",
      detail:
        "Demander une place en crèche, trouver une assistante maternelle agréée, ou opter pour une garde partagée. Prévoir contrats/attestations.",
      pro: "Mairie / Relais Petite Enfance / CAF",
      // Dossiers/crèches = formulaires fournis par la mairie/structure
      doc: {
        type: "local",
        note: "Formulaire d’inscription crèche fourni par la mairie/structure.",
      },
    },
    {
      title: "Aides financières (PAJE, CMG)",
      detail:
        "Demande de Complément de libre choix du Mode de Garde (CMG), aides PAJE et démarches Pajemploi.",
      pro: "CAF / URSSAF Pajemploi",
      // Démarches principalement en ligne (compte CAF, Pajemploi)
      doc: {
        type: "link",
        label: "Accéder à la démarche CAF",
        href: "https://www.caf.fr/allocataires/caf-de-la-reunion/offre-de-service/vie-personnelle/cmg-complement-de-libre-choix-du-mode-de-garde",
      },
    },
    {
      title: "Allocations familiales",
      detail:
        "Actualiser régulièrement sa situation dans l’espace CAF pour maintenir les droits.",
      pro: "CAF",
      // Démarches/actualisations en ligne → lien
      doc: null,
    },
    {
      title: "Préparation à la rentrée scolaire",
      detail:
        "Inscrire l’enfant à l’école maternelle l’année de ses 3 ans : préinscription en mairie puis inscription à l’école.",
      pro: "Mairie + direction de l’école",
      // Dossiers fournis par la mairie/école (variables selon commune)
      doc: {
        type: "local",
        note: "Formulaire d’inscription scolaire fourni par la mairie/école.",
      },
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
          Parcours — 1 à 3 ans
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
                      style={{ background: "#F4CFDF", color: "#1f2a44" }}
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

                {/* Action droite */}
                <div className="mt-3 md:mt-0 md:w-56 shrink-0">
                  {s.doc?.type === "link" ? (
                    <a
                      href={s.doc.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium shadow hover:brightness-110 active:brightness-95 transition"
                      style={{ background: "#5784BA", color: "#fff" }}
                    >
                      {s.doc.label || "Accéder à la démarche"}
                    </a>
                  ) : s.doc?.type === "local" ? (
                    <div className="rounded-lg border p-3 bg-slate-50 text-sm">
                      <div className="font-medium mb-1">
                        Document remis sur place
                      </div>
                      <p className="text-slate-600">{s.doc.note}</p>
                    </div>
                  ) : s.doc?.type === "official" ? (
                    <Link
                      to={`/documents?q=${encodeURIComponent(s.doc.query)}`}
                      className="w-full inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium shadow"
                      style={{ background: "#5784BA", color: "#fff" }}
                    >
                      Télécharger le document
                    </Link>
                  ) : (
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
              Besoin d’un certificat ou d’un formulaire ?
            </h4>
            <p className="text-sm text-slate-700">
              Retrouvez tous les documents utiles pour la petite enfance.
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
