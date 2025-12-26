import express from "express"
import { create, get, getAll } from "../controllers/story.controller.js"
import auth from "../middleware/auth.js"


const router = express.Router()

router.post("/", auth, create)
router.get("/:id", get)
router.get("/", getAll)

export default router;