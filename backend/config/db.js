import mongoose from "mongoose";
import chalk from "chalk"; // Optional (for colored logs)

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Prevent hanging
    });
    console.log(chalk.green("✅ MongoDB Connected Successfully"));
  } catch (error) {
    console.error(chalk.red("❌ MongoDB connection error:"), error.message);
    // Retry connection every 5 seconds if failed
    setTimeout(connectDB, 5000);
  }
};

// 🔁 Auto-reconnect when disconnected
mongoose.connection.on("disconnected", () => {
  console.log(chalk.yellow("⚠️ MongoDB disconnected. Reconnecting..."));
  connectDB();
});

// 🔍 Handle runtime errors
mongoose.connection.on("error", (err) => {
  console.error(chalk.red("❌ MongoDB runtime error:"), err.message);
});

export default connectDB;
