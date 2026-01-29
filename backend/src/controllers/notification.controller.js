import {
  getNotifications,
  getUnreadNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notification.service.js";

/**
 * GET /notifications
 */
export async function getNotificationsController(req, res) {
  try {
    const userId = req.user.id;

    const notifications = await getNotifications(userId);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /notifications/unread
 */
export async function getUnreadNotificationsController(req, res) {
  try {
    const userId = req.user.id;

    const notifications = await getUnreadNotifications(userId);
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * GET /notifications/unread-count
 */
export async function getUnreadCountController(req, res) {
  try {
    const userId = req.user.id;

    const count = await getUnreadNotificationCount(userId);
    res.status(200).json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * PATCH /notifications/read-all
 */
export async function markAllReadController(req, res) {
  try {
    const userId = req.user.id;

    await markAllNotificationsAsRead(userId);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * PATCH /notifications/:id/read
 */
export async function markSingleReadController(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    await markNotificationAsRead(userId, id);
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
