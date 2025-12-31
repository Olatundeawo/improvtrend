import prisma from "../prisma/client.js";
import parseCharacters from "../utils/parseCharacters.js";


export async function createStory(userId, data) {
  const { title, content, characters } = data;

  const parsedCharacters = parseCharacters(characters);

  if (parsedCharacters.length === 0) {
    throw new Error("At least one character is required");
  }

  if (parsedCharacters.length > 5) {
    throw new Error("You can create a maximum of 5 characters");
  }

  // prevent duplicates (case-insensitive)
  const lower = parsedCharacters.map(c => c.toLowerCase());
  if (new Set(lower).size !== parsedCharacters.length) {
    throw new Error("Duplicate character names are not allowed");
  }

  return prisma.story.create({
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
