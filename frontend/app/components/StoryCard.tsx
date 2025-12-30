import { Pressable, StyleSheet, Text, View } from "react-native";
import { FeedStory } from "./type";



interface StoryCardProps {
    story: FeedStory;
    onPress: (storyId: string) => void
}

export default function Storycard ({ story, onPress}: StoryCardProps) {
    return (
        <Pressable
        onPress={() => onPress(story.storyId)}>
            {/* {renderHeader(story)}
            {renderMeta(story)}
            {renderPreview(story)}
            {renderCharacters(story)}
            {renderActions(story)} */}
        </Pressable>
    )
}

function renderHeader(story: FeedStory) {
    return (
        <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>
                {story.title}
            </Text>

            <View style={[styles.badge, styles[`badge_${story.status}`]]}>
                <Text style={styles.badgeText}>{story.status}</Text>
            </View>
        </View>
    )
}


function renderMeta(story: FeedStory) {
    return (
      <Text style={styles.meta}>
        • {story.totalTurns} turns •{" "}
        {story.totalContributors} writers • {story.lastUpdatedAt}
      </Text>
    );
  }
  

function renderPreview(story: FeedStory) {
    return (
      <Text style={styles.preview} numberOfLines={3}>
        {story.lastTurnPreview}
      </Text>
    );
  }


function renderCharacters(story: FeedStory) {
    if (story.activeCharacters.length === 0) return null;

  const visible = story.activeCharacters.slice(0, 3);
  const extra = story.activeCharacters.length - visible.length;

  return (
    <View style={styles.characters}>
      {visible.map((char) => (
        <View key={char} style={styles.chip}>
          <Text style={styles.chipText}>{char}</Text>
        </View>
      ))}
      {extra > 0 && (
        <View style={styles.chip}>
          <Text style={styles.chipText}>+{extra}</Text>
        </View>
      )}
    </View>
  );
}


function renderActions(story: FeedStory) {
    return (
      <View style={styles.actions}>
        <Text style={styles.actionText}>↑ {story.upvoteCount}</Text>
        <Text style={styles.actionText}>💬 {story.commentCount}</Text>
        <Text style={styles.view}>View →</Text>
      </View>
    );
  }

const styles = StyleSheet.create({
    container: {
      backgroundColor: "green",
      padding: 16,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: "#E5E7EB",
    },
  
    pressed: {
      opacity: 0.95,
    },
  
    header: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
  
    title: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600",
      color: "#111827",
      marginRight: 8,
      lineHeight: 22,
    },
  
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
  
    badge_open: {
      backgroundColor: "#DCFCE7",
    },
  
    badge_paused: {
      backgroundColor: "#E5E7EB",
    },
  
    badge_completed: {
      backgroundColor: "#FEF3C7",
    },
  
    badgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: "#374151",
      textTransform: "capitalize",
    },
  
    meta: {
      marginTop: 4,
      fontSize: 12,
      color: "#6B7280",
    },
  
    preview: {
      marginTop: 10,
      fontSize: 14,
      lineHeight: 20,
      color: "#374151",
    },
  
    characters: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 10,
    },
  
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: "#F3F4F6",
      borderRadius: 999,
      marginRight: 6,
      marginBottom: 6,
    },
  
    chipText: {
      fontSize: 12,
      color: "#374151",
      fontWeight: "500",
    },
  
    actions: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 12,
    },
  
    actionText: {
      fontSize: 13,
      color: "#6B7280",
      marginRight: 16,
    },
  
    view: {
      marginLeft: "auto",
      fontSize: 13,
      fontWeight: "600",
      color: "#111827",
    },
  });