
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useEffect, useRef, useState } from "react"
import {
  Dimensions,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native"

import FeedHeader from "../components/FeedHeader"
import FeedSkeleton from "../components/FeedSkeleton"
import formatTime from "../hooks/time"
import { toggleUpvote } from "../hooks/upvote"
import useStoryId from "../hooks/UseStoryId"
import useTurn from "../hooks/useTurn"
import useTurnId from "../hooks/useTurnId"

const { width } = Dimensions.get("window")
const IS_WEB = Platform.OS === "web"
const MAX_WIDTH = 720

export default function StoryScreen() {
  const router = useRouter()

  const { story, loading } = useStoryId()
  const { turn, refresh } = useTurnId()
  const { createTurn, error, message } = useTurn()

  const turns = Array.isArray(turn) ? turn : []
  const hasTurns = turns.length > 0

  const [characterId, setCharacterId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [isDropdownFocused, setIsDropdownFocused] = useState(false)
  const [isTextareaFocused, setIsTextareaFocused] = useState(false)
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  const [feedback, setFeedback] = useState<{
    type: "error" | "success"
    text: string
  } | null>(null)

  const scrollRef = useRef<ScrollView>(null)

  useEffect(() => {
    if (error) setFeedback({ type: "error", text: error })
    if (message) setFeedback({ type: "success", text: message })

    if (error || message) {
      const timer = setTimeout(() => setFeedback(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error, message])

  if (loading) return <FeedSkeleton count={5} />
  if (!story) return <Text style={styles.stateText}>Story not found</Text>

  const selectedCharacter = story.characters.find((c) => c.id === characterId)
  const canSubmit = Boolean(selectedCharacter && text.trim() && !isSubmitting)

  async function handleUpvote(turnId: string) {
    await toggleUpvote(turnId)
    await refresh()
  }

  return (
    <View style={styles.screen}>
      <FeedHeader />

      {/* 🔙 BACK BUTTON */}
      <View style={styles.backRow}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && { opacity: 0.6 },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color="#7C3AED" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>

      {feedback && (
        <View
          style={[
            styles.feedback,
            feedback.type === "error"
              ? styles.feedbackError
              : styles.feedbackSuccess,
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

          <Text style={styles.label}>Choose a character</Text>
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
          </Pressable>

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
              if (!selectedCharacter || isSubmitting) return
              setIsSubmitting(true)

              try {
                const created = await createTurn(selectedCharacter.id, text.trim())
                if (created) {
                  setText("")
                  setCharacterId(null)
                  await refresh()
                  setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)
                }
                if(! created) {
                  setText("")
                  setCharacterId(null)
                }
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            <Text style={styles.primaryButtonText}>
              {isSubmitting ? "Submitting..." : "Submit turn"}
            </Text>
          </Pressable>

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
                        <Text style={styles.turnCharacter}>{item.character?.name}</Text>
                        <Text style={styles.turnAuthor}>{item.user?.username}</Text>
                      </View>

                      <View style={styles.turnRight}>
                        <Text style={styles.turnTime}>{formatTime(item.createdAt)}</Text>
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
        <Modal visible={open} transparent animationType="fade">
          <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
            <View
              style={[styles.menu, IS_WEB ? styles.menuWeb : styles.menuMobile]}
            >
              <FlatList
                data={story.characters}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.option}
                    disabled={isSubmitting}
                    onPress={() => {
                      setCharacterId(item.id);
                      setOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item.name}</Text>
                  </Pressable>
                )}
              />
            </View>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  )
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

  label: { fontWeight: "600", color: "#374151", marginBottom: 8 },

  dropdown: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 26,
    backgroundColor: "#FFFFFF",
  },

  dropdownText: { fontSize: 16, color: "#1F2937" },
  placeholder: { color: "#9CA3AF" },

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

  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },

  turnsWrapper: { marginTop: 36 },
  turnsTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, color: "#7C3AED" },

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
    maxHeight: 360,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },

  menuMobile: { width: "100%" },
  menuWeb: { width: Math.min(width - 32, 420), alignSelf: "center" },

  option: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  optionText: { fontSize: 16, color: "#1F2937" },

  stateText: {
    textAlign: "center",
    marginTop: 48,
    fontSize: 16,
    color: "#6B7280",
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
  
  backText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7C3AED",
  },
  
})
