import { useEffect, useState } from "react";
import { Dimensions, Platform } from "react-native";

export function useWebBreakpoint() {
  const [width, setWidth] = useState(Dimensions.get("window").width);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setWidth(window.width);
    });

    return () => sub?.remove();
  }, []);

  return {
    width,
    isDesktop: width >= 1024,
  };
}
