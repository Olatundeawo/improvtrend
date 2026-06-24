import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import formatTime from "../hooks/time";
import FeedSkeleton from "./FeedSkeleton";
import type { ArcStage, Story } from "./type";

const FONT = {
  regular:  "Inter_400Regular",
  medium:   "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold:     "Inter_700Bold",
  title:    "PlayfairDisplay_600SemiBold",
};

const C = {
  primary:     "#1E3A8A",
  accent:      "#F97316",
  accentLight: "#FFF7ED",
  blue:        "#3B82F6",
  blueLight:   "#EFF6FF",
  surface:     "#F9FAFB",
  border:      "#E5E7EB",
  bg:          "#FFFFFF",
  text: {
    primary:   "#111827",
    secondary: "#6B7280",
    tertiary:  "#9CA3AF",
  },
  arc: {
    SETUP:      { bg: "#EFF6FF", text: "#1D4ED8", bar: "#3B82F6" },
    RISING:     { bg: "#FFF7ED", text: "#C2410C", bar: "#F97316" },
    CLIMAX:     { bg: "#FEF2F2", text: "#B91C1C", bar: "#EF4444" },
    RESOLUTION: { bg: "#F0FDF4", text: "#15803D", bar: "#22C55E" },
  },
  status: {
    ACTIVE:    { bg: "#F0FDF4", text: "#15803D" },
    COMPLETED: { bg: "#F1F5F9", text: "#475569" },
  },
};

// ── arc helpers ───────────────────────────────────────────────────────────────

const ARC_STAGE_LABEL: Record<ArcStage, string> = {
  SETUP:      "Setup",
  RISING:     "Rising Action",
  CLIMAX:     "Climax",
  RESOLUTION: "Resolution",
};

const STAGE_INDEX: Record<ArcStage, number> = {
  SETUP: 0, RISING: 1, CLIMAX: 2, RESOLUTION: 3,
};

function ArcBadge({ stage }: { stage: ArcStage }) {
  const col = C.arc[stage];
  return (
    <View style={[arcStyles.badge, { backgroundColor: col.bg }]}>
      <View style={[arcStyles.dot, { backgroundColor: col.bar }]} />
      <Text style={[arcStyles.badgeText, { color: col.text }]}>
        {ARC_STAGE_LABEL[stage]}
      </Text>
    </View>
  );
}

function ArcProgress({
  stage,
  turnCount,
  maxTurns,
  status,
}: {
  stage: ArcStage;
  turnCount: number;
  maxTurns: number;
  status: string;
}) {
  const col         = C.arc[stage];
  const isCompleted = status === "COMPLETED";
  const STAGES: ArcStage[] = ["SETUP", "RISING", "CLIMAX", "RESOLUTION"];
  const activeIdx   = STAGE_INDEX[stage];

  return (
    <View style={arcStyles.progressBlock}>
      <View style={arcStyles.progressHeader}>
        <ArcBadge stage={stage} />
        <Text style={arcStyles.turnCount}>
          {isCompleted
            ? `${maxTurns}/${maxTurns} turns · Complete`
            : `${turnCount}/${maxTurns} turns`}
        </Text>
      </View>

      <View style={arcStyles.trackRow}>
        {STAGES.map((s, i) => {
          const segCol   = C.arc[s];
          const isFilled = i < activeIdx || isCompleted;
          const isActive = i === activeIdx && !isCompleted;
          const activePct =
            isActive && maxTurns > 0
              ? `${Math.round(
                  ((turnCount - getStageStart(s, maxTurns)) /
                    getStageWidth(s, maxTurns)) *
                    100
                )}%`
              : "100%";

          return (
            <View key={s} style={arcStyles.segmentOuter}>
              <View
                style={[
                  arcStyles.segmentTrack,
                  i > 0 && arcStyles.segmentGap,
                  { backgroundColor: isFilled || isActive ? segCol.bg : C.border },
                ]}
              >
                {(isFilled || isActive) && (
                  <View
                    style={[
                      arcStyles.segmentFill,
                      {
                        backgroundColor: segCol.bar,
                        width: isFilled ? "100%" : activePct,
                      },
                    ]}
                  />
                )}
              </View>
              <Text style={arcStyles.segLabel}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function getStageStart(stage: ArcStage, maxTurns: number): number {
  const b = {
    SETUP:      0,
    RISING:     Math.round(maxTurns * 0.25),
    CLIMAX:     Math.round(maxTurns * 0.65),
    RESOLUTION: Math.round(maxTurns * 0.85),
  };
  return b[stage];
}

function getStageWidth(stage: ArcStage, maxTurns: number): number {
  const boundaries = {
    SETUP:      Math.round(maxTurns * 0.25),
    RISING:     Math.round(maxTurns * 0.65) - Math.round(maxTurns * 0.25),
    CLIMAX:     Math.round(maxTurns * 0.85) - Math.round(maxTurns * 0.65),
    RESOLUTION: maxTurns - Math.round(maxTurns * 0.85),
  };
  return Math.max(boundaries[stage], 1);
}

// ── types ─────────────────────────────────────────────────────────────────────

type FeedListProps = {
  stories:       Story[];
  onStoryPress:  (id: string) => void;
  isLoading?:    boolean;
  refreshing?:   boolean;
  onRetry?:      () => void;
  onRefresh?:    () => void;
  onEndReached?: () => void;
  hasMore?:      boolean;
};

// ── Avatar ────────────────────────────────────────────────────────────────────

function StoryAvatar({ avatarUrl, username }: { avatarUrl?: string | null; username: string }) {
  if (avatarUrl) {
    return <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />;
  }
  return (
    <View style={styles.avatarPlaceholder}>
      <Text style={styles.avatarText}>
        {username.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

// ── FeedList ──────────────────────────────────────────────────────────────────

export default function FeedList({
  stories,
  onStoryPress,
  isLoading,
  onRetry,
  refreshing,
  onRefresh,
  onEndReached,
  hasMore,
}: FeedListProps) {
  const { width }     = useWindowDimensions();
  const isTabletOrWeb = width >= 768;

  if (isLoading && stories.length === 0) return <FeedSkeleton count={5} />;
  if (!isLoading && stories.length === 0) return <EmptyFeed onRetry={onRetry} />;

  return (
    <FlatList
      data={stories}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      onEndReached={() => {
        if (!hasMore || isLoading || refreshing) return;
        onEndReached?.();
      }}
      onEndReachedThreshold={0.7}
      ListFooterComponent={() => {
        if (hasMore && stories.length > 0)
          return (
            <View style={styles.footer}>
              <Text style={styles.footerText}>Loading more stories…</Text>
            </View>
          );
        if (!hasMore && stories.length > 0)
          return (
            <View style={styles.footer}>
              <Text style={styles.footerDone}>You're all caught up 🎉</Text>
            </View>
          );
        return null;
      }}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor={C.accent}
            colors={[C.accent, C.primary]}
          />
        ) : undefined
      }
      contentContainerStyle={[
        styles.list,
        isTabletOrWeb && styles.listWide,
      ]}
      renderItem={({ item }) => (
        <StoryCard
          item={item}
          isTabletOrWeb={isTabletOrWeb}
          onPress={onStoryPress}
        />
      )}
    />
  );
}

// ── StoryCard ─────────────────────────────────────────────────────────────────

function StoryCard({
  item,
  isTabletOrWeb,
  onPress,
}: {
  item: Story;
  isTabletOrWeb: boolean;
  onPress: (id: string) => void;
}) {
  const isCompleted = item.status === "COMPLETED";
  const statusCol   = C.status[item.status ?? "ACTIVE"];

  return (
    <View style={[styles.card, isTabletOrWeb && styles.cardWide]}>
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <StoryAvatar
            avatarUrl={item.user.avatarUrl}
            username={item.user.username}
          />
          <View>
            <Text style={styles.username}>{item.user.username}</Text>
            <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <View style={[styles.statusPill, { backgroundColor: statusCol.bg }]}>
            <Text style={[styles.statusText, { color: statusCol.text }]}>
              {isCompleted ? "Completed" : "Active"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.openButton}
            onPress={() => onPress(item.id)}
            activeOpacity={0.85}
          >
            <Text style={styles.openText}>Open</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ── STORY BODY ── */}
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>

      <Text style={styles.content} numberOfLines={3}>
        {item.content}
      </Text>

      {/* ── CHARACTERS ── */}
      {item.characters?.length > 0 && (
        <View style={styles.charactersWrapper}>
          {item.characters.map((char) => (
            <View key={char.id} style={styles.characterChip}>
              <Text style={styles.characterText}>{char.name}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── ARC PROGRESS ── */}
      <View style={styles.divider} />
      <ArcProgress
        stage={item.arcStage ?? "SETUP"}
        turnCount={item.turnCount ?? 0}
        maxTurns={item.maxTurns ?? 6}
        status={item.status ?? "ACTIVE"}
      />

      {/* ── ENGAGEMENT ── */}
      <View style={styles.divider} />
      <View style={styles.engagementRow}>
        <View style={styles.engagementGroup}>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementCount}>
              {item.commentCount ?? item.comments?.length ?? 0}
            </Text>
            <Text style={styles.engagementLabel}>
              {(item.commentCount ?? 0) === 1 ? "Comment" : "Comments"}
            </Text>
          </View>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementCount}>
              {item.turns?.length ?? 0}
            </Text>
            <Text style={styles.engagementLabel}>
              {(item.turns?.length ?? 0) === 1 ? "Turn" : "Turns"}
            </Text>
          </View>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementCount}>
              {item.totalReactions ?? 0}
            </Text>
            <Text style={styles.engagementLabel}>Reactions</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.ctaButton, isCompleted && styles.ctaButtonDone]}
          onPress={() => onPress(item.id)}
          activeOpacity={0.9}
          disabled={isCompleted}
        >
          <Text style={styles.ctaText}>
            {isCompleted ? "Read" : "Contribute"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── EmptyFeed ─────────────────────────────────────────────────────────────────

function EmptyFeed({ onRetry }: { onRetry?: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptySubText}>
        We couldn't load stories. Please try again.
      </Text>
      {onRetry && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onRetry}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const arcStyles = StyleSheet.create({
  progressBlock:  { gap: 10 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  dot:       { width: 7, height: 7, borderRadius: 4 },
  badgeText: { fontSize: 12, fontFamily: FONT.semibold },
  turnCount: { fontSize: 11, fontFamily: FONT.medium, color: C.text.tertiary },
  trackRow:  { flexDirection: "row", gap: 4 },
  segmentOuter: { flex: 1, gap: 4 },
  segmentTrack: { height: 5, borderRadius: 999, overflow: "hidden" },
  segmentGap:   {},
  segmentFill:  { height: "100%", borderRadius: 999 },
  segLabel: {
    fontSize: 9,
    fontFamily: FONT.medium,
    color: C.text.tertiary,
    textAlign: "center",
  },
});

const styles = StyleSheet.create({
  list:     { paddingVertical: 8 },
  listWide: { paddingHorizontal: 24 },

  card: {
    backgroundColor: C.bg,
    padding: 18,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardWide: { maxWidth: 720, alignSelf: "center", width: "100%" },

  header:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  userInfo:    { flexDirection: "row", alignItems: "center", gap: 10 },

  // Avatar — shared dimensions, two visual variants
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.border, // placeholder colour while image loads
  },
  avatarText: { fontSize: 16, fontFamily: FONT.semibold, color: C.bg },

  username: { fontSize: 14, fontFamily: FONT.semibold, color: C.text.primary },
  time:     { fontSize: 11, fontFamily: FONT.regular, color: C.text.secondary, marginTop: 2 },

  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusText: { fontSize: 11, fontFamily: FONT.semibold },

  openButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: C.blueLight,
    borderWidth: 1,
    borderColor: C.blue + "30",
  },
  openText: { fontSize: 13, fontFamily: FONT.semibold, color: C.blue },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 14 },

  title: {
    fontSize: 19,
    fontFamily: FONT.title,
    color: C.primary,
    marginBottom: 8,
    lineHeight: 26,
  },
  content: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: C.text.secondary,
    lineHeight: 22,
    marginBottom: 12,
  },

  charactersWrapper: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  characterChip: {
    backgroundColor: C.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.border,
  },
  characterText: { fontSize: 12, fontFamily: FONT.medium, color: C.text.secondary },

  engagementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  engagementGroup: { flexDirection: "row", gap: 20 },
  engagementItem:  { flexDirection: "row", alignItems: "center" },
  engagementCount: { fontSize: 14, fontFamily: FONT.bold, color: C.primary, marginRight: 4 },
  engagementLabel: { fontSize: 12, fontFamily: FONT.regular, color: C.text.secondary },

  ctaButton: {
    backgroundColor: C.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaButtonDone: { backgroundColor: C.surface, shadowOpacity: 0, elevation: 0 },
  ctaText:       { color: C.bg, fontSize: 14, fontFamily: FONT.semibold },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    paddingHorizontal: 24,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: C.text.secondary,
    marginTop: 8,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: C.accent,
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryText: { color: C.bg, fontSize: 14, fontFamily: FONT.semibold },

  footer:      { paddingVertical: 24, alignItems: "center" },
  footerText:  { fontSize: 14, color: C.text.secondary, fontFamily: FONT.medium },
  footerDone:  { fontSize: 14, color: C.primary, fontFamily: FONT.semibold },
});