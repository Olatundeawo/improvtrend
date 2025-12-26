import express from 'express'
import { comment } from '../controllers/comment.controller.js'
import auth from '../middleware/auth.js'

const router = express.Router()

router.post("/create/comment", auth, comment)

export default router;