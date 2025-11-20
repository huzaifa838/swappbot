import mongoose from "mongoose";

const botSchema = new mongoose.Schema({
    sender: {
        type: String,
        default: "bot"
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("Bot", botSchema);