import { Router } from 'express'
const router = Router()
router.post('/register', (_req,res)=> res.status(201).json({message:'Inscription simulée'}))
router.post('/login', (_req,res)=> res.json({message:'Connexion simulée'}))
router.get('/me', (_req,res)=> res.json({user:null}))
export default router
