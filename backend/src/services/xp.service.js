import prisma from "../prisma/client.js";

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
    (now.setHours(0,0,0,0) - last.setHours(0,0,0,0)) / 86_400_000
  );

  if (diffDays === 0) return currentStreak;
  if (diffDays === 1) return currentStreak + 1;
  return 1;
}

export async function awardXp(tx = prisma, userId, reason, meta = {}) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { xp: true, streak: true, lastTurnDate: true },
  });

  const multiplier =
    reason === "TURN_WRITTEN"
      ? getStreakMultiplier(user.streak)
      : 1.0;

  const basePoints = XP_VALUES[reason];
  const finalXp    = Math.round(basePoints * multiplier);

  await tx.xpTransaction.create({
    data: {
      userId,
      reason,
      points:     basePoints,
      multiplier,
      finalXp,
      meta,
    },
  });

  await tx.user.update({
    where: { id: userId },
    data:  { xp: { increment: finalXp } },
  });

  return { reason, basePoints, multiplier, finalXp };
}

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

export async function awardStoryCompletionXp(tx = prisma, storyId) {
  const contributors = await tx.turn.findMany({
    where:   { storyId },
    select:  { userId: true },
    distinct: ["userId"],
  });

  const awards = await Promise.all(
    contributors.map(({ userId }) =>
      awardXp(tx, userId, "STORY_COMPLETION", { storyId })
    )
  );

  return awards;
}

/**
 * Check if a turn just went viral and award bonus if so.
 */
export async function checkViralAndAward(tx = prisma, turnId) {
  const turn = await tx.turn.findUnique({
    where:   { id: turnId },
    select:  { userId: true, storyId: true, _count: { select: { reactions: true } } },
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

export async function getUserXpSummary(userId) {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: { xp: true, streak: true, lastTurnDate: true, badge: true },
  });

  const breakdown = await prisma.xpTransaction.groupBy({
    by:     ["reason"],
    where:  { userId },
    _sum:   { finalXp: true },
    _count: { id: true },
  });

  return {
    totalXp:    user.xp,
    streak:     user.streak,
    multiplier: getStreakMultiplier(user.streak),
    badge:      user.badge,
    breakdown,
  };
}