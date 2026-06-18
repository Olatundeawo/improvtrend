import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useAuth } from "../context/auth";
import useUserStories from "../hooks/useUserStories";
import useXpSummary from "../hooks/useXpSummary";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatJoinedDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}

const REASON_LABELS: Record<string, string> = {
  TURN_WRITTEN:     "✍️  Turns written",
  CLIMAX_BONUS:     "🎯  Climax bonuses",
  VIRAL_TURN:       "📈  Viral turns",
  STORY_COMPLETION: "🏁  Story completions",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <View style={skeleton.stat}>
      <View style={skeleton.number} />
      <View style={skeleton.label} />
    </View>
  );
}

function XpErrorBanner({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.xpError}>
      <Text style={styles.xpErrorText}>Couldn't load XP data</Text>
      <Pressable onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, logout } = useAuth();
  const {
    stories,
    refetch: refetchStories,
  } = useUserStories();
  const { xpData, loading: xpLoading, error: xpError, refetch: refetchXp } = useXpSummary(user?.id);
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchStories(), refetchXp()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchStories, refetchXp]);

  if (!user) return null;

  const isLargeScreen = width >= 768;
  const joinedDate = formatJoinedDate(user.createdAt);
  const xpBreakdown = xpData?.breakdown ?? [];

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3b82f6"
          colors={["#3b82f6"]}
        />
      }
      style={styles.container}
    >
      <View style={[styles.card, isLargeScreen && styles.cardLarge]}>

        {/* ── Header ── */}
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
            {/* Badge string comes directly from the server — no client mapping */}
            {xpData?.badge && (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>{xpData.badge}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Stats ── */}
        {xpLoading ? (
          <View style={styles.stats}>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </View>
        ) : xpError ? (
          <XpErrorBanner onRetry={refetchXp} />
        ) : (
          <>
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{stories?.length ?? 0}</Text>
                <Text style={styles.statLabel}>Stories</Text>
              </View>

              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {xpData ? xpData.totalXp.toLocaleString() : "—"}
                </Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>

              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {xpData ? `${xpData.streak}d` : "—"}
                </Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>

              {xpData && xpData.multiplier > 1 && (
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, styles.multiplierNumber]}>
                    {xpData.multiplier}×
                  </Text>
                  <Text style={styles.statLabel}>Multiplier</Text>
                </View>
              )}
            </View>

            {/* ── XP Breakdown ── */}
            {xpBreakdown.length > 0 && (
              <View style={styles.breakdown}>
                {xpBreakdown.map((item) => (
                  <View key={item.reason} style={styles.breakdownRow}>
                    <Text style={styles.breakdownReason}>
                      {REASON_LABELS[item.reason] ?? item.reason}
                    </Text>
                    <View style={styles.breakdownMeta}>
                      <Text style={styles.breakdownCount}>
                        ×{item._count.id}
                      </Text>
                      <Text style={styles.breakdownXp}>
                        +{item._sum.finalXp.toLocaleString()} XP
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.divider} />

        {/* ── Rules ── */}
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

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Skeleton styles ──────────────────────────────────────────────────────────

const skeleton = StyleSheet.create({
  stat: { gap: 6 },
  number: {
    width: 48,
    height: 20,
    borderRadius: 6,
    backgroundColor: "#e2e8f0",
  },
  label: {
    width: 36,
    height: 12,
    borderRadius: 4,
    backgroundColor: "#f1f5f9",
  },
});

// ─── Main styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
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

  // Header
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
  badgePill: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#fef9c3",
    borderColor: "#fde047",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#854d0e",
  },

  // Stats
  stats: {
    flexDirection: "row",
    marginTop: 24,
    gap: 28,
    flexWrap: "wrap",
  },
  stat: {},
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f172a",
  },
  multiplierNumber: {
    color: "#d97706",
  },
  statLabel: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },

  // XP error
  xpError: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  xpErrorText: {
    fontSize: 13,
    color: "#ef4444",
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  retryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#b91c1c",
  },

  // Breakdown
  breakdown: {
    marginTop: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownReason: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  breakdownMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownCount: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: "500",
  },
  breakdownXp: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },

  // Rules
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  ruleRowPressed: { opacity: 0.6 },
  ruleText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0f172a",
  },
  ruleArrow: {
    fontSize: 22,
    color: "#94a3b8",
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 24,
  },

  // Logout
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