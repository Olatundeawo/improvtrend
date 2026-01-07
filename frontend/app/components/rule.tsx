import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native"

export default function RulesScreen() {
  const router = useRouter()
  const { width } = useWindowDimensions()

  const isLargeScreen = width >= 768
  const isExtraLarge = width >= 1024

  // Icon mapping for each rule
  const ruleIcons = ["book-outline", "pencil-outline", "people-outline", "thumbs-up-outline", "create-outline"]

  const rules = [
    {
      title: "1. Browsing Stories",
      text: "The Feed displays all available stories. Scroll through the Feed and tap on any story to view its details and contributions. Only active and published stories appear in the Feed.",
      icon: ruleIcons[0],
    },
    {
      title: "2. Creating a Turn",
      text: "A Turn is a contribution that continues a story. Open a story from the Feed, select a character, and submit content that naturally continues the story. Turns appear in chronological order.",
      icon: ruleIcons[1],
    },
    {
      title: "3. Using Characters",
      text: "Each story contains predefined characters. You must select one character per turn. Characters represent unique voices and cannot be duplicated within the same turn.",
      icon: ruleIcons[2],
    },
    {
      title: "4. Upvoting Turns",
      text: "Upvotes help highlight quality contributions. You can upvote a turn once. Upvotes can be reversed if you change your mind.",
      icon: ruleIcons[3],
    },
    {
      title: "5. Creating a Story",
      text: 'You can create a story by tapping the "Create Story" button. You need to enter a title, define the characters separated by commas, and write the story content. Once created, your story will be added to the Feed and can be viewed by others.',
      icon: ruleIcons[4],
    },
  ]

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingHorizontal: isExtraLarge ? 48 : isLargeScreen ? 32 : 20 }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.6 }]}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={24} color="#0066FF" />
        </Pressable>

        <Text style={styles.headerTitle}>How to Use the App</Text>
      </View>

      <Text style={styles.subtitle}>
        Master the essentials and unlock the full potential of collaborative storytelling.
      </Text>

      {/* Rules Grid */}
      <View style={[styles.rulesContainer, isLargeScreen && styles.rulesContainerDesktop]}>
        {rules.map((rule, index) => (
          <View key={index} style={[styles.card, isLargeScreen && styles.cardDesktop]}>
            <View style={styles.iconContainer}>
              <Ionicons name={rule.icon} size={28} color="#0066FF" />
            </View>
            <Text style={styles.ruleTitle}>{rule.title}</Text>
            <Text style={styles.ruleText}>{rule.text}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === "android" ? 32 : 20,
    paddingBottom: 48,
    backgroundColor: "#F8F9FB",
    alignItems: "center",
  },

  header: {
    width: "100%",
    maxWidth: 900,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },

  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0A0E27",
    letterSpacing: -0.5,
  },

  subtitle: {
    width: "100%",
    maxWidth: 900,
    fontSize: 16,
    color: "#5B6B7A",
    marginBottom: 32,
    lineHeight: 24,
    fontWeight: "500",
  },

  rulesContainer: {
    width: "100%",
    maxWidth: 900,
    gap: 16,
  },

  rulesContainerDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    marginBottom: 0,
    borderWidth: 1,
    borderColor: "#E5E8EE",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  cardDesktop: {
    width: "48%",
    marginBottom: 16,
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  ruleTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#0A0E27",
    lineHeight: 26,
  },

  ruleText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#475569",
    fontWeight: "400",
  },
})
