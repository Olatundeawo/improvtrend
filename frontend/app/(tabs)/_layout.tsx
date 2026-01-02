import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import FeedHeader from "../components/FeedHeader"

const IS_WEB = Platform.OS === "web";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: "#FFFFFF",
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          height: IS_WEB ? 64 : 60,
          paddingBottom: IS_WEB ? 12 : 6,
          paddingTop: 6,
        },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
        tabBarShowLabel: false,
      }}
    >
      {/* FEED */}
      <Tabs.Screen
        name="index"
        options={{
          header: () => <FeedHeader />,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "newspaper" : "newspaper-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* STORY */}
      <Tabs.Screen
        name="story"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
