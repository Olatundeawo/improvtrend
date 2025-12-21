import { createStory, getStories, getStoryById } from "../services/story.service";


export async function create(req, res) {
    try {
        const userId = req.user.id
        const { title, content } = req.body
        const maxChar = 50
        const maxCont = 150

        if (title > maxChar) {
            throw new Error("Title cannot be more than 50 characters")
        }

        if ( content > maxCont) {
            throw new Error("You've passed the numbers of characters alllowed.")
        }

        const story = await createStory(userId, title, content);
        res.status(201).json(story)
    } catch ( err ) {
        res.status(400).json({ error: err.message })
    }
}

export async function get(req, res) {
    try {
        const id = req.params

        const getStory = await getStoryById(id);
        res.status(201).json(getStory)
    } catch ( err ) {
        res.status(400).json({error: err.message})
    }
}

export async function getAll(req, res) {
    try {
        const getAll = await getStories();
        res.status(201).json(getAll)
    } catch (err) {
        res.json(400).json({Error: err.message})
    }
}