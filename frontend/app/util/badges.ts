import { Platform } from "react-native"
import { DisplayBadge } from "../components/type"

let Icons: Record<string, any>

if (Platform.OS === "web") {
  Icons = require("lucide-react")
} else {
  Icons = require("lucide-react-native")
}

export const BadgeIcons = {
  CheckCircle: Icons.CheckCircle,
  Star: Icons.Star,
  Crown: Icons.Crown
}

export type BadgeConfig = {
    label: string
    icon: keyof typeof BadgeIcons
    color: string
  }
  
  export const BADGE_CONFIG: Record<DisplayBadge, BadgeConfig> = {
    CONTRIBUTOR: {
      label: "Contributor",
      icon: "CheckCircle",
      color: "#3B82F6",
    },
    CREATOR: {
      label: "Creator",
      icon: "Star",
      color: "#8B5CF6",
    },
    TREND_STARTER: {
      label: "Trend Starter",
      icon: "Crown",
      color: "#F59E0B",
    },
  }