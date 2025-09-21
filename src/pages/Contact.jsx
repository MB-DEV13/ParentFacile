import { useState } from "react";

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
    // honeypot: si rempli → bot
    if (values.hp) e.hp = "bot";
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
        body: JSON.stringify({
          email: form.email,
          subject: form.subject,
          message: form.message,
          hp: form.hp,
        }),
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

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-start">
        {/* Colonne gauche : formulaire */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Nous contacter</h2>
          <p className="text-slate-600 mt-2 text-sm">
            Une question, un document manquant, une correction ? Écris-nous.
          </p>

          <form className="mt-6 space-y-3" onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Votre email
              </label>
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
                autoComplete="email"
                required
              />
              {errors.email && <p className={errTxt}>{errors.email}</p>}
            </div>

            {/* Sujet */}
            <div>
              <label htmlFor="subject" className="sr-only">
                Sujet
              </label>
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

            {/* Message */}
            <div>
              <label htmlFor="message" className="sr-only">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                className={`${inputBase} h-28 ${
                  errors.message ? "border-red-500" : ""
                }`}
                placeholder="Message"
                value={form.message}
                onChange={(e) => setField("message", e.target.value)}
                aria-invalid={!!errors.message}
                rows={6}
                required
                minLength={10}
              />
              {errors.message && <p className={errTxt}>{errors.message}</p>}
            </div>

            {/* Honeypot (caché) */}
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

            {/* Bouton + état */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={status === "sending"}
                className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "#5784BA", color: "#fff" }}
              >
                {status === "sending" ? "Envoi…" : "Envoyer"}
              </button>

              <div
                className="mt-2 text-sm"
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
        </div>

        {/* Colonne droite : numéros utiles */}
        <div>
          <h3 className="font-semibold mb-4">Numéros utiles</h3>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            {helpfulNumbers.map((n) => (
              <li
                key={n.name}
                className="rounded-xl border p-3 flex items-center justify-between bg-white"
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
      </div>
    </section>
  );
}
