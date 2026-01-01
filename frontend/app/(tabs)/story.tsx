import { useState, useRef } from "react";
import {
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import formatTime from "../hooks/time";
import FeedSkeleton from "../components/FeedSkeleton";
import useStoryId from "../hooks/UseStoryId";
import useTurnId from "../hooks/useTurnId";
import useTurn from "../hooks/useTurn";

const { width } = Dimensions.get("window");
const IS_WEB = Platform.OS === "web";
const MAX_WIDTH = 720;

export default function StoryScreen() {
  const { story, loading } = useStoryId();
  const { turn, refresh } = useTurnId();
  const { createTurn } = useTurn();

  const turns = Array.isArray(turn) ? turn : [];
  const hasTurns = turns.length > 0;

  const [characterId, setCharacterId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isDropdownFocused, setIsDropdownFocused] = useState(false);
  const [isTextareaFocused, setIsTextareaFocused] = useState(false);
  const [text, setText] = useState("");

  const scrollRef = useRef<ScrollView>(null);

  if (loading) return <FeedSkeleton count={5} />;
  if (!story) return <Text style={styles.stateText}>Story not found</Text>;

  const selectedCharacter = story.characters.find(
    (c) => c.id === characterId
  );

  const canSubmit = Boolean(selectedCharacter && text.trim());

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
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
        >
          <Text
            style={[
              styles.dropdownText,
              !selectedCharacter && styles.placeholder,
            ]}
          >
            {selectedCharacter ? selectedCharacter.name : "Select character"}
          </Text>
        </Pressable>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Continue the story</Text>
          <TextInput
            multiline
            numberOfLines={6}
            value={text}
            onChangeText={setText}
            placeholder="Write the next part of the story…"
            placeholderTextColor="#9CA3AF"
            style={[
              styles.textarea,
              isTextareaFocused && styles.focusedField,
            ]}
            onFocus={() => setIsTextareaFocused(true)}
            onBlur={() => setIsTextareaFocused(false)}
          />
        </View>

        <Pressable
          disabled={!canSubmit}
          style={[
            styles.primaryButton,
            !canSubmit && styles.primaryButtonDisabled,
          ]}
          onPress={async () => {
            if (!selectedCharacter) return;

            const created = await createTurn(
              selectedCharacter.id,
              text.trim()
            );

            if (created) {
              setText("");
              setCharacterId(null);
              await refresh();

              setTimeout(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              }, 300);
            }
          }}
        >
          <Text style={styles.primaryButtonText}>Submit turn</Text>
        </Pressable>

        {/* ===== Community Contributions ===== */}
        <View style={styles.turnsWrapper}>
          <Text style={styles.turnsTitle}>Community Contributions</Text>

          {hasTurns ? (
            <FlatList
              data={turns}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.turnCard}>
                  {/* Header */}
                  <View style={styles.turnHeader}>
                    <View style={styles.turnIdentity}>
                      <Text style={styles.turnCharacter}>
                        {item.character?.name}
                      </Text>
                      <Text style={styles.turnAuthor}>
                        {item.user?.username}
                      </Text>
                    </View>

                    <View style={styles.turnRight}>
                      <Text style={styles.turnTime}>
                        {formatTime(item.createdAt)}
                      </Text>

                      {/* Upvote Button UI */}
                      <Pressable style={styles.upvoteButton}>
                        <Text style={styles.upvoteArrow}>▲</Text>
                        <Text style={styles.upvoteCount}>
                          {item.upvotes?.length ?? 0}
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
                This story hasn’t been continued yet. Choose a character and
                write the next part of the story.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Dropdown */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={[styles.menu, IS_WEB ? styles.menuWeb : styles.menuMobile]}>
            <FlatList
              data={story.characters}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.option}
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
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { alignItems: "center", paddingVertical: 24 },

  container: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
    ...(IS_WEB && { boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }),
  },

  title: { fontSize: 26, fontWeight: "800", marginBottom: 12 },
  content: { fontSize: 16, lineHeight: 26, color: "#334155", marginBottom: 28 },

  label: { fontSize: 14, fontWeight: "600", color: "#475569" },

  dropdown: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 26,
  },

  dropdownText: { fontSize: 16 },
  placeholder: { color: "#94A3B8" },

  sectionLabel: { fontSize: 15, fontWeight: "600", marginBottom: 10 },

  textarea: {
    minHeight: 150,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  focusedField: { borderColor: "#2563EB" },

  primaryButton: {
    marginTop: 28,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },

  primaryButtonDisabled: { backgroundColor: "#94A3B8" },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 16 },

  turnsWrapper: { marginTop: 36 },
  turnsTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },

  turnCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },

  turnHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },

  turnIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  turnCharacter: { color: "#2563EB", fontWeight: "700", fontSize: 14 },
  turnAuthor: { color: "#64748B", fontSize: 13 },

  turnRight: {
    alignItems: "flex-end",
    gap: 6,
  },

  turnTime: { fontSize: 12, color: "#94A3B8" },

  upvoteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  upvoteArrow: {
    fontSize: 12,
    fontWeight: "900",
    color: "#2563EB",
  },

  upvoteCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563EB",
  },

  turnContent: { fontSize: 15, lineHeight: 24, color: "#334155" },

  emptyState: {
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },

  emptyTitle: { fontWeight: "700", marginBottom: 6 },
  emptyText: { color: "#64748B", textAlign: "center", lineHeight: 22 },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.35)",
    justifyContent: IS_WEB ? "center" : "flex-end",
    padding: 16,
  },

  menu: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    maxHeight: 360,
  },

  menuMobile: { width: "100%" },
  menuWeb: { width: Math.min(width - 32, 420), alignSelf: "center" },

  option: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  optionText: { fontSize: 16 },
});
