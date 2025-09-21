import { Link } from 'react-router-dom'
export default function Breadcrumbs({ items=[] }) {
  return (
    <nav className="text-sm mb-4 text-slate-600">
      {items.map((it, i) => (
        <span key={i}>
          {it.to ? <Link className="hover:underline" to={it.to}>{it.label}</Link> : <span>{it.label}</span>}
          {i < items.length - 1 ? ' / ' : ''}
        </span>
      ))}
    </nav>
  )
}
