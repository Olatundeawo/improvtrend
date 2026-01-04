
import { StyleSheet, useWindowDimensions, View } from "react-native"
import FeedList from "../components/FeedLists"
import FeedTab from "../components/FeedTabs"
import Rules from "../components/rule"
import useFeed from "../hooks/useFeed"

export default function FeedScreen() {
  const {
    stories,
    activeTab,
    setActiveTab,
    handleStoryId,
    loading,
    refreshing,
    refreshFeed,
    hasMore,
    fetchMore
  } = useFeed()

  const { width } = useWindowDimensions()
  const isLargeScreen = width >= 1024

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.contentWrapper,
          isLargeScreen && styles.contentWrapperLarge,
        ]}
      >
       
        <FeedTab value={activeTab} onChange={setActiveTab} />

        
        <View
          style={[
            styles.mainLayout,
            isLargeScreen && styles.mainLayoutLarge,
          ]}
        >
          {/* FEED (SCROLLS) */}
          <View style={styles.feedSection}>
          <FeedList
          stories={stories}
          onStoryPress={handleStoryId}
          isLoading={loading}
          refreshing={refreshing}
          onRefresh={refreshFeed}
          onRetry={refreshFeed}
          onEndReached={fetchMore}
          hasMore={true}
        />

          </View>

          {/* RULES (DESKTOP ONLY) */}
          {isLargeScreen && (
            <View style={styles.rulesSection}>
              <Rules />
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FAF5FF",
  },

  contentWrapper: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 12,
    overflow: "hidden",
  },

  contentWrapperLarge: {
    flex: 1,
    maxWidth: 1280,
    alignSelf: "center",
    paddingHorizontal: 32,
    paddingTop: 24,
    overflow: "hidden",
  },

  mainLayout: {
    flex: 1,
    paddingTop: 16,
    minHeight: 0,
  },

  mainLayoutLarge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 28,
    paddingTop: 20,
    minHeight: 0,
  },

  feedSection: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    shadowColor: "#5B21B6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },

  rulesSection: {
    width: 340,
    flexShrink: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#5B21B6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
})
