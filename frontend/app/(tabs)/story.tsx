import { Text, View } from "react-native";
import useStoryId from "../hooks/UseStoryId";

export default function StoryScreen() {
  const { story, loading } = useStoryId();

  if (loading) return <Text>Loading...</Text>;
  if (!story) return <Text>Story not found</Text>;

  console.log("This is the story:", story)

  return (
    <View>
      <Text>{story.title}</Text>
      <Text>{story.content}</Text>
    </View>
  );
}
