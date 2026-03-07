import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import TerminalWidget from "./TerminalWidget";

const ROLES = [
  "Full Stack Developer",
  "React & Node.js Engineer",
  "Penetration Tester",
  "3D Web Experiences Dev",
  "Problem Solver",
];

// roles that should display in red gradient (security-related)
const RED_ROLES = ["Penetration Tester"];

const STATS = [
  { val: "20+",  label: "Projects Built" },
  { val: "eJPTv2", label: "Certified" },
  { val: "150+", label: "LeetCode Solved" },
  { val: "∞",   label: "Bugs Squashed" },
];

const useTypewriter = (words, speed = 90, pause = 1800) => {
  const [index, setIndex]    = useState(0);
  const [sub,   setSub]      = useState(0);
  const [del,   setDel]      = useState(false);
  const [text,  setText]     = useState("");

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

  // return both text and whether current word is a red-role
  const currentWord = words[index % words.length];
  return { text, isRed: RED_ROLES.includes(currentWord) };
};

const Hero = () => {
  const { text: role, isRed: roleIsRed } = useTypewriter(ROLES);

  return (
    <section className="relative w-full h-screen mx-auto overflow-hidden bg-hero-pattern bg-cover bg-no-repeat bg-center">
      {/* Deep radial glow — green left, red right accent */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 35% 55%, rgba(158,255,0,0.06) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 75% 45%, rgba(230,48,48,0.05) 0%, transparent 60%)",
      }} />

      {/* Top status bar */}
      <div style={{
        position: "absolute", top: 82, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 24, zIndex: 10, padding: "0 24px",
      }}>
        <div style={{
          height: 1,
          flex: 1,
          background: "linear-gradient(to right, transparent, rgba(158,255,0,0.25))",
        }} />
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11, color: "rgba(158,255,0,0.6)",
          letterSpacing: 3,
        }}>
          <span className="status-dot" />
          SYSTEM ONLINE — abhijit-kad.dev
        </div>
        <div style={{
          height: 1, flex: 1,
          background: "linear-gradient(to left, transparent, rgba(158,255,0,0.25))",
        }} />
      </div>

      {/* 3D Computer model — top, above name */}
      {/* Main content — full height, two columns */}
      <div
        className={`absolute inset-0 max-w-7xl mx-auto ${styles.paddingX}
          flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16`}
        style={{ top: 120, bottom: 80 }}
      >
        {/* ── LEFT: name / role / stats / contact ── */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 flex flex-col justify-center"
          style={{ maxWidth: 580 }}
        >
          {/* Tag line */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11, color: "rgba(158,255,0,0.55)",
            letterSpacing: 4, marginBottom: 6,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "#9eff00" }}>❯</span>
            <span>root@portfolio:~#</span>
            <span className="cursor-blink" style={{ width: 7, height: "1em" }} />
          </div>

          {/* Glitch Name */}
          <div
            className="glitch flicker"
            data-text="ABHIJEET KAD"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(52px, 8vw, 96px)",
              color: "#ffffff",
              letterSpacing: 6,
              lineHeight: 1,
              marginBottom: 16,
              textShadow: "0 0 40px rgba(158,255,0,0.15)",
            }}
          >
            ABHIJEET KAD
          </div>

          {/* Typewriter role */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "clamp(14px, 2vw, 20px)",
            marginBottom: 28,
            letterSpacing: 2,
            minHeight: 24,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <span style={{ color: roleIsRed ? "rgba(230,48,48,0.5)" : "rgba(158,255,0,0.4)" }}>//</span>
            <span style={{
              color: roleIsRed ? "#e63030" : "#9eff00",
              textShadow: roleIsRed ? "0 0 14px rgba(230,48,48,0.45)" : "0 0 10px rgba(158,255,0,0.3)",
              transition: "color 0.4s, text-shadow 0.4s",
            }}>{role}</span>
            <span className="cursor-blink" style={{
              width: 9, height: "1.2em",
              background: roleIsRed ? "#e63030" : "#9eff00",
              boxShadow: roleIsRed ? "0 0 6px #e63030" : "0 0 6px #9eff00",
            }} />
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, flexWrap: "nowrap", marginBottom: 32, overflowX: "auto" }}>
            {STATS.map(({ val, label }) => {
              const isRedStat = val === "eJPTv2";
              const isLeet = val === "150+";
              return (
                <div key={label} style={{
                  display: "flex", flexDirection: "column",
                  padding: "10px 14px",
                  flexShrink: 0,
                  background: isRedStat ? "rgba(230,48,48,0.05)" : isLeet ? "rgba(248,161,0,0.05)" : "rgba(158,255,0,0.04)",
                  border: isRedStat ? "1px solid rgba(230,48,48,0.22)" : isLeet ? "1px solid rgba(248,161,0,0.22)" : "1px solid rgba(158,255,0,0.18)",
                  borderTop: isRedStat ? "2px solid rgba(230,48,48,0.65)" : isLeet ? "2px solid rgba(248,161,0,0.65)" : "2px solid rgba(158,255,0,0.5)",
                  cursor: isLeet ? "pointer" : "default",
                  textDecoration: "none",
                }}
                  onClick={isLeet ? () => window.open("https://leetcode.com/u/AbhijitKad/", "_blank") : undefined}
                  title={isLeet ? "View LeetCode profile" : undefined}
                >
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 28, lineHeight: 1,
                    background: isRedStat ? "linear-gradient(to top, #e63030, #ff7070)" : isLeet ? "linear-gradient(to top, #f8a100, #ffd166)" : "none",
                    WebkitBackgroundClip: (isRedStat || isLeet) ? "text" : "unset",
                    WebkitTextFillColor: (isRedStat || isLeet) ? "transparent" : "#9eff00",
                    color: (isRedStat || isLeet) ? undefined : "#9eff00",
                    textShadow: (isRedStat || isLeet) ? "none" : "0 0 12px rgba(158,255,0,0.4)",
                  }}>{val}</span>
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 10, color: isRedStat ? "rgba(230,48,48,0.5)" : "rgba(158,255,0,0.45)",
                    letterSpacing: 2, marginTop: 3, textTransform: "uppercase",
                  }}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Contact mini-row */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 12, color: "rgba(158,255,0,0.45)",
            display: "flex", flexWrap: "wrap", gap: "6px 20px",
          }}>
            {[
              { icon: "✉", val: "abhijitkad62@gmail.com" },
              { icon: "⬡", val: "linkedin.com/in/abhijit-kad" },
              { icon: "⌥", val: "+91 913729367" },
            ].map(({ icon, val }) => (
              <span key={val} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: "#9eff00" }}>{icon}</span>
                {val}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── RIGHT: Terminal ── */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          className="flex-1 hidden lg:block"
          style={{ maxWidth: 480, width: "100%" }}
        >
          <TerminalWidget />
        </motion.div>
      </div>

      {/* Bottom scroll cue */}
      <div className="absolute xs:bottom-10 bottom-20 w-full flex justify-center items-center" style={{ zIndex: 10 }}>
        <a href="#about">
          <div className="w-[32px] h-[58px] rounded-3xl flex justify-center items-start pt-2"
            style={{
              border: "2px solid rgba(158,255,0,0.4)",
              boxShadow: "0 0 14px rgba(158,255,0,0.15)",
            }}>
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
              style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "#9eff00",
                boxShadow: "0 0 10px #9eff00",
              }}
            />
          </div>
        </a>
      </div>

      {/* Bottom glow line — tri-color */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent 5%, #e63030 25%, #9eff00 50%, #e63030 75%, transparent 95%)",
        boxShadow: "0 0 16px rgba(158,255,0,0.5), 0 0 32px rgba(230,48,48,0.3)",
        zIndex: 10,
      }} />
    </section>
  );
};

export default Hero;
