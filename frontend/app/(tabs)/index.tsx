import { StyleSheet, useWindowDimensions, View } from "react-native";
import FeedHeader from "../components/FeedHeader";
import FeedList from "../components/FeedLists";
import FeedTab from "../components/FeedTabs";
import useFeed from "../hooks/useFeed";
import Rules from "../components/rule";

export default function FeedScreen() {
  const {
    stories,
    activeTab,
    setActiveTab,
    handleStoryId,
    loading,
    refreshing,
    refreshFeed,
    loadMore,
  } = useFeed();

  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.contentWrapper,
          isLargeScreen && styles.contentWrapperLarge,
        ]}
      >
        {/* Main layout */}
        <View
          style={[
            styles.mainLayout,
            isLargeScreen && styles.mainLayoutLarge,
          ]}
        >
          {/* LEFT: Feed section */}
          <View style={styles.feedSection}>
            <FeedTab value={activeTab} onChange={setActiveTab} />

            <FeedList
              stories={stories}
              onStoryPress={handleStoryId}
              isLoading={loading}
              refreshing={refreshing}
              onRefresh={refreshFeed}
              onRetry={loadMore}
            />
          </View>

          {/* RIGHT: Rules (only on large screens) */}
          {isLargeScreen && (
            <View style={styles.rulesSection}>
              <Rules />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },

  contentWrapper: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  contentWrapperLarge: {
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  mainLayout: {
    flex: 1,
  },

  mainLayoutLarge: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 24,
  },

  feedSection: {
    flex: 1,
  },

  rulesSection: {
    width: 320,
    position: "sticky", // works on web
    top: 20,
  },
});
