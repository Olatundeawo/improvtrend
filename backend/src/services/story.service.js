import prisma from "../prisma/client.js";
import parseCharacters from "../utils/parseCharacters.js";
import { resolveBadge } from "../utils/badge.js";
import { BADGE_META } from "../utils/badgeMeta.js";
import { getMaxTurns, deriveStage, VOTE_THRESHOLD } from "../utils/arc.js";


function summariseReactions(reactions) {
  const TYPES = ["SPICY", "PLOT_TWIST", "FUNNY", "BEST_LINE"];
  const counts = Object.fromEntries(TYPES.map((t) => [t, 0]));
  for (const r of reactions) counts[r.type] = (counts[r.type] || 0) + 1;
  return TYPES.map((type) => ({ type, count: counts[type] }));
}

function formatTurn(turn) {
  const { reactions, ...rest } = turn;
  return {
    ...rest,
    reactions: summariseReactions(reactions ?? []),
    reactionCount: (reactions ?? []).length,
  };
}


export async function createStory(userId, data) {
  const { title, content, characters, arcSize = "SHORT" } = data;

  const parsedCharacters = parseCharacters(characters);

  if (parsedCharacters.length === 0)
    throw new Error("At least one character is required");
  if (parsedCharacters.length > 5)
    throw new Error("Characters exceed 5");

  const lower = parsedCharacters.map((c) => c.toLowerCase());
  if (new Set(lower).size !== parsedCharacters.length)
    throw new Error("Duplicate character names are not allowed");

  const validArcSizes = ["SHORT", "MEDIUM", "EPIC"];
  if (!validArcSizes.includes(arcSize))
    throw new Error("arcSize must be SHORT, MEDIUM, or EPIC");

  const maxTurns = getMaxTurns(arcSize);

  return prisma.$transaction(async (tx) => {
    const story = await tx.story.create({
      data: {
        title,
        content,
        userId,
        arcSize,
        maxTurns,
        turnCount: 0,
        arcStage: "SETUP",
        status: "ACTIVE",
        characters: {
          create: parsedCharacters.map((name) => ({ name })),
        },
      },
      include: { characters: true },
    });

    const user = await tx.user.update({
      where: { id: userId },
      data: { storyCount: { increment: 1 } },
    });

    const newStoryCount = user.storyCount + 1;
    const newBadge = resolveBadge(newStoryCount);

    if (newBadge && newBadge !== user.badge) {
      await tx.user.update({
        where: { id: userId },
        data: { badge: newBadge },
      });

      const meta = BADGE_META[newBadge];
      await tx.notification.create({
        data: {
          userId,
          type: "BADGE_UNLOCKED",
          title: `Badge Unlocked: ${meta.title}`,
          message: meta.message,
        },
      });
    }

    return {
      story,
      badgeUnlocked: newBadge && newBadge !== user.badge ? newBadge : null,
    };
  });
}


export async function advanceArc(tx, storyId, newTurnCount, maxTurns) {
  const newStage  = deriveStage(newTurnCount, maxTurns);
  const isComplete = newTurnCount >= maxTurns;

  await tx.story.update({
    where: { id: storyId },
    data: {
      arcStage: newStage,
      ...(isComplete && { status: "COMPLETED", isLocked: true }),
    },
  });

  return { newTurnCount, newStage, isComplete };
}
// ── voteToComplete ───────────────────────────────────────────────────────────

export async function voteToComplete(storyId, userId) {
  return prisma.$transaction(async (tx) => {
    const story = await tx.story.findUnique({
      where: { id: storyId },
      select: {
        id: true,
        userId: true,
        status: true,
        maxTurns: true,
        turnCount: true,
        votes: { select: { userId: true } },
        turns: { select: { userId: true } },
      },
    });

    if (!story) throw new Error("Story not found");
    if (story.status === "COMPLETED") throw new Error("Story is already completed");

    // Prevent duplicate votes (the @@unique constraint also guards this, but
    // surfacing a clear error is nicer than a Prisma P2002)
    const alreadyVoted = story.votes.some((v) => v.userId === userId);
    if (alreadyVoted) throw new Error("You have already voted to complete this story");

    await tx.storyVote.create({ data: { storyId, userId } });

    // Eligible voters = creator + everyone who has written at least one turn
    const participantIds = new Set([
      story.userId,
      ...story.turns.map((t) => t.userId),
    ]);
    const totalVotes = story.votes.length + 1;
    const quorum     = Math.ceil(participantIds.size * VOTE_THRESHOLD);
    const shouldComplete = totalVotes >= quorum;

    if (shouldComplete) {
      await tx.story.update({
        where: { id: storyId },
        data: { status: "COMPLETED", isLocked: true },
      });
    }

    return {
      voted: true,
      totalVotes,
      quorum,
      participantCount: participantIds.size,
      completed: shouldComplete,
    };
  });
}


export async function completeStoryByCreator(storyId, userId) {
  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { userId: true, status: true },
  });

  if (!story) throw new Error("Story not found");
  if (story.userId !== userId) throw new Error("Only the creator can end their story");
  if (story.status === "COMPLETED") throw new Error("Story is already completed");

  return prisma.story.update({
    where: { id: storyId },
    data: { status: "COMPLETED", isLocked: true },
  });
}

// ── getStories ───────────────────────────────────────────────────────────────

export async function getStories({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user:       { select: { username: true, badge: true } },
        characters: { select: { id: true, name: true } },
        comments:   { select: { id: true } },
        votes:      { select: { userId: true } },
        turns: {
          orderBy: { createdAt: "asc" },
          include: {
            user:      { select: { username: true } },
            character: { select: { id: true, name: true } },
            reactions: { select: { type: true } },
          },
        },
      },
    }),
    prisma.story.count(),
  ]);

  const formatted = stories.map((story) => ({
    ...story,
    turns: story.turns.map(formatTurn),
    totalReactions: story.turns.reduce(
      (sum, t) => sum + (t.reactions?.length ?? 0),
      0
    ),
    commentCount: story.comments.length,
    voteCount: story.votes.length,
  }));

  return {
    data: formatted,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + stories.length < total,
    },
  };
}

// ── getStoryById ─────────────────────────────────────────────────────────────

export async function getStoryById(id) {
  const story = await prisma.story.findUnique({
    where: { id },
    include: {
      user: { select: { username: true, badge: true } },
      characters: {
        select: {
          id: true,
          name: true,
          claimedByUserId: true,
          claimedBy: { select: { username: true } },
        },
      },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { username: true } } },
      },
      votes: { select: { userId: true } },
      turns: {
        orderBy: { createdAt: "asc" },
        include: {
          user:      { select: { username: true } },
          character: { select: { id: true, name: true } },
          reactions: { select: { type: true, userId: true } },
        },
      },
    },
  });

  if (!story) return null;

  return {
    ...story,
    turns: story.turns.map(formatTurn),
    totalReactions: story.turns.reduce(
      (sum, t) => sum + (t.reactions?.length ?? 0),
      0
    ),
    commentCount: story.comments.length,
    voteCount: story.votes.length,
  };
}

// ── getStoryByUserId ─────────────────────────────────────────────────────────

export async function getStoryByUserId(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      storyCount: true,
      badge: true,
      stories: {
        orderBy: { createdAt: "desc" },
        include: {
          characters: {
            select: { id: true, name: true, claimedByUserId: true },
          },
          comments: { select: { id: true } },
          votes:    { select: { userId: true } },
          turns: {
            orderBy: { createdAt: "asc" },
            include: {
              user:      { select: { username: true } },
              character: { select: { id: true, name: true } },
              reactions: { select: { type: true } },
            },
          },
        },
      },
    },
  });

  if (!user) return null;

  return {
    ...user,
    stories: user.stories.map((story) => ({
      ...story,
      turns: story.turns.map(formatTurn),
      totalReactions: story.turns.reduce(
        (sum, t) => sum + (t.reactions?.length ?? 0),
        0
      ),
      commentCount: story.comments.length,
      voteCount: story.votes.length,
    })),
  };
}