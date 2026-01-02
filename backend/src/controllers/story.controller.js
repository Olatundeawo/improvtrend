import { createStory, getStories, getStoryById } from "../services/story.service.js";


export async function create(req, res) {
    try {
        const userId = req.user.id
        const { title, content, characters } = req.body
        const maxChar = 50
        const maxCont = 150

        if (!title || title.trim().length === 0) {
            throw new Error("Title cant be empty")
        }

        if (!content || content.trim().length === 0) {
            throw new Error("Content cant be empty")
        }

        if (title.length > maxChar) {
            throw new Error("Title cannot be more than 50 characters")
        }

        if ( content.length > maxCont) {
            throw new Error("You've passed the numbers of characters alllowed.")
        }

        const story = await createStory(userId, {title, content, characters});
        res.status(201).json(story)
    } catch ( err ) {
        if( 
            err.message === "Title cannot be more than 50 characters" ||
            err.message === "You've passed the numbers of characters alllowed."
        ) {
            return res.status(400).json({error: err.message})
        }
        res.status(400).json({ error: err.message })
    }
}

export async function get(req, res) {
    try {
        const {id} = req.params

        const getStory = await getStoryById(id);
        res.status(200).json(getStory)
    } catch ( err ) {
        res.status(400).json({error: err.message})
    }
}

export async function getAll(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    try {
        const getAll = await getStories({page, limit});
        res.status(200).json(getAll)
    } catch (err) {
         res.status(400).json({Error: err.message})
        
    }
}