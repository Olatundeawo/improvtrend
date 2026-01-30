import prisma from "../prisma/client.js";
import parseCharacters from "../utils/parseCharacters.js";

import { resolveBadge } from "../utils/badge.js";
import { BADGE_META } from "../utils/badgeMeta.js";

export async function createStory(userId, data) {
  const { title, content, characters } = data;

  const parsedCharacters = parseCharacters(characters);

  if (parsedCharacters.length === 0) {
    throw new Error("At least one character is required");
  }

  if (parsedCharacters.length > 5) {
    throw new Error("Characters exceed 5");
  }

  // prevent duplicates (case-insensitive)
  const lower = parsedCharacters.map(c => c.toLowerCase());
  if (new Set(lower).size !== parsedCharacters.length) {
    throw new Error("Duplicate character names are not allowed");
  }

  return prisma.$transaction(async (tx) => {
    // 1. Create story
    const story = await tx.story.create({
      data: {
        title,
        content,
        userId,
        characters: {
          create: parsedCharacters.map(name => ({ name })),
        },
      },
      include: {
        characters: true,
      },
    });

    // 2. Increment story count
    const user = await tx.user.update({
      where: { id: userId },
      data: { storyCount: { increment: 1 } },
    });

    const newStoryCount = user.storyCount + 1;
    const newBadge = resolveBadge(newStoryCount);

    // 3. Unlock badge + notify
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



export async function getStories({ page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [stories, total] = await Promise.all([
    prisma.story.findMany({
      skip,
      take: limit,
      include: {
        turns: {
          include: { upvotes: true },
        },
        characters: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: { username: true },
        },
        comments: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.story.count(),
  ]);

  return {
    data: stories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + stories.length < total,
    },
  };
}


export async function getStoryById(id) {
  return prisma.story.findUnique({
    where: { id },
    include: {
      characters: {
        select: {
          id: true,
          name: true
        }
      }
    }
    
  });
}

export async function getStoryByUserId(userId) {

 return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      storyCount: true,
      badge: true,
      stories: {
        orderBy: { createdAt: "desc" },
        include: {
          turns: true,
          characters: true,
          comments: true,
        },
      },
    },
  })
}