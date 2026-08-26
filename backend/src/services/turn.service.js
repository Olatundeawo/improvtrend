import prisma from "../prisma/client.js";
import { advanceArc } from "./story.service.js";
import { awardXp, updateStreak, awardStoryCompletionXp } from "./xp.service.js";
import { AppError } from "../errors/AppError.js";

const CLAIM_WINDOW_MS = 48 * 60 * 60 * 1000; // 48 hours
const EDIT_WINDOW_MS  = 10 * 60 * 1000;      // 10 minutes

const REACTION_TYPES = ["SPICY", "PLOT_TWIST", "FUNNY", "BEST_LINE"];

function summariseReactions(reactions) {
  const counts = Object.fromEntries(REACTION_TYPES.map((t) => [t, 0]));
  for (const r of reactions) counts[r.type] = (counts[r.type] || 0) + 1;
  return REACTION_TYPES.map((type) => ({ type, count: counts[type] }));
}

function formatTurn(turn) {
  const { reactions, ...rest } = turn;
  const editWindowExpiresAt = new Date(
    new Date(turn.createdAt).getTime() + EDIT_WINDOW_MS
  );
  return {
    ...rest,
    reactions:          summariseReactions(reactions ?? []),
    reactionCount:      (reactions ?? []).length,
    isEditable:         Date.now() < editWindowExpiresAt.getTime(),
    editWindowExpiresAt,
  };
}

export async function addTurn(storyId, userId, characterId, content) {
  return prisma.$transaction(
    async (tx) => {
      const story = await tx.story.findUnique({ where: { id: storyId } });
      if (!story)                          throw new AppError("Story not found.");
      if (story.isLocked)                  throw new AppError("Story is locked.");
      if (story.status === "COMPLETED")    throw new AppError("Story already completed.");

      const character = await tx.character.findUnique({ where: { id: characterId } });
      if (!character || character.storyId !== storyId)
        throw new AppError("Character does not belong to this story.");

      if (character.claimedByUserId !== null && character.claimedByUserId !== userId)
        throw new AppError("This character has been claimed by another user.");

      // ── Guard: catch claims the scheduler hasn't cleaned up yet ────────────
      if (
        character.claimedByUserId === userId &&
        character.claimExpiresAt  &&
        character.claimExpiresAt <= new Date()
      ) {
        throw new AppError(
          "Your 48-hour claim on this character has expired. Re-claim it to continue writing."
        );
      }

      const lastTurn = await tx.turn.findFirst({
        where:   { storyId },
        orderBy: { createdAt: "desc" },
        select:  { characterId: true },
      });
      if (lastTurn?.characterId === characterId)
        throw new AppError("You cannot use the same character twice in a row.");

      const { turnCount: newTurnCount } = await tx.story.update({
        where:  { id: storyId },
        data:   { turnCount: { increment: 1 } },
        select: { turnCount: true },
      });

      const now = new Date();
      if (character.claimedByUserId === userId) {
        await tx.character.update({
          where: { id: characterId },
          data: {
            lastTurnAt:     now,
            claimExpiresAt: new Date(now.getTime() + CLAIM_WINDOW_MS),
            warningSentAt:  null,
          },
        });
      }

      const turn = await tx.turn.create({
        data: { storyId, userId, characterId, content },
        include: {
          user:      { select: { username: true } },
          character: {
            select: {
              name:            true,
              claimedByUserId: true,
              claimedBy:       { select: { username: true } },
            },
          },
          reactions: { select: { type: true, userId: true } },
        },
      });

      const arc        = await advanceArc(tx, storyId, newTurnCount, story.maxTurns);
      const newStreak  = await updateStreak(tx, userId);
      const turnXp     = await awardXp(tx, userId, "TURN_WRITTEN", { storyId, turnId: turn.id });

      let climaxXp = null;
      if (arc.newStage === "CLIMAX" && arc.previousStage !== "CLIMAX") {
        climaxXp = await awardXp(tx, userId, "CLIMAX_BONUS", { storyId, turnId: turn.id });
      }

      let completionXp = null;
      if (arc.isComplete) {
        completionXp = await awardStoryCompletionXp(tx, storyId);
      }

      return {
        turn: formatTurn(turn),
        arc: {
          turnCount:   newTurnCount,
          maxTurns:    story.maxTurns,
          stage:       arc.newStage,
          isCompleted: arc.isComplete,
          turnsLeft:   Math.max(0, story.maxTurns - newTurnCount),
        },
        xp: {
          streak:      newStreak,
          turnXp,
          climaxXp,
          completionXp,
        },
      };
    },
    { timeout: 15_000, maxWait: 5_000 }
  );
}

export async function editTurn(turnId, userId, content) {
  if (!content || !content.trim()) {
    throw new AppError("Content cannot be empty.");
  }

  return prisma.$transaction(async (tx) => {
    const turn = await tx.turn.findUnique({
      where:   { id: turnId },
      include: { story: { select: { isLocked: true, status: true } } },
    });

    if (!turn)                       throw new AppError("Turn not found.");
    if (turn.userId !== userId)      throw new AppError("You can only edit your own turns.");
    if (turn.story.isLocked)         throw new AppError("Story is locked.");
    if (turn.story.status === "COMPLETED")
      throw new AppError("Cannot edit turns in a completed story.");

    const elapsedMs = Date.now() - new Date(turn.createdAt).getTime();
    if (elapsedMs > EDIT_WINDOW_MS) {
      throw new AppError(
        "Edit window has expired. Turns can only be edited within 10 minutes of posting."
      );
    }

    const updated = await tx.turn.update({
      where: { id: turnId },
      data:  { content: content.trim(), editedAt: new Date() },
      include: {
        user:      { select: { username: true } },
        character: {
          select: {
            name:            true,
            claimedByUserId: true,
            claimedBy:       { select: { username: true } },
          },
        },
        reactions: { select: { type: true, userId: true } },
      },
    });

    return formatTurn(updated);
  });
}

export async function getTurnsByStoryId(storyId) {
  const turns = await prisma.turn.findMany({
    where:   { storyId },
    orderBy: { createdAt: "asc" },
    include: {
      user:      { select: { username: true } },
      character: {
        select: {
          name:            true,
          claimedByUserId: true,
          claimedBy:       { select: { username: true } },
        },
      },
      reactions: { select: { type: true, userId: true } },
    },
  });
  return turns.map(formatTurn);
}