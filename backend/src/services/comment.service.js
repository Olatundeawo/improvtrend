import prisma from "../../prisma/client";


export async function addComment(storyId, userId, { content }) {
    
    await prisma.story.findUnique({
        where: { id: storyId}
    })

    return prisma.comment.create({
        data: {
            storyId, userId, content
        }
    })
    
}