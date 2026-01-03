import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { AuthProvider } from "./context/auth";

import {
  PlayfairDisplay_600SemiBold,
} from "@expo-google-fonts/playfair-display";


export default function RootLayout() {

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    PlayfairDisplay_600SemiBold,
  });

  if (!fontsLoaded) return null;
 
  return (
    <AuthProvider>

    <Stack screenOptions={{ headerShown: false}}>
      <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthProvider>
  );
}
