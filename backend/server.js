import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes.js";
import botRoutes from "./routes/swappbot.routes.js";
import connectDB from "./config/db.js";

import path from "path";
import { fileURLToPath } from "url";

// Get dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env correctly
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bot", botRoutes);

connectDB();

// Health
app.get("/health", (req, res) => {
  const dbState = ["disconnected","connected","connecting","disconnecting"];
  res.json({
    status: "server ok",
    database: dbState[mongoose.connection.readyState]
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(chalk.cyan(`🚀 Server running on port ${port}`));
});
