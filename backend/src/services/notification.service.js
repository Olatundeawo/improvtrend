import prisma from "../prisma/client.js";

/**
 * Get all notifications for a user
 */
export async function getNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get unread notifications
 */
export async function getUnreadNotifications(userId) {
  return prisma.notification.findMany({
    where: {
      userId,
      isRead: false,
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get unread notification count (for badge)
 */
export async function getUnreadNotificationCount(userId) {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead(userId) {
  return prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsRead(
  userId,
  notificationId
) {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: {
      isRead: true,
    },
  });
}
