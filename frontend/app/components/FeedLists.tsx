import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import FeedSkeleton from "./FeedSkeleton";
import { Story } from "./type";
import formatTime from '../hooks/time'
import { useState } from 'react'
import { RefreshControl } from "react-native";

const FONT = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  title: "PlayfairDisplay_600SemiBold",
};



type FeedListProps = {
  stories: Story[];
  onStoryPress: (id: string) => void;
  isLoading?: boolean;
  refreshing?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
  
};

export default function FeedList({
  stories,
  onStoryPress,
  isLoading ,
  onRetry,
  refreshing,
  onRefresh,
}: FeedListProps) {
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width >= 768;

  if (isLoading) {
    return <FeedSkeleton count={5} />;
  }

  
  if (!isLoading && stories.length === 0) {
    return <EmptyFeed onRetry={onRetry}/>;
  }

  
  return (
    <FlatList
      data={stories}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={!!refreshing}
            onRefresh={onRefresh}
            tintColor="#4F46E5"
            colors={["#4F46E5"]}
          />
        ) : undefined
      }
      contentContainerStyle={[
        styles.list,
        isTabletOrWeb && styles.listWide,
      ]}
      renderItem={({ item }) => (
        <View
          style={[
            styles.card,
            isTabletOrWeb && styles.cardWide,
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.username}>
                {item.user.username}
              </Text>
              <Text style={styles.time}>
                {formatTime(item.createdAt)}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.openButton}
              onPress={() => onStoryPress(item.id)}
              activeOpacity={0.85}
            >
              <Text style={styles.openText}>Open</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>

          <Text style={styles.content} numberOfLines={3}>
            {item.content}
          </Text>

          {item.characters?.length > 0 && (
            <View style={styles.charactersWrapper}>
              {item.characters.map((char) => (
                <View key={char.id} style={styles.characterChip}>
                  <Text style={styles.characterText}>
                    {char.name}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.engagementRow}>
            <View style={styles.engagementGroup}>
              <View style={styles.engagementItem}>
                <Text style={styles.engagementCount}>
                  {item.comments?.length ?? 0}
                </Text>
                <Text style={styles.engagementLabel}>
                  {(item.comments?.length ?? 0) <=1 ? "Comment" : "Comments"}
                  
                </Text>
              </View>

              <View style={styles.engagementItem}>
                <Text style={styles.engagementCount}>
                  {item.turns?.length ?? 0}
                </Text>
                <Text style={styles.engagementLabel}>
                {(item.turns?.length ?? 0) <= 1 ? "Contribution" : "Contributions"}
                  
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => onStoryPress(item.id)}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaText}>Contribute</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}
function EmptyFeed({ onRetry }: { onRetry?: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptySubText}>
        We couldn’t load stories. Please try again.
      </Text>

      {onRetry && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onRetry()}
          style={styles.retryButton}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


  const styles = StyleSheet.create({
    list: {
      paddingVertical: 8,
    },
  
    listWide: {
      paddingHorizontal: 24,
    },
  
    card: {
      backgroundColor: "#FFFFFF",
      padding: 16,
      marginHorizontal: 12,
      marginVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
  
    cardWide: {
      maxWidth: 720,
      alignSelf: "center",
      width: "100%",
    },
  
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
  
    /** ─── META ─── */
    username: {
      fontSize: 13,
      fontFamily: FONT.semibold,
      color: "#111827",
    },
  
    time: {
      fontSize: 11,
      fontFamily: FONT.regular,
      color: "#6B7280",
      marginTop: 2,
    },
  
    /** ─── ACTIONS ─── */
    openButton: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: "#EEF2FF",
    },
  
    openText: {
      fontSize: 13,
      fontFamily: FONT.semibold,
      color: "#4F46E5",
    },
  
    /** ─── STORY ─── */
    title: {
      fontSize: 18,
      fontFamily: FONT.title,
      color: "#111827",
      marginBottom: 6,
      lineHeight: 24,
    },
  
    content: {
      fontSize: 14,
      fontFamily: FONT.regular,
      color: "#374151",
      lineHeight: 22,
      marginBottom: 12,
    },
  
    /** ─── CHARACTERS ─── */
    charactersWrapper: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
  
    characterChip: {
      backgroundColor: "#F3F4F6",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: "#E5E7EB",
    },
  
    characterText: {
      fontSize: 12,
      fontFamily: FONT.medium,
      color: "#374151",
    },
  
    divider: {
      height: 1,
      backgroundColor: "#E5E7EB",
      marginVertical: 14,
    },
  
    /** ─── ENGAGEMENT ─── */
    engagementRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 12,
    },
  
    engagementGroup: {
      flexDirection: "row",
      gap: 20,
    },
  
    engagementItem: {
      flexDirection: "row",
      alignItems: "center",
    },
  
    engagementCount: {
      fontSize: 13,
      fontFamily: FONT.semibold,
      color: "#111827",
      marginRight: 4,
    },
  
    engagementLabel: {
      fontSize: 12,
      fontFamily: FONT.regular,
      color: "#6B7280",
    },
  
    /** ─── CTA ─── */
    ctaButton: {
      backgroundColor: "#4F46E5",
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 10,
    },
  
    ctaText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontFamily: FONT.semibold,
    },
  
    /** ─── EMPTY ─── */
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 60,
      paddingHorizontal: 24,
    },
  
    emptyText: {
      fontSize: 16,
      fontFamily: FONT.semibold,
      color: "#111827",
      textAlign: "center",
    },
  
    emptySubText: {
      fontSize: 14,
      fontFamily: FONT.regular,
      color: "#6B7280",
      marginTop: 8,
      textAlign: "center",
    },
    retryButton: {
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: "#4F46E5",
    },
    
    retryText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    
  });
  

