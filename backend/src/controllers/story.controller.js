import {
  createStory,
  getStories,
  getStoryById,
  getStoryByUserId,
  voteToComplete,
  completeStoryByCreator,
  editStory
} from "../services/story.service.js";

export async function create(req, res) {
  try {
    const userId = req.user.id;
    const { title, content, characters, arcSize = "SHORT" } = req.body;

    if (!title || title.trim().length === 0)
      throw new Error("Title can't be empty");
    if (!content || content.trim().length === 0)
      throw new Error("Content can't be empty");
    if (title.length > 50)
      throw new Error("Title cannot be more than 50 characters");
    if (content.length > 150)
      throw new Error("You've passed the number of characters allowed.");

    const story = await createStory(userId, { title, content, characters, arcSize });
    res.status(201).json(story);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


export async function get(req, res) {
  try {
    const story = await getStoryById(req.params.id);
    if (!story) return res.status(404).json({ error: "Story not found" });
    res.status(200).json(story);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


export async function getAll(req, res) {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await getStories({ page, limit });
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


export async function getUserStoryById(req, res) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const stories = await getStoryByUserId(userId);
    if (!stories) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ data: stories });
  } catch (err) {
    console.error("Get stories by user error:", err);
    res.status(500).json({ error: "Failed to fetch user stories" });
  }
}


export async function voteComplete(req, res) {
  try {
    const userId  = req.user.id;
    const storyId = req.params.id;

    const result = await voteToComplete(storyId, userId);
    res.status(200).json(result);
  } catch (err) {
    const status =
      err.message === "Story not found" ? 404 :
      err.message === "Story is already completed" ? 409 :
      err.message === "You have already voted to complete this story" ? 409 : 400;

    res.status(status).json({ error: err.message });
  }
}


export async function complete(req, res) {
  try {
    const userId  = req.user.id;
    const storyId = req.params.id;

    const story = await completeStoryByCreator(storyId, userId);
    res.status(200).json({ message: "Story completed.", story });
  } catch (err) {
    const status =
      err.message === "Story not found" ? 404 :
      err.message === "Only the creator can end their story" ? 403 :
      err.message === "Story is already completed" ? 409 : 400;

    res.status(status).json({ error: err.message });
  }
}

export async function editStoryController(req, res) {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;
 
    const updated = await editStory(id, userId, {
      title,
      content,
    });
 
    res.status(200).json(updated);
  } catch (error) {
    // 400 for validation/permission errors, 404 for not found
    const statusCode = error.message.includes("not found") ? 404 : 400;
    res.status(statusCode).json({ error: error.message });
  }
}