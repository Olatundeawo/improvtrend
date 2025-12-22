import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import commentRoutes from './routes/comment.routes'
import storyRoutes from './routes/story.routes'
import turnRoues from './routes/turn.routes'
import upvoteRoutes from './routes/upvote.routes'


dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.use(
  cors()
);

app.use("/", user(prisma));
app.use("/api/stories", storyRoutes);
app.use("/api", turnRoues);
app.use("/api", commentRoutes);
app.use("/api", upvoteRoutes);


app.use((req, res) => {
    res.status(404).json({
        error: "Route not found"
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