import prisma from "../prisma/client.js";

export async function addTurn(storyId, userId, characterId, content) {
    const story = await prisma.story.findUnique({
        where: { id: storyId }
    });

    if (!story || story.isLocked) {
        throw new Error("Story is not available.");
    }

    
    const character = await prisma.character.findUnique({
        where: { id: characterId }
    });

    if (!character || character.storyId !== storyId) {
        throw new Error("Character does not belong to this story.");
    }

    if (character.claimedByUserId !== null && character.claimedByUserId !== userId) {
        throw new Error("This character has been claimed by another user.");
    }

    const lastTurn = await prisma.turn.findFirst({
        where: { storyId },
        orderBy: { createdAt: "desc" }
    });

    if (lastTurn?.characterId === characterId) {
        throw new Error("You cannot use the same character twice in a row.");
    }

    return prisma.turn.create({
        data: { storyId, userId, characterId, content }
    });
}

export async function getTurnsByStoryId(storyId) {
    return prisma.turn.findMany({
        where: { storyId },
        include: {
            user: {
                select: { username: true }
            },
            character: {
                select: {
                    name: true,
                    claimedByUserId: true,
                    claimedBy: { select: { username: true } }
                }
            },
            upvotes: {
                select: { id: true }
            }
        },
        orderBy: { createdAt: "desc" }
    });
}