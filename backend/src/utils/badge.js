
export function resolveBadge (storyCount) {
    if (storyCount >= 50) return "TREND_STARTER";
    if (storyCount >= 20) return "CREATOR";
    if (storyCount >= 5) return "CONTRIBUTOR";
    if (storyCount >= 1) return "NEWBIE";
    return null;
}