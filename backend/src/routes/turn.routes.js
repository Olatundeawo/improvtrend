import express from "express"
import { continueStory, getTurns } from "../controllers/turn.controller.js"
import auth from "../middleware/auth.js";



const router = express.Router();

router.post("/:storyId/turns", auth, continueStory);
router.get('/:storyId/turns', getTurns)
export default router;