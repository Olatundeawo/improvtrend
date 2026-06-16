import express from "express";
import {
  handleToggleReaction,
  handleGetReactions,
  handleGetBulkReactions,
} from "../controllers/reaction.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();


router.post("/turns/:turnId", auth, handleToggleReaction);
router.get("/turns/:turnId", auth, handleGetReactions);
router.post("/bulk", auth, handleGetBulkReactions);

export default router;