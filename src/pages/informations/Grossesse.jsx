import { Link } from "react-router-dom";

export default function Grossesse() {
  const steps = [
    {
      title: "Test et confirmation de grossesse",
      detail:
        "Prendre rendez-vous pour confirmer la grossesse et lancer le suivi. Conseils initiaux (alimentation, activité, prévention).",
      pro: "Médecin généraliste, sage-femme ou gynécologue",
      doc: null,
    },
    {
      title: "Déclaration de grossesse",
      detail:
        "À réaliser avant la fin de la 14ᵉ semaine d’aménorrhée. Elle déclenche vos droits (prise en charge, prestations CAF). Souvent télétransmise par le praticien.",
      pro: "Médecin ou sage-femme (établit/valide la déclaration)",
      // PDF national unifié de moins en moins utilisé (télétransmission), on oriente vers la rubrique Documents pour infos/attestations associées
      doc: { type: "official", query: "Déclaration de grossesse" },
    },
    {
      title: "Suivi médical obligatoire",
      detail:
        "7 consultations prénatales obligatoires, prises en charge à 100% à partir du 6ᵉ mois. Surveillance de la maman et du bébé + conseils prévention.",
      pro: "Sage-femme, gynécologue ou médecin",
      doc: null,
    },
    {
      title: "Échographies (1er, 2e, 3e trimestre)",
      detail:
        "Échos de référence : autour de 12 SA, 22 SA et 32 SA. Vérification de la croissance et de la vitalité fœtale, dépistage d’anomalies.",
      pro: "Sage-femme échographiste, gynécologue, radiologue",
      doc: { type: "official", query: "Compte rendu échographie" },
    },
    {
      title: "Examens biologiques et dépistages",
      detail:
        "Bilans sanguins (groupe, sérologies), analyse d’urines, dépistage diabète gestationnel (HGPO) si indiqué, suivi tensionnel.",
      pro: "Laboratoire de biologie médicale (sur prescription)",
      doc: { type: "official", query: "Ordonnances examens prénataux" },
    },
    {
      title: "Suivi spécifique si grossesse à risque",
      detail:
        "Contrôles additionnels (monitoring, échos supplémentaires) en cas de facteurs de risque ou pathologie.",
      pro: "Sage-femme / obstétricien en maternité ou cabinet",
      doc: null,
    },
    {
      title: "Choix et inscription à la maternité",
      detail:
        "Réserver une place tôt (niveau adapté à votre situation). Se renseigner sur la liste d’affaires et le projet de naissance.",
      pro: "Secrétariat de la maternité / clinique choisie",
      doc: {
        type: "local",
        note: "Dossier d’inscription propre à l’établissement",
      },
    },
    {
      title: "Reconnaissance anticipée (si non mariés)",
      detail:
        "Permet d’établir la filiation avant la naissance ; évite les démarches urgentes après l’accouchement.",
      pro: "Mairie (officier d’état civil)",
      doc: {
        type: "local",
        note: "Formulaire fourni par la mairie (pièces d’identité, justificatifs)",
      },
    },
    {
      title: "Aides financières (PAJE, prime de naissance…)",
      detail:
        "Vérifier l’éligibilité et déclarer la grossesse à la CAF. La prime de naissance est versée avant la fin du 2ᵉ mois suivant la naissance (sous conditions).",
      pro: "CAF (en ligne) — accompagnement possible par PMI",
      doc: { type: "official", query: "Dossier PAJE CAF" },
    },
    {
      title: "Congé maternité (et paternité/2e parent)",
      detail:
        "Informer votre employeur et fournir le justificatif. Durée légale (1er/2e enfant) : 6 semaines avant + 10 après la naissance (aménagements si grossesse multiple/pathologique).",
      pro: "Employeur / RH ; CPAM pour indemnités journalières",
      doc: { type: "official", query: "Attestations congé maternité" },
    },
    {
      title: "Séances de préparation à la naissance",
      detail:
        "Jusqu’à 8 séances prises en charge : respiration, postures, gestion de la douleur, allaitement, projet de naissance.",
      pro: "Sage-femme (ville, maternité ou PMI)",
      doc: null,
    },
    {
      title: "Projet de naissance",
      detail:
        "Noter vos souhaits (positions, accompagnement, peau-à-peau…). À échanger avec l’équipe pour vérifier ce qui est possible.",
      pro: "Sage-femme / équipe de la maternité",
      doc: {
        type: "local",
        note: "Modèle de projet parfois fourni par la maternité",
      },
    },
    {
      title: "Préparation administrative & trousseau",
      detail:
        "Rassembler : carte Vitale, pièce d’identité, livret de famille, justificatif de domicile, RIB, examens, échos, ordonnance, valise de maternité.",
      pro: "Vous-même (checklist de la maternité)",
      doc: {
        type: "official",
        query: "Checklist maternité / documents utiles",
      },
    },
    {
      title: "Anticiper le retour à domicile et le mode de garde",
      detail:
        "Contacter les modes de garde (crèche, assistante maternelle) et préparer les démarches (inscriptions, contrats, attestations).",
      pro: "Crèche/Relais Petite Enfance, assistante maternelle, mairie",
      doc: {
        type: "local",
        note: "Dossier d’inscription crèche / mairie selon la commune",
      },
    },
  ];

  return (
    <section className="py-12 bg-gradient-to-r from-[#B6D8F2] to-[#F4CFDF]">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">
          Parcours — Grossesse (0 à 9 mois)
        </h1>

        <ul className="space-y-4">
          {steps.map((s, i) => (
            <li
              key={i}
              className="rounded-xl border p-4 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="md:flex md:items-start md:justify-between gap-6">
                {/* Titre + détails (gauche) */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold"
                      style={{ background: "#9AC8EB", color: "#ffffff" }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-semibold">{s.title}</h3>
                  </div>

                  <p className="text-sm text-slate-600 mt-2">{s.detail}</p>

                  {/* Pro à contacter */}
                  {s.pro && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">
                        Professionnel à contacter :{" "}
                      </span>
                      <span className="text-slate-700">{s.pro}</span>
                    </p>
                  )}
                </div>

                {/* Action (droite) */}
                <div className="mt-3 md:mt-0 md:w-56 shrink-0">
                  {s.doc?.type === "official" ? (
                    <Link
                      to={`/documents?q=${encodeURIComponent(s.doc.query)}`}
                      className="w-full inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium shadow hover:brightness-110 active:brightness-95 transition"
                      style={{ background: "#5784BA", color: "#fff" }}
                      title={`Télécharger : ${s.doc.query}`}
                    >
                      Télécharger le document
                    </Link>
                  ) : s.doc?.type === "local" ? (
                    <div className="rounded-lg border p-3 bg-slate-50 text-sm">
                      <div className="font-medium mb-1">Document local</div>
                      <p className="text-slate-600">
                        {s.doc.note ||
                          "Document spécifique à votre mairie/établissement."}
                      </p>
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

        {/* Bande CTA vers tous les documents */}
        <div
          className="mt-8 rounded-2xl border p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ background: "#F7F6CF" }}
        >
          <div>
            <h4 className="font-semibold">
              Besoin d’un modèle ou d’une attestation ?
            </h4>
            <p className="text-sm text-slate-700">
              Retrouvez tous les PDF téléchargeables et classés par étape.
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
