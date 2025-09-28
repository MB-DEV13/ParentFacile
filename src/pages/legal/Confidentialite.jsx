// src/pages/Legal/Privacy.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Privacy() {
  const siteName = "ParentFacile";
  const siteUrl = "https://parentfacile.fr"; // ajuste si besoin
  const lastUpdate = "septembre 2025";
  const contactPath = "/contact";

  const Section = ({ id, title, children }) => (
    <section id={id} className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-3">{title}</h3>
      <div className="prose prose-slate max-w-none text-sm leading-relaxed">
        {children}
      </div>
    </section>
  );

  return (
    <main
      className="py-16"
      style={{
        background: "linear-gradient(135deg, #9AC8EB 0%, #F4CFDF 100%)",
      }}
    >
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <header className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Politique de confidentialité
          </h1>
          <p className="text-slate-700 mt-2">
            {siteName} — Dernière mise à jour : {lastUpdate}
          </p>
        </header>

        <div className="space-y-6">
          <Section id="introduction" title="1. Introduction">
            <p>
              La présente politique décrit comment <strong>{siteName}</strong>{" "}
              collecte, utilise et protège vos données personnelles lors de
              l’utilisation du site{" "}
              <a href={siteUrl} target="_blank" rel="noopener noreferrer">
                {siteUrl}
              </a>
              .
            </p>
          </Section>

          <Section id="donnees-collectees" title="2. Données collectées">
            <ul>
              <li>
                <strong>Données fournies directement :</strong> email, sujet et
                message transmis via le formulaire de contact.
              </li>
              <li>
                <strong>Données techniques :</strong> adresse IP, logs serveur
                (utilisés uniquement à des fins de sécurité et de diagnostic).
              </li>
            </ul>
          </Section>

          <Section id="finalites" title="3. Finalités de la collecte">
            <p>Les données collectées sont utilisées pour :</p>
            <ul>
              <li>répondre aux messages envoyés via le formulaire ;</li>
              <li>assurer la sécurité et le bon fonctionnement du site ;</li>
              <li>
                améliorer le contenu et l’expérience utilisateur de {siteName}.
              </li>
            </ul>
          </Section>

          <Section id="conservation" title="4. Durée de conservation">
            <p>
              Les données de contact sont conservées le temps nécessaire au
              traitement de la demande puis supprimées dans un délai maximum de{" "}
              <strong>12 mois</strong>.
            </p>
          </Section>

          <Section id="partage" title="5. Partage des données">
            <p>
              Vos données ne sont <strong>jamais revendues</strong>. Elles
              peuvent être partagées uniquement dans les cas suivants :
            </p>
            <ul>
              <li>exigence légale ou judiciaire ;</li>
              <li>
                nécessité technique pour l’hébergement (OVHcloud) ou l’envoi
                d’email (SMTP Gmail).
              </li>
            </ul>
          </Section>

          <Section id="droits" title="6. Vos droits (RGPD)">
            <p>
              Conformément au Règlement Général sur la Protection des Données
              (RGPD), vous disposez des droits suivants :
            </p>
            <ul>
              <li>Droit d’accès et de rectification ;</li>
              <li>Droit d’effacement (“droit à l’oubli”) ;</li>
              <li>Droit d’opposition et de limitation du traitement ;</li>
              <li>Droit à la portabilité des données.</li>
            </ul>
            <p className="mt-2">
              Pour exercer vos droits, vous pouvez nous contacter via la page{" "}
              <Link className="underline" to={contactPath}>
                Contact
              </Link>
              .
            </p>
          </Section>

          <Section id="cookies" title="7. Cookies">
            <p>
              {siteName} n’utilise pas de cookies de suivi publicitaire. Seuls
              des cookies techniques essentiels peuvent être déposés pour le bon
              fonctionnement du site. Si un outil d’analyse d’audience est
              ajouté, une bannière de consentement sera affichée.
            </p>
          </Section>

          <Section id="securite" title="8. Sécurité des données">
            <p>
              {siteName} met en place des mesures techniques et
              organisationnelles (HTTPS, hébergement sécurisé, limitation
              d’accès) pour protéger vos données personnelles.
            </p>
          </Section>

          <Section id="contact" title="9. Contact">
            <p>
              Pour toute question relative à cette politique de confidentialité,
              vous pouvez nous écrire via la page{" "}
              <Link className="underline" to={contactPath}>
                Contact
              </Link>
              .
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}
