export default function Timeline({ steps=[] }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
      {steps.map((s, idx) => (
        <div key={idx} className="relative mb-8 last:mb-0">
          <div className="absolute -left-[11px] top-1 h-5 w-5 rounded-full ring-4 bg-pfBlueLight ring-slate-200" />
          <h4 className="font-semibold">{s.title}</h4>
          {s.desc && <p className="text-sm text-slate-600 mt-1">{s.desc}</p>}
          {s.actions}
        </div>
      ))}
    </div>
  )
}
