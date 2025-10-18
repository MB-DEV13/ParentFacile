/**
 * Page : Connexion administrateur
 * -------------------------------------------------
 * - Utilise adminLogin() depuis services/adminApi.js
 * - Design cohérent avec la charte ParentFacile (bleu/rose pastel)
 * - Feedback clair : loading, erreurs, focus visibles
 * 
 * Notes :
 * - L’utilisateur est redirigé vers /admin en cas de succès.
 * - En cas d’erreur (mauvais identifiants, serveur down, etc.),
 *   un message rouge clair s’affiche sous le formulaire.
 * - Les états (loading, erreur) sont gérés localement via useState.
 * - Le gradient pastel reste cohérent avec les autres pages publiques.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../services/adminApi";

export default function AdminLogin() {
  // -------------------------------
  // États locaux du formulaire
  // -------------------------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState(""); // Message d’erreur affiché
  const [loading, setLoading] = useState(false); // Désactive le bouton + change le texte

  const navigate = useNavigate();

  // -------------------------------
  // Gestion de la soumission du formulaire
  // -------------------------------
  async function onSubmit(e) {
    e.preventDefault();
    setErr(""); // Réinitialise une éventuelle erreur précédente
    setLoading(true);
    try {
      await adminLogin(email, password); // Appel à l’API d’authentification admin
      navigate("/admin", { replace: true }); // Redirige après succès
    } catch (e) {
      // Message d’erreur explicite si renvoyé par le backend, sinon fallback générique
      setErr(e.message || "Échec de la connexion");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------
  // Rendu principal
  // -------------------------------
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pfBlueLight to-pfPink"

      role="main"
    >
      <div className="w-full max-w-md px-4">
        {/* Carte de connexion */}
        <div className="bg-white rounded-2xl shadow-md p-6 transition-shadow hover:shadow-lg">
          <h1 className="text-xl font-semibold mb-5 text-center text-slate-800">
            Connexion administrateur
          </h1>

          {/* Formulaire d’authentification */}
          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Champ Email */}
            <div>
              <label
                htmlFor="admin-email"
                className="text-sm font-medium text-slate-700"
              >
                Adresse email
              </label>
              <input
                id="admin-email"
                type="email"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pfBlue focus:border-pfBlue transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            {/* Champ mot de passe */}
            <div>
              <label
                htmlFor="admin-password"
                className="text-sm font-medium text-slate-700"
              >
                Mot de passe
              </label>
              <input
                id="admin-password"
                type="password"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pfBlue focus:border-pfBlue transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Message d'erreur global */}
            {err && (
              <p className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-lg py-2">
                {err}
              </p>
            )}

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-pfBlue text-white px-4 py-2 text-sm font-medium shadow-sm hover:shadow-md hover:bg-pfBlue/90 transition-all disabled:opacity-60"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

