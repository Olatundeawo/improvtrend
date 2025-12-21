import { addComment } from "../services/comment.service";

export async function comment(req, res) {
    try {
        const storyId = req.params
        const userId = req.user.id
        const { content } = req.body
        const maxChar = 100

        if (content > maxChar) {
            throw new Error("maximum coment characters is 100")
        }

        const comment = await addComment(storyId, userId, content)
        res.status(201).json(comment)
    } catch (err) {
        res.status(400).json({ Error: err.message})
    }
}