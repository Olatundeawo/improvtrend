import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useAuth } from "../context/auth";
import useUserStories from "../hooks/useUserStories";

function formatJoinedDate(dateString?: string) {
  if (!dateString) return null;

  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { stories } = useUserStories();
  const router = useRouter();
  const { width } = useWindowDimensions();

  if (!user) return null;

  const isLargeScreen = width >= 768;
  const joinedDate = formatJoinedDate(user.createdAt);

  const handleLogout = async () => {
    await logout();
    router.replace("(auth)/login");
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, isLargeScreen && styles.cardLarge]}>
        {/* Header */}
        <View style={styles.topRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.info}>
            <Text style={styles.username}>{user.username}</Text>
            {joinedDate && (
              <Text style={styles.joined}>Joined {joinedDate}</Text>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {stories?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Rules */}
        <Pressable
          onPress={() => router.push("/components/rule")}
          style={({ pressed }) => [
            styles.ruleRow,
            pressed && styles.ruleRowPressed,
          ]}
        >
          <Text style={styles.ruleText}>Engagement rules</Text>
          <Text style={styles.ruleArrow}>›</Text>
        </Pressable>

        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  cardLarge: {
    maxWidth: 900,
    alignSelf: "center",
    width: "100%",
    padding: 28,
  },

  /* ---------- HEADER ---------- */
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "700",
  },

  info: {
    marginLeft: 16,
    flex: 1,
  },

  username: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0f172a",
  },

  joined: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },

  /* ---------- STATS ---------- */
  stats: {
    flexDirection: "row",
    marginTop: 24,
  },

  stat: {
    marginRight: 32,
  },

  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },

  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },

  /* ---------- RULE ROW ---------- */
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },

  ruleRowPressed: {
    opacity: 0.6,
  },

  ruleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },

  ruleArrow: {
    fontSize: 22,
    color: "#94a3b8",
  },

  /* ---------- DIVIDER ---------- */
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 24,
  },

  /* ---------- LOGOUT ---------- */
  logoutButton: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    paddingVertical: 14,
    borderRadius: 14,
  },

  logoutText: {
    textAlign: "center",
    color: "#b91c1c",
    fontSize: 15,
    fontWeight: "700",
  },
});
