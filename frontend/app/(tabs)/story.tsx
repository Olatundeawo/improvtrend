// import { useSearchParams } from "expo-router";
// import { useEffect, useState } from "react";
// import { ScrollView, StyleSheet, Text, View } from "react-native";
// import CommentInput from "../../components/story/CommentInput";
// import CommentList from "../../components/story/CommentList";
// import Storycard from "../components/StoryCard";
// import { FeedStory } from "../components/type";
// import { mockFeedStories } from "../mock/mockFeedStories";

// export default function StoryScreen() {
//   const { id } = useSearchParams<{ id: string }>();

//   const [story, setStory] = useState<FeedStory | null>(null);
//   const [upvotes, setUpvotes] = useState(0);
//   const [comments, setComments] = useState<string[]>([]);

//   useEffect(() => {
//     const stories = mockFeedStories();
//     const selectedStory = stories.find((s) => s.storyId === id);
//     if (selectedStory) {
//       setStory(selectedStory);
//       setUpvotes(selectedStory.upvoteCount);
//     }
//   }, [id]);

//   if (!story) {
//     return (
//       <View style={styles.emptyContainer}>
//         <Text style={styles.emptyText}>Story not found.</Text>
//       </View>
//     );
//   }

//   const handleUpvote = () => setUpvotes(upvotes + 1);

//   const handleAddComment = (text: string) => setComments([text, ...comments]);

//   return (
//     <ScrollView style={styles.container} contentContainerStyle={styles.content}>
//       {/* Reuse StoryCard for consistent UI */}
//       <Storycard
//         story={{ ...story, upvoteCount: upvotes, commentCount: comments.length }}
//         onPress={() => {}}
//       />

//       {/* Add new comment */}
//       <CommentInput onSubmit={handleAddComment} />

//       {/* List of comments */}
//       <CommentList comments={comments} />
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F9FAFB" },
//   content: { padding: 16 },
//   emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
//   emptyText: { fontSize: 16, color: "#6B7280" },
// });
