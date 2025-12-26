import express from "express"
import { continueStory } from "../controllers/turn.controller.js"
import auth from "../middleware/auth.js";



const router = express.Router();

router.post("/:storyId/turns", auth, continueStory);

export default router;