import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
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


const REASON_LABELS: Record<string, string> = {
  TURN_WRITTEN:     "✍️  Turns written",
  CLIMAX_BONUS:     "🎯  Climax bonuses",
  VIRAL_TURN:       "📈  Viral turns",
  STORY_COMPLETION: "🏁  Story completions",
};

const LEVEL_COLORS: Record<string, { bg: string; text: string; bar: string }> = {
  NEWCOMER:       { bg: "#f1f5f9", text: "#475569", bar: "#94a3b8" },
  STORYTELLER:    { bg: "#eff6ff", text: "#1d4ed8", bar: "#3b82f6" },
  SCRIBE:         { bg: "#f0fdf4", text: "#15803d", bar: "#22c55e" },
  AUTHOR:         { bg: "#faf5ff", text: "#7e22ce", bar: "#a855f7" },
  GRAND_NARRATOR: { bg: "#fffbeb", text: "#b45309", bar: "#f59e0b" },
};

const BADGE_EMOJI: Record<string, string> = {
  NEWBIE:          "🌱",
  CONTRIBUTOR:     "✍️",
  CREATOR:         "📖",
  TREND_STARTER:   "🔥",
  PLOT_TWISTER:    "🌀",
  SCENE_SETTER:    "🎭",
  NARRATOR_KING:   "👑",
  SPEED_WRITER:    "⚡",
  CHARACTER_ACTOR: "🎪",
};

const GENRE_LABELS: Record<string, string> = {
  COMEDY:       "😂 Comedy",
  HORROR:       "👻 Horror",
  ROMANCE:      "💕 Romance",
  MYSTERY:      "🔍 Mystery",
  FANTASY:      "🧙 Fantasy",
  SCI_FI:       "🚀 Sci-Fi",
  DRAMA:        "🎭 Drama",
  ADVENTURE:    "⚔️ Adventure",
  THRILLER:     "😰 Thriller",
  SLICE_OF_LIFE:"☕ Slice of Life",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatJoinedDate(dateString?: string) {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    year:  "numeric",
  });
}

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

interface LevelCardProps {
  level:       string;
  levelMeta:   { title: string; message: string };
  nextLevel:   string | null;
  xpToNext:    number | null;
  progressPct: number;
  totalXp:     number;
}

function LevelCard({
  level, levelMeta, nextLevel, xpToNext, progressPct, totalXp,
}: LevelCardProps) {
  const colors = LEVEL_COLORS[level] ?? LEVEL_COLORS.NEWCOMER;

  return (
    <View style={[styles.levelCard, { backgroundColor: colors.bg }]}>
      <View style={styles.levelHeader}>
        <Text style={[styles.levelTitle, { color: colors.text }]}>
          {levelMeta.title}
        </Text>
        <Text style={[styles.levelXp, { color: colors.text }]}>
          {totalXp.toLocaleString()} XP
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progressPct}%` as any, backgroundColor: colors.bar },
          ]}
        />
      </View>

      <View style={styles.levelFooter}>
        <Text style={styles.levelHint}>{levelMeta.message}</Text>
        {nextLevel && xpToNext != null && (
          <Text style={[styles.xpToNext, { color: colors.text }]}>
            {xpToNext.toLocaleString()} XP to {nextLevel.replace("_", " ")}
          </Text>
        )}
      </View>
    </View>
  );
}

interface BadgesRowProps {
  badges: { badge: string; awardedAt: string }[];
}

function BadgesRow({ badges }: BadgesRowProps) {
  if (badges.length === 0) return null;

  return (
    <View style={styles.badgesSection}>
      <Text style={styles.sectionLabel}>Badges earned</Text>
      <View style={styles.badgesWrap}>
        {badges.map(({ badge }) => (
          <View key={badge} style={styles.badgeChip}>
            <Text style={styles.badgeChipEmoji}>{BADGE_EMOJI[badge] ?? "🏅"}</Text>
            <Text style={styles.badgeChipText}>
              {badge.replace(/_/g, " ")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function AvatarDisplay({ avatarUrl, username }: { avatarUrl?: string | null; username: string }) {
  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={styles.avatarImage}
      />
    );
  }
  return (
    <View style={styles.avatarFallback}>
      <Text style={styles.avatarText}>
        {username.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

// ─── Genre Chips ──────────────────────────────────────────────────────────────

function GenreChips({ genres }: { genres: string[] }) {
  if (!genres || genres.length === 0) return null;

  return (
    <View style={styles.genreSection}>
      <Text style={styles.sectionLabel}>Genre preferences</Text>
      <View style={styles.genreWrap}>
        {genres.map((g) => (
          <View key={g} style={styles.genreChip}>
            <Text style={styles.genreChipText}>{GENRE_LABELS[g] ?? g}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export default function Profile() {
  const { user, logout } = useAuth();
  const { stories, refetch: refetchStories } = useUserStories();
  const { xpData, loading: xpLoading, error: xpError, refetch: refetchXp } =
    useXpSummary(user?.id);
  const router                = useRouter();
  const { width }             = useWindowDimensions();
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
  const joinedDate    = formatJoinedDate(user.createdAt);
  const xpBreakdown   = xpData?.breakdown ?? [];

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
          <AvatarDisplay avatarUrl={user.avatarUrl} username={user.username} />

          <View style={styles.info}>
            <Text style={styles.username}>{user.username}</Text>
            {joinedDate && (
              <Text style={styles.joined}>Joined {joinedDate}</Text>
            )}
            {xpData?.badge && (
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>
                  {BADGE_EMOJI[xpData.badge] ?? "🏅"}{" "}
                  {xpData.badgeMeta?.title ?? xpData.badge.replace(/_/g, " ")}
                </Text>
              </View>
            )}
          </View>

          {/* Edit button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push("/components/edit-profile")}
            activeOpacity={0.75}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* ── Bio ── */}
        {user.bio ? (
          <Text style={styles.bio}>{user.bio}</Text>
        ) : (
          <TouchableOpacity onPress={() => router.push("/components/edit-profile")} activeOpacity={0.7}>
            <Text style={styles.bioEmpty}>Add a bio…</Text>
          </TouchableOpacity>
        )}

        {/* ── Genre preferences ── */}
        <GenreChips genres={user.genrePreferences ?? []} />

        {/* ── XP / Stats area ── */}
        {xpLoading ? (
          <View style={styles.stats}>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </View>
        ) : xpError ? (
          <XpErrorBanner onRetry={refetchXp} />
        ) : xpData ? (
          <>
            <View style={styles.dividerThin} />

            {/* Stats row */}
            <View style={styles.stats}>
              <View style={styles.stat}>
                <Text style={styles.statNumber}>{stories?.length ?? 0}</Text>
                <Text style={styles.statLabel}>Stories</Text>
              </View>

              <View style={styles.stat}>
                <Text style={styles.statNumber}>
                  {xpData.totalXp.toLocaleString()}
                </Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>

              <View style={styles.stat}>
                <Text style={styles.statNumber}>{xpData.streak}d</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>

              {xpData.multiplier > 1 && (
                <View style={styles.stat}>
                  <Text style={[styles.statNumber, styles.multiplierNumber]}>
                    {xpData.multiplier}×
                  </Text>
                  <Text style={styles.statLabel}>Multiplier</Text>
                </View>
              )}
            </View>

            {/* Level card */}
            <LevelCard
              level={xpData.level}
              levelMeta={xpData.levelMeta}
              nextLevel={xpData.nextLevel}
              xpToNext={xpData.xpToNext}
              progressPct={xpData.progressPct}
              totalXp={xpData.totalXp}
            />

            {/* Badges */}
            <BadgesRow badges={xpData.badges} />

            {/* XP Breakdown */}
            {xpBreakdown.length > 0 && (
              <View style={styles.breakdown}>
                <Text style={styles.sectionLabel}>XP breakdown</Text>
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
        ) : null}

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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const skeleton = StyleSheet.create({
  stat:   { gap: 6 },
  number: { width: 48, height: 20, borderRadius: 6, backgroundColor: "#e2e8f0" },
  label:  { width: 36, height: 12, borderRadius: 4, backgroundColor: "#f1f5f9" },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  scrollContent: { flexGrow: 1, paddingBottom: 24 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardLarge: { maxWidth: 900, alignSelf: "center", width: "100%", padding: 28 },

  // Header
  topRow:       { flexDirection: "row", alignItems: "center" },
  avatarImage: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#e2e8f0",
  },
  avatarFallback: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#2563eb",
    justifyContent: "center", alignItems: "center",
  },
  avatarText:   { color: "#ffffff", fontSize: 30, fontWeight: "700" },
  info:         { marginLeft: 16, flex: 1 },
  username:     { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  joined:       { fontSize: 14, color: "#64748b", marginTop: 4 },
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
  badgePillText: { fontSize: 12, fontWeight: "700", color: "#854d0e" },

  // Edit button
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  editButtonText: { fontSize: 13, fontWeight: "600", color: "#334155" },

  // Bio
  bio: {
    marginTop: 14,
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  bioEmpty: {
    marginTop: 14,
    fontSize: 14,
    color: "#cbd5e1",
    fontStyle: "italic",
  },

  // Genre chips
  genreSection: { marginTop: 14 },
  genreWrap:    { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  genreChip: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  genreChipText: { fontSize: 12, fontWeight: "600", color: "#1d4ed8" },

  // Thin divider between profile section and stats
  dividerThin: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 18 },

  // Stats
  stats:            { flexDirection: "row", gap: 28, flexWrap: "wrap" },
  stat:             {},
  statNumber:       { fontSize: 20, fontWeight: "700", color: "#0f172a" },
  multiplierNumber: { color: "#d97706" },
  statLabel:        { fontSize: 13, color: "#64748b", marginTop: 4 },

  // Level card
  levelCard: {
    marginTop: 20,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  levelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  levelTitle:  { fontSize: 15, fontWeight: "700" },
  levelXp:     { fontSize: 13, fontWeight: "600" },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: { height: 6, borderRadius: 3 },
  levelFooter: { gap: 2 },
  levelHint:   { fontSize: 12, color: "#64748b" },
  xpToNext:    { fontSize: 12, fontWeight: "600", marginTop: 2 },

  // Badges
  badgesSection: { marginTop: 20 },
  sectionLabel: {
    fontSize: 12, fontWeight: "600", color: "#94a3b8",
    marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5,
  },
  badgesWrap:    { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  badgeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeChipEmoji: { fontSize: 14 },
  badgeChipText:  { fontSize: 12, fontWeight: "600", color: "#334155", textTransform: "capitalize" },

  // XP error
  xpError: { marginTop: 24, flexDirection: "row", alignItems: "center", gap: 12 },
  xpErrorText: { fontSize: 13, color: "#ef4444" },
  retryButton: {
    paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 8, backgroundColor: "#fef2f2",
    borderWidth: 1, borderColor: "#fecaca",
  },
  retryText: { fontSize: 13, fontWeight: "600", color: "#b91c1c" },

  // Breakdown
  breakdown:       { marginTop: 20, backgroundColor: "#f8fafc", borderRadius: 12, padding: 14, gap: 10 },
  breakdownRow:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  breakdownReason: { fontSize: 13, color: "#475569", fontWeight: "500", flex: 1 },
  breakdownMeta:   { flexDirection: "row", alignItems: "center", gap: 8 },
  breakdownCount:  { fontSize: 12, color: "#94a3b8", fontWeight: "500" },
  breakdownXp:     { fontSize: 13, fontWeight: "700", color: "#2563eb" },

  // Rules
  ruleRow:        { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  ruleRowPressed: { opacity: 0.6 },
  ruleText:       { fontSize: 15, fontWeight: "600", color: "#0f172a" },
  ruleArrow:      { fontSize: 22, color: "#94a3b8" },

  // Divider
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 24 },

  // Logout
  logoutButton: {
    borderWidth: 1, borderColor: "#fecaca",
    backgroundColor: "#fef2f2",
    paddingVertical: 14, borderRadius: 14,
  },
  logoutText: { textAlign: "center", color: "#b91c1c", fontSize: 15, fontWeight: "700" },
});