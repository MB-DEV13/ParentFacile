// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{
        background: "linear-gradient(135deg, #B6D8F2 0%, #F4CFDF 100%)",
      }}
    >
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-6xl font-bold text-[#5784BA] mb-3">404</h1>
        <h2 className="text-2xl font-semibold text-slate-800 mb-4">
          Page non trouvée
        </h2>
        <p className="text-slate-600 mb-8">
          Oups ! La page que vous recherchez n’existe pas ou a été déplacée.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Link
            to="/"
            className="rounded-xl px-4 py-2 text-sm font-medium shadow"
            style={{ background: "#5784BA", color: "#fff" }}
          >
            Retour à l’accueil
          </Link>
          <Link
            to="/contact"
            className="rounded-xl px-4 py-2 text-sm font-medium border"
            style={{ borderColor: "#5784BA", color: "#5784BA" }}
          >
            Contacter le support
          </Link>
        </div>
      </div>
    </main>
  );
}
