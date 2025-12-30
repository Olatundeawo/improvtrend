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

type FeedListProps = {
  stories: Story[];
  onStoryPress: (id: string) => void;
  isLoading?: boolean;
};


function formatTime(date: string | Date) {
  const created = new Date(date);
  const diffSeconds = Math.floor(
    (Date.now() - created.getTime()) / 1000
  );

  // Less than 24 hours → relative time
  if (diffSeconds < 86400) {
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const minutes = Math.floor(diffSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  }

  // More than 24 hours → date format (Dec 29)
  return created.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}


export default function FeedList({
  stories,
  onStoryPress,
  isLoading = false
}: FeedListProps) {
  const { width } = useWindowDimensions();
  const isTabletOrWeb = width >= 768;
  if (isLoading) {
    return <FeedSkeleton count={5} />;

  }
  if (isLoading && stories.length === 0) {
    return <EmptyFeed />;
  }

  return (
    <FlatList
      data={stories}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
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
                  Comments
                </Text>
              </View>

              <View style={styles.engagementItem}>
                <Text style={styles.engagementCount}>
                  {item.turns?.length ?? 0}
                </Text>
                <Text style={styles.engagementLabel}>
                  Contributions
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => onStoryPress(item.id)}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaText}>
                Contribute
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
}
function EmptyFeed() {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No stories to display.</Text>
        <Text style={styles.emptySubText}>
          Start a story or follow other writers to see their stories here.
        </Text>
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

  username: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },

  time: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 2,
  },

  openButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#EEF2FF",
  },

  openText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4F46E5",
  },

  title: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },

  content: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 22,
    marginBottom: 12,
  },


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
    fontWeight: "500",
    color: "#374151",
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 14,
  },

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
    fontWeight: "600",
    color: "#111827",
    marginRight: 4,
  },

  engagementLabel: {
    fontSize: 12,
    color: "#6B7280",
  },

  ctaButton: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },

  ctaText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 60,
        paddingHorizontal: 24,
      },
      emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#111827",
        textAlign: "center",
      },
      emptySubText: {
        fontSize: 14,
        color: "#6B7280",
        marginTop: 8,
        textAlign: "center",
      },
});


