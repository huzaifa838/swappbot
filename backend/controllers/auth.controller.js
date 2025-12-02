import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AuthUser from "../models/authUser.model.js";
import { sendOtpEmail } from "../utils/mailer.js";

/* -----------------------------------------
   REGISTER
--------------------------------------------*/
export const register = async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email & Password required" });

    const exists = await AuthUser.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await AuthUser.create({
      email,
      name,
      password: hashed,
    });

    res.json({
      message: "Registered Successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });

  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------------------
   LOGIN
--------------------------------------------*/
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid login" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid login" });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login OK",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      }
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------------------
   FORGOT PASSWORD (SEND OTP)
--------------------------------------------*/
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(400).json({ message: "Email not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    await sendOtpEmail(email, otp);

    res.json({ message: "OTP sent to your email" });

  } catch (err) {
    console.log("FORGOT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -----------------------------------------
   RESET PASSWORD (OTP BASED)
--------------------------------------------*/
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await AuthUser.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpires < new Date())
      return res.status(400).json({ message: "OTP expired" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (err) {
    console.log("RESET ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
