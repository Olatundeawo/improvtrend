import express from "express"
import { continueStory } from "../controllers/turn.controller"



const router = express.Router();

router.post("/:storyId/turns", auth, continueStory);

export default router;