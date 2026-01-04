import { useRouter } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useAuth } from "../context/auth";

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
  const router = useRouter();
  const { width } = useWindowDimensions();
  console.log(user)

  if (!user) return null;

  const isLargeScreen = width >= 768;
  const joinedDate = formatJoinedDate(user.createdAt);

  const handleLogout = async () => {
    await logout();
    router.replace("(auth)/login");
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.card,
          isLargeScreen && styles.cardLarge,
        ]}
      >
        {/* Top Row */}
        <View style={styles.topRow}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.username.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.username}>
              {user.username}
            </Text>

            {joinedDate && (
              <Text style={styles.joined}>
                Joined {joinedDate}
              </Text>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>
              {user.stories?.length || 0}
            </Text>
            <Text style={styles.statLabel}>Stories</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
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
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingTop: 24,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
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
    fontSize: 28,
    fontWeight: "600",
  },

  info: {
    marginLeft: 16,
    flex: 1,
  },

  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#0f172a",
  },

  joined: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },

  stats: {
    flexDirection: "row",
    marginTop: 20,
  },

  stat: {
    marginRight: 24,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0f172a",
  },

  statLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 24,
  },

  logoutButton: {
    borderWidth: 1,
    borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    paddingVertical: 12,
    borderRadius: 12,
  },

  logoutText: {
    textAlign: "center",
    color: "#b91c1c",
    fontSize: 15,
    fontWeight: "600",
  },
});
