import prisma from "../prisma/client.js";
import { AppError } from "../errors/AppError.js";

export async function addComment(storyId, userId, { content }) {
  if (!content || content.trim().length === 0) {
    throw new AppError("Comment cannot be empty");
  }

  const story = await prisma.story.findUnique({
    where: { id: storyId }
  });

  if (!story) {
    throw new AppError("Story not found");
  }

  return prisma.comment.create({
    data: {
      storyId,
      userId,
      content
    }
  });
}
