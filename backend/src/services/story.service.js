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

export async function getStories() {
    return prisma.story.findMany({
        include: {
            turns: {
                include: {upvotes: true}
            }
        },
        orderBy: {createdAt: "desc" }
    });
}

export async function getStoryById(id) {
    return prisma.story.findUnique({
        where: { id },
        include: {
            turns: {
                include: {
                    upvotes: true,
                    character: true,
                    user: { select: {username: true}}
                },
                orderBy: { createdAt: "asc" }
            },
            comments: true
        }
    })
}