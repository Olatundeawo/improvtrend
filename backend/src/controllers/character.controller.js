import {
    addCharacter,
    claimCharacter,
    unclaimCharacter,
    getCharactersByStory
} from "../services/characters.service.js";

export async function createCharacter(req, res) {
    try {
        const { storyId } = req.params;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: "Character name is required." });
        }

        const character = await addCharacter(storyId, name.trim());
        res.status(201).json(character);
    } catch (err) {
        const clientErrors = [
            "Story not found.",
            `A story cannot have more than 6 characters.`,
        ];

        if (clientErrors.includes(err.message) || err.message.startsWith("A character named")) {
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: "Something went wrong." });
    }
}

export async function claim(req, res) {
    try {
        const { characterId } = req.params;
        const userId = req.user.id;

        const character = await claimCharacter(Number(characterId), userId);
        res.status(200).json(character);
    } catch (err) {
        const clientErrors = [
            "Character not found.",
            "You have already claimed this character.",
            "This character has already been claimed by another user.",
        ];

        if (clientErrors.includes(err.message)) {
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: "Something went wrong." });
    }
}

export async function unclaim(req, res) {
    try {
        const { characterId } = req.params;
        const userId = req.user.id;

        const character = await unclaimCharacter(Number(characterId), userId);
        res.status(200).json(character);
    } catch (err) {
        const clientErrors = [
            "Character not found.",
            "You do not own this character.",
        ];

        if (clientErrors.includes(err.message)) {
            return res.status(400).json({ error: err.message });
        }

        res.status(500).json({ error: "Something went wrong." });
    }
}

export async function getCharacters(req, res) {
    try {
        const { storyId } = req.params;
        const characters = await getCharactersByStory(storyId);
        res.status(200).json(characters);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong." });
    }
}