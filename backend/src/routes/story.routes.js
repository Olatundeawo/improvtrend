import express from "express";
import {
  create,
  get,
  getAll,
  getUserStoryById,
  voteComplete,
  complete,
} from "../controllers/story.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/",               auth, create);
router.get("/",                      getAll);
router.get("/user/:userId",    auth, getUserStoryById);
router.get("/:id",                   get);
router.post("/:id/vote-complete", auth, voteComplete);
router.post("/:id/complete",      auth, complete);

export default router;