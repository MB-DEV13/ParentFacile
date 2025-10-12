import { useState } from "react";
import family from "../assets/images/family_3.png";

export default function Contact() {
  const [form, setForm] = useState({
    email: "",
    subject: "",
    message: "",
    hp: "", // honeypot
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverMsg, setServerMsg] = useState("");

  function validate(values) {
    const e = {};
    if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      e.email = "Email invalide";
    }
    if (!values.subject || values.subject.trim().length < 2) {
      e.subject = "Sujet requis (min. 2 caractères)";
    }
    if (!values.message || values.message.trim().length < 10) {
      e.message = "Message trop court (min. 10 caractères)";
    }
    if (values.hp) e.hp = "bot"; // honeypot
    return e;
  }

  function setField(key, val) {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    try {
      setStatus("sending");
      setServerMsg("");
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Erreur lors de l'envoi");
      setStatus("success");
      setServerMsg("Merci ! Votre message a bien été envoyé.");
      setForm({ email: "", subject: "", message: "", hp: "" });
    } catch (err) {
      setStatus("error");
      setServerMsg(err.message || "Erreur inconnue");
    }
  }

  const inputBase =
    "w-full rounded-xl border px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#5784BA]/30";
  const errTxt = "text-xs text-red-600 mt-1";

  const helpfulNumbers = [
    { name: "Samu", num: "15" },
    { name: "Pompiers", num: "18" },
    { name: "Numéro d’urgence européen", num: "112" },
    { name: "Violences femmes info", num: "3919" },
    { name: "Allo Service Public", num: "39 39" },
    { name: "CAF", num: "32 30" },
  ];

  const usefulSites = [
    {
      name: "CAF",
      url: "https://www.caf.fr/",
      desc: "Prestations familiales, démarches en ligne.",
    },
    {
      name: "Service-Public.fr",
      url: "https://www.service-public.fr/",
      desc: "Démarches administratives et fiches pratiques.",
    },
    {
      name: "Ameli (Assurance Maladie)",
      url: "https://www.ameli.fr/",
      desc: "Droits santé, rattachement de l’enfant, remboursements.",
    },
    {
      name: "Pajemploi (Urssaf)",
      url: "https://www.pajemploi.urssaf.fr/",
      desc: "Garde d’enfants, assistante maternelle, CMG.",
    },
    {
      name: "monenfant.gouv.fr",
      url: "https://monenfant.gouv.fr/",
      desc: "Modes de garde, lieux d’accueil, inscription.",
    },
    {
      name: "MSA",
      url: "https://www.msa.fr/",
      desc: "Sécurité sociale agricole (si affilié MSA).",
    },
  ];

  return (
    <section
      className="py-16"
      style={{
        background: "linear-gradient(135deg, #9AC8EB 0%, #F4CFDF 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête de page */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800">
            Contact
          </h2>
          <p className="text-slate-600 mt-1 max-w-2xl mx-auto mb-6">
            Une question, un document manquant, une correction ? Écris-nous.
          </p>
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={family}
              alt="Famille - documents utiles"
              className="w-full h-48 sm:h-56 lg:h-64 object-cover"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>

        {/* Grille 2 colonnes */}
        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          {/* Colonne gauche : formulaire */}
          <form
            className="bg-white rounded-2xl shadow p-6 flex flex-col h-full"
            onSubmit={onSubmit}
            noValidate
          >
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Nous contacter
            </h3>

            {/* Zone champs (prend l'espace dispo) */}
            <div className="flex flex-col gap-4 flex-1">
              {/* Email */}
              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`${inputBase} ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="Votre email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  required
                />
                {errors.email && <p className={errTxt}>{errors.email}</p>}
              </div>

              {/* Sujet */}
              <div>
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  className={`${inputBase} ${
                    errors.subject ? "border-red-500" : ""
                  }`}
                  placeholder="Sujet"
                  value={form.subject}
                  onChange={(e) => setField("subject", e.target.value)}
                  aria-invalid={!!errors.subject}
                  required
                />
                {errors.subject && <p className={errTxt}>{errors.subject}</p>}
              </div>

              {/* Message (s'étire) */}
              <div className="flex-1 flex">
                <textarea
                  id="message"
                  name="message"
                  className={`${inputBase} flex-1 min-h-[200px] resize-none ${
                    errors.message ? "border-red-500" : ""
                  }`}
                  placeholder="Message"
                  value={form.message}
                  onChange={(e) => setField("message", e.target.value)}
                  aria-invalid={!!errors.message}
                  required
                  minLength={10}
                />
              </div>
              {errors.message && <p className={errTxt}>{errors.message}</p>}
            </div>

            {/* Honeypot caché */}
            <div className="absolute left-[-5000px] top-0" aria-hidden="true">
              <label htmlFor="hp">Ne pas remplir</label>
              <input
                id="hp"
                name="hp"
                type="text"
                value={form.hp}
                onChange={(e) => setField("hp", e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Bouton + état (collé en bas) */}
            <div className="pt-2 mt-auto">
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#5784BA", color: "#fff" }}
              >
                {status === "sending" ? "Envoi…" : "Envoyer"}
              </button>

              <div
                className="mt-2 text-sm text-center"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {status === "success" && (
                  <span className="text-green-700">{serverMsg}</span>
                )}
                {status === "error" && (
                  <span className="text-red-700">{serverMsg}</span>
                )}
              </div>
            </div>
          </form>

          {/* Colonne droite : numéros + sites utiles */}
          <div className="space-y-6">
            {/* Numéros utiles */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-semibold mb-4 text-slate-800 text-lg">
                Numéros utiles
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm">
                {helpfulNumbers.map((n) => (
                  <li
                    key={n.name}
                    className="rounded-xl border p-3 flex items-center justify-between bg-slate-50"
                  >
                    <span>{n.name}</span>
                    <a
                      href={`tel:${n.num.replace(/\s/g, "")}`}
                      className="font-semibold"
                      style={{ color: "#5784BA" }}
                    >
                      {n.num}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sites utiles */}
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="font-semibold mb-4 text-slate-800 text-lg">
                Sites utiles
              </h3>
              <ul className="grid sm:grid-cols-2 gap-3 text-sm">
                {usefulSites.map((s) => (
                  <li
                    key={s.name}
                    className="rounded-xl border p-3 flex items-center justify-between bg-slate-50"
                  >
                    <div className="pr-3">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-slate-600">{s.desc}</p>
                    </div>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 underline font-semibold"
                      style={{ color: "#5784BA" }}
                      title={`Ouvrir ${s.name}`}
                    >
                      Visiter
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
