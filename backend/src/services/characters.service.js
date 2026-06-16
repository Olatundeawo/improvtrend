import prisma from "../prisma/client.js";

const MAX_CHARACTERS = 6;

export async function addCharacter(storyId, name) {
    const story = await prisma.story.findUnique({
        where: { id: storyId },
        include: { _count: { select: { characters: true } } }
    });

    if (!story) {
        throw new Error("Story not found.");
    }

    if (story._count.characters >= MAX_CHARACTERS) {
        throw new Error(`A story cannot have more than ${MAX_CHARACTERS} characters.`);
    }

    const existing = await prisma.character.findUnique({
        where: { name_storyId: { name, storyId } }
    });

    if (existing) {
        throw new Error(`A character named "${name}" already exists in this story.`);
    }

    return prisma.character.create({
        data: { name, storyId }
    });
}

export async function claimCharacter(characterId, userId) {
    const character = await prisma.character.findUnique({
        where: { id: characterId }
    });

    if (!character) {
        throw new Error("Character not found.");
    }

    if (character.claimedByUserId !== null) {
        if (character.claimedByUserId === userId) {
            throw new Error("You have already claimed this character.");
        }
        throw new Error("This character has already been claimed by another user.");
    }

    return prisma.character.update({
        where: { id: characterId },
        data: { claimedByUserId: userId }
    });
}

export async function unclaimCharacter(characterId, userId) {
    const character = await prisma.character.findUnique({
        where: { id: characterId }
    });

    if (!character) {
        throw new Error("Character not found.");
    }

    if (character.claimedByUserId !== userId) {
        throw new Error("You do not own this character.");
    }

    return prisma.character.update({
        where: { id: characterId },
        data: { claimedByUserId: null }
    });
}

export async function getCharactersByStory(storyId) {
    return prisma.character.findMany({
        where: { storyId },
        select: {
            id: true,
            name: true,
            claimedByUserId: true,
            claimedBy: {
                select: { username: true }
            }
        },
        orderBy: { id: "asc" }
    });
}