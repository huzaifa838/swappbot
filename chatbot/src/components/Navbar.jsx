// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Theme + brightness config (for neon border + glow)
const getThemeConfig = (theme, brightness = 1) => {
  // clamp brightness between 0.3 and 2
  const b = Math.max(0.3, Math.min(brightness, 2));

  const alpha = 0.35 * b; // glow intensity
  const borderWidth = 1 + 0.3 * b;

  switch (theme) {
    case "orange":
      return {
        border: `rgba(249,115,22,${0.8})`,
        glow: `0 0 ${10 + 10 * b}px rgba(249,115,22,${alpha})`,
        borderWidth,
      };
    case "red":
      return {
        border: `rgba(248,113,113,${0.9})`,
        glow: `0 0 ${10 + 10 * b}px rgba(248,113,113,${alpha})`,
        borderWidth,
      };
    case "green":
      return {
        border: `rgba(34,197,94,${0.9})`,
        glow: `0 0 ${10 + 10 * b}px rgba(34,197,94,${alpha})`,
        borderWidth,
      };
    case "white":
      return {
        border: `rgba(229,231,235,${0.9})`,
        glow: `0 0 ${8 + 8 * b}px rgba(209,213,219,${alpha})`,
        borderWidth,
      };
    default:
      return {
        border: `rgba(249,115,22,${0.8})`,
        glow: `0 0 ${10 + 10 * b}px rgba(249,115,22,${alpha})`,
        borderWidth,
      };
  }
};

export default function Navbar({ theme, onThemeChange, brightness, onBrightnessChange }) {
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "en");
  const location = useLocation();
  const navigate = useNavigate();

  const cfg = getThemeConfig(theme, brightness || 1);

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    i18n.changeLanguage(newLang);
  };

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    onThemeChange && onThemeChange(newTheme);
  };

  const handleBrightnessChange = (value) => {
    const num = Number(value);
    if (!onBrightnessChange) return;
    onBrightnessChange(num);
  };

  const isActive = (path) => location.pathname === path;

  // Brightness knob maths (for pointer rotation)
  const minB = 0.3;
  const maxB = 2;
  const bNorm = Math.max(minB, Math.min(brightness || 1, maxB));
  // rotation from -120 to +120 degrees
  const angle = ((bNorm - minB) / (maxB - minB)) * 240 - 120;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: theme === "white" ? "rgba(248,250,252,0.9)" : "rgba(0,0,0,0.75)",
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
        borderBottom: `${cfg.borderWidth}px solid ${cfg.border}`,
        boxShadow: cfg.glow,
      }}
      className="w-full px-6 py-3 text-xs sm:text-sm flex items-center justify-between font-mono"
    >
      {/* LEFT: Logo + Links */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate("/")}
          className="text-lg font-bold tracking-wide hover:opacity-90 transition"
        >
          Swapp
          <span style={{ color: cfg.border }}>Bot</span>
        </button>

        <div className="hidden sm:flex items-center gap-3 sm:gap-4">
          <Link
            to="/"
            className={`px-3 py-1 rounded-full border transition ${
              isActive("/") || isActive("/login") ? "bg-white/10" : "bg-transparent"
            }`}
            style={{ borderColor: cfg.border }}
          >
            Home
          </Link>
          <Link
            to="/chat"
            className={`px-3 py-1 rounded-full border transition ${
              isActive("/chat") ? "bg-white/10" : "bg-transparent"
            }`}
            style={{ borderColor: cfg.border }}
          >
            Chat
          </Link>
          <Link
            to="/profile"
            className={`px-3 py-1 rounded-full border transition ${
              isActive("/profile") ? "bg-white/10" : "bg-transparent"
            }`}
            style={{ borderColor: cfg.border }}
          >
            Profile
          </Link>
        </div>
      </div>

      {/* RIGHT: Language + Theme + Brightness */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Language selector */}
        <div className="flex items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-xs opacity-70">Lang</span>
          <select
            value={lang}
            onChange={handleLangChange}
            className="bg-black/40 text-[11px] sm:text-xs border rounded-full px-3 py-1 outline-none"
            style={{
              borderColor: cfg.border,
              color: theme === "white" ? "#020617" : "#e5e7eb",
              background: theme === "white" ? "#0f172a" : "rgba(15,23,42,0.8)",
            }}
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="ar">العربية</option>
            <option value="zh">中文</option>
          </select>
        </div>

        {/* Theme selector */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2">
          <span className="text-[10px] sm:text-xs opacity-70">Theme</span>
          <select
            value={theme}
            onChange={handleThemeChange}
            className="bg-black/40 text-[11px] sm:text-xs border rounded-full px-3 py-1 outline-none"
            style={{
              borderColor: cfg.border,
              color: theme === "white" ? "#020617" : "#e5e7eb",
              background: theme === "white" ? "#0f172a" : "rgba(15,23,42,0.8)",
            }}
          >
            <option value="orange">Orange Neon</option>
            <option value="red">Red Neon</option>
            <option value="green">Green Neon</option>
            <option value="white">White</option>
          </select>
        </div>

        {/* 🔥 Brightness Knob */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs opacity-70 hidden sm:inline">
            Neon
          </span>
          <div
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center"
            style={{
              border: `${cfg.borderWidth}px solid ${cfg.border}`,
              boxShadow: cfg.glow,
              background: theme === "white" ? "#f9fafb" : "#020617",
            }}
          >
            {/* inner circle */}
            <div
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-full"
              style={{
                background:
                  theme === "white"
                    ? "radial-gradient(circle, #f9fafb 0, #e5e7eb 60%, #cbd5f5 100%)"
                    : "radial-gradient(circle, #0f172a 0, #020617 70%, #000000 100%)",
              }}
            />

            {/* pointer */}
            <div
              className="absolute origin-center w-[2px] sm:w-[3px] h-[40%] rounded-full"
              style={{
                background: cfg.border,
                transform: `rotate(${angle}deg) translateY(-8%)`,
                transformOrigin: "50% 80%",
              }}
            />

            {/* invisible range input on top for drag control */}
            <input
              type="range"
              min={minB}
              max={maxB}
              step="0.1"
              value={bNorm}
              onChange={(e) => handleBrightnessChange(e.target.value)}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
