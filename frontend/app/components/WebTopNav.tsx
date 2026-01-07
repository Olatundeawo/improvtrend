import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Pressable, View } from "react-native";

const navItems = [
  { icon: "newspaper-outline", href: "/" },
  { icon: "book-outline", href: "/story" },
  { icon: "person-outline", href: "/profile" },
];

export default function WebTopNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View
      style={{
        height: 56,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      {navItems.map((item) => {
        const active = pathname === item.href;

        return (
          <Pressable key={item.href} onPress={() => router.push(item.href)}>
            <Ionicons
              name={item.icon as any}
              size={22}
              color={active ? "#2563EB" : "#64748B"}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
