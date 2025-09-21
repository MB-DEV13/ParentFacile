import cors from 'cors'
export default function buildCors(allowedOrigins) {
  const whitelist = (allowedOrigins || '').split(',').map(s=>s.trim()).filter(Boolean)
  return cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true)
      if (whitelist.length===0 || whitelist.includes(origin)) return cb(null, true)
      cb(new Error('Not allowed by CORS'))
    },
    credentials: true
  })
}
