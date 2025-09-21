import { Link } from "react-router-dom";
import family from "../../assets/images/family.png"; // <-- ton image

const Badge = ({ children }) => (
  <span
    className="text-xs font-semibold tracking-wider uppercase"
    style={{ color: "#5784BA" }}
  >
    {children}
  </span>
);

const Card = ({ to, title, desc }) => (
  <Link
    to={to}
    className="rounded-2xl border p-5 bg-white hover:shadow-md transition"
  >
    <div
      className="text-xs font-medium w-fit rounded-md px-2 py-1 mb-2"
      style={{ background: "#B6D8F2", color: "#1f2a44" }}
    >
      Parcours
    </div>
    <h3 className="font-semibold text-lg">{title}</h3>
    <p className="text-sm text-slate-600 mt-1">{desc}</p>
  </Link>
);

export default function InfosIndex() {
  return (
    <section className="py-16 bg-[#F4CFDF]">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-10 text-center">
          <Badge>Notre parcours</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold">
            Informations essentielles, étape par étape
          </h2>
          <p className="text-slate-600 mt-1 max-w-2xl mx-auto mb-6">
            Une vue d’ensemble claire puis le détail de chaque démarche avec
            documents téléchargeables.
          </p>

          {/* Image bandeau sous le titre */}
          <div className="mb-6 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={family}
              alt="Famille - documents utiles"
              className="w-full h-48 sm:h-56 lg:h-64 object-cover"
              loading="eager"
              decoding="async"
            />
          </div>

          {/* Raccourcis (pills) */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Link
              to="/informations/grossesse"
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-white"
              style={{ borderColor: "#5784BA", color: "#1f2a44" }}
            >
              Grossesse
            </Link>
            <Link
              to="/informations/naissance"
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-white"
              style={{ borderColor: "#5784BA", color: "#1f2a44" }}
            >
              Naissance
            </Link>
            <Link
              to="/informations/1-3-ans"
              className="rounded-full border px-3 py-1.5 text-sm hover:bg-white"
              style={{ borderColor: "#5784BA", color: "#1f2a44" }}
            >
              1 à 3 ans
            </Link>
          </div>
        </div>

        {/* Grille des parcours */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Card
            to="/informations/grossesse"
            title="Grossesse"
            desc="Déclarations, suivi médical, congés, allocations..."
          />
          <Card
            to="/informations/naissance"
            title="Naissance"
            desc="Reconnaissance, acte de naissance, sécu, mutuelle, prime..."
          />
          <Card
            to="/informations/1-3-ans"
            title="1 à 3 ans"
            desc="Vaccins, PAJE/CAF, modes de garde, rentrée en maternelle..."
          />
        </div>
      </div>
    </section>
  );
}
