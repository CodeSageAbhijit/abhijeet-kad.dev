import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import TerminalWidget from "./TerminalWidget";
import HireMeButton from "./HireMeButton";

const ROLES = [
  "Full Stack Developer",
  "React & Node.js Engineer",
  "Penetration Tester",
  "3D Web Experiences Dev",
  "Problem Solver",
];

const RED_ROLES = ["Penetration Tester"];

// Show only 2 important stats for mobile
const STATS = [
  { val: "10+", label: "Projects" },
  { val: "150+", label: "LeetCode" },
];

const useTypewriter = (words, speed = 90, pause = 1800) => {
  const [index, setIndex] = useState(0);
  const [sub, setSub] = useState(0);
  const [del, setDel] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    const word = words[index % words.length];
    let timer;
    if (!del && sub < word.length) {
      timer = setTimeout(() => {
        setText(word.slice(0, sub + 1));
        setSub(s => s + 1);
      }, speed);
    } else if (!del && sub === word.length) {
      timer = setTimeout(() => setDel(true), pause);
    } else if (del && sub > 0) {
      timer = setTimeout(() => {
        setText(word.slice(0, sub - 1));
        setSub(s => s - 1);
      }, speed / 2);
    } else if (del && sub === 0) {
      setDel(false);
      setIndex(i => i + 1);
    }
    return () => clearTimeout(timer);
  }, [sub, del, index, words, speed, pause]);

  const currentWord = words[index % words.length];
  return { text, isRed: RED_ROLES.includes(currentWord) };
};

const HeroMobile = () => {
  const { text: role, isRed: roleIsRed } = useTypewriter(ROLES);

  return (
    <section className="relative w-full min-h-screen mx-auto overflow-hidden bg-hero-pattern bg-cover bg-no-repeat bg-center pt-32 pb-20 px-6">
      {/* Deep radial glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 35% 55%, rgba(158,255,0,0.06) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 75% 45%, rgba(230,48,48,0.05) 0%, transparent 60%)",
      }} />

      {/* Status bar */}
      <div style={{
        position: "absolute", top: 86, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 12, zIndex: 10, padding: "0 16px",
        fontSize: "10px",
      }}>
        <div style={{
          height: 1, flex: 1,
          background: "linear-gradient(to right, transparent, rgba(158,255,0,0.25))",
        }} />
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 9, color: "rgba(158,255,0,0.6)",
          letterSpacing: 2,
        }}>
          <span className="status-dot" />
          ONLINE
        </div>
        <div style={{
          height: 1, flex: 1,
          background: "linear-gradient(to left, transparent, rgba(158,255,0,0.25))",
        }} />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col items-center justify-center mt-12 gap-8"
      >
        {/* Tag line */}
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 10, color: "rgba(158,255,0,0.55)",
          letterSpacing: 3,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <span style={{ color: "#9eff00" }}>❯</span>
          <span>root@portfolio</span>
          <span className="cursor-blink" style={{ width: 5, height: "0.8em" }} />
        </div>

        {/* Name */}
        <div
          className="glitch flicker text-center"
          data-text="Abhijeet Kad"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "2.25rem", // text-4xl equivalent
            color: "#ffffff",
            letterSpacing: 4,
            lineHeight: 1,
            textShadow: "0 0 40px rgba(158,255,0,0.15)",
          }}
        >
          Abhijeet Kad
        </div>

        {/* Typewriter role */}
        <div style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "13px",
          letterSpacing: 2,
          display: "flex", alignItems: "center", gap: 4,
          justifyContent: "center",
          minHeight: 20,
          flexWrap: "wrap",
        }}>
          <span style={{ color: roleIsRed ? "rgba(230,48,48,0.5)" : "rgba(158,255,0,0.4)" }}>//</span>
          <span style={{
            color: roleIsRed ? "#e63030" : "#9eff00",
            textShadow: roleIsRed ? "0 0 14px rgba(230,48,48,0.45)" : "0 0 10px rgba(158,255,0,0.3)",
            transition: "color 0.4s, text-shadow 0.4s",
          }}>{role}</span>
          <span className="cursor-blink" style={{
            width: 7, height: "1em",
            background: roleIsRed ? "#e63030" : "#9eff00",
            boxShadow: roleIsRed ? "0 0 6px #e63030" : "0 0 6px #9eff00",
          }} />
        </div>

        {/* Stats - 2 column grid */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-4">
          {STATS.map(({ val, label }) => {
            const isLeet = val === "150+";
            return (
              <div key={label} style={{
                display: "flex", flexDirection: "column",
                alignItems: "center",
                padding: "10px 12px",
                background: isLeet ? "rgba(248,161,0,0.05)" : "rgba(158,255,0,0.04)",
                border: isLeet ? "1px solid rgba(248,161,0,0.22)" : "1px solid rgba(158,255,0,0.18)",
                borderTop: isLeet ? "2px solid rgba(248,161,0,0.65)" : "2px solid rgba(158,255,0,0.5)",
                cursor: isLeet ? "pointer" : "default",
                borderRadius: 6,
              }}
                onClick={isLeet ? () => window.open("https://leetcode.com/u/AbhijitKad/", "_blank") : undefined}
              >
                <span style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 20, lineHeight: 1,
                  background: isLeet ? "linear-gradient(to top, #f8a100, #ffd166)" : "none",
                  WebkitBackgroundClip: isLeet ? "text" : "unset",
                  WebkitTextFillColor: isLeet ? "transparent" : "#9eff00",
                  color: isLeet ? undefined : "#9eff00",
                  textShadow: isLeet ? "none" : "0 0 12px rgba(158,255,0,0.4)",
                }}>{val}</span>
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 9, color: isLeet ? "rgba(248,161,0,0.5)" : "rgba(158,255,0,0.45)",
                  letterSpacing: 1, marginTop: 2, textTransform: "uppercase", textAlign: "center",
                }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Terminal Widget */}
        <div className="w-full max-w-xs mt-6">
          <TerminalWidget />
        </div>

        {/* Hire Me Button */}
        <div className="mt-6">
          <HireMeButton />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroMobile;



