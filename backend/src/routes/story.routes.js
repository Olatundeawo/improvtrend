import express from "express"
import { create, get, getAll, getUserStoryById } from "../controllers/story.controller.js"
import auth from "../middleware/auth.js"


const router = express.Router()

router.post("/", auth, create)
router.get("/:id", get)
router.get("/", getAll)
router.get("/user/:userId", auth, getUserStoryById);

export default router;