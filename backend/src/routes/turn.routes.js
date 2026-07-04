import express from "express"
import { continueStory, getTurns, editTurnController } from "../controllers/turn.controller.js"
import auth from "../middleware/auth.js";



const router = express.Router();

router.post("/:storyId/turns", auth, continueStory);
router.get('/:storyId/turns', getTurns)
router.patch('/:storyId/turns/:turnId', auth, editTurnController)
export default router;