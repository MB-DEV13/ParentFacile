import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../services/adminApi";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      setLoading(true);
      await adminLogin(email, password);
      navigate("/admin");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-[70vh] flex items-center"
      style={{
        background: "linear-gradient(135deg, #9AC8EB 0%, #F4CFDF 100%)",
      }}
    >
      <div className="max-w-md mx-auto px-4 w-full">
        <div className="bg-white rounded-2xl shadow p-6">
          <h1 className="text-xl font-semibold mb-4 text-slate-800">
            Connexion administrateur
          </h1>
          <form className="space-y-3" onSubmit={onSubmit}>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Mot de passe</label>
              <input
                type="password"
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {err && <p className="text-sm text-red-600">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-60"
              style={{ background: "#5784BA", color: "#fff" }}
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
