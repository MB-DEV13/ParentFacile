export default function Card({ title, children, badge, className='' }) {
  return (
    <article className={`rounded-2xl border bg-white p-4 shadow-sm ${className}`}>
      {badge && <div className="text-xs font-medium w-fit rounded-md px-2 py-1 mb-2 bg-pfBlueSoft/80">{badge}</div>}
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      <div>{children}</div>
    </article>
  )
}
