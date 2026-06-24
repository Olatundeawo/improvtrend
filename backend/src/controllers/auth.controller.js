import { registerUser, loginUser, updateProfile, getProfile } from "../services/auth.service.js";
import { uploadAvatar } from "../services/upload.service.js";


export async function register(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({
        error: "Request body is missing or invalid JSON"
      });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        error: "username, email, and password are required"
      });
    }

    const user = await registerUser({username, email, password});

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id
    });

  } catch (err) {
    if (
      err.message === "Choose a different username, username already picked." ||
      err.message === "Email already used"
    ) {
     return res.status(409).json({ error: err.message})
    }
    res.status(400).json({ error: err.message });
  }
}


export async function login(req, res) {
  try {
    if (!req.body) {
      return res.status(400).json({
        error: "Request body is missing or invalid JSON"
      });
    }

    const { username, email, password } = req.body;

    if ((!username && !email) || !password) {
      return res.status(400).json({
        error: "username, email, and password are required"
      });
    }
    const result = await loginUser({username, email, password});
    res.json(result);
  } catch (err) {
    if (
    err.message === "Invalid credentials" ||
    err.message === "Password mismatch"
  ) {
    return res.status(401).json({ error: err.message });
  }
    res.status(400).json({ error: err.message });
  }
}

export async function getProfileHandler(req, res) {
    try {
        const user = await getProfile(req.user.id);
        res.status(200).json(user);
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
}

export async function updateProfileHandler(req, res) {
    try {
        const { bio, genrePreferences } = req.body;

        let avatarUrl;
        if (req.file) {
            avatarUrl = await uploadAvatar(req.file.buffer);
        }

        // genrePreferences may arrive as a JSON string if sent via multipart/form-data
        const parsedGenres = genrePreferences
            ? (typeof genrePreferences === "string" ? JSON.parse(genrePreferences) : genrePreferences)
            : undefined;

        console.log("userId from token:", req.user.id);

        const user = await updateProfile(req.user.id, {
            bio,
            avatarUrl,
            genrePreferences: parsedGenres,
        });

        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}