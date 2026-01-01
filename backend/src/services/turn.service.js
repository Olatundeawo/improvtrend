import prisma from "../prisma/client.js";

export async function addTurn(storyId, userId, characterId, content) {
    const story = await prisma.story.findUnique({
        where: { id: storyId }
    });

    if (!story || story.isLocked) {
        throw new Error("Story is not available.")
    }

    const lastTurn = await prisma.turn.findFirst({
        where: {storyId},
        orderBy: {createdAt: "desc" }
    });

    if(lastTurn?.userId === userId) {
        throw new Error("You cannot contribute twice in a row.")
    }

    return prisma.turn.create({
        data: {
            storyId, userId, characterId, content
        }
    })
}

export async function getTurnsByStoryId(storyId) {
  return prisma.turn.findMany({
    where: { storyId },
    include: {
        user : {
            select: {
                username: true
            }
        },
        character: {
            select: {
                name: true
            }
        },
        upvotes: {
            select: {
                id: true
            }
        }
    },
    orderBy: {
      createdAt: "asc", 
    },
    
  });
}
