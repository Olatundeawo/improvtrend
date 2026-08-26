import { addComment } from "../services/comment.service.js";
import { AppError } from "../errors/AppError.js";

export async function comment(req, res) {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    const MAX_CHAR = 100;

    if (!content || content.trim().length === 0) {
      throw new AppError("Comment cannot be empty");
    }

    if (content.length > MAX_CHAR) {
      throw new AppError("Maximum comment length is 100 characters");
    }

    const comment = await addComment(
      storyId,
      userId,
      { content }
    );

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
