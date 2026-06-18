import { Router } from "express";
import { getXpSummary, getXpHistory } from "../controllers/xp.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/:userId/summary", auth, getXpSummary);
router.get("/:userId/history", auth, getXpHistory);

export default router;