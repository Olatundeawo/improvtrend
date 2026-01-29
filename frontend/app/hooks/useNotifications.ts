import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Notification } from "../components/type";
import { useAuth } from "../context/auth";

export default function useNotifications() {
  const URL = process.env.EXPO_PUBLIC_BASE_URL;
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNew, setHasNew] = useState(false);

  const latestNotificationRef = useRef<string | null>(null);

  const fetchNotifications = async () => {
    if (!user?.token) return;

    try {
      const res = await axios.get(`${URL}notifications/`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = res.data as Notification[];

      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);

      if (
        latestNotificationRef.current &&
        data[0]?.createdAt > latestNotificationRef.current
      ) {
        setHasNew(true);
      }

      latestNotificationRef.current = data[0]?.createdAt ?? null;
    } catch (err) {
      console.error("Notification fetch error", err);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.token) return;

    try {
      await axios.patch(
        `${URL}notifications/read-all/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setUnreadCount(0);
      setHasNew(false);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user?.token) return;

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user?.token]);

  return {
    notifications,
    unreadCount,
    hasNew,
    fetchNotifications,
    markAllAsRead,
  };
}
