import prisma from "../prisma/client.js";

const MAX_CHARACTERS  = 6;
const CLAIM_WINDOW_MS = 48 * 60 * 60 * 1000;

export async function addCharacter(storyId, name) {
  const story = await prisma.story.findUnique({
    where:   { id: storyId },
    include: { _count: { select: { characters: true } } },
  });

  if (!story) throw new Error("Story not found.");

  if (story._count.characters >= MAX_CHARACTERS)
    throw new Error(`A story cannot have more than ${MAX_CHARACTERS} characters.`);

  const existing = await prisma.character.findUnique({
    where: { name_storyId: { name, storyId } },
  });
  if (existing) throw new Error(`A character named "${name}" already exists in this story.`);

  return prisma.character.create({ data: { name, storyId } });
}

export async function claimCharacter(characterId, userId) {
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) throw new Error("Character not found.");

  const now = new Date();

  // Already claimed by someone else — but allow if their claim has expired
  if (character.claimedByUserId !== null && character.claimedByUserId !== userId) {
    const expired =
      !character.claimExpiresAt || character.claimExpiresAt <= now;
    if (!expired) throw new Error("This character has already been claimed by another user.");
  }

  if (character.claimedByUserId === userId) {
    throw new Error("You have already claimed this character.");
  }

  return prisma.character.update({
    where: { id: characterId },
    data: {
      claimedByUserId: userId,
      claimExpiresAt:  new Date(now.getTime() + CLAIM_WINDOW_MS),
      lastTurnAt:      null,
      warningSentAt:   null,
    },
  });
}

export async function unclaimCharacter(characterId, userId) {
  const character = await prisma.character.findUnique({ where: { id: characterId } });
  if (!character) throw new Error("Character not found.");
  if (character.claimedByUserId !== userId) throw new Error("You do not own this character.");

  return prisma.character.update({
    where: { id: characterId },
    data: {
      claimedByUserId: null,
      claimExpiresAt:  null,
      lastTurnAt:      null,
      warningSentAt:   null,
    },
  });
}

export async function getCharactersByStory(storyId) {
  const now = new Date();

  const characters = await prisma.character.findMany({
    where:   { storyId },
    select: {
      id:              true,
      name:            true,
      claimedByUserId: true,
      claimExpiresAt:  true,
      lastTurnAt:      true,
      claimedBy: { select: { username: true } },
    },
    orderBy: { id: "asc" },
  });

  // Annotate each character with how many hours remain on its claim
  return characters.map((c) => {
    const msLeft =
      c.claimExpiresAt && c.claimedByUserId
        ? Math.max(0, c.claimExpiresAt.getTime() - now.getTime())
        : null;

    return {
      ...c,
      claimExpiresAt:    c.claimExpiresAt ?? null,
      claimHoursRemaining: msLeft !== null ? Math.ceil(msLeft / (60 * 60 * 1000)) : null,
    };
  });
}