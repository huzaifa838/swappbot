import mongoose from "mongoose";

const authUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, default: "" },
  password: { type: String, required: true },

  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("AuthUser", authUserSchema);
