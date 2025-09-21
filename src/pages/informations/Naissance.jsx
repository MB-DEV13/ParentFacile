import { Link } from "react-router-dom";

export default function Naissance() {
  const steps = [
    {
      title: "Déclaration de naissance",
      detail:
        "À faire dans les 5 jours ouvrables suivant la naissance à la mairie du lieu de naissance. Permet d’obtenir l’acte de naissance.",
      pro: "Officier d’état civil en mairie",
      doc: { type: "official", query: "Acte de naissance" },
    },
    {
      title: "Reconnaissance anticipée / filiation",
      detail:
        "Si les parents ne sont pas mariés : la filiation paternelle doit être établie par reconnaissance (possible avant ou après la naissance).",
      pro: "Mairie (service état civil)",
      doc: { type: "local", note: "Formulaire fourni par la mairie" },
    },
    {
      title: "Inscription sur le livret de famille",
      detail:
        "L’officier d’état civil complète le livret existant ou en délivre un nouveau.",
      pro: "Mairie du lieu de naissance",
      doc: { type: "local", note: "Mise à jour automatique par la mairie" },
    },
    {
      title: "Sécurité sociale",
      detail:
        "Déclarer la naissance à la CPAM pour rattacher l’enfant à un ou aux deux parents (choix possible).",
      pro: "CPAM (en ligne ou courrier)",
      doc: { type: "official", query: "Formulaire rattachement enfant CPAM" },
    },
    {
      title: "Mutuelle santé",
      detail:
        "Informer votre complémentaire santé afin d’ajouter l’enfant à votre contrat.",
      pro: "Mutuelle de santé de l’un des parents",
      doc: null,
    },
    {
      title: "CAF / prestations familiales",
      detail:
        "Déclarer la naissance pour déclencher la prime de naissance (si non déjà versée) et les allocations (PAJE).",
      pro: "CAF (compte en ligne ou formulaire papier)",
      doc: { type: "official", query: "Déclaration naissance CAF" },
    },
    {
      title: "Protection sociale complémentaire",
      detail:
        "Informer votre employeur (si mutuelle d’entreprise) et vérifier les couvertures (prévoyance, etc.).",
      pro: "Service RH / employeur",
      doc: null,
    },
    {
      title: "Congé paternité / 2e parent",
      detail:
        "À poser dans les 6 mois suivant la naissance (25 jours, ou 32 en cas de naissances multiples).",
      pro: "Employeur + CPAM",
      doc: { type: "official", query: "Attestation congé paternité" },
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-[#B6D8F2] to-[#F4CFDF]">
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
