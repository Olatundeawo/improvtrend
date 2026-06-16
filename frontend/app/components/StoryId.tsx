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
import { toggleUpvote } from "../hooks/upvote";
import useStoryId from "../hooks/UseStoryId";
import useTurn from "../hooks/useTurn";
import useTurnId from "../hooks/useTurnId";
import useCharacter, { type Character } from "../hooks/useCharacter";

const { width } = Dimensions.get("window");
const IS_WEB = Platform.OS === "web";
const MAX_WIDTH = 720;

export default function StoryScreen() {
  const router = useRouter();

  const { story, loading, retry } = useStoryId();
  const { turn, refresh } = useTurnId();
  const { createTurn, error: turnError, message: turnMessage } = useTurn();
  const {
    characters,
    error: charError,
    message: charMessage,
    addCharacter,
    claimCharacter,
    unclaimCharacter,
  } = useCharacter();

  const turns = Array.isArray(turn) ? turn : [];
  const hasTurns = turns.length > 0;

  // current user id — read once from storage
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem("userId").then(setCurrentUserId);
  }, []);

  const [characterId, setCharacterId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add-character modal
  const [addCharOpen, setAddCharOpen] = useState(false);
  const [newCharName, setNewCharName] = useState("");
  const [isAddingChar, setIsAddingChar] = useState(false);

  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  // Merge errors/messages from both hooks into one feedback banner
  useEffect(() => {
    const err = turnError || charError;
    const msg = turnMessage || charMessage;
    if (err) setFeedback({ type: "error", text: err });
    else if (msg) setFeedback({ type: "success", text: msg });

    if (err || msg) {
      const t = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(t);
    }
  }, [turnError, charError, turnMessage, charMessage]);

  if (loading) return <FeedSkeleton count={5} />;
  if (!story && !loading) {
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
  const canSubmit = Boolean(selectedCharacter && text.trim() && !isSubmitting);
  const atCharLimit = characters.length >= 6;

  // A character is selectable if unclaimed OR claimed by current user
  function isSelectable(char: Character) {
    return char.claimedByUserId === null || char.claimedByUserId === currentUserId;
  }

  async function handleUpvote(turnId: string) {
    await toggleUpvote(turnId);
    await refresh();
  }

  async function handleAddCharacter() {
    const name = newCharName.trim();
    if (!name) return;
    setIsAddingChar(true);
    const ok = await addCharacter(name);
    setIsAddingChar(false);
    if (ok) {
      setNewCharName("");
      setAddCharOpen(false);
    }
  }

  function renderCharacterOption({ item }: { item: Character }) {
    const selectable = isSelectable(item);
    const claimedByMe = item.claimedByUserId === currentUserId;
    const claimedByOther = item.claimedByUserId !== null && !claimedByMe;

    return (
      <Pressable
        style={[styles.option, !selectable && styles.optionDisabled]}
        disabled={!selectable || isSubmitting}
        onPress={() => {
          setCharacterId(item.id);
          setOpen(false);
        }}
      >
        <View style={styles.optionRow}>
          <Text style={[styles.optionText, !selectable && styles.optionTextDisabled]}>
            {item.name}
          </Text>

          {claimedByMe && (
            <View style={styles.badgeMine}>
              <Text style={styles.badgeMineText}>Yours</Text>
            </View>
          )}
          {claimedByOther && (
            <View style={styles.badgeTaken}>
              <Text style={styles.badgeTakenText}>
                {item.claimedBy?.username ?? "Taken"}
              </Text>
            </View>
          )}
          {!item.claimedByUserId && (
            <View style={styles.badgeFree}>
              <Text style={styles.badgeFreeText}>Free</Text>
            </View>
          )}
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
        <View
          style={[
            styles.feedback,
            feedback.type === "error" ? styles.feedbackError : styles.feedbackSuccess,
          ]}
        >
          <Text style={styles.feedbackText}>{feedback.text}</Text>
        </View>
      )}

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.content}>{story.content}</Text>

          {/* ── CHARACTER PICKER ROW ── */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Choose a character</Text>
            {!atCharLimit && (
              <Pressable
                onPress={() => setAddCharOpen(true)}
                style={styles.addCharBtn}
              >
                <Ionicons name="add-circle-outline" size={16} color="#7C3AED" />
                <Text style={styles.addCharText}>Add</Text>
              </Pressable>
            )}
            {atCharLimit && (
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

          {/* Claim / Unclaim for selected character */}
          {selectedCharacter && currentUserId && (
            <View style={styles.claimRow}>
              {selectedCharacter.claimedByUserId === null && (
                <Pressable
                  style={styles.claimBtn}
                  onPress={() => claimCharacter(selectedCharacter.id)}
                >
                  <Ionicons name="lock-open-outline" size={14} color="#7C3AED" />
                  <Text style={styles.claimBtnText}>Claim this character</Text>
                </Pressable>
              )}
              {selectedCharacter.claimedByUserId === currentUserId && (
                <Pressable
                  style={styles.unclaimBtn}
                  onPress={() => unclaimCharacter(selectedCharacter.id)}
                >
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
            style={[
              styles.primaryButton,
              (!canSubmit || isSubmitting) && styles.primaryButtonDisabled,
            ]}
            onPress={async () => {
              if (!selectedCharacter || isSubmitting) return;
              setIsSubmitting(true);
              try {
                const created = await createTurn(selectedCharacter.id, text.trim());
                if (created) {
                  setText("");
                  setCharacterId(null);
                  await refresh();
                  setTimeout(
                    () => scrollRef.current?.scrollToEnd({ animated: true }),
                    300
                  );
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
              {isSubmitting ? "Submitting..." : "Submit turn"}
            </Text>
          </Pressable>

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
                        <Text style={styles.turnCharacter}>
                          {item.character?.name}
                        </Text>
                        <Text style={styles.turnAuthor}>{item.user?.username}</Text>
                      </View>
                      <View style={styles.turnRight}>
                        <Text style={styles.turnTime}>
                          {formatTime(item.createdAt)}
                        </Text>
                        <Pressable
                          onPress={() => handleUpvote(item.id)}
                          style={styles.upvoteButton}
                        >
                          <Text style={styles.upvoteArrow}>▲</Text>
                          <Text style={styles.upvoteCount}>
                            Upvote {item.upvotes?.length || 0}
                          </Text>
                        </Pressable>
                      </View>
                    </View>
                    <Text style={styles.turnContent}>{item.content}</Text>
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Be the first to contribute</Text>
                <Text style={styles.emptyText}>
                  This story hasn't been continued yet.
                </Text>
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
            onPress={() => {
              setAddCharOpen(false);
              setNewCharName("");
            }}
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
                style={[
                  styles.primaryButton,
                  (!newCharName.trim() || isAddingChar) && styles.primaryButtonDisabled,
                ]}
                disabled={!newCharName.trim() || isAddingChar}
                onPress={handleAddCharacter}
              >
                <Text style={styles.primaryButtonText}>
                  {isAddingChar ? "Adding..." : "Add character"}
                </Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAF5FF" },
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

  feedback: {
    margin: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  feedbackError: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  feedbackSuccess: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  feedbackText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    textAlign: "center",
  },

  title: { fontSize: 26, fontWeight: "800", marginBottom: 12, color: "#7C3AED" },
  content: { fontSize: 16, lineHeight: 26, marginBottom: 28, color: "#1F2937" },

  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  label: { fontWeight: "600", color: "#374151" },
  limitNote: { fontSize: 12, color: "#9CA3AF" },

  addCharBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#F3E8FF",
  },
  addCharText: { fontSize: 13, fontWeight: "600", color: "#7C3AED" },

  dropdown: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    backgroundColor: "#FFFFFF",
  },
  dropdownText: { fontSize: 16, color: "#1F2937" },
  placeholder: { color: "#9CA3AF" },

  claimRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    minHeight: 28,
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F3E8FF",
  },
  claimBtnText: { fontSize: 12, fontWeight: "600", color: "#7C3AED" },
  unclaimBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  unclaimBtnText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  takenNote: { fontSize: 12, color: "#EF4444" },

  sectionLabel: { fontWeight: "600", marginBottom: 10, color: "#374151" },

  textarea: {
    minHeight: 150,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    fontSize: 16,
    color: "#1F2937",
    backgroundColor: "#FFFFFF",
  },
  focusedField: { borderColor: "#7C3AED", borderWidth: 2 },

  primaryButton: {
    marginTop: 28,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonDisabled: {
    backgroundColor: "#D1D5DB",
    opacity: 0.7,
    shadowOpacity: 0.1,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  turnsWrapper: { marginTop: 36 },
  turnsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    color: "#7C3AED",
  },

  turnCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
    backgroundColor: "#FFFFFF",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  turnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  turnIdentity: { flexDirection: "row", gap: 8 },
  turnCharacter: { fontWeight: "700", color: "#7C3AED" },
  turnAuthor: { color: "#6B7280" },
  turnRight: { alignItems: "flex-end", gap: 6 },
  turnTime: { fontSize: 12, color: "#9CA3AF" },
  upvoteButton: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F3E8FF",
  },
  upvoteArrow: { fontWeight: "900", color: "#7C3AED" },
  upvoteCount: { fontWeight: "700", color: "#7C3AED", fontSize: 12 },
  turnContent: { lineHeight: 24, color: "#374151" },

  emptyState: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  emptyTitle: { fontWeight: "700", marginBottom: 6, color: "#374151" },
  emptyText: { color: "#6B7280", textAlign: "center" },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(124, 58, 237, 0.25)",
    justifyContent: IS_WEB ? "center" : "flex-end",
    padding: 16,
  },
  menu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    maxHeight: 400,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  menuTitle: {
    fontWeight: "700",
    fontSize: 15,
    color: "#374151",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  menuMobile: { width: "100%" },
  menuWeb: { width: Math.min(width - 32, 420), alignSelf: "center" },

  option: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  optionDisabled: { backgroundColor: "#FAFAFA" },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: { fontSize: 16, color: "#1F2937" },
  optionTextDisabled: { color: "#9CA3AF" },

  badgeMine: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#F3E8FF",
  },
  badgeMineText: { fontSize: 11, fontWeight: "700", color: "#7C3AED" },
  badgeTaken: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#FEF2F2",
  },
  badgeTakenText: { fontSize: 11, fontWeight: "700", color: "#EF4444" },
  badgeFree: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "#ECFDF5",
  },
  badgeFreeText: { fontSize: 11, fontWeight: "700", color: "#059669" },

  addCharModal: {
    padding: 20,
    alignSelf: "center",
    width: Math.min(width - 32, 420),
  },
  addCharInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 14,
    fontSize: 16,
    color: "#1F2937",
    marginTop: 12,
  },
  charLimitHint: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 6,
    marginBottom: 4,
  },

  backRow: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#F3E8FF",
    alignSelf: "flex-start",
  },
  backText: { fontSize: 14, fontWeight: "600", color: "#7C3AED" },

  retryScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FAF5FF",
  },
  retryTitle: { marginTop: 12, fontSize: 20, fontWeight: "700", color: "#1F2937" },
  retryText: {
    marginTop: 8,
    fontSize: 15,
    textAlign: "center",
    color: "#6B7280",
    maxWidth: 320,
  },
  retryButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 999,
    backgroundColor: "#7C3AED",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  retryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
});