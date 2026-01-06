import { useRouter } from "expo-router"
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native"
import useUserStories from "../hooks/useUserStories"

const { width } = Dimensions.get("window")
const isSmallDevice = width < 375
const isTablet = width >= 768
const isDesktop = width >= 1024

const responsiveSize = (mobile: number, tablet?: number, desktop?: number) => {
  if (isDesktop && desktop) return desktop
  if (isTablet && tablet) return tablet
  return isSmallDevice ? mobile * 0.9 : mobile
}

const responsivePadding = (mobile: number) => {
  if (isDesktop) return mobile * 2
  if (isTablet) return mobile * 1.5
  return mobile
}

export default function Story() {
  const router = useRouter()
  const { stories, loading } = useUserStories()

  if (loading) {
    return (
      <View style={styles.centerState}>
        <Text style={styles.loadingText}>Loading your stories…</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Stories</Text>
        <Text style={styles.subtitle}>
          Stories you’ve created or contributed to
        </Text>
      </View>

      {/* Empty State */}
      {stories.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>No stories yet</Text>
          <Text style={styles.emptyText}>
            Start exploring and join stories to see them appear here.
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            activeOpacity={0.85}
            onPress={() => router.push("/")}
          >
            <Text style={styles.ctaText}>Explore Stories</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={stories}
          keyExtractor={(item) => item.id}
          numColumns={isDesktop ? 2 : 1}
          key={isDesktop ? "desktop" : "mobile"}
          columnWrapperStyle={isDesktop ? styles.columnWrapper : undefined}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.storyCard}
              onPress={() =>
                router.push(`components/StoryId?id=${item.id}`)
              }
            >
              <View style={styles.cardContent}>
                <Text style={styles.storyTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.storyMeta}>
                      {item.turns?.length ?? 0} turns
                    </Text>
                  </View>

                  <Text style={styles.viewText}>Open →</Text>
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
    backgroundColor: "#f8fafc",
    maxWidth: isDesktop ? 1200 : "100%",
    alignSelf: "center",
    width: "100%",
  },

  /* ---------- HEADER ---------- */
  header: {
    paddingHorizontal: responsivePadding(24),
    paddingTop: responsiveSize(36, 48, 56),
    paddingBottom: responsiveSize(24, 28, 32),
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },

  title: {
    fontSize: responsiveSize(30, 38, 44),
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.6,
  },

  subtitle: {
    marginTop: 6,
    fontSize: responsiveSize(15, 16, 18),
    color: "#64748b",
    lineHeight: 26,
  },

  /* ---------- LIST ---------- */
  listContent: {
    paddingHorizontal: responsivePadding(24),
    paddingTop: responsiveSize(24, 28, 32),
    paddingBottom: responsiveSize(48, 64, 80),
  },

  columnWrapper: {
    justifyContent: "space-between",
    gap: 20,
  },

  storyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    ...(isDesktop && {
      flex: 1,
      maxWidth: "48%",
    }),
  },

  cardContent: {
    padding: responsiveSize(20, 24, 28),
  },

  storyTitle: {
    fontSize: responsiveSize(18, 20, 22),
    fontWeight: "700",
    color: "#111827",
    lineHeight: 30,
    marginBottom: 20,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  metaBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },

  storyMeta: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },

  viewText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563eb",
  },

  /* ---------- STATES ---------- */
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsivePadding(32),
  },

  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },

  emptyTitle: {
    fontSize: responsiveSize(22, 26, 30),
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 420,
  },

  ctaButton: {
    marginTop: 32,
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 18,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },

  ctaText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
})
