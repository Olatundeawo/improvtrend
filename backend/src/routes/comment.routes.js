import express from 'express'
import { comment } from '../controllers/comment.controller'

const router = express.Router()

router.post("/create/comment", auth, comment)

export default router;