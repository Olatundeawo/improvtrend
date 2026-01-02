import { addTurn, getTurnsByStoryId } from "../services/turn.service.js";

export async function continueStory( req, res) {
    try {
        const { storyId } = req.params;
        const { characterId, content } = req.body
        const userId = req.user.id;

        const turn = await addTurn(storyId, userId, characterId, content);
        res.status(201).json(turn)
    } catch (err) {
        if (
            err.message === "Story is not available." ||
            err.message === "You cannot contribute twice in a row."
        ) {

            return res.status(400).json({ error: err.message })
        }
        res.status(400).json({ error: err.message })
    }
}

export async function getTurns (req, res) {
    try {
        const { storyId } = req.params;

        const turn = await getTurnsByStoryId(storyId)
        res.status(201).json(turn)

    } catch(err) {
        res.status(400).json({ error: err.message})
    }
}