import prisma from "../prisma/client.js";

// ── helpers ──────────────────────────────────────────────────────────────────

const REACTION_TYPES = ["SPICY", "PLOT_TWIST", "FUNNY", "BEST_LINE"];

function summariseReactions(reactions) {
  const counts = Object.fromEntries(REACTION_TYPES.map((t) => [t, 0]));
  for (const r of reactions) counts[r.type] = (counts[r.type] || 0) + 1;
  return REACTION_TYPES.map((type) => ({ type, count: counts[type] }));
}

function formatTurn(turn) {
  const { reactions, ...rest } = turn;
  return {
    ...rest,
    reactions: summariseReactions(reactions ?? []),
    reactionCount: (reactions ?? []).length,
  };
}

// ── addTurn ──────────────────────────────────────────────────────────────────

export async function addTurn(storyId, userId, characterId, content) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
  });

  if (!story || story.isLocked) {
    throw new Error("Story is not available.");
  }

  const character = await prisma.character.findUnique({
    where: { id: characterId },
  });

  if (!character || character.storyId !== storyId) {
    throw new Error("Character does not belong to this story.");
  }

  if (character.claimedByUserId !== null && character.claimedByUserId !== userId) {
    throw new Error("This character has been claimed by another user.");
  }

  const lastTurn = await prisma.turn.findFirst({
    where: { storyId },
    orderBy: { createdAt: "desc" },
  });

  if (lastTurn?.characterId === characterId) {
    throw new Error("You cannot use the same character twice in a row.");
  }

  const turn = await prisma.turn.create({
    data: { storyId, userId, characterId, content },
    include: {
      user: { select: { username: true } },
      character: {
        select: {
          name: true,
          claimedByUserId: true,
          claimedBy: { select: { username: true } },
        },
      },
      reactions: {
        select: { type: true, userId: true },
      },
    },
  });

  return formatTurn(turn);
}

// ── getTurnsByStoryId ────────────────────────────────────────────────────────

export async function getTurnsByStoryId(storyId) {
  const turns = await prisma.turn.findMany({
    where: { storyId },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { username: true } },
      character: {
        select: {
          name: true,
          claimedByUserId: true,
          claimedBy: { select: { username: true } },
        },
      },
      reactions: {
        select: { type: true, userId: true },
      },
    },
  });

  return turns.map(formatTurn);
}