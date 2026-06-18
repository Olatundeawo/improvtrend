import { StyleSheet, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FeedList from "../components/FeedLists";
import FeedTab from "../components/FeedTabs";
import NewStoriesBanner from "../components/NewStories";
import useFeed from "../hooks/useFeed";

export default function FeedScreen() {
  const {
    stories,
    initialLoading,
    activeTab,
    setActiveTab,
    handleStoryId,
    loading,
    refreshing,
    refreshFeed,
    hasMore,
    fetchMore,
    showNewStoriesBanner,
    newStoriesCount,
    applyNewStories,
  } = useFeed();

  const { width }    = useWindowDimensions();
  const insets       = useSafeAreaInsets();
  const isLargeScreen = width >= 1024;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View
        style={[
          styles.contentWrapper,
          isLargeScreen && styles.contentWrapperLarge,
        ]}
      >
        <FeedTab value={activeTab} onChange={setActiveTab} />

        {showNewStoriesBanner && (
          <NewStoriesBanner count={newStoriesCount} onPress={applyNewStories} />
        )}

        <View
          style={[
            styles.mainLayout,
            isLargeScreen && styles.mainLayoutLarge,
          ]}
        >
          <View style={styles.feedSection}>
            <FeedList
              stories={stories}
              onStoryPress={handleStoryId}
              isLoading={initialLoading}
              refreshing={refreshing}
              onRefresh={refreshFeed}
              onRetry={refreshFeed}
              onEndReached={fetchMore}
              hasMore={hasMore}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F1F5F9",  // neutral slate instead of purple-tinted
  },

  contentWrapper: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 0,
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
    paddingTop: 10,
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
  },
});