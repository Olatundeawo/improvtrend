import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Rules({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>How to Use the App</Text>
        <Text style={styles.subtitle}>
          Follow these guidelines to get the best experience.
        </Text>

        <View style={styles.card}>
          <Text style={styles.ruleTitle}>1. Browsing Stories</Text>
          <Text style={styles.ruleText}>
            Browse the Feed and tap any story to view its details and
            contributions.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.ruleTitle}>2. Creating a Turn</Text>
          <Text style={styles.ruleText}>
            Open a story, select a character, and submit content that continues
            the story naturally.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.ruleTitle}>3. Using Characters</Text>
          <Text style={styles.ruleText}>
            Each turn requires one character. Characters represent unique
            voices.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.ruleTitle}>4. Upvoting Turns</Text>
          <Text style={styles.ruleText}>
            You can upvote a turn once to highlight quality contributions.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.ruleTitle}>5. Got story to share?</Text>
          <Text style={styles.ruleText}>
            Click on create at the top right corner in the feed section to share one.
          </Text>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>Got it</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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
  wrapper: {
    flex: 1,
    maxHeight: "100%",
  },
  
  closeButton: {
    marginTop: 16,
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 12,
  },
  
  closeText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
  
});
