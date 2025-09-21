import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import dotenv from 'dotenv'
import path from 'node:path'
import buildCors from './middleware/cors.js'
import docsRouter from './routes/docs.js'
import authRouter from './routes/auth.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 5174

app.use(helmet())
app.use(express.json())
app.use(morgan('dev'))
app.use(buildCors(process.env.ALLOWED_ORIGINS))

app.use('/pdfs', express.static(path.join(process.cwd(), 'public', 'pdfs')))

app.use('/api/docs', docsRouter)
app.use('/api/auth', authRouter)

app.get('/', (_req,res)=> res.json({ok:true,name:'ParentFacile API'}))

app.listen(PORT, ()=> console.log(`API http://localhost:${PORT}`))
