// src/pages/ForgotPassword.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const BACKEND = "http://localhost:4000";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!email.trim()) {
      return setMsg("Please enter your email.");
    }

    try {
      setLoading(true);
      const res = await axios.post(`${BACKEND}/api/auth/forgot-password`, { email });

      setMsg(res.data.message || "OTP sent successfully");
      setTimeout(() => navigate("/reset"), 1000);
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-cyan-300 font-mono">
      <form
        onSubmit={sendOtp}
        className="w-full max-w-md p-6 bg-black/60 border border-cyan-700/30 rounded-2xl"
      >
        <h2 className="text-2xl mb-4">Forgot Password</h2>

        <input
          className="w-full p-3 mb-3 bg-transparent border rounded-lg"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex gap-2">
          <button disabled={loading} className="px-4 py-2 rounded bg-cyan-700/30">
            {loading ? "Sending..." : "Send OTP"}
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
