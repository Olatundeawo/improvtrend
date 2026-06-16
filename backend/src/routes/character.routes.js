import express from "express";
import {
    createCharacter,
    claim,
    unclaim,
    getCharacters
} from "../controllers/character.controller.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/:storyId/characters", getCharacters);                  
router.post("/:storyId/characters", auth, createCharacter);                 
router.patch("/:storyId/characters/:characterId/claim", auth, claim);      
router.patch("/:storyId/characters/:characterId/unclaim", auth, unclaim);

export default router;