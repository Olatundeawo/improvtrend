import prisma from "../prisma/client.js";
import {
  resolveBadge,
  LEVEL_THRESHOLDS,
  LEVEL_ORDER,
  LEVEL_GATES,
  deriveLevel,
  levelRank,
} from "../utils/badge.js";
import { BADGE_META, LEVEL_META } from "../utils/badgeMeta.js";

export const XP_VALUES = {
  TURN_WRITTEN:     10,
  CLIMAX_BONUS:     20,
  VIRAL_TURN:       15,
  STORY_COMPLETION: 30,
};

export const VIRAL_REACTION_THRESHOLD = 10;

const STREAK_TIERS = [
  [7, 2.5],
  [4, 2.0],
  [2, 1.5],
  [0, 1.0],
];

export function getStreakMultiplier(streak) {
  for (const [min, mult] of STREAK_TIERS) {
    if (streak >= min) return mult;
  }
  return 1.0;
}

export function computeNewStreak(lastTurnDate, currentStreak) {
  if (!lastTurnDate) return 1;

  const now  = new Date();
  const last = new Date(lastTurnDate);

  const diffDays = Math.floor(
    (now.setHours(0, 0, 0, 0) - last.setHours(0, 0, 0, 0)) / 86_400_000
  );

  if (diffDays === 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}


 
export async function assertLevel(userId, action) {
  const requiredLevel = LEVEL_GATES[action];
  if (!requiredLevel) return; // no gate defined for this action
 
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { level: true },
  });
 
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
 
  if (levelRank(user.level) < levelRank(requiredLevel)) {
    const meta = LEVEL_META[requiredLevel];
    const err  = new Error(
      `Requires ${meta.title} level or above to perform this action.`
    );
    err.status = 403;
    throw err;
  }
}
 
// ─── Core XP award ────────────────────────────────────────────────────────────
 
/**
 * Awards XP, then checks for level-up and badge upgrade.
 * Fires notifications for both inside the same transaction.
 *
 * Returns { reason, basePoints, multiplier, finalXp, leveledUp, newLevel, badgeAwarded }
 */
export async function awardXp(tx = prisma, userId, reason, meta = {}) {
  // 1. Fetch current state
  const user = await tx.user.findUnique({
    where:  { id: userId },
    select: { xp: true, streak: true, lastTurnDate: true, level: true },
  });
 
  if (!user) {
    const err = new Error("User not found");
    err.status = 404;
    throw err;
  }
 
  // 2. Compute XP
  const multiplier = reason === "TURN_WRITTEN"
    ? getStreakMultiplier(user.streak)
    : 1.0;
 
  const basePoints = XP_VALUES[reason];
  const finalXp    = Math.round(basePoints * multiplier);
  const newXp      = user.xp + finalXp;
 
  // 3. Derive level after XP increment
  const oldLevel   = user.level;
  const newLevel   = deriveLevel(newXp);
  const leveledUp  = levelRank(newLevel) > levelRank(oldLevel);
 
  // 4. Write XP transaction record
  await tx.xpTransaction.create({
    data: {
      userId,
      reason,
      points: basePoints,
      multiplier,
      finalXp,
      meta,
    },
  });
 
  // 5. Update user XP + level
  await tx.user.update({
    where: { id: userId },
    data:  {
      xp:    { increment: finalXp },
      level: newLevel,
    },
  });
 
  // 6. Fire level-up notification
  if (leveledUp) {
    const display = LEVEL_META[newLevel];
    await tx.notification.create({
      data: {
        userId,
        type:    "LEVEL_UP",
        title:   `⬆️ Level Up — ${display.title}`,
        message: display.message,
      },
    });
  }
 
  // Badge awarding is intentionally NOT done here.
  // Badges are storyCount-based and are awarded in createStory only.
 
  return { reason, basePoints, multiplier, finalXp, leveledUp, newLevel };
}
 
// ─── Streak update (unchanged) ────────────────────────────────────────────────
 
export async function updateStreak(tx = prisma, userId) {
  const user = await tx.user.findUnique({
    where:  { id: userId },
    select: { streak: true, lastTurnDate: true },
  });
 
  const newStreak = computeNewStreak(user.lastTurnDate, user.streak);
 
  await tx.user.update({
    where: { id: userId },
    data:  {
      streak:       newStreak,
      lastTurnDate: new Date(),
    },
  });
 
  return newStreak;
}
 
// ─── Story completion XP (all contributors) ───────────────────────────────────
 
export async function awardStoryCompletionXp(tx = prisma, storyId) {
  const contributors = await tx.turn.findMany({
    where:    { storyId },
    select:   { userId: true },
    distinct: ["userId"],
  });
 
  const awards = await Promise.all(
    contributors.map(({ userId }) =>
      awardXp(tx, userId, "STORY_COMPLETION", { storyId })
    )
  );
 
  return awards;
}
 
// ─── Viral turn check + award ─────────────────────────────────────────────────
 
export async function checkViralAndAward(tx = prisma, turnId) {
  const turn = await tx.turn.findUnique({
    where:  { id: turnId },
    select: { userId: true, storyId: true, _count: { select: { reactions: true } } },
  });
 
  if (!turn) return null;
  if (turn._count.reactions < VIRAL_REACTION_THRESHOLD) return null;
 
  const alreadyAwarded = await tx.xpTransaction.findFirst({
    where: {
      userId: turn.userId,
      reason: "VIRAL_TURN",
      meta:   { path: ["turnId"], equals: turnId },
    },
  });
 
  if (alreadyAwarded) return null;
 
  return awardXp(tx, turn.userId, "VIRAL_TURN", {
    turnId,
    storyId: turn.storyId,
  });
}
 
// ─── XP summary (profile screen) ─────────────────────────────────────────────
 
export async function getUserXpSummary(userId) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: {
      xp: true, streak: true, lastTurnDate: true, level: true,
      badges: { select: { badge: true, awardedAt: true }, orderBy: { awardedAt: "desc" } },
    },
  });
 
  const breakdown = await prisma.xpTransaction.groupBy({
    by:    ["reason"],
    where: { userId },
    _sum:  { finalXp: true },
    _count: { id: true },
  });
 
  // Highest-ranked badge for display (last earned)
  const latestBadge = user.badges[0]?.badge ?? null;
 
  // Progress to next level
  const currentLevel = user.level;
  const levelIdx     = levelRank(currentLevel);
  const nextLevel    = LEVEL_ORDER[levelIdx + 1] ?? null;
  const currentFloor = LEVEL_THRESHOLDS[currentLevel];
  const nextFloor    = nextLevel ? LEVEL_THRESHOLDS[nextLevel] : null;
 
  const progressPct = nextFloor
    ? Math.min(100, Math.round(((user.xp - currentFloor) / (nextFloor - currentFloor)) * 100))
    : 100;
 
  return {
    totalXp:    user.xp,
    streak:     user.streak,
    multiplier: getStreakMultiplier(user.streak),
    badge:      latestBadge,
    badgeMeta:  latestBadge ? BADGE_META[latestBadge] : null,
    badges:     user.badges,
    level:      currentLevel,
    levelMeta:  LEVEL_META[currentLevel],
    nextLevel,
    xpToNext:   nextFloor ? nextFloor - user.xp : null,
    progressPct,
    breakdown,
  };
}
 
