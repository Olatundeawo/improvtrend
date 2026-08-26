import prisma from "../prisma/client.js";
import { AppError } from "../errors/AppError.js";

const VALID_REACTIONS = ["SPICY", "PLOT_TWIST", "FUNNY", "BEST_LINE"];

export async function toggleReaction(turnId, userId, type) {
  if (!VALID_REACTIONS.includes(type)) {
    throw new AppError(`Invalid reaction type: ${type}`);
  }

  const existing = await prisma.turnReaction.findUnique({
    where: { turnId_userId: { turnId, userId } },
  });

  if (existing?.type === type) {
    await prisma.turnReaction.delete({ where: { id: existing.id } });
    return { reacted: false, type };
  }

  await prisma.turnReaction.upsert({
    where:  { turnId_userId: { turnId, userId } },
    update: { type, createdAt: new Date() },
    create: { turnId, userId, type },
  });

  return { reacted: true, type };
}

export async function getReactionSummary(turnId, requestingUserId) {
  const [reactions, userReaction] = await Promise.all([
    prisma.turnReaction.groupBy({
      by:    ["type"],
      where: { turnId },
      _count: { type: true },
    }),
    prisma.turnReaction.findUnique({
      where:  { turnId_userId: { turnId, userId: requestingUserId } },
      select: { type: true },
    }),
  ]);

  return VALID_REACTIONS.map((type) => {
    const found = reactions.find((r) => r.type === type);
    return {
      type,
      count:   found?._count.type ?? 0,
      reacted: userReaction?.type === type,
    };
  });
}

export async function getBulkReactionSummary(turnIds, requestingUserId) {
  const [reactions, userReactions] = await Promise.all([
    prisma.turnReaction.groupBy({
      by:    ["turnId", "type"],
      where: { turnId: { in: turnIds } },
      _count: { type: true },
    }),
    prisma.turnReaction.findMany({
      where:  { turnId: { in: turnIds }, userId: requestingUserId },
      select: { turnId: true, type: true },
    }),
  ]);

  // One active reaction per user per turn — key by turnId only
  const userReactionMap = Object.fromEntries(
    userReactions.map((r) => [r.turnId, r.type])
  );

  const result = {};
  for (const turnId of turnIds) {
    result[turnId] = VALID_REACTIONS.map((type) => {
      const found = reactions.find((r) => r.turnId === turnId && r.type === type);
      return {
        type,
        count:   found?._count.type ?? 0,
        reacted: userReactionMap[turnId] === type,
      };
    });
  }

  return result;
}

export async function getBestTurn(storyId) {
  const turns = await prisma.turn.findMany({
    where:   { storyId },
    include: {
      _count:    { select: { reactions: true } },
      character: { select: { name: true } },
      user:      { select: { username: true } },
    },
  });

  if (!turns.length) return null;

  return turns.reduce((best, turn) =>
    turn._count.reactions > best._count.reactions ? turn : best
  );
}