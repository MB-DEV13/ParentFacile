export default function DocumentCard({ tag, label, onPreview, onDownload }) {
  return (
    <article className="rounded-2xl border bg-white p-4 flex flex-col shadow-sm">
      <div className="text-xs font-medium w-fit rounded-md px-2 py-1 mb-2 bg-pfBlueSoft/80">{tag}</div>
      <h3 className="font-semibold leading-snug flex-1">{label}</h3>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={onPreview} className="text-sm underline">Aperçu</button>
        <button onClick={onDownload} className="ml-auto inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium bg-pfBlueLight">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
          PDF
        </button>
      </div>
    </article>
  )
}
