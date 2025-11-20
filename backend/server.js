import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import chalk from "chalk";

// ✅ Import database connection
import connectDB from "./config/db.js";

// ✅ Import your routes
import swappbotRoutes from "./routes/swappbot.routes.js";

// ✅ Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Connect to MongoDB
connectDB();

// ✅ Routes
app.use("/bot", swappbotRoutes);

// ✅ Health check route
app.get("/health", (req, res) => {
  const dbState = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "✅ Server running",
    database: dbState[mongoose.connection.readyState],
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "❌ Route not found" });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error(chalk.red("🔥 Server Error:"), err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message,
  });
});

// ✅ Start Server
app.listen(port, () => {
  console.log(chalk.cyan(`🚀 Server running on port ${port}`));
});

