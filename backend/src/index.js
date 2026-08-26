import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import commentRoutes from './routes/comment.routes.js'
import storyRoutes from './routes/story.routes.js'
import turnRoues from './routes/turn.routes.js'
import authRoutes from './routes/auth.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import characterRouter from "./routes/character.routes.js";
import reactionRoutes from "./routes/reaction.routes.js";
import xpRoutes from "./routes/xp.routes.js";
import userRoutes from "./routes/user.routes.js";
import { startScheduler } from "./services/scheduler.service.js";
import { AppError } from "./errors/AppError.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("METHOD:", req.method);
  console.log("URL:", req.url);
  console.log("CONTENT-TYPE:", req.headers["content-type"]);
  console.log("RAW BODY:", req.body);
  next();
});

app.use(
  cors()
);

app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api/stories", characterRouter);
app.use("/api", turnRoues);
app.use("/api", notificationRoutes);
app.use("/api", commentRoutes);
app.use("/api", userRoutes);
app.use("/api/xp", xpRoutes);
app.use("/api/reactions", reactionRoutes);
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: Date.now(),
  });
});



app.use((req, res) => {
  res.status(404).json({
    error: "Route not found, enter a valid route",
    code: "ROUTE_NOT_FOUND",
  });
})

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const isAppError = err instanceof AppError || err?.isAppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Internal server error";
  const code = isAppError ? err.code : "INTERNAL_SERVER_ERROR";

  console.error(err);

  res.status(statusCode).json({ error: message, code });
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Currently listen on port ${PORT}`);
  startScheduler();
});