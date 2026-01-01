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
import FeedSkeleton from "../components/FeedSkeleton";
import useStoryId from "../hooks/UseStoryId";
import useTurnId from "../hooks/useTurnId";

const { width } = Dimensions.get("window");
const IS_WEB = Platform.OS === "web";
const MAX_WIDTH = 720;

export default function StoryScreen() {
  const { story, loading } = useStoryId();
  const { turn } = useTurnId();

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
        {/* ===== Story ===== */}
        <Text style={styles.title}>{story.title}</Text>
        <Text style={styles.content}>{story.content}</Text>

        {/* ===== Character ===== */}
        <Text style={styles.label}>Choose a character</Text>

        <Pressable
          style={[
            styles.dropdown,
            isDropdownFocused && styles.focusedField,
          ]}
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

        {/* ===== Continue Story ===== */}
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

        {/* ===== Submit ===== */}
        <Pressable
          disabled={!canSubmit}
          style={[
            styles.primaryButton,
            !canSubmit && styles.primaryButtonDisabled,
          ]}
          onPress={() => {
            // submit logic here
            setText("");
            setTimeout(() => {
              scrollRef.current?.scrollToEnd({ animated: true });
            }, 300);
          }}
        >
          <Text style={styles.primaryButtonText}>Submit turn</Text>
        </Pressable>

        {/* ===== Turns Section ===== */}
        <View style={styles.turnsWrapper}>
          <Text style={styles.turnsTitle}>Community Contributions</Text>

          {hasTurns ? (
            <FlatList
              data={turns}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.turnCard}>
                  <View style={styles.turnMeta}>
                    <Text style={styles.turnCharacter}>
                      {item.character?.name}
                    </Text>
                    <Text style={styles.turnAuthor}>
                      by {item.user?.name}
                    </Text>
                  </View>

                  <Text style={styles.turnContent}>{item.content}</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>
                Be the first to contribute
              </Text>
              <Text style={styles.emptyText}>
                This story hasn’t been continued yet. Choose a character and
                write the next part of the story.
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ===== Dropdown Modal ===== */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View
            style={[
              styles.menu,
              IS_WEB ? styles.menuWeb : styles.menuMobile,
            ]}
          >
            <FlatList
              data={story.characters}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
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
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  scrollContent: {
    alignItems: "center",
    paddingVertical: 24,
  },

  container: {
    width: "100%",
    maxWidth: MAX_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 28,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,

    ...(IS_WEB && {
      boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    }),
  },

  stateText: {
    marginTop: 120,
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
    lineHeight: 34,
  },

  content: {
    fontSize: 16,
    color: "#334155",
    lineHeight: 26,
    marginBottom: 32,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 10,
  },

  section: {
    marginTop: 8,
  },

  dropdown: {
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 28,
  },

  dropdownText: {
    fontSize: 16,
    color: "#0F172A",
  },

  placeholder: {
    color: "#94A3B8",
  },

  textarea: {
    minHeight: 150,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    textAlignVertical: "top",

    ...(IS_WEB && {
      outlineStyle: "none",
    }),
  },

  focusedField: {
    borderColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,

    ...(IS_WEB && {
      boxShadow: "0 0 0 2px rgba(37,99,235,0.15)",
    }),
  },

  primaryButton: {
    marginTop: 28,
    height: 54,
    borderRadius: 16,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },

  primaryButtonDisabled: {
    backgroundColor: "#94A3B8",
    shadowOpacity: 0,
  },

  primaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

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
    overflow: "hidden",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },

  menuMobile: {
    width: "100%",
  },

  menuWeb: {
    width: Math.min(width - 32, 420),
    alignSelf: "center",
  },

  option: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },

  optionText: {
    fontSize: 16,
    color: "#0F172A",
  },

  turnsWrapper: {
    width: "100%",
    marginTop: 32,
  },

  turnsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 16,
  },

  turnCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  turnMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  turnCharacter: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },

  turnAuthor: {
    fontSize: 13,
    color: "#64748B",
  },

  turnContent: {
    fontSize: 15,
    lineHeight: 24,
    color: "#334155",
  },

  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
  },
});
