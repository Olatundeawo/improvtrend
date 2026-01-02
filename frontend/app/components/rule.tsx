import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function Rules() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How to Use the App</Text>
      <Text style={styles.subtitle}>
        Follow these guidelines to get the best experience.
      </Text>

      {/* Rule 1 */}
      <View style={styles.card}>
        <Text style={styles.ruleTitle}>1. Browsing Stories</Text>
        <Text style={styles.ruleText}>
          The Feed displays all available stories. Scroll through the Feed and
          tap on any story to view its details and contributions. Only active and
          published stories appear in the Feed.
        </Text>
      </View>

      {/* Rule 2 */}
      <View style={styles.card}>
        <Text style={styles.ruleTitle}>2. Creating a Turn</Text>
        <Text style={styles.ruleText}>
          A Turn is a contribution that continues a story. Open a story from the
          Feed, select a character, and submit content that naturally continues
          the story. Turns appear in chronological order.
        </Text>
      </View>

      {/* Rule 3 */}
      <View style={styles.card}>
        <Text style={styles.ruleTitle}>3. Using Characters</Text>
        <Text style={styles.ruleText}>
          Each story contains predefined characters. You must select one
          character per turn. Characters represent unique voices and cannot be
          duplicated within the same turn.
        </Text>
      </View>

      {/* Rule 4 */}
      <View style={styles.card}>
        <Text style={styles.ruleTitle}>4. Upvoting Turns</Text>
        <Text style={styles.ruleText}>
          Upvotes help highlight quality contributions. You can upvote a turn
          once. Upvotes cannot be reversed after submission.
        </Text>
      </View>

      <Text style={styles.footer}>
        Collaborative storytelling works best when everyone follows these rules.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#F9FAFB",
  },

  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  ruleTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#1F2937",
  },

  ruleText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#374151",
  },

  footer: {
    marginTop: 24,
    fontSize: 12,
    textAlign: "center",
    color: "#9CA3AF",
  },
});
