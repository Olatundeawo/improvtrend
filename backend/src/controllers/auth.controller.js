import { registerUser, loginUser } from "../services/auth.service.js";

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
        error: "username, email, and passwordHash are required"
      });
    }

    const user = await registerUser({username, email, password});

    res.status(201).json({
      message: "User registered successfully",
      userId: user.id
    });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}


export async function login(req, res) {
  try {
    const result = await loginUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
