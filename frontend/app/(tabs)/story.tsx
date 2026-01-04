
import { useRouter } from "expo-router"
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { useAuth } from "../context/auth"

export default function Story() {
  const { user } = useAuth()
  const router = useRouter()

  const stories = user?.stories || []

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Stories</Text>
        <Text style={styles.subtitle}>Stories you've created and contributed to</Text>
      </View>

      {/* Empty State */}
      {stories.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Text style={styles.emptyIcon}>📖</Text>
          </View>
          <Text style={styles.emptyTitle}>No stories yet</Text>
          <Text style={styles.emptyText}>
            Start creating amazing collaborative stories with your community. Your stories will appear here.
          </Text>

          <TouchableOpacity style={styles.ctaButton} onPress={() => router.push("/")}>
            <Text style={styles.ctaText}>Explore Stories</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Stories List */
        <FlatList
          data={stories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.storyCard}
              onPress={() => router.push(`components/StoryId?id=${item.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.storyTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.storyMeta}>{item.turns?.length || 0} turns</Text>
                  </View>
                  <Text style={styles.viewText}>View →</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 15,
    color: "#737373",
    marginTop: 6,
    lineHeight: 22,
  },

  listContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },

  storyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f0f0f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  cardContent: {
    padding: 20,
  },

  cardHeader: {
    marginBottom: 16,
  },

  storyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 26,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  metaBadge: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  storyMeta: {
    fontSize: 13,
    color: "#525252",
    fontWeight: "500",
  },

  viewText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingBottom: 80,
  },

  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },

  emptyIcon: {
    fontSize: 40,
  },

  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 15,
    color: "#737373",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },

  ctaButton: {
    marginTop: 32,
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: "#3b82f6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
})
