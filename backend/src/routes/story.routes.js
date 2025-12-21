import express from "express"
import { create, get, getAll } from "../controllers/story.controller"


const router = express.Router()

router.post("/create/story", auth, create)
router.get("/:id/story", get)
router.get("/stories", getAll)

export default router;