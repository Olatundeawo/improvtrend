import { getProfileHandler,updateProfileHandler } from "../controllers/auth.controller.js";
import { upload } from "../config/multer.js";
import auth from "../middleware/auth.js";
import { Router } from "express";

const router = Router();

router.get("/users/me", auth, getProfileHandler);
router.patch("/users/me", auth, upload.single("avatar"), updateProfileHandler);

export default router;