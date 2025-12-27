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
      err.message === "choose a different username, username already picked." ||
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
