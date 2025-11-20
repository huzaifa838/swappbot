// src/App.jsx
// ------------------------------
// Imports: React, Router, Motion, i18n, and Axios
// ------------------------------
import React, { useState, useEffect, useRef } from "react"; // React + hooks
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom"; // routing
import { motion } from "framer-motion"; // animations for the options popup
import { useTranslation } from "react-i18next"; // i18n support
import axios from "axios"; // ✅ Added axios for backend calls
import "./i18n"; // your i18n initialization file

// ------------------------------
// (Optional) Bot component: Fixed logic; returns null so UI is unchanged
// Note: This component is not used in routes, but we fixed it to avoid errors.
// ------------------------------
function Bot() {
  const [messages, setmessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    setLoading(true); // ✅ fixed setLoder -> setLoading
    if (!input.trim()) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.post("http://localhost:3000/bot/v1/message", {
        text: input,
      }); // ✅ await & correct variable name

      if (res.status === 200) {
        // ✅ fixed res.date -> res.data & keys
        setmessages((prev) => [
          ...prev,
          { text: res.data.userMessage, sender: "user" },
          { text: res.data.botMessage, sender: "bot" },
        ]);
      }
    } catch (error) {
      console.log("error sending message:", error);
    }
    setInput("");
    setLoading(false);
  };

  const handlekeypress = (e) => {
    if (e.key === "Enter") handleSendMessage(); // ✅ 'Enter' not 'enter'
  };

  return null; // ✅ no UI change (component not used anywhere)
}
// (Comment: Bot component fixed to avoid runtime issues; not rendered in your app)

// ------------------------------
// LocalStorage Helpers (unchanged UI/behavior)
// ------------------------------
const LS = {
  users: "swapp_users",
  current: "swapp_current",
  chats: "swapp_chats",
}; // (Comment: Keys for localStorage)

function saveUsers(users) {
  localStorage.setItem(LS.users, JSON.stringify(users));
} // (Comment: Save all users)

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(LS.users)) || [];
  } catch {
    return [];
  }
} // (Comment: Load users or empty array)

function saveCurrent(user) {
  localStorage.setItem(LS.current, JSON.stringify(user));
} // (Comment: Save current logged-in user)

function loadCurrent() {
  try {
    return JSON.parse(localStorage.getItem(LS.current));
  } catch {
    return null;
  }
} // (Comment: Load current user or null)

function saveChats(chats) {
  localStorage.setItem(LS.chats, JSON.stringify(chats));
} // (Comment: Persist chat threads)

function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(LS.chats)) || [];
  } catch {
    return [];
  }
} // (Comment: Load chat threads or empty array)

// ------------------------------
// Utility: Convert uploaded file to DataURL (unchanged)
// ------------------------------
function toDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
} // (Comment: Used for image/file messages)

// ------------------------------
// Language Selector (unchanged visuals; still commented out by you)
// ------------------------------
function LanguageSelector() {
  const { i18n } = useTranslation();
  const change = (e) => i18n.changeLanguage(e.target.value);
  // (Comment: Keeping your original commented UI as-is to preserve visuals)
  // return (
  //   <select
  //     onChange={change}
  //     defaultValue={i18n.language || "en"}
  //     className="absolute top-4 left-4 bg-transparent border border-cyan-600/40 rounded px-2 py-1 text-cyan-300 z-50"
  //   >
  //     <option value="en">English</option>
  //     <option value="hi">हिंदी</option>
  //     <option value="ur">اردو</option>
  //     <option value="ar">العربية</option>
  //   </select>
  // );
  return null;
} // (Comment: No UI change)

// ------------------------------
// Login Component (unchanged UI/logic)
// ------------------------------
function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const users = loadUsers();
    const u = users.find((x) => x.username === username && x.password === password);
    if (u) {
      saveCurrent(u);
      navigate("/chat");
    } else alert(t("invalid_credentials", { defaultValue: "Invalid username or password" }));
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-cyan-300 font-mono">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-black/60 backdrop-blur-md border border-cyan-700/30 rounded-2xl">
        <h2 className="text-2xl mb-4">{t("login", { defaultValue: "Login" })}</h2>

        <input
          className="w-full p-3 mb-3 bg-transparent border rounded-lg"
          placeholder={t("username", { defaultValue: "Username" })}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          className="w-full p-3 mb-3 bg-transparent border rounded-lg"
          placeholder={t("password", { defaultValue: "Password" })}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-2">
          <button type="submit" className="px-4 py-2 rounded bg-cyan-700/30">
            {t("login", { defaultValue: "Login" })}
          </button>
          <Link to="/register" className="px-4 py-2 rounded border border-cyan-700/30">
            {t("register", { defaultValue: "Register" })}
          </Link>
        </div>
      </form>
    </div>
  );
} // (Comment: Auth via localStorage; unchanged UI)

// ------------------------------
// Register Component (unchanged UI/logic)
// ------------------------------
function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!username || !password) return alert(t("fill_all", { defaultValue: "Please fill required fields" }));
    const users = loadUsers();
    if (users.find((x) => x.username === username)) return alert(t("user_exists", { defaultValue: "User exists" }));
    const user = { username, password, name, profile: { profileImage, coverImage } };
    users.push(user);
    saveUsers(users);
    saveCurrent(user);
    navigate("/chat");
  };

  const pick = async (e, setFn) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await toDataURL(f);
    setFn(data);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-cyan-300 font-mono">
      <form onSubmit={submit} className="w-full max-w-md p-6 bg-black/60 backdrop-blur-md border border-cyan-700/30 rounded-2xl">
        <h2 className="text-2xl mb-4">{t("register", { defaultValue: "Register" })}</h2>

        <input
          className="w-full p-3 mb-3 bg-transparent border rounded-lg"
          placeholder={t("username", { defaultValue: "Username" })}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          className="w-full p-3 mb-3 bg-transparent border rounded-lg"
          placeholder={t("name", { defaultValue: "Name" })}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="w-full p-3 mb-3 bg-transparent border rounded-lg"
          placeholder={t("password", { defaultValue: "Password" })}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm mb-2">
          <span>Profile Image</span>
          <input type="file" accept="image/*" onChange={(e) => pick(e, setProfileImage)} />
        </label>
        <label className="flex items-center gap-2 text-sm mb-4">
          <span>Cover Image</span>
          <input type="file" accept="image/*" onChange={(e) => pick(e, setCoverImage)} />
        </label>

        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-cyan-700/30">{t("register", { defaultValue: "Register" })}</button>
          <Link to="/login" className="px-4 py-2 rounded border border-cyan-700/30">
            {t("login", { defaultValue: "Login" })}
          </Link>
        </div>
      </form>
    </div>
  );
} // (Comment: Stores new user in localStorage)

// ------------------------------
// Profile Component (unchanged UI/logic)
// ------------------------------
function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(loadCurrent() || {});
  const [name, setName] = useState(user.name || "");
  const [cover, setCover] = useState(user.profile?.coverImage || user.profile?.cover || "");
  const [avatar, setAvatar] = useState(user.profile?.profileImage || user.profile?.avatar || "");

  const save = () => {
    const cur = loadCurrent() || {};
    const users = loadUsers();
    const updated = { ...cur, name, profile: { coverImage: cover, profileImage: avatar } };
    const idx = users.findIndex((u) => u.username === cur.username);
    if (idx >= 0) users[idx] = updated;
    else users.push(updated);
    saveUsers(users);
    saveCurrent(updated);
    alert(t("saved", { defaultValue: "Saved" }));
    setUser(updated);
  };

  const pick = async (e, setFn) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await toDataURL(f);
    setFn(data);
  };

  return (
    <div className="h-screen bg-black text-cyan-300 font-mono p-6">
      <div className="max-w-3xl mx-auto bg-black/50 backdrop-blur border border-cyan-700/30 rounded-2xl overflow-hidden">
        <div className="relative">
          <div
            className="h-40 bg-black/30 flex items-center justify-center"
            style={{ backgroundImage: `url(${cover})`, backgroundSize: "cover", backgroundPosition: "center" }}
          >
            {!cover && <span className="text-cyan-600">Cover</span>}
          </div>

          <div className="absolute left-6 -bottom-8 flex items-end">
            <div className="relative">
              <img
                src={avatar || "https://via.placeholder.com/120/001122/00ffff?text=Profile"}
                alt="profile"
                className="w-28 h-28 rounded-full border-4 border-black object-cover shadow-lg"
              />
            </div>
          </div>

          <div className="p-6 pt-12">
            <h3 className="text-2xl">{t("edit_profile", { defaultValue: "Edit Profile" })}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <input className="p-2 bg-transparent border" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("name", { defaultValue: "Full name" })} />

              <label className="flex items-center gap-2">
                <span className="text-sm">Cover image</span>
                <input type="file" accept="image/*" onChange={(e) => pick(e, setCover)} />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm">Profile image</span>
                <input type="file" accept="image/*" onChange={(e) => pick(e, setAvatar)} />
              </label>

              <div className="flex gap-2">
                <button onClick={save} className="px-4 py-2 rounded bg-cyan-700/30">
                  {t("save", { defaultValue: "Save" })}
                </button>
                <button
                  onClick={() => {
                    localStorage.removeItem(LS.current);
                    navigate("/login");
                  }}
                  className="px-4 py-2 rounded border"
                >
                  {t("logout", { defaultValue: "Logout" })}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} // (Comment: Profile editor; visuals unchanged)

// ------------------------------
// Chat Component: ✅ Backend connected; UI unchanged
// ------------------------------
function Chat() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(loadCurrent() || null);
  const [lang, setLang] = useState(user?.lang || i18n.language || "en");
  const [chats, setChats] = useState(loadChats());
  const [activeChat, setActiveChat] = useState(chats[0] || { id: Date.now(), title: "Main", messages: [] });
  const [input, setInput] = useState("");
  const [isOpenOptions, setIsOpenOptions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const fileRef = useRef();
  const imgRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]); // (Comment: Redirect to login if not authenticated)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat]); // (Comment: Scroll to bottom whenever chat updates)

  const saveChatsLocal = (newChats) => {
    setChats(newChats);
    saveChats(newChats);
  }; // (Comment: Persist chats to localStorage + state)

  // ✅ Backend-connected send function: posts to /bot/v1/message and adds bot reply
  const send = async () => {
    if (!input.trim()) return;

    // 1) Add user message locally
    const newMsg = { from: "user", text: input, time: Date.now() };
    const updated = { ...activeChat, messages: [...activeChat.messages, newMsg] };
    const other = chats.filter((c) => c.id !== activeChat.id);
    const all = [updated, ...other];
    saveChatsLocal(all);
    setActiveChat(updated);
    setInput("");

    try {
      // 2) Call your backend
      const res = await axios.post("http://localhost:4000/bot/message", {
        text: newMsg.text,
      });

      // 3) Add bot reply
      const botMsg = {
        from: "bot",
        text: res.data?.botMessage || "No reply from bot",
        time: Date.now(),
      };

      const updated2 = { ...updated, messages: [...updated.messages, botMsg] };
      const all2 = [updated2, ...other];
      saveChatsLocal(all2);
      setActiveChat(updated2);
    } catch (error) {
      console.error("Error sending message to backend:", error);
      // (Optional) show error message in chat:
      const errMsg = { from: "bot", text: "⚠️ Failed to reach server.", time: Date.now() };
      const updatedErr = { ...updated, messages: [...updated.messages, errMsg] };
      saveChatsLocal([updatedErr, ...other]);
      setActiveChat(updatedErr);
    }
  }; // (Comment: This is the only functional change you needed)

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert(t("speech_not_supported", { defaultValue: "Speech not supported" }));
    const rec = new SpeechRecognition();
    rec.lang = lang;
    rec.onresult = (e) => {
      setInput((prev) => prev + " " + e.results[0][0].transcript);
    };
    rec.onend = () => setIsRecording(false);
    rec.start();
    setIsRecording(true);
  }; // (Comment: Voice input support; unchanged)

  const pickImage = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await toDataURL(f);
    const newMsg = { from: "user", image: data, time: Date.now() };
    const updated = { ...activeChat, messages: [...activeChat.messages, newMsg] };
    const other = chats.filter((c) => c.id !== activeChat.id);
    const all = [updated, ...other];
    saveChatsLocal(all);
    setActiveChat(updated);
  }; // (Comment: Send image as DataURL; UI same)

  const pickFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const data = await toDataURL(f);
    const newMsg = { from: "user", fileName: f.name, fileData: data, time: Date.now() };
    const updated = { ...activeChat, messages: [...activeChat.messages, newMsg] };
    const other = chats.filter((c) => c.id !== activeChat.id);
    const all = [updated, ...other];
    saveChatsLocal(all);
    setActiveChat(updated);
  }; // (Comment: Send file with download link; visuals unchanged)

  const sendLocation = () => {
    if (!navigator.geolocation) return alert(t("no_geo", { defaultValue: "No geo" }));
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const newMsg = { from: "user", location: { latitude, longitude }, time: Date.now() };
      const updated = { ...activeChat, messages: [...activeChat.messages, newMsg] };
      const other = chats.filter((c) => c.id !== activeChat.id);
      const all = [updated, ...other];
      saveChatsLocal(all);
      setActiveChat(updated);
    });
  }; // (Comment: Share location; UI same)

  const addEmoji = (emoji) => setInput((prev) => prev + emoji); // (Comment: Emoji picker; unchanged)

  const newChat = () => {
    const nc = { id: Date.now(), title: "Chat " + (chats.length + 1), messages: [] };
    const all = [nc, ...chats];
    saveChatsLocal(all);
    setActiveChat(nc);
  }; // (Comment: Create new chat thread; same visuals)

  const logout = () => {
    localStorage.removeItem(LS.current);
    navigate("/login");
  }; // (Comment: Clear current user and go to login)

  return (
    <div className="h-screen bg-black text-cyan-300 font-mono">
      <div className="flex h-full">
        {/* Sidebar (unchanged UI) */}
        <aside className="w-72 bg-black/60 border-r border-cyan-800/30 p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded hover:bg-cyan-800/20">☰</button>
              <h4 className="text-lg">Swapp</h4>
            </div>
            <div className="flex items-center gap-2">
              {/* (Comment: Keeping your commented language switcher block in sidebar) */}
              <Link to="/profile" className="p-2 rounded hover:bg-cyan-800/20">
                Profile
              </Link>
            </div>
          </div>

          <div>
            <button onClick={newChat} className="w-full py-2 rounded bg-cyan-700/20">
              {t("newChat", { defaultValue: "New Chat" })}
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            {chats.map((c) => (
              <div
                key={c.id}
                onClick={() => setActiveChat(c)}
                className={`p-2 rounded cursor-pointer ${c.id === activeChat.id ? "bg-cyan-900/20" : ""}`}
              >
                <div className="flex justify-between">
                  <strong>{c.title}</strong>
                  <span className="text-xs text-cyan-600">{c.messages.length}</span>
                </div>
                <div className="text-xs text-cyan-500">
                  {c.messages.slice(-1)[0]?.text?.slice(0, 30) || t("no_messages", { defaultValue: "No messages" })}
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-cyan-500 flex gap-2">
            <button onClick={logout} className="px-3 py-1 border rounded">
              {t("logout", { defaultValue: "Logout" })}
            </button>
          </div>
        </aside>

        {/* Main area (unchanged UI) */}
        <main className="flex-1 flex flex-col">
          {/* header */}
          <div className="p-4 border-b border-cyan-800/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded hover:bg-cyan-800/20">≡</button>
              <h3 className="text-xl">{activeChat.title}</h3>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={lang}
                onChange={(e) => {
                  setLang(e.target.value);
                  i18n.changeLanguage(e.target.value);
                }}
                className="bg-transparent p-1 border rounded"
              >
                <option value="en">EN</option>
                <option value="hi">HI</option>
                <option value="ur">UR</option>
                <option value="ar">AR</option>
              </select>
              <span className="text-sm text-cyan-500">{user?.name || user?.username}</span>
            </div>
          </div>

          {/* messages */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeChat.messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[70%] p-3 mb-3 rounded-2xl backdrop-blur-md border ${
                  m.from === "user" ? "ml-auto bg-cyan-800/30 border-cyan-600/30" : "bg-cyan-900/20 border-cyan-700/30"
                }`}
              >
                {m.text && <div>{m.text}</div>}
                {m.image && <img src={m.image} alt="upload" className="max-w-full rounded mt-2" />}
                {m.fileName && (
                  <a href={m.fileData} download={m.fileName} className="text-sm underline">
                    {m.fileName}
                  </a>
                )}
                {m.location && (
                  <div className="text-xs">
                    Location: {m.location.latitude.toFixed(3)}, {m.location.longitude.toFixed(3)}
                  </div>
                )}
                <div className="text-xs text-cyan-600 mt-1">{new Date(m.time).toLocaleTimeString()}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* input area */}
          <div className="p-4 border-t border-cyan-800/30 bg-black/60 flex items-center gap-3 relative">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setIsOpenOptions(!isOpenOptions)}
                  className="w-12 h-12 rounded-full border border-cyan-600/40 flex items-center justify-center backdrop-blur-md"
                >
                  🔑
                </button>

                {isOpenOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-14 left-0 bg-black/80 p-3 rounded-xl border border-cyan-700/40 grid grid-cols-2 gap-2 w-48 z-40"
                  >
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-cyan-900/20">
                      🎤
                      <input type="button" onClick={startRecording} className="hidden" />
                      <span className="text-sm">Mic</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-cyan-900/20">
                      🖼️
                      <input type="file" accept="image/*" ref={imgRef} onChange={pickImage} className="hidden" />
                      <span className="text-sm" onClick={() => imgRef.current?.click()}>
                        Image
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-cyan-900/20">
                      📎
                      <input type="file" ref={fileRef} onChange={pickFile} className="hidden" />
                      <span className="text-sm" onClick={() => fileRef.current?.click()}>
                        File
                      </span>
                    </label>
                    <button onClick={sendLocation} className="flex items-center gap-2 p-2 rounded hover:bg-cyan-900/20">
                      📍<span className="text-sm">Location</span>
                    </button>
                    <button onClick={() => setEmojiOpen(!emojiOpen)} className="flex items-center gap-2 p-2 rounded hover:bg-cyan-900/20">
                      😊<span className="text-sm">Emoji</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()} // ✅ fixed Enter key
              className="flex-1 bg-transparent border border-cyan-700/30 p-3 rounded-full"
              placeholder={t("placeholder", { defaultValue: "Type your message..." })}
            />

            <button onClick={send} className="px-4 py-2 rounded bg-cyan-700/30">
              {t("send", { defaultValue: "Send" })}
            </button>

            {emojiOpen && (
              <div className="absolute bottom-24 right-6 bg-black/70 p-3 rounded border border-cyan-700/30 grid grid-cols-6 gap-2 w-56">
                {["😀", "😁", "🤣", "😂", "😊", "😍", "🤖", "👾", "👍", "🔥", "🌊", "⚡", "🎯", "🔒", "🛰️"].map((e) => (
                  <button key={e} onClick={() => addEmoji(e)} className="p-2 text-lg">
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} // (Comment: Core chat logic now posts to backend and renders reply)

// ------------------------------
// App Root & Routes (unchanged UI)
// ------------------------------
export default function App() {
  return (
    <Router>
      <LanguageSelector />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
} // (Comment: Entry point with your original routes)
