import express from "express"
import { upvoteTurn } from "../controllers/upvote.controller"

const router = express.Router()

router.post("/turns/:turnId/upvote", auth, upvoteTurn);

export default router;