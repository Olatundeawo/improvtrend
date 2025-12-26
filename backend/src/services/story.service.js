import prisma from "../prisma/client.js";

export async function createStory(userId, { title, content}) {
    return prisma.story.create({
        data: {
            title, content, userId
        }
    })
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