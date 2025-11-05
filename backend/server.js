import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoute.js";
import chapterRoutes from "./routes/chapterRoute.js";
import notesRoutes from "./routes/notesRoute.js";
dotenv.config();
connectDB();
const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).send("✅ Server is up and running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/notes", notesRoutes);
const PORT = process.env.PORT ;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
