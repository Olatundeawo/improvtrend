import { StyleSheet, useWindowDimensions, View } from "react-native";
import FeedTab from "../components/FeedTabs";
import FeedList from "../components/FeedLists";
import Rules from "../components/rule";
import useFeed from "../hooks/useFeed";

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

  const { width, height } = useWindowDimensions();
  const isLargeScreen = width >= 768;

  return (
    <View style={styles.screen}>
      <View
        style={[
          styles.contentWrapper,
          isLargeScreen && styles.contentWrapperLarge,
        ]}
      >
        {/* FULL-WIDTH TAB */}
        <FeedTab value={activeTab} onChange={setActiveTab} />

        {/* MAIN CONTENT */}
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
              onRetry={loadMore}
            />
          </View>

          {/* RULES (STATIC) */}
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
    height: "100vh", 
    backgroundColor: "#F9FAFB",
  },

  contentWrapper: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 16,
  },

  contentWrapperLarge: {
    maxWidth: 1200,
    alignSelf: "center",
    paddingHorizontal: 24,
  },

  mainLayout: {
    flex: 1,
  },

  mainLayoutLarge: {
    flex: 1,
    flexDirection: "row",
    alignItems: "stretch", 
    gap: 24,
  },

  feedSection: {
    flex: 1,
    minHeight: 0, 
  },

  rulesSection: {
    width: 320,
    flexShrink: 0,
  },
});
