// src/pages/ResetPassword.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const BACKEND = "http://localhost:4000";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email || !otp || !newPassword) {
      return setMsg("Please fill all the fields.");
    }

    try {
      setLoading(true);

      const res = await axios.post(`${BACKEND}/api/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      setMsg(res.data.message || "Password reset successful!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Invalid OTP or email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-cyan-300 font-mono">
      <form
        onSubmit={reset}
        className="w-full max-w-md p-6 bg-black/60 border border-cyan-700/30 rounded-2xl"
      >
        <h2 className="text-2xl mb-4">Reset Password</h2>

        <input
          className="w-full p-3 mb-3 bg-transparent border rounded-lg"
          placeholder="Email you used"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-3 mb-3 bg-transparent border rounded-lg"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 mb-3 bg-transparent border rounded-lg"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <div className="flex gap-2">
          <button disabled={loading} className="px-4 py-2 rounded bg-cyan-700/30">
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <Link to="/login" className="px-4 py-2 rounded border border-cyan-700/30">
            Back to Login
          </Link>
        </div>

        {msg && <p className="mt-3 text-sm text-cyan-300">{msg}</p>}
      </form>
    </div>
  );
}
