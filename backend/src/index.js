import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import commentRoutes from './routes/comment.routes.js'
import storyRoutes from './routes/story.routes.js'
import turnRoues from './routes/turn.routes.js'
import upvoteRoutes from './routes/upvote.routes.js'
import authRoutes from './routes/auth.routes.js'

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  console.log("METHOD:", req.method);
  console.log("CONTENT-TYPE:", req.headers["content-type"]);
  console.log("RAW BODY:", req.body);
  next();
});

app.use(
  cors()
);

app.use("/api/auth", authRoutes);
app.use("/api/stories", storyRoutes);
app.use("/api", turnRoues);
app.use("/api", commentRoutes);
app.use("/api", upvoteRoutes);


app.use((req, res) => {
    res.status(404).json({
        error: "Route not found, enter a valid route"
    })
})

app.use((err, req, res, next) => {
    console.error(err)

    res.status(err.status || 500).json({
        error: err.message || "internal error"
    })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Currently listen on port ${PORT}`);
});