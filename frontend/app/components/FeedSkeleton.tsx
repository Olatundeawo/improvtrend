import { StyleSheet, View } from "react-native";

interface FeedSkeletonProps {
  count?: number;
}

export default function FeedSkeleton({ count = 5 }: FeedSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header} />
          <View style={styles.meta} />
          <View style={styles.preview} />
          <View style={styles.characters} />
          <View style={styles.actions} />
        </View>
      ))}
    </>
  );
}



const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 14,
  },
  header: {
    width: "60%",
    height: 18,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 8,
  },
  meta: {
    width: "40%",
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginBottom: 10,
  },
  preview: {
    width: "100%",
    height: 48,
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 10,
  },
  characters: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
  },
  actions: {
    flexDirection: "row",
    width: "50%",
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
  },
});
