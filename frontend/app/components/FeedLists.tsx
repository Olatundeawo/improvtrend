import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from "react-native"
import formatTime from "../hooks/time"
import FeedSkeleton from "./FeedSkeleton"
import type { Story } from "./type"

const FONT = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  title: "PlayfairDisplay_600SemiBold",
}

const COLORS = {
  primary: "#1E3A8A", 
  accent: "#F97316", 
  accentLight: "#FFF7ED", 
  blue: "#3B82F6", 
  blueLight: "#EFF6FF", 
  text: {
    primary: "#111827",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
  },
  border: "#E5E7EB",
  background: "#FFFFFF",
  surface: "#F9FAFB",
}

type FeedListProps = {
  stories: Story[]
  onStoryPress: (id: string) => void
  isLoading?: boolean
  refreshing?: boolean
  onRetry?: () => void
  onRefresh?: () => void
  onEndReached?: () => void
  hasMore?: boolean
}


export default function FeedList({ stories, onStoryPress, isLoading, onRetry, refreshing, onRefresh, onEndReached, hasMore }: FeedListProps) {
  const { width } = useWindowDimensions()
  const isTabletOrWeb = width >= 768

  if (isLoading && stories.length === 0) {
    return <FeedSkeleton count={5} />
  }

  if (!isLoading && stories.length === 0) {
    return <EmptyFeed onRetry={onRetry} />
  }

  return (
    <FlatList
    data={stories}
    keyExtractor={(item) => item.id}
    showsVerticalScrollIndicator={false}
  
    onEndReached={() => {
      if (!hasMore || isLoading || refreshing) return;
      onEndReached();
    }}
    onEndReachedThreshold={0.7}
  
    ListFooterComponent={() => { if (hasMore  && stories.length > 0) {
      return ( <View style={styles.footer}>
         <Text style={styles.footerText}>Loading more stories…</Text> 
         </View> ); 
         } 
         if (!hasMore && stories.length > 0)
           { return ( <View style={styles.footer}>
             <Text style={styles.footerDone}>
              You’re all caught up 🎉</Text> </View> );
               } 
               return null; 
              }
            }
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.accent}
            colors={[COLORS.accent, COLORS.primary]}
          />
        ) : undefined
      }
      contentContainerStyle={[styles.list, isTabletOrWeb && styles.listWide]}
      renderItem={({ item }) => (
        <View style={[styles.card, isTabletOrWeb && styles.cardWide]}>
          <View style={styles.header}>
            <View style={styles.userInfo}>
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{item.user.username.charAt(0).toUpperCase()}</Text>
              </View>
              <View>
                <Text style={styles.username}>{item.user.username}</Text>
                <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.openButton} onPress={() => onStoryPress(item.id)} activeOpacity={0.85}>
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
                  <Text style={styles.characterText}>{char.name}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.engagementRow}>
            <View style={styles.engagementGroup}>
              <View style={styles.engagementItem}>
                <Text style={styles.engagementCount}>{item.comments?.length ?? 0}</Text>
                <Text style={styles.engagementLabel}>{(item.comments?.length ?? 0) <= 1 ? "Comment" : "Comments"}</Text>
              </View>

              <View style={styles.engagementItem}>
                <Text style={styles.engagementCount}>{item.turns?.length ?? 0}</Text>
                <Text style={styles.engagementLabel}>
                  {(item.turns?.length ?? 0) <= 1 ? "Contribution" : "Contributions"}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.ctaButton} onPress={() => onStoryPress(item.id)} activeOpacity={0.9}>
              <Text style={styles.ctaText}>Contribute</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  )
}

function EmptyFeed({ onRetry }: { onRetry?: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptySubText}>We couldn't load stories. Please try again.</Text>

      {onRetry && (
        <TouchableOpacity activeOpacity={0.85} onPress={() => onRetry()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8,
  },

  listWide: {
    paddingHorizontal: 24,
  },

  card: {
    backgroundColor: COLORS.background,
    padding: 18,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  cardWide: {
    maxWidth: 720,
    alignSelf: "center",
    width: "100%",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 16,
    fontFamily: FONT.semibold,
    color: COLORS.background,
  },

  /** ─── META ─── */
  username: {
    fontSize: 14,
    fontFamily: FONT.semibold,
    color: COLORS.text.primary,
  },

  time: {
    fontSize: 11,
    fontFamily: FONT.regular,
    color: COLORS.text.secondary,
    marginTop: 2,
  },

  /** ─── ACTIONS ─── */
  openButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: COLORS.blueLight,
    borderWidth: 1,
    borderColor: COLORS.blue + "20",
  },

  openText: {
    fontSize: 13,
    fontFamily: FONT.semibold,
    color: COLORS.blue,
  },

  /** ─── STORY ─── */
  title: {
    fontSize: 19,
    fontFamily: FONT.title,
    color: COLORS.primary,
    marginBottom: 8,
    lineHeight: 26,
  },

  content: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.text.secondary,
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
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  characterText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: COLORS.text.secondary,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
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
    gap: 24,
  },

  engagementItem: {
    flexDirection: "row",
    alignItems: "center",
  },

  engagementCount: {
    fontSize: 14,
    fontFamily: FONT.bold,
    color: COLORS.primary,
    marginRight: 4,
  },

  engagementLabel: {
    fontSize: 12,
    fontFamily: FONT.regular,
    color: COLORS.text.secondary,
  },

  /** ─── CTA ─── */
  ctaButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  ctaText: {
    color: COLORS.background,
    fontSize: 14,
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

  emptySubText: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.text.secondary,
    marginTop: 8,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  retryText: {
    color: COLORS.background,
    fontSize: 14,
    fontFamily: FONT.semibold,
  },
  footer:
   { paddingVertical: 24,
     alignItems: "center",
     },
      footerText: 
      { fontSize: 14, 
        color: COLORS.text.secondary,
         fontFamily: FONT.medium,
         },
          footerDone:
           { fontSize: 14,
             color: COLORS.primary,
              fontFamily: FONT.semibold, 

  },
})