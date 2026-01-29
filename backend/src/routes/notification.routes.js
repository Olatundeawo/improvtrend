import { Router } from "express";
import {
  getNotificationsController,
  getUnreadNotificationsController,
  getUnreadCountController,
  markAllReadController,
  markSingleReadController,
} from "../controllers/notification.controller.js";
import auth from "../middleware/auth.js"

const router = Router();

router.get(
  "/notifications",
  auth,
  getNotificationsController
);

router.get(
  "/notifications/unread",
  auth,
  getUnreadNotificationsController
);

router.get(
  "/notifications/unread-count",
  auth,
  getUnreadCountController
);

router.patch(
  "/notifications/read-all",
  auth,
  markAllReadController
);

router.patch(
  "/notifications/:id/read",
  auth,
  markSingleReadController
);

export default router;
