import express from "express";
import { Message } from "../controllers/swappbot.message.js";

const router = express.Router();

// ✅ Test Route
router.get("/test", (req, res) => {
    res.json({ message: "✅ /bot/test working!" });
});

// ✅ Chatbot Message Route
router.post("/message", Message);

export default router;