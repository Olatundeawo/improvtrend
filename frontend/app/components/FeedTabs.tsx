import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";

type FeedTabValue = "trending" | "newest";

interface FeedTabProps {
  value: FeedTabValue;
  onChange: (value: FeedTabValue) => void;
}

const TABS: { label: string; value: FeedTabValue }[] = [
  { label: "Trending", value: "trending" },
  { label: "Newest", value: "newest" },
 
];

const { width } = Dimensions.get("window");
const IS_WEB = Platform.OS === "web";
const IS_SMALL_SCREEN = width < 380;

export default function FeedTab({ value, onChange }: FeedTabProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        {TABS.map((tab) => {
          const active = tab.value === value;

          return (
            <Pressable
              key={tab.value}
              onPress={() => onChange(tab.value)}
              style={({ pressed }) => [
                styles.tab,
                active && styles.activeTab,
                pressed && styles.pressedTab,
              ]}
            >
              <Text style={[styles.label, active && styles.activeLabel]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Create Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.createButton}
        onPress={() => router.push("/components/createStory")}
      >
        <Text style={styles.createText}>Create</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: IS_WEB ? 24 : 16,
    paddingVertical: 10,
    backgroundColor: "transparent",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
    gap: 12,
  },

  tabsWrapper: {
    flexDirection: "row",
    flex: 1,
    justifyContent: IS_WEB ? "flex-start" : "space-around",
    alignItems: "center",
  },

  tab: {
    paddingVertical: 10,
    paddingHorizontal: IS_SMALL_SCREEN ? 6 : 10,
    alignItems: "center",
  },

  pressedTab: {
    opacity: 0.7,
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
  },

  label: {
    fontSize: IS_SMALL_SCREEN ? 13 : 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  activeLabel: {
    color: "#2563EB",
    fontWeight: "700",
  },

  createButton: {
    paddingHorizontal: IS_SMALL_SCREEN ? 14 : 18,
    paddingVertical: IS_SMALL_SCREEN ? 8 : 10,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,

    ...(IS_WEB && {
      boxShadow: "0 6px 16px rgba(37,99,235,0.25)",
    }),
  },

  createText: {
    fontSize: IS_SMALL_SCREEN ? 12 : 13,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
});
