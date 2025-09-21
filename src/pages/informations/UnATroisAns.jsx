import { Link } from "react-router-dom";

export default function UnATroisAns() {
  const steps = [
    {
      title: "Vaccinations obligatoires",
      detail:
        "Suivre le calendrier vaccinal (11 vaccins obligatoires avant 2 ans). Garder les certificats pour la crèche ou l’école.",
      pro: "Médecin traitant ou PMI",
      doc: {
        type: "official",
        query: "Carnet de santé / certificats vaccinaux",
      },
    },
    {
      title: "Suivi de santé",
      detail:
        "Visites obligatoires à 9 mois, 24 mois et 36 mois. Examen complet avec certificat de santé à envoyer à la PMI.",
      pro: "Médecin traitant ou PMI",
      doc: { type: "official", query: "Certificat de santé obligatoire" },
    },
    {
      title: "Modes de garde",
      detail:
        "Demander une place en crèche, trouver une assistante maternelle agréée, ou opter pour une garde partagée. Prévoir contrats et attestations.",
      pro: "Mairie / Relais Petite Enfance / CAF",
      doc: {
        type: "local",
        note: "Formulaire inscription crèche (mairie/commune)",
      },
    },
    {
      title: "Aides financières (PAJE, CMG)",
      detail:
        "Demande de complément de libre choix du mode de garde (CMG), aides PAJE et crédit d’impôt.",
      pro: "CAF / URSSAF Pajemploi",
      doc: { type: "official", query: "Dossier PAJE / CMG" },
    },
    {
      title: "Allocations familiales",
      detail:
        "Déclaration annuelle et actualisation de situation pour maintenir les droits.",
      pro: "CAF",
      doc: null,
    },
    {
      title: "Préparation à la rentrée scolaire",
      detail:
        "Inscrire l’enfant à l’école maternelle l’année de ses 3 ans. Dossier à déposer auprès de la mairie puis inscription auprès de l’école.",
      pro: "Mairie + direction de l’école",
      doc: {
        type: "local",
        note: "Formulaire d’inscription scolaire fourni par la mairie",
      },
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-[#B6D8F2] to-[#F4CFDF]">
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
                  {s.doc?.type === "official" ? (
                    <Link
                      to={`/documents?q=${encodeURIComponent(s.doc.query)}`}
                      className="w-full inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium shadow"
                      style={{ background: "#5784BA", color: "#fff" }}
                    >
                      Télécharger le document
                    </Link>
                  ) : s.doc?.type === "local" ? (
                    <div className="rounded-lg border p-3 bg-slate-50 text-sm">
                      <div className="font-medium mb-1">Document local</div>
                      <p className="text-slate-600">{s.doc.note}</p>
                    </div>
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
