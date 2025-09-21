export default function Contact() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-start">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Nous contacter</h2>
          <p className="text-slate-600 mt-2 text-sm">
            Une question, un document manquant, une correction ? Écris-nous.
          </p>
          <form className="mt-6 space-y-3">
            <input className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Votre email" />
            <input className="w-full rounded-xl border px-3 py-2 text-sm" placeholder="Sujet" />
            <textarea className="w-full rounded-xl border px-3 py-2 text-sm h-28" placeholder="Message" />
            <button type="button" className="rounded-xl px-4 py-2 text-sm font-medium"
                    style={{ background:'#5784BA', color:'#fff' }}>
              Envoyer
            </button>
          </form>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Numéros utiles</h3>
          <ul className="grid sm:grid-cols-2 gap-3 text-sm">
            {[
              {name:'Samu', num:'15'},
              {name:'Pompiers', num:'18'},
              {name:'Numéro d’urgence européen', num:'112'},
              {name:'Violences femmes info', num:'3919'},
              {name:'Allo Service Public', num:'39 39'},
              {name:'CAF', num:'32 30'},
            ].map((n) => (
              <li key={n.name} className="rounded-xl border p-3 flex items-center justify-between bg-white">
                <span>{n.name}</span>
                <span className="font-semibold" style={{ color:'#5784BA' }}>{n.num}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
