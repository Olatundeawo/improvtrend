
export function resolveBadge (storyCount) {
    if (storyCount >= 50) return "TREND_STARTER";
    if (storyCount >= 20) return "CREATOR";
    if (storyCount >= 5) return "CONTRIBUTOR";
    if (storyCount >= 1) return "NEWBIE";
    return null;
}


// ─── Level Config ─────────────────────────────────────────────────────────────
 
export const LEVEL_THRESHOLDS = {
  NEWCOMER:         0,
  STORYTELLER:    100,
  SCRIBE:         300,
  AUTHOR:         700,
  GRAND_NARRATOR: 1500,
};
 
export const LEVEL_ORDER = [
  "NEWCOMER",
  "STORYTELLER",
  "SCRIBE",
  "AUTHOR",
  "GRAND_NARRATOR",
];
 

export const LEVEL_GATES = {
  createStory:       "STORYTELLER",
  addCharacter:      "SCRIBE",
  flagContent:       "AUTHOR",
  moderateCommunity: "GRAND_NARRATOR",
};
 
export function deriveLevel(xp) {
  if (xp >= 1500) return "GRAND_NARRATOR";
  if (xp >= 700)  return "AUTHOR";
  if (xp >= 300)  return "SCRIBE";
  if (xp >= 100)  return "STORYTELLER";
  return "NEWCOMER";
}
 
export function levelRank(level) {
  return LEVEL_ORDER.indexOf(level);
}