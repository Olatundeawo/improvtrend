
import { Ionicons } from "@expo/vector-icons"
import { usePathname, useRouter } from "expo-router"
import { Pressable, Text, View } from "react-native"

const navItems = [
  { label: "Feed", icon: "newspaper-outline", href: "/" },
  { label: "Story", icon: "book-outline", href: "/story" },
  { label: "Profile", icon: "person-outline", href: "/profile" },
]

export default function WebSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <View
      style={{
        width: 260,
        backgroundColor: "#FFFFFF",
        borderRightWidth: 2,
        borderRightColor: "#a855f7",
        paddingTop: 24,
        backgroundColor: "#fafafa",
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "800",
          paddingHorizontal: 16,
          marginBottom: 32,
          background: "linear-gradient(135deg, #a855f7 0%, #ec4899 25%, #f97316 50%, #eab308 75%, #06b6d4 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: -0.5,
        }}
      >
        ImprovTrend
      </Text>

      {navItems.map((item) => {
        const active = pathname === item.href

        return (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: active ? "rgba(168, 85, 247, 0.1)" : "transparent",
              borderLeftWidth: active ? 3 : 0,
              borderLeftColor: active ? "#a855f7" : "transparent",
              transition: "all 0.2s ease",
            }}
          >
            <Ionicons name={item.icon as any} size={20} color={active ? "#a855f7" : "#64748B"} />
            <Text
              style={{
                fontSize: 15,
                fontWeight: active ? "600" : "400",
                color: active ? "#a855f7" : "#0F172A",
                transition: "color 0.2s ease",
              }}
            >
              {item.label}
            </Text>
          </Pressable>
        )
      })}

      <View
        style={{
          marginTop: "auto",
          paddingVertical: 24,
          paddingHorizontal: 16,
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          background: "linear-gradient(90deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            color: "#64748B",
            fontWeight: "500",
          }}
        >
          ✨ Powered by ImprovTrend
        </Text>
      </View>
    </View>
  )
}
