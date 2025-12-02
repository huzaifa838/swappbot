import express from "express";
import { Message } from "../controllers/swappbot.message.js";
import auth from "../middleware/auth.middleware.js";
import { messageBot } from "../controllers/swappbot.message.js";



// const router = express.Router();



const router = express.Router();

router.post("/ask", messageBot);

// test
router.get("/test", (req, res) => {
  res.json({ message: "bot test working" });
});

// ⭐ MAIN CHAT ROUTE ⭐
router.post("/message", auth, Message);   // ✅ FIXED

export default router;
