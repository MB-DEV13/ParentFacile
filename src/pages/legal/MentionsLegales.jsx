// src/pages/Legal/Legal.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Legal() {
  const siteName = "ParentFacile";
  const siteUrl = "https://parentfacile.fr"; // ajuste si besoin
  const lastUpdate = "septembre 2025";
  const contactPath = "/contact"; // route de ta page Contact

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
            Mentions légales
          </h1>
          <p className="text-slate-700 mt-2">
            {siteName} — Dernière mise à jour : {lastUpdate}
          </p>
        </header>

        <div className="space-y-6">
          <Section id="editeur" title="1. Éditeur du site">
            <p>
              Le site <strong>{siteName}</strong> est édité dans le cadre d’un
              projet personnel et non commercial. Contact :{" "}
              <a
                href="mailto:contact@parentfacile.fr"
                className="underline text-[#5784BA]"
              >
                contact@parentfacile.fr
              </a>
              .
            </p>
          </Section>

          <Section id="hebergeur" title="2. Hébergement">
            <p>
              Le site est hébergé par :
              <br />
              <strong>OVHcloud</strong> – 2 rue Kellermann, 59100 Roubaix,
              France. Site :{" "}
              <a
                href="https://www.ovhcloud.com/fr/"
                target="_blank"
                rel="noreferrer"
                className="underline text-[#5784BA]"
              >
                www.ovhcloud.com
              </a>
            </p>
          </Section>

          <Section id="responsabilite" title="3. Responsabilité">
            <p>
              {siteName} s’efforce de fournir des informations fiables et
              actualisées. Toutefois, {siteName} ne saurait être tenu
              responsable :
            </p>
            <ul>
              <li>d’erreurs, omissions ou informations obsolètes ;</li>
              <li>
                de l’usage fait des informations ou documents par l’utilisateur
                ;
              </li>
              <li>
                de dommages indirects liés à l’utilisation du site ou à
                l’impossibilité d’y accéder.
              </li>
            </ul>
          </Section>

          <Section id="propriete" title="4. Propriété intellectuelle">
            <p>
              L’ensemble des contenus présents sur le site{" "}
              <strong>{siteName}</strong> (textes, images, PDF, graphismes,
              logos, etc.) est protégé par le droit d’auteur. Toute
              reproduction, représentation ou diffusion sans autorisation est
              interdite.
            </p>
          </Section>

          <Section id="donnees" title="5. Données personnelles">
            <p>
              Les données collectées via le formulaire de contact sont utilisées
              uniquement pour répondre aux messages envoyés. Elles ne sont pas
              transmises à des tiers.
            </p>
            <p className="mt-2">
              Conformément au RGPD, vous disposez d’un droit d’accès, de
              rectification et de suppression de vos données. Vous pouvez
              exercer ces droits via la page{" "}
              <Link className="underline" to={contactPath}>
                Contact
              </Link>
              .
            </p>
          </Section>

          <Section id="credits" title="6. Crédits">
            <p>
              Illustrations libres de droits et contenus rédigés dans le cadre
              du projet <strong>{siteName}</strong>. Toute demande de retrait ou
              modification peut être adressée via la page{" "}
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
