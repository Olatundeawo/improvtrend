import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import logo from "../../assets/images/logo.png";

export default function FeedHeader() {
  const router = useRouter();

  function openProfile() {
    router.push("/profile");
  }

  return (
    <View style={styles.container}>
      {/* Logo + Brand */}
      <View style={styles.brand}>
        <Image
          source={logo}
          style={styles.logoImage}
          resizeMode="contain"
        />
        <Text style={styles.logoText}>ImprovTrend</Text>
      </View>

      {/* Avatar */}
      <Pressable
        onPress={openProfile}
        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        style={({ pressed }) => [
          styles.avatarWrapper,
          pressed && styles.avatarPressed,
        ]}
      >
        <View style={styles.avatar} />
      </Pressable>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },

  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  logoImage: {
    width: 50,
    height: 60,
  },

  logoText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: "#111827",
  },

  avatarWrapper: {
    padding: 2,
    borderRadius: 18,
  },

  avatarPressed: {
    backgroundColor: "#EEF2FF",
  },

  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E0E7FF",
    borderWidth: 2,
    borderColor: "#C7D2FE",
  },
});
