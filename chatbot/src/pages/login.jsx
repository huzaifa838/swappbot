import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:4000/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setMsg("Login successful");

      // redirect to chatbot
      window.location.href = "/";
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ padding: 30 }}>
      <h2>Login</h2>
      <form onSubmit={loginUser}>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <br />
        <button>Login</button>
      </form>
      <p>{msg}</p>
    </div>
  );
}
