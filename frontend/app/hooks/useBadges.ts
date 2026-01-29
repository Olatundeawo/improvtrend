import { UserBadge } from "../components/type"
import { BADGE_CONFIG, BadgeIcons } from "../util/badges"

export function useUserBadge(badge?: UserBadge) {
  if (!badge || badge === "NEWBIE") {
    return { hasBadge: false as const }
  }

  const config = BADGE_CONFIG[badge]
  const Icon = BadgeIcons[config.icon]

  return {
    hasBadge: true as const,
    label: config.label,
    Icon,
    color: config.color,
  }
}
