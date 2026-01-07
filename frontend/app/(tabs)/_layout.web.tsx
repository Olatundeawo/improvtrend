import { Redirect, Slot } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import WebSidebar from "../components/WebSidebar";
import WebTopNav from "../components/WebTopNav";
import { useAuth } from "../context/auth";
import { useWebBreakpoint } from "../hooks/useWebBreakpoint";

export default function WebLayout() {
  const { user, loading } = useAuth();
  const { isDesktop } = useWebBreakpoint();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="(auth)/login" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
      {!isDesktop && <WebTopNav />}

      <View style={{ flex: 1, flexDirection: "row" }}>
        {isDesktop && <WebSidebar />}
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
      </View>
    </View>
  );
}
