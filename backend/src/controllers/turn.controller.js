import { addTurn } from "../services/turn.service";

export async function continueStory( req, res) {
    try {
        const { storyId } = req.params;
        const { characterId, content } = req.body
        const userId = req.user.id;

        const turn = await addTurn(storyId, userId, characterId, content);
        res.status(201).json(turn)
    } catch (err) {
        res.status(400).json({ error: err.message })
    }
}