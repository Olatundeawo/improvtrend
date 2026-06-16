import {
  toggleReaction,
  getReactionSummary,
  getBulkReactionSummary,
} from "../services/reaction.service.js";

export async function handleToggleReaction(req, res) {
  try {
    const { turnId } = req.params;
    const { type } = req.body;
    const userId = req.user.id;

    if (!type) {
      return res.status(400).json({ error: "Reaction type is required" });
    }

    const result = await toggleReaction(turnId, userId, type);
    const summary = await getReactionSummary(turnId, userId);

    return res.json({ ...result, summary });
  } catch (err) {
    if (err.message.startsWith("Invalid reaction")) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function handleGetReactions(req, res) {
  try {
    const { turnId } = req.params;
    const userId = req.user.id;

    const summary = await getReactionSummary(turnId, userId);
    return res.json({ summary });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}

export async function handleGetBulkReactions(req, res) {
  try {
    const { turnIds } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(turnIds) || !turnIds.length) {
      return res.status(400).json({ error: "turnIds must be a non-empty array" });
    }

    const summary = await getBulkReactionSummary(turnIds, userId);
    return res.json({ summary });
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong" });
  }
}