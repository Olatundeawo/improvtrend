import prisma from "../prisma/client.js";

const VALID_REACTIONS = ["SPICY", "PLOT_TWIST", "FUNNY", "BEST_LINE"];

export async function toggleReaction(turnId, userId, type) {
  if (!VALID_REACTIONS.includes(type)) {
    throw new Error(`Invalid reaction type: ${type}`);
  }

  const existing = await prisma.turnReaction.findUnique({
    where: {
      turnId_userId_type: { turnId, userId, type },
    },
  });

  if (existing) {
    await prisma.turnReaction.delete({ where: { id: existing.id } });
    return { reacted: false, type };
  }

  await prisma.turnReaction.create({
    data: { turnId, userId, type },
  });

  return { reacted: true, type };
}

export async function getReactionSummary(turnId, requestingUserId) {
  const [reactions, userReactions] = await Promise.all([
    prisma.turnReaction.groupBy({
      by: ["type"],
      where: { turnId },
      _count: { type: true },
    }),
    prisma.turnReaction.findMany({
      where: { turnId, userId: requestingUserId },
      select: { type: true },
    }),
  ]);

  const userReactionTypes = new Set(userReactions.map((r) => r.type));

  return VALID_REACTIONS.map((type) => {
    const found = reactions.find((r) => r.type === type);
    return {
      type,
      count: found?._count.type ?? 0,
      reacted: userReactionTypes.has(type),
    };
  });
}

export async function getBulkReactionSummary(turnIds, requestingUserId) {
  const [reactions, userReactions] = await Promise.all([
    prisma.turnReaction.groupBy({
      by: ["turnId", "type"],
      where: { turnId: { in: turnIds } },
      _count: { type: true },
    }),
    prisma.turnReaction.findMany({
      where: { turnId: { in: turnIds }, userId: requestingUserId },
      select: { turnId: true, type: true },
    }),
  ]);

  const userReactionSet = new Set(
    userReactions.map((r) => `${r.turnId}:${r.type}`)
  );

  const result = {};
  for (const turnId of turnIds) {
    result[turnId] = VALID_REACTIONS.map((type) => {
      const found = reactions.find(
        (r) => r.turnId === turnId && r.type === type
      );
      return {
        type,
        count: found?._count.type ?? 0,
        reacted: userReactionSet.has(`${turnId}:${type}`),
      };
    });
  }

  return result;
}

export async function getBestTurn(storyId) {
  const turns = await prisma.turn.findMany({
    where: { storyId },
    include: {
      _count: { select: { reactions: true } },
      character: { select: { name: true } },
      user: { select: { username: true } },
    },
  });

  if (!turns.length) return null;

  return turns.reduce((best, turn) =>
    turn._count.reactions > best._count.reactions ? turn : best
  );
}