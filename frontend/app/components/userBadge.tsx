import { Platform, View } from "react-native"
import { useUserBadge } from "../hooks/useBadges"
import { UserBadge as UserBadgeType } from "./type"

type Props = {
  badge: UserBadgeType
  size?: number
}

export function UserBadge({ badge, size = 14 }: Props) {
  const result = useUserBadge(badge)

  if (!result.hasBadge) return null

  const { Icon, color, label } = result

  return (
    <View
      style={{ marginLeft: 4 }}
      accessibilityLabel={label}
    >
      <Icon
        size={size}
        color={color}
        {...(Platform.OS === "web" ? { strokeWidth: 2 } : {})}
      />
    </View>
  )
}
