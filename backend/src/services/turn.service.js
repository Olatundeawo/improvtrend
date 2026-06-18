import prisma from "../prisma/client.js";
import { advanceArc } from "./story.service.js";

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


export async function addTurn(storyId, userId, characterId, content) {
  return prisma.$transaction(async (tx) => {

    const story = await tx.story.findUnique({ where: { id: storyId } });
    if (!story) throw new Error("Story not found.");
    if (story.isLocked) throw new Error("Story is locked and no longer accepting turns.");
    if (story.status === "COMPLETED") throw new Error("Story is already completed.");

    const character = await tx.character.findUnique({ where: { id: characterId } });
    if (!character || character.storyId !== storyId)
      throw new Error("Character does not belong to this story.");
    if (character.claimedByUserId !== null && character.claimedByUserId !== userId)
      throw new Error("This character has been claimed by another user.");

    const lastTurn = await tx.turn.findFirst({
      where: { storyId },
      orderBy: { createdAt: "desc" },
      select: { characterId: true },
    });
    if (lastTurn?.characterId === characterId)
      throw new Error("You cannot use the same character twice in a row.");

    const { turnCount: newTurnCount } = await tx.story.update({
      where: { id: storyId },
      data: { turnCount: { increment: 1 } },
      select: { turnCount: true },
    });

    const turn = await tx.turn.create({
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
        reactions: { select: { type: true, userId: true } },
      },
    });

    const arc = await advanceArc(tx, storyId, newTurnCount, story.maxTurns);

    return {
      turn: formatTurn(turn),
      arc: {
        turnCount:   arc.newTurnCount,
        maxTurns:    story.maxTurns,
        stage:       arc.newStage,
        isCompleted: arc.isComplete,
        turnsLeft:   Math.max(0, story.maxTurns - arc.newTurnCount),
      },
    };
  });
}


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
      reactions: { select: { type: true, userId: true } },
    },
  });

  return turns.map(formatTurn);
}