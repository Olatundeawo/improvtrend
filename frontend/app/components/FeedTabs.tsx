import {
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";

type FeedTabValue = "trending" | "newest" | "following";

interface FeedTabProps {
  value: FeedTabValue;
  onChange: (value: FeedTabValue) => void;
}

const TABS: { label: string; value: FeedTabValue }[] = [
  { label: "Trending", value: "trending" },
  { label: "Newest", value: "newest" },
  { label: "Following", value: "following" },
];

export default function FeedTab({ value, onChange }: FeedTabProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Left Tabs */}
      <View style={styles.tabsWrapper}>
        {TABS.map((tab) => {
          const active = tab.value === value;

          return (
            <Pressable
              key={tab.value}
              onPress={() => onChange(tab.value)}
              style={[styles.tab, active && styles.activeTab]}
            >
              <Text
                style={[styles.label, active && styles.activeLabel]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Right Create Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.createButton}
        onPress={() => router.push("/components/createStory")}
      >
        <Text style={styles.createText}>Create Story</Text>
      </TouchableOpacity>
    </View>
  );
}

const IS_WEB = Platform.OS === "web";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E7EB",
  },

  tabsWrapper: {
    flexDirection: "row",
    flex: 1,
    gap: 20,
  },

  tab: {
    paddingVertical: 10,
  },

  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2563EB",
  },

  label: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  activeLabel: {
    color: "#2563EB",
    fontWeight: "700",
  },

  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,

    ...(IS_WEB && {
      boxShadow: "0 6px 14px rgba(37,99,235,0.25)",
    }),
  },

  createText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
