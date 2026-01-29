import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import useNotifications from "../hooks/useNotifications";

export default function NotificationScreen() {
  const { notifications, fetchNotifications, markAllAsRead } =
    useNotifications();

    console.log("notifivcartion", notifications)

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  useEffect(() => {
    fetchNotifications();
    markAllAsRead(); 
  }, []);

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.notificationCard,
        !item.isRead && styles.unreadCard,
      ]}
    >
      <View style={styles.iconWrapper}>
        <Ionicons
          name={getIconByType(item.type)}
          size={20}
          color={item.isRead ? "#6B7280" : "#4F46E5"}
        />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, !item.isRead && styles.unreadTitle]}
        >
          {item.title}
        </Text>

        <Text style={styles.message}>{item.message}</Text>

        <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.screen, isLargeScreen && styles.screenLarge]}>
      <Text style={styles.heading}>Notifications</Text>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="notifications-off-outline"
            size={48}
            color="#9CA3AF"
          />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptyText}>
            You’ll see updates here when something happens.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

/* -------------------- helpers -------------------- */

function getIconByType(type: string) {
  switch (type) {
    case "BADGE_UNLOCKED":
      return "trophy-outline";
    case "NEW_COMMENT":
      return "chatbubble-outline";
    case "NEW_UPVOTE":
      return "thumbs-up-outline";
    case "TURN_RELY":
      return "repeat-outline";
    case "STORY_TRENDING":
      return "trending-up-outline";
    default:
      return "notifications-outline";
  }
}

function formatTime(date: string) {
  return new Date(date).toLocaleString();
}

/* -------------------- styles -------------------- */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAF5FF",
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  screenLarge: {
    maxWidth: 900,
    alignSelf: "center",
    paddingHorizontal: 32,
  },

  heading: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },

  list: {
    gap: 12,
    paddingBottom: 24,
  },

  notificationCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#4F46E5",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
    backgroundColor: "#EEF2FF",
  },

  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  content: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
  },

  unreadTitle: {
    color: "#312E81",
  },

  message: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },

  time: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 4,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
  },

  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    maxWidth: 260,
  },
});
