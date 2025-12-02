// src/App.jsx
import React, { useState, useEffect, useRef } from "react";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate
} from "react-router-dom";
import axios from "axios";
import "./themes.css";
import "./i18n";

const BACKEND = "http://localhost:4000";

// ------------------- AUTH HELPERS -------------------
const setAuthToken = (token) => {
  if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete axios.defaults.headers.common["Authorization"];
};

const LS = {
  current: "swapp_current",
  token: "swapp_token",
  chats: "swapp_chats"
};

const saveCurrent = (u) => localStorage.setItem(LS.current, JSON.stringify(u));
const loadCurrent = () => JSON.parse(localStorage.getItem(LS.current)) || null;

const saveToken = (t) => {
  localStorage.setItem(LS.token, t);
  setAuthToken(t);
};
const loadToken = () => localStorage.getItem(LS.token);

const clearAuth = () => {
  localStorage.removeItem(LS.token);
  localStorage.removeItem(LS.current);
  setAuthToken(null);
};

const saveChats = (c) => localStorage.setItem(LS.chats, JSON.stringify(c));
const loadChats = () => JSON.parse(localStorage.getItem(LS.chats)) || [];

// ------------------- NAVBAR -------------------
function Navbar({ theme, setTheme, brightness, setBrightness }) {
  return (
    <div className="w-full flex justify-between px-6 py-4 border-b border-[var(--neon-color)] bg-black/40 backdrop-blur fixed top-0 z-50">

      <Link to="/chat" className="text-xl font-bold">
        SwappBot
      </Link>

      <div className="flex items-center gap-6">

        {/* LANGUAGE */}
        <select className="bg-transparent border px-2 py-1 rounded text-white">
          <option>English</option>
          <option>Hindi</option>
          <option>Arabic</option>
          <option>Chinese</option>
        </select>

        {/* THEME SELECTOR */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="bg-transparent border px-2 py-1 rounded text-white"
        >
          <option value="blue">Neon Blue</option>
          <option value="green">Neon Green</option>
          <option value="orange">Neon Orange</option>
          <option value="red">Neon Red</option>
          <option value="white">White</option>
        </select>

        {/* Brightness */}
        <input
          type="range"
          min="0.1"
          max="1"
          step="0.1"
          value={brightness}
          onChange={(e) => setBrightness(e.target.value)}
        />
      </div>
    </div>
  );
}

// ------------------- LOGIN -------------------
function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND}/api/auth/login`, {
        email,
        password
      });
      saveToken(res.data.token);
      saveCurrent(res.data.user);
      navigate("/chat");
    } catch (err) {
      alert(err?.response?.data?.message || "Invalid login");
    }
  };

  return (
    <div className="page">
      <form onSubmit={submit} className="box">
        <h2 className="title">Login</h2>

        <input
          className="input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn">Login</button>

        <div className="text-sm mt-3 flex justify-between">
          <Link to="/register">Register</Link>
          <Link to="/forgot">Forgot?</Link>
        </div>
      </form>
    </div>
  );
}

// ------------------- REGISTER -------------------
function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND}/api/auth/register`, {
        email,
        name,
        password
      });
      alert("Registered!");
      navigate("/login");
    } catch (err) {
      alert(err?.response?.data?.message || "Error");
    }
  };

  return (
    <div className="page">
      <form onSubmit={submit} className="box">
        <h2 className="title">Register</h2>

        <input
          className="input"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          placeholder="Full Name"
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input"
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="btn">Register</button>
      </form>
    </div>
  );
}

// ------------------- CHAT PAGE -------------------
function Chat() {
  const navigate = useNavigate();
  const [user] = useState(loadCurrent());
  const [chats, setChats] = useState(loadChats());

  const [activeChat, setActiveChat] = useState(
    chats[0] || { id: Date.now(), title: "Chat", messages: [] }
  );

  const [input, setInput] = useState("");
  const bottomRef = useRef();

  useEffect(() => {
    if (!loadToken()) navigate("/login");
  }, []);

  // AUTO SCROLL FIX
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat.messages]);

  const saveLocalChats = (c) => {
    setChats(c);
    saveChats(c);
  };

  const send = async () => {
    if (!input.trim()) return;

    const msg = { from: "user", text: input, time: Date.now() };
    const updated = {
      ...activeChat,
      messages: [...activeChat.messages, msg]
    };
    const others = chats.filter((x) => x.id !== activeChat.id);

    saveLocalChats([updated, ...others]);
    setActiveChat(updated);
    setInput("");

    try {
      const res = await axios.post(`${BACKEND}/api/bot/message`, {
        text: msg.text
      });

      const botMsg = {
        from: "bot",
        text: res.data.botMessage,
        time: Date.now()
      };

      const updated2 = {
        ...updated,
        messages: [...updated.messages, botMsg]
      };

      saveLocalChats([updated2, ...others]);
      setActiveChat(updated2);
    } catch {
      const errMsg = {
        from: "bot",
        text: "⚠ Server error",
        time: Date.now()
      };
      const updErr = {
        ...updated,
        messages: [...updated.messages, errMsg]
      };
      saveLocalChats([updErr, ...others]);
      setActiveChat(updErr);
    }
  };

  return (
    <div className="chat-page">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h3 className="text-xl">Chats</h3>

        <button
          className="btn"
          onClick={() => {
            const nc = {
              id: Date.now(),
              title: "Chat",
              messages: []
            };
            saveLocalChats([nc, ...chats]);
            setActiveChat(nc);
          }}
        >
          New Chat
        </button>

        <div className="chat-list">
          {chats.map((c) => (
            <div
              key={c.id}
              className={`chat-item ${c.id === activeChat.id ? "active" : ""
                }`}
              onClick={() => setActiveChat(c)}
            >
              {c.title}
            </div>
          ))}
        </div>

        {/* LOGOUT FIXED BOTTOM */}
        <button
          className="btn"
          style={{ marginTop: "auto" }}
          onClick={() => {
            clearAuth();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>

      {/* MAIN CHAT WINDOW */}
      <div className="chat-window">
        <div className="messages">
          {activeChat.messages.map((m, i) => (
            <div key={i} className={`msg ${m.from}`}>
              {m.text}
              <div className="time">
                {new Date(m.time).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="send-bar">
          <input
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type..."
          />
          <button className="btn small-btn" onClick={send}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------- ROOT APP -------------------
export default function App() {
  const [theme, setTheme] = useState("blue");       // default = Neon Blue
  const [brightness, setBrightness] = useState(0.7);

  useEffect(() => {
    const t = loadToken();
    if (t) setAuthToken(t);
  }, []);

  return (
    <Router>
      <Navbar
        theme={theme}
        setTheme={setTheme}
        brightness={brightness}
        setBrightness={setBrightness}
      />

      <div
        className={`theme-${theme}`}
        style={{ "--neon-bright": brightness }}
      >
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Important */}
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset" element={<ResetPassword />} />

          {/* Protected */}
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </div>
    </Router>
  );
}
