import express from "express"
import { upvoteTurn } from "../controllers/upvote.controller.js"
import auth from "../middleware/auth.js";

const router = express.Router()

router.post("/turns/:turnId/upvote", auth, upvoteTurn);

export default router;