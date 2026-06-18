import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import FeedHeader from "../components/FeedHeader";
import FeedSkeleton from "../components/FeedSkeleton";
import formatTime from "../hooks/time";
import {
  toggleReaction,
  getBulkReactions,
  REACTION_META,
  type ReactionType,
  type ReactionSummary,
} from "../hooks/useReaction";
import useStoryId from "../hooks/UseStoryId";
import useTurn from "../hooks/useTurn";
import useTurnId from "../hooks/useTurnId";
import useCharacter, { type Character } from "../hooks/useCharacter";
import type { ArcStage } from "../components/type";

const { width } = Dimensions.get("window");
const IS_WEB    = Platform.OS === "web";
const MAX_WIDTH = 720;

// ── palette ──────────────────────────────────────────────────────────────────

const ARC_COLORS: Record<ArcStage, { bg: string; bar: string; text: string }> = {
  SETUP:      { bg: "#EFF6FF", bar: "#3B82F6", text: "#1D4ED8" },
  RISING:     { bg: "#FFF7ED", bar: "#F97316", text: "#C2410C" },
  CLIMAX:     { bg: "#FEF2F2", bar: "#EF4444", text: "#B91C1C" },
  RESOLUTION: { bg: "#F0FDF4", bar: "#22C55E", text: "#15803D" },
};

const STAGE_LABEL: Record<ArcStage, string> = {
  SETUP:      "Setup",
  RISING:     "Rising Action",
  CLIMAX:     "Climax",
  RESOLUTION: "Resolution",
};

const STAGES: ArcStage[] = ["SETUP", "RISING", "CLIMAX", "RESOLUTION"];
const STAGE_IDX: Record<ArcStage, number> = {
  SETUP: 0, RISING: 1, CLIMAX: 2, RESOLUTION: 3,
};

function stageStart(s: ArcStage, max: number) {
  return { SETUP: 0, RISING: Math.round(max * 0.25), CLIMAX: Math.round(max * 0.65), RESOLUTION: Math.round(max * 0.85) }[s];
}
function stageWidth(s: ArcStage, max: number) {
  return Math.max(
    { SETUP: Math.round(max * 0.25), RISING: Math.round(max * 0.40), CLIMAX: Math.round(max * 0.20), RESOLUTION: max - Math.round(max * 0.85) }[s],
    1
  );
}

// ── ArcBanner ─────────────────────────────────────────────────────────────────

function ArcBanner({
  arcStage,
  arcSize,
  turnCount,
  maxTurns,
  status,
}: {
  arcStage: ArcStage;
  arcSize: string;
  turnCount: number;
  maxTurns: number;
  status: string;
}) {
  const col        = ARC_COLORS[arcStage];
  const isComplete = status === "COMPLETED";
  const activeIdx  = STAGE_IDX[arcStage];

  return (
    <View style={[arc.banner, { backgroundColor: col.bg }]}>
      {/* top row */}
      <View style={arc.bannerRow}>
        <View style={arc.stageBadge}>
          <View style={[arc.stageDot, { backgroundColor: col.bar }]} />
          <Text style={[arc.stageLabel, { color: col.text }]}>
            {isComplete ? "Completed" : STAGE_LABEL[arcStage]}
          </Text>
        </View>

        <View style={arc.metaRow}>
          <View style={arc.arcSizePill}>
            <Text style={arc.arcSizeText}>{arcSize}</Text>
          </View>
          <Text style={arc.turnCounter}>
            {turnCount}/{maxTurns} turns
          </Text>
        </View>
      </View>

      {/* segmented track */}
      <View style={arc.trackRow}>
        {STAGES.map((s, i) => {
          const sc       = ARC_COLORS[s];
          const filled   = isComplete || i < activeIdx;
          const active   = !isComplete && i === activeIdx;
          const pct      = active
            ? `${Math.round(((turnCount - stageStart(s, maxTurns)) / stageWidth(s, maxTurns)) * 100)}%`
            : "100%";

          return (
            <View key={s} style={arc.segOuter}>
              <View style={[arc.segTrack, { backgroundColor: filled || active ? sc.bg : "#E5E7EB" }]}>
                {(filled || active) && (
                  <View style={[arc.segFill, { backgroundColor: sc.bar, width: filled ? "100%" : pct }]} />
                )}
              </View>
              <Text style={arc.segLabel}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const arc = StyleSheet.create({
  banner: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  bannerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stageBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stageDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stageLabel: {
    fontSize: 13,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  arcSizePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  arcSizeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#374151",
    letterSpacing: 0.5,
  },
  turnCounter: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6B7280",
  },
  trackRow: {
    flexDirection: "row",
    gap: 4,
  },
  segOuter: {
    flex: 1,
    gap: 4,
  },
  segTrack: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
  },
  segFill: {
    height: "100%",
    borderRadius: 999,
  },
  segLabel: {
    fontSize: 9,
    fontWeight: "500",
    color: "#9CA3AF",
    textAlign: "center",
  },
});

// ── TurnReactionBar ───────────────────────────────────────────────────────────

function TurnReactionBar({
  turnId,
  summary,
  onReact,
}: {
  turnId: string;
  summary: ReactionSummary[];
  onReact: (turnId: string, updated: ReactionSummary[]) => void;
}) {
  const [reactions, setReactions]   = useState<ReactionSummary[]>(summary);
  const [loadingType, setLoadingType] = useState<ReactionType | null>(null);

  async function handlePress(type: ReactionType) {
    if (loadingType) return;
    setLoadingType(type);
    const optimistic = reactions.map((r) =>
      r.type === type
        ? { ...r, reacted: !r.reacted, count: r.reacted ? r.count - 1 : r.count + 1 }
        : r
    );
    setReactions(optimistic);
    try {
      const result = await toggleReaction(turnId, type);
      setReactions(result.summary);
      onReact(turnId, result.summary);
    } catch {
      setReactions(reactions);
    } finally {
      setLoadingType(null);
    }
  }

  return (
    <View style={rb.row}>
      {reactions.map((r) => {
        const meta      = REACTION_META[r.type];
        const isLoading = loadingType === r.type;
        return (
          <Pressable
            key={r.type}
            onPress={() => handlePress(r.type)}
            disabled={!!loadingType}
            style={({ pressed }) => [
              rb.pill,
              r.reacted && rb.pillActive,
              pressed && { opacity: 0.75 },
            ]}
          >
            <Text style={rb.emoji}>{meta.emoji}</Text>
            <Text style={[rb.label, r.reacted && rb.labelActive]}>
              {isLoading ? "…" : r.count > 0 ? r.count : meta.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const rb = StyleSheet.create({
  row:        { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 12 },
  pill:       { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, borderWidth: 1, borderColor: "#E5E7EB", backgroundColor: "#F9FAFB" },
  pillActive: { borderColor: "#C4B5FD", backgroundColor: "#F3E8FF" },
  emoji:      { fontSize: 13 },
  label:      { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  labelActive:{ color: "#7C3AED", fontWeight: "700" },
});

// ── StoryScreen ───────────────────────────────────────────────────────────────

export default function StoryScreen() {
  const router = useRouter();

  const {
    story,
    loading,
    retry,
    completeStory,
    completing,
    voteToComplete,
    voting,
    actionError,
    actionMsg,
    clearActionMsg,
    clearActionError,
  } = useStoryId();
 

  const { turn, refresh }                          = useTurnId();
  const { createTurn, error: turnError, message: turnMessage } = useTurn();
  const { characters, error: charError, message: charMessage, addCharacter, claimCharacter, unclaimCharacter } = useCharacter();

  const turns    = Array.isArray(turn) ? turn : [];
  const hasTurns = turns.length > 0;

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => { AsyncStorage.getItem("userId").then(setCurrentUserId); }, []);

  const isCreator  = !!currentUserId && !!story && story.userId === currentUserId;
  const isLocked   = story?.status === "COMPLETED" || story?.isLocked;

  // ── reactions ──────────────────────────────────────────────────────────────
  const [reactionMap, setReactionMap] = useState<Record<string, ReactionSummary[]>>({});
  useEffect(() => {
    if (!turns.length) return;
    getBulkReactions(turns.map((t) => t.id)).then(setReactionMap).catch(() => {});
  }, [turns.length]);

  function handleReactionUpdate(turnId: string, updated: ReactionSummary[]) {
    setReactionMap((prev) => ({ ...prev, [turnId]: updated }));
  }

  // ── turn form ──────────────────────────────────────────────────────────────
  const [characterId, setCharacterId]           = useState<number | null>(null);
  const [open, setOpen]                         = useState(false);
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [text, setText]                         = useState("");
  const [isSubmitting, setIsSubmitting]         = useState(false);

  const [addCharOpen, setAddCharOpen]   = useState(false);
  const [newCharName, setNewCharName]   = useState("");
  const [isAddingChar, setIsAddingChar] = useState(false);

  // ── feedback ───────────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    const err = turnError || charError || actionError;
    const msg = turnMessage || charMessage || actionMsg;
    if (err) { setFeedback({ type: "error",   text: err }); clearActionError?.(); }
    else if (msg) { setFeedback({ type: "success", text: msg }); clearActionMsg?.(); }
    if (err || msg) {
      const t = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(t);
    }
  }, [turnError, charError, turnMessage, charMessage, actionError, actionMsg]);

  const scrollRef = useRef<ScrollView>(null);

  // ── loading / error screens ────────────────────────────────────────────────
  if (loading) return <FeedSkeleton count={5} />;
  if (!story) {
    return (
      <View style={styles.retryScreen}>
        <Ionicons name="cloud-offline-outline" size={48} color="#7C3AED" />
        <Text style={styles.retryTitle}>Connection issue</Text>
        <Text style={styles.retryText}>
          We couldn't load this story. Please check your internet connection.
        </Text>
        <Pressable
          onPress={retry}
          style={({ pressed }) => [styles.retryButton, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="refresh" size={18} color="#FFFFFF" />
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const selectedCharacter = characters.find((c) => c.id === characterId);
  const canSubmit  = Boolean(selectedCharacter && text.trim() && !isSubmitting && !isLocked);
  const atCharLimit = characters.length >= 6;

  function isSelectable(char: Character) {
    return char.claimedByUserId === null || char.claimedByUserId === currentUserId;
  }

  async function handleAddCharacter() {
    const name = newCharName.trim();
    if (!name) return;
    setIsAddingChar(true);
    const ok = await addCharacter(name);
    setIsAddingChar(false);
    if (ok) { setNewCharName(""); setAddCharOpen(false); }
  }

  function renderCharacterOption({ item }: { item: Character }) {
    const selectable     = isSelectable(item);
    const claimedByMe    = item.claimedByUserId === currentUserId;
    const claimedByOther = item.claimedByUserId !== null && !claimedByMe;
    return (
      <Pressable
        style={[styles.option, !selectable && styles.optionDisabled]}
        disabled={!selectable || isSubmitting}
        onPress={() => { setCharacterId(item.id); setOpen(false); }}
      >
        <View style={styles.optionRow}>
          <Text style={[styles.optionText, !selectable && styles.optionTextDisabled]}>
            {item.name}
          </Text>
          {claimedByMe    && <View style={styles.badgeMine}><Text style={styles.badgeMineText}>Yours</Text></View>}
          {claimedByOther && <View style={styles.badgeTaken}><Text style={styles.badgeTakenText}>{item.claimedBy?.username ?? "Taken"}</Text></View>}
          {!item.claimedByUserId && <View style={styles.badgeFree}><Text style={styles.badgeFreeText}>Free</Text></View>}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.screen}>
      <FeedHeader />

      <View style={styles.backRow}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
        >
          <Ionicons name="arrow-back" size={22} color="#7C3AED" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      {feedback && (
        <View style={[styles.feedback, feedback.type === "error" ? styles.feedbackError : styles.feedbackSuccess]}>
          <Text style={styles.feedbackText}>{feedback.text}</Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>

          {/* ── ARC BANNER ── */}
          <ArcBanner
            arcStage={story.arcStage ?? "SETUP"}
            arcSize={story.arcSize  ?? "SHORT"}
            turnCount={story.turnCount ?? 0}
            maxTurns={story.maxTurns  ?? 6}
            status={story.status ?? "ACTIVE"}
          />

          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.content}>{story.content}</Text>

          {/* ── COMPLETE / VOTE ACTIONS ── */}
          {!isLocked && (
            <View style={styles.actionRow}>
              {isCreator ? (
                <Pressable
                  style={[styles.completeBtn, completing && styles.completeBtnDisabled]}
                  disabled={completing}
                  onPress={completeStory}
                >
                  <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.completeBtnText}>
                    {completing ? "Completing…" : "End story"}
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  style={[styles.voteBtn, voting && styles.voteBtnDisabled]}
                  disabled={voting}
                  onPress={voteToComplete}
                >
                  <Ionicons name="thumbs-up-outline" size={16} color="#7C3AED" />
                  <Text style={styles.voteBtnText}>
                    {voting
                      ? "Voting…"
                      : `Vote to complete${story.voteCount > 0 ? ` (${story.voteCount})` : ""}`}
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* ── LOCKED NOTICE ── */}
          {isLocked && (
            <View style={styles.lockedBanner}>
              <Ionicons name="lock-closed" size={15} color="#475569" />
              <Text style={styles.lockedText}>
                This story is complete — no new turns can be added.
              </Text>
            </View>
          )}

          {/* ── TURN FORM (hidden when locked) ── */}
          {!isLocked && (
            <>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Choose a character</Text>
                {!atCharLimit ? (
                  <Pressable onPress={() => setAddCharOpen(true)} style={styles.addCharBtn}>
                    <Ionicons name="add-circle-outline" size={16} color="#7C3AED" />
                    <Text style={styles.addCharText}>Add</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.limitNote}>6 / 6</Text>
                )}
              </View>

              <Pressable
                style={[styles.dropdown, isDropdownFocused && styles.focusedField]}
                onPressIn={() => setIsDropdownFocused(true)}
                onPressOut={() => setIsDropdownFocused(false)}
                onPress={() => setOpen(true)}
                disabled={isSubmitting}
              >
                <Text style={[styles.dropdownText, !selectedCharacter && styles.placeholder]}>
                  {selectedCharacter ? selectedCharacter.name : "Select character"}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#9CA3AF" />
              </Pressable>

              {selectedCharacter && currentUserId && (
                <View style={styles.claimRow}>
                  {selectedCharacter.claimedByUserId === null && (
                    <Pressable style={styles.claimBtn} onPress={() => claimCharacter(selectedCharacter.id)}>
                      <Ionicons name="lock-open-outline" size={14} color="#7C3AED" />
                      <Text style={styles.claimBtnText}>Claim this character</Text>
                    </Pressable>
                  )}
                  {selectedCharacter.claimedByUserId === currentUserId && (
                    <Pressable style={styles.unclaimBtn} onPress={() => unclaimCharacter(selectedCharacter.id)}>
                      <Ionicons name="lock-closed-outline" size={14} color="#6B7280" />
                      <Text style={styles.unclaimBtnText}>Release claim</Text>
                    </Pressable>
                  )}
                  {selectedCharacter.claimedByUserId !== null &&
                    selectedCharacter.claimedByUserId !== currentUserId && (
                      <Text style={styles.takenNote}>
                        Claimed by {selectedCharacter.claimedBy?.username}
                      </Text>
                    )}
                </View>
              )}

              <Text style={styles.sectionLabel}>Continue the story</Text>
              <TextInput
                multiline
                value={text}
                editable={!isSubmitting}
                onChangeText={setText}
                placeholder="Write the next part of the story…"
                placeholderTextColor="#9CA3AF"
                style={[styles.textarea, isTextareaFocused && styles.focusedField]}
                onFocus={() => setIsTextareaFocused(true)}
                onBlur={() => setIsTextareaFocused(false)}
              />

              <Pressable
                disabled={!canSubmit}
                style={[styles.primaryButton, (!canSubmit || isSubmitting) && styles.primaryButtonDisabled]}
                onPress={async () => {
                  if (!selectedCharacter || isSubmitting) return;
                  setIsSubmitting(true);
                  try {
                    const created = await createTurn(selectedCharacter.id, text.trim());
                    if (created) {
                      setText("");
                      setCharacterId(null);
                      await refresh();
                      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
                    } else {
                      setText("");
                      setCharacterId(null);
                    }
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>
                  {isSubmitting ? "Submitting…" : "Submit turn"}
                </Text>
              </Pressable>
            </>
          )}

          {/* ── TURNS ── */}
          <View style={styles.turnsWrapper}>
            <Text style={styles.turnsTitle}>Community Contributions</Text>

            {hasTurns ? (
              <FlatList
                data={turns}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.turnCard}>
                    <View style={styles.turnHeader}>
                      <View style={styles.turnIdentity}>
                        <View style={styles.characterAvatar}>
                          <Text style={styles.characterAvatarText}>
                            {item.character?.name?.[0]?.toUpperCase() ?? "?"}
                          </Text>
                        </View>
                        <View>
                          <Text style={styles.turnCharacter}>{item.character?.name}</Text>
                          <Text style={styles.turnAuthor}>@{item.user?.username}</Text>
                        </View>
                      </View>
                      <Text style={styles.turnTime}>{formatTime(item.createdAt)}</Text>
                    </View>

                    <Text style={styles.turnContent}>{item.content}</Text>

                    <TurnReactionBar
                      turnId={item.id}
                      summary={
                        reactionMap[item.id] ?? [
                          { type: "SPICY",      count: 0, reacted: false },
                          { type: "PLOT_TWIST", count: 0, reacted: false },
                          { type: "FUNNY",      count: 0, reacted: false },
                          { type: "BEST_LINE",  count: 0, reacted: false },
                        ]
                      }
                      onReact={handleReactionUpdate}
                    />
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="book-outline" size={32} color="#C4B5FD" />
                <Text style={styles.emptyTitle}>Be the first to contribute</Text>
                <Text style={styles.emptyText}>This story hasn't been continued yet.</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── CHARACTER PICKER MODAL ── */}
        <Modal visible={open} transparent animationType="fade">
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <View style={[styles.menu, IS_WEB ? styles.menuWeb : styles.menuMobile]}>
              <Text style={styles.menuTitle}>Characters</Text>
              <FlatList
                data={characters}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderCharacterOption}
              />
            </View>
          </Pressable>
        </Modal>

        {/* ── ADD CHARACTER MODAL ── */}
        <Modal visible={addCharOpen} transparent animationType="fade">
          <Pressable
            style={styles.overlay}
            onPress={() => { setAddCharOpen(false); setNewCharName(""); }}
          >
            <Pressable
              style={[styles.menu, styles.addCharModal]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={styles.menuTitle}>New character</Text>
              <TextInput
                value={newCharName}
                onChangeText={setNewCharName}
                placeholder="Character name"
                placeholderTextColor="#9CA3AF"
                style={styles.addCharInput}
                maxLength={40}
                autoFocus
              />
              <Text style={styles.charLimitHint}>
                {characters.length} / 6 characters used
              </Text>
              <Pressable
                style={[styles.primaryButton, (!newCharName.trim() || isAddingChar) && styles.primaryButtonDisabled]}
                disabled={!newCharName.trim() || isAddingChar}
                onPress={handleAddCharacter}
              >
                <Text style={styles.primaryButtonText}>
                  {isAddingChar ? "Adding…" : "Add character"}
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}

// ── styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen:        { flex: 1, backgroundColor: "#FAF5FF" },
  scrollContent: { alignItems: "center", paddingVertical: 24 },

  container: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    elevation: 8,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },

  feedback: { marginHorizontal: 16, marginBottom: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 14, alignItems: "center" },
  feedbackError:   { backgroundColor: "#FEF2F2", borderWidth: 1, borderColor: "#FECACA" },
  feedbackSuccess: { backgroundColor: "#ECFDF5", borderWidth: 1, borderColor: "#A7F3D0" },
  feedbackText:    { fontSize: 14, fontWeight: "600", color: "#0F172A", textAlign: "center" },

  title:   { fontSize: 26, fontWeight: "800", marginBottom: 12, color: "#7C3AED" },
  content: { fontSize: 16, lineHeight: 26, marginBottom: 20, color: "#1F2937" },

  // ── complete / vote ──────────────────────────────────────────────────────
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 20,
  },
  completeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  completeBtnDisabled: { opacity: 0.6, shadowOpacity: 0 },
  completeBtnText: { fontSize: 13, fontWeight: "700", color: "#FFFFFF" },

  voteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#C4B5FD",
  },
  voteBtnDisabled: { opacity: 0.6 },
  voteBtnText: { fontSize: 13, fontWeight: "700", color: "#7C3AED" },

  // ── locked ───────────────────────────────────────────────────────────────
  lockedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  lockedText: { fontSize: 13, color: "#475569", fontWeight: "500", flex: 1 },

  // ── turn form ─────────────────────────────────────────────────────────────
  labelRow:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 },
  label:     { fontWeight: "600", color: "#374151" },
  limitNote: { fontSize: 12, color: "#9CA3AF" },

  addCharBtn:  { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, backgroundColor: "#F3E8FF" },
  addCharText: { fontSize: 13, fontWeight: "600", color: "#7C3AED" },

  dropdown:     { height: 54, borderRadius: 14, borderWidth: 1, borderColor: "#D1D5DB", paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8, backgroundColor: "#FFFFFF" },
  dropdownText: { fontSize: 16, color: "#1F2937" },
  placeholder:  { color: "#9CA3AF" },
  focusedField: { borderColor: "#7C3AED", borderWidth: 2 },

  claimRow:       { flexDirection: "row", alignItems: "center", marginBottom: 20, minHeight: 28 },
  claimBtn:       { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: "#F3E8FF" },
  claimBtnText:   { fontSize: 12, fontWeight: "600", color: "#7C3AED" },
  unclaimBtn:     { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999, backgroundColor: "#F3F4F6" },
  unclaimBtnText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  takenNote:      { fontSize: 12, color: "#EF4444" },

  sectionLabel: { fontWeight: "600", marginBottom: 10, color: "#374151" },
  textarea:     { minHeight: 150, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#D1D5DB", fontSize: 16, color: "#1F2937", backgroundColor: "#FFFFFF", textAlignVertical: "top" },

  primaryButton:         { marginTop: 28, height: 54, borderRadius: 16, backgroundColor: "#7C3AED", alignItems: "center", justifyContent: "center", shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  primaryButtonDisabled: { backgroundColor: "#D1D5DB", opacity: 0.7, shadowOpacity: 0.1 },
  primaryButtonText:     { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  // ── turns ─────────────────────────────────────────────────────────────────
  turnsWrapper: { marginTop: 36 },
  turnsTitle:   { fontSize: 18, fontWeight: "700", marginBottom: 16, color: "#7C3AED" },

  turnCard:     { borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#EDE9FE", marginBottom: 14, backgroundColor: "#FDFCFF", shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  turnHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 },
  turnIdentity: { flexDirection: "row", alignItems: "center", gap: 10 },
  characterAvatar:     { width: 36, height: 36, borderRadius: 18, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center" },
  characterAvatarText: { fontWeight: "800", fontSize: 14, color: "#7C3AED" },
  turnCharacter: { fontWeight: "700", color: "#7C3AED", fontSize: 14 },
  turnAuthor:    { color: "#9CA3AF", fontSize: 12, marginTop: 1 },
  turnTime:      { fontSize: 12, color: "#9CA3AF" },
  turnContent:   { lineHeight: 24, color: "#374151", fontSize: 15 },

  emptyState: { borderWidth: 1, borderStyle: "dashed", borderColor: "#D1D5DB", borderRadius: 16, padding: 32, alignItems: "center", gap: 8 },
  emptyTitle: { fontWeight: "700", fontSize: 15, color: "#374151" },
  emptyText:  { color: "#6B7280", textAlign: "center", fontSize: 13 },

  // ── modals ────────────────────────────────────────────────────────────────
  overlay:   { flex: 1, backgroundColor: "rgba(124, 58, 237, 0.25)", justifyContent: IS_WEB ? "center" : "flex-end", padding: 16 },
  menu:      { backgroundColor: "#FFFFFF", borderRadius: 18, maxHeight: 400, shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 8, overflow: "hidden" },
  menuTitle: { fontWeight: "700", fontSize: 15, color: "#374151", paddingHorizontal: 18, paddingTop: 16, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  menuMobile: { width: "100%" },
  menuWeb:    { width: Math.min(width - 32, 420), alignSelf: "center" },

  option:             { paddingVertical: 14, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  optionDisabled:     { backgroundColor: "#FAFAFA" },
  optionRow:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  optionText:         { fontSize: 16, color: "#1F2937" },
  optionTextDisabled: { color: "#9CA3AF" },

  badgeMine:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: "#F3E8FF" },
  badgeMineText: { fontSize: 11, fontWeight: "700", color: "#7C3AED" },
  badgeTaken:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: "#FEF2F2" },
  badgeTakenText: { fontSize: 11, fontWeight: "700", color: "#EF4444" },
  badgeFree:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, backgroundColor: "#ECFDF5" },
  badgeFreeText: { fontSize: 11, fontWeight: "700", color: "#059669" },

  addCharModal: { padding: 20, alignSelf: "center", width: Math.min(width - 32, 420) },
  addCharInput: { height: 50, borderRadius: 12, borderWidth: 1, borderColor: "#D1D5DB", paddingHorizontal: 14, fontSize: 16, color: "#1F2937", marginTop: 12 },
  charLimitHint: { fontSize: 12, color: "#9CA3AF", marginTop: 6, marginBottom: 4 },

  backRow:    { width: "100%", maxWidth: MAX_WIDTH, paddingHorizontal: 16, marginBottom: 12, alignSelf: "center" },
  backButton: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999, backgroundColor: "#F3E8FF", alignSelf: "flex-start" },
  backText:   { fontSize: 14, fontWeight: "600", color: "#7C3AED" },

  retryScreen: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#FAF5FF" },
  retryTitle:  { marginTop: 12, fontSize: 20, fontWeight: "700", color: "#1F2937" },
  retryText:   { marginTop: 8, fontSize: 15, textAlign: "center", color: "#6B7280", maxWidth: 320 },
  retryButton: { marginTop: 20, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, height: 48, borderRadius: 999, backgroundColor: "#7C3AED", shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  retryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});