import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";

export default function NotFoundScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isLargeScreen = width >= 768;

  return (
    <View style={styles.container}>
      <Text style={[styles.code, isLargeScreen && styles.codeLarge]}>
        404
      </Text>

      <Text style={[styles.title, isLargeScreen && styles.titleLarge]}>
        Page Not Found
      </Text>

      <Text style={[styles.description, isLargeScreen && styles.descriptionLarge]}>
        The page you’re looking for doesn’t exist or has been moved.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => router.replace("/")}
      >
        <Text style={styles.buttonText}>Go Home</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0f172a", // dark neutral
  },

  code: {
    fontSize: 72,
    fontWeight: "800",
    color: "#38bdf8",
    marginBottom: 8,
  },

  codeLarge: {
    fontSize: 96,
  },

  title: {
    fontSize: 22,
    fontWeight: "600",
    color: "#f8fafc",
    marginBottom: 6,
    textAlign: "center",
  },

  titleLarge: {
    fontSize: 28,
  },

  description: {
    fontSize: 15,
    color: "#cbd5f5",
    textAlign: "center",
    marginBottom: 24,
    maxWidth: 420,
    lineHeight: 22,
  },

  descriptionLarge: {
    fontSize: 17,
    lineHeight: 26,
  },

  button: {
    backgroundColor: "#38bdf8",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonText: {
    color: "#020617",
    fontSize: 16,
    fontWeight: "600",
  },
});
