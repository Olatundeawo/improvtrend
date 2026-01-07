import { useRouter } from "expo-router"
import { Dimensions, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native"
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
        <Text style={styles.subtitle}>Stories you've created.</Text>
      </View>

      {/* Empty State */}
      {stories.length === 0 ? (
        <View style={styles.centerState}>
          <Text style={styles.emptyTitle}>No stories yet</Text>
          <Text style={styles.emptyText}>Start exploring and join stories to see them appear here.</Text>

          <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85} onPress={() => router.push("/")}>
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
              onPress={() => router.push(`components/StoryId?id=${item.id}`)}
            >
              <View style={styles.cardContent}>
                <Text style={styles.storyTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.storyMeta}>{item.turns?.length ?? 0} turns</Text>
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
    backgroundColor: "#fafaf9",
    maxWidth: isDesktop ? 1280 : "100%",
    alignSelf: "center",
    width: "100%",
  },

  
  header: {
    paddingHorizontal: responsivePadding(24),
    paddingTop: responsiveSize(40, 52, 64),
    paddingBottom: responsiveSize(28, 32, 40),
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e8e8e8",
  },

  title: {
    fontSize: responsiveSize(32, 40, 48),
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.4,
    lineHeight: 40,
  },

  subtitle: {
    marginTop: 8,
    fontSize: responsiveSize(15, 16, 17),
    color: "#717171",
    lineHeight: 24,
    fontWeight: "400",
  },

  /* ---------- LIST ---------- */
  listContent: {
    paddingHorizontal: responsivePadding(24),
    paddingTop: responsiveSize(28, 36, 44),
    paddingBottom: responsiveSize(52, 68, 84),
  },

  columnWrapper: {
    justifyContent: "space-between",
    gap: 24,
  },

  storyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    ...(isDesktop && {
      flex: 1,
      maxWidth: "48%",
    }),
  },

  cardContent: {
    padding: responsiveSize(24, 28, 32),
  },

  storyTitle: {
    fontSize: responsiveSize(18, 20, 23),
    fontWeight: "600",
    color: "#1a1a1a",
    lineHeight: 32,
    marginBottom: 22,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  metaBadge: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  storyMeta: {
    fontSize: 12,
    fontWeight: "500",
    color: "#636363",
  },

  viewText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3b82f6",
  },

  /* ---------- STATES ---------- */
  centerState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsivePadding(32),
  },

  loadingText: {
    fontSize: 15,
    color: "#717171",
    fontWeight: "500",
  },

  emptyTitle: {
    fontSize: responsiveSize(24, 28, 32),
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: 12,
  },

  emptyText: {
    fontSize: 15,
    color: "#717171",
    textAlign: "center",
    lineHeight: 26,
    maxWidth: 440,
    fontWeight: "400",
  },

  ctaButton: {
    marginTop: 36,
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  ctaText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
})
