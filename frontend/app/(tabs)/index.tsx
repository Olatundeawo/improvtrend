import { StyleSheet, useWindowDimensions, View } from "react-native";
import FeedHeader from "../components/FeedHeader";
import FeedList from "../components/FeedLists";
import FeedTab from "../components/FeedTabs";
import useFeed from "../hooks/useFeed";

export default function FeedScreen() {
  const {
    stories,
    activeTab,
    setActiveTab,
    handleStoryId,
    loading,
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
        <FeedTab
          value={activeTab}
          onChange={setActiveTab}
        />

        <FeedList
          stories={stories}
          onStoryPress={handleStoryId}
          isLoading={loading}
          onRetry={loadMore}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
   screen: { flex: 1,
     backgroundColor: "#F9FAFB", }, 
   contentWrapper: { flex: 1,
     width: "100%", paddingHorizontal: 16,
      paddingTop: 12,
     },
    contentWrapperLarge: { maxWidth: 1200,
       alignSelf: "center",
        paddingHorizontal: 24,
         paddingTop: 20, },
   }

);
