import { toggleUpvote } from "../services/upvote.service";

export async function upvoteTurn(req, res) {
    try {
        const { turnId } = req.params;
        const userId = req.user.id;

        const result = await toggleUpvote(turnId, userId);
        res.json(result)
    } catch (err) {
        res.status(400).json({ error: err.message})
    }
}