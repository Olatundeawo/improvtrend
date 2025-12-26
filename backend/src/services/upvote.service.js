import prisma from "../prisma/client.js";

export async function toggleUpvote(turnId, userId) {
    const existing = await prisma.turnUpvote.findUnique({
        where: {
            turnId_userId: {
                turnId, userId
            }
        }
    });

    if (existing) {
        await prisma.turnUpvote.delete({
            where: {id: existing.id}
        });
        return { upvoted: false}
    }

    await prisma.turnUpvote.create({
        data: {
            turnId, userId
        }
    });

    return { upvoted: true }
}