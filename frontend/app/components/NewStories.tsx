import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function NewStoriesBanner({
  count,
  onPress,
}: {
  count: number;
  onPress: () => void;
}) {
  if (count === 0) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.text}>
          {count} new {count === 1 ? "story" : "stories"} available
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 6,
    alignSelf: "center",
    zIndex: 10,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  text: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
});
