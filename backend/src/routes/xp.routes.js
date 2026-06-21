import { Router } from "express";
import { getXpSummary, getXpHistory, checkAction } from "../controllers/xp.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.get("/:userId/summary", auth, getXpSummary);
router.get("/:userId/history", auth, getXpHistory);
router.get("/can-perform/:action", auth, checkAction);

export default router;