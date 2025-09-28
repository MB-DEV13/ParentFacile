import numeros from "../data/numerosUtiles";

export default function Footer() {
  // On ne garde que les deux numéros voulus
  const numerosFiltres = numeros.filter(
    (n) =>
      n.name.toLowerCase().includes("allo service public") ||
      n.name.toLowerCase().includes("caf")
  );

  return (
    <footer className="border-t py-10" style={{ background: "#B6D8F2" }}>
      <div className="max-w-6xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="font-semibold">ParentFacile</div>
          <p className="mt-2 text-slate-700">
            Le guide simple des démarches de la grossesse aux 3 ans.
          </p>
          <p className="text-sm mt-3">
            © {new Date().getFullYear()} parentfacile.fr
          </p>
        </div>

        <div>
          <div className="font-semibold mb-2">Navigation</div>
          <ul className="space-y-1">
            <li>
              <a href="/informations" className="hover:underline">
                Informations
              </a>
            </li>
            <li>
              <a href="/documents" className="hover:underline">
                Documents
              </a>
            </li>
            <li>
              <a href="/contact" className="hover:underline">
                Contact
              </a>
            </li>
            <li>
              <a href="/cgu" className="hover:underline">
                Conditions générales
              </a>
            </li>
            <li>
              <a href="/mentions-legales" className="hover:underline">
                Mentions Legales
              </a>
            </li>
            <li>
              <a href="/confidentialite" className="hover:underline">
                Confidentialite
              </a>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-2">Thèmes</div>
          <ul className="space-y-1">
            <li>Grossesse</li>
            <li>Naissance</li>
            <li>1 à 3 ans</li>
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-2">Numéros utiles</div>
          <ul className="grid gap-2">
            {numerosFiltres.map((n) => (
              <li
                key={n.name}
                className="rounded-xl border p-3 flex items-center justify-between bg-white"
              >
                <span>{n.name}</span>
                <span className="font-semibold" style={{ color: "#5784BA" }}>
                  {n.num}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
