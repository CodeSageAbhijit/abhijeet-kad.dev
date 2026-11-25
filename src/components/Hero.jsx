import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import TerminalWidget from "./TerminalWidget";
import HireMeButton from "./HireMeButton";
import BugsSquashOverlay from "./BugsSquashOverlay";
import { markEasterEggFound } from "../utils/analytics";
import { playNextRingtone } from "../utils/retroRingtone";

const ROLES = [
  "Full Stack Developer",
  "React & Node.js Engineer",
  "Open Source Contributor",
  "3D Web Experiences Dev",
  "Problem Solver",
];

const HIGHLIGHTED_ROLES = ["Open Source Contributor"];

const STATS = [
  { val: "10+",         label: "Projects Built" },
  { val: "Open Source", label: "Contributor",     href: "https://github.com/CodeSageAbhijit", external: true, accent: "alt",      title: "View GitHub profile" },
  { val: "150+",        label: "LeetCode Solved", href: "https://leetcode.com/u/AbhijitKad/", external: true, accent: "leetcode", title: "View LeetCode profile" },
  { val: "∞",           label: "Bugs Squashed" },
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

  // return both text and whether the current role uses the secondary accent
  const currentWord = words[index % words.length];
  return { text, highlighted: HIGHLIGHTED_ROLES.includes(currentWord) };
};

const Hero = ({ children }) => {
  const { text: role, highlighted: highlightedRole } = useTypewriter(ROLES);
  const [bugClicks, setBugClicks] = useState(0);
  const [bugsActive, setBugsActive] = useState(false);
  const [ringtoneBanner, setRingtoneBanner] = useState("");
  const bugResetTimer = useRef(null);
  const ringBannerTimer = useRef(null);

  useEffect(() => () => {
    clearTimeout(bugResetTimer.current);
    clearTimeout(ringBannerTimer.current);
  }, []);

  const handleBugCardClick = () => {
    clearTimeout(bugResetTimer.current);
    const next = bugClicks + 1;
    if (next >= 3) {
      setBugClicks(0);
      setBugsActive(true);
      markEasterEggFound("bugs_squashed_swarm", "click");
    } else {
      setBugClicks(next);
      bugResetTimer.current = setTimeout(() => setBugClicks(0), 2500);
    }
  };

  const handlePhoneRingtone = () => {
    const res = playNextRingtone();
    markEasterEggFound("nostalgic_ringtone_synth", "click");
    setRingtoneBanner(`✆ ${res.label} ♪`);
    clearTimeout(ringBannerTimer.current);
    ringBannerTimer.current = setTimeout(() => setRingtoneBanner(""), Math.max(2600, res.durationMs + 400));
  };

  return (
    <section id="hero" data-analytics-section="hero" className="relative w-full h-screen mx-auto overflow-hidden bg-hero-pattern bg-cover bg-no-repeat bg-center">
      {/* Palette glow */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 35% 55%, rgb(var(--accent-rgb) / 0.06) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 75% 45%, rgb(var(--accent-alt-rgb) / 0.05) 0%, transparent 60%)",
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
          background: "linear-gradient(to right, transparent, rgb(var(--accent-rgb) / 0.25))",
        }} />
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 11, color: "rgb(var(--accent-rgb) / 0.6)",
          letterSpacing: 3,
        }}>
          <span className="status-dot" />
          SYSTEM ONLINE — abhijit-kad.dev
        </div>
        <div style={{
          height: 1, flex: 1,
          background: "linear-gradient(to left, transparent, rgb(var(--accent-rgb) / 0.25))",
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
          className="flex-1 flex flex-col justify-center items-start"
          style={{ maxWidth: 580 }}
        >
          {/* Tag line */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 11, color: "rgb(var(--accent-rgb) / 0.55)",
            letterSpacing: 4, marginBottom: 6,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ color: "var(--accent)" }}>❯</span>
            <span>root@portfolio:~#</span>
            <span className="cursor-blink" style={{ width: 7, height: "1em" }} />
          </div>

          {/* Glitch Name */}
          <div
            className="glitch"
            data-text="Abhijeet Kad"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(52px, 8vw, 96px)",
              color: "#ffffff",
              letterSpacing: 6,
              lineHeight: 1,
              marginBottom: 16,
              textShadow: "0 0 40px rgb(var(--accent-rgb) / 0.15)",
            }}
          >
            Abhijeet Kad
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
            <span style={{ color: highlightedRole ? "rgb(var(--accent-alt-rgb) / 0.5)" : "rgb(var(--accent-rgb) / 0.4)" }}>//</span>
            <span style={{
              color: highlightedRole ? "var(--accent-alt)" : "var(--accent)",
              textShadow: highlightedRole ? "0 0 14px rgb(var(--accent-alt-rgb) / 0.45)" : "0 0 10px rgb(var(--accent-rgb) / 0.3)",
              transition: "color 0.4s, text-shadow 0.4s",
            }}>{role}</span>
            <span className="cursor-blink" style={{
              width: 9, height: "1.2em",
              background: highlightedRole ? "var(--accent-alt)" : "var(--accent)",
              boxShadow: highlightedRole ? "0 0 6px var(--accent-alt)" : "0 0 6px var(--accent)",
            }} />
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 32, maxWidth: "100%" }}>
            {STATS.map(({ val, label, href, external, accent, title }) => {
              const isAlt = accent === "alt";
              const isLeet = accent === "leetcode";
              const isBugs = label === "Bugs Squashed";
              const Stat = href ? "a" : isBugs ? "button" : "div";
              return (
                <Stat
                  key={label}
                  type={isBugs ? "button" : undefined}
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  onClick={isBugs ? handleBugCardClick : undefined}
                  style={{
                    display: "flex", flexDirection: "column", textAlign: "left",
                    padding: "10px 12px",
                    flexShrink: 0,
                    background: isAlt ? "rgb(var(--accent-alt-rgb) / 0.05)" : isLeet ? "rgba(248,161,0,0.05)" : "rgb(var(--accent-rgb) / 0.04)",
                    border: isAlt ? "1px solid rgb(var(--accent-alt-rgb) / 0.22)" : isLeet ? "1px solid rgba(248,161,0,0.22)" : "1px solid rgb(var(--accent-rgb) / 0.18)",
                    borderTop: isAlt ? "2px solid rgb(var(--accent-alt-rgb) / 0.65)" : isLeet ? "2px solid rgba(248,161,0,0.65)" : "2px solid rgb(var(--accent-rgb) / 0.5)",
                    cursor: (href || isBugs) ? "pointer" : "default",
                    textDecoration: "none",
                    transform: isBugs && bugClicks > 0 ? "scale(0.96)" : "none",
                    transition: "transform 0.12s ease",
                  }}
                  title={isBugs ? (bugClicks ? `Click ${3 - bugClicks} more time${3 - bugClicks > 1 ? "s" : ""}...` : "Triple-click?") : title}
                >
                  <span style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 26, lineHeight: 1, whiteSpace: "nowrap",
                    background: isAlt ? "linear-gradient(to top, var(--accent-alt), var(--accent-soft))" : isLeet ? "linear-gradient(to top, #f8a100, #ffd166)" : "none",
                    WebkitBackgroundClip: (isAlt || isLeet) ? "text" : "unset",
                    WebkitTextFillColor: (isAlt || isLeet) ? "transparent" : "var(--accent)",
                    color: (isAlt || isLeet) ? undefined : "var(--accent)",
                    textShadow: (isAlt || isLeet) ? "none" : "0 0 12px rgb(var(--accent-rgb) / 0.4)",
                  }}>{val}</span>
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 10, color: isAlt ? "rgb(var(--accent-alt-rgb) / 0.5)" : "rgb(var(--accent-rgb) / 0.45)",
                    letterSpacing: 1.5, marginTop: 3, textTransform: "uppercase", whiteSpace: "nowrap",
                  }}>{label}</span>
                </Stat>
              );
            })}
          </div>

          {/* Contact mini-row */}
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 12, color: "rgb(var(--accent-rgb) / 0.45)",
            display: "flex", flexWrap: "wrap", gap: "6px 20px",
          }}>
            {[
              { icon: "✉", val: "abhijitkad62@gmail.com" },
              { icon: "⬡", val: "linkedin.com/in/abhijit-kad" },
              { icon: "⌥", val: "+91 9137292367", isPhone: true },
            ].map(({ icon, val, isPhone }) =>
              isPhone ? (
                <button
                  key={val}
                  type="button"
                  onClick={handlePhoneRingtone}
                  title="Play Nokia 3310 / Classic Landline ringtone"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    background: "transparent",
                    border: "none",
                    padding: 0,
                    color: ringtoneBanner ? "var(--accent)" : "inherit",
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    cursor: "pointer",
                    textShadow: ringtoneBanner ? "0 0 8px var(--accent)" : "none",
                  }}
                >
                  <span style={{ color: "var(--accent)" }}>{icon}</span>
                  {val}
                </button>
              ) : (
                <span key={val} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: "var(--accent)" }}>{icon}</span>
                  {val}
                </span>
              )
            )}
          </div>
          {ringtoneBanner && (
            <div
              role="status"
              style={{
                marginTop: 8,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: "var(--accent)",
                letterSpacing: 1,
                textShadow: "0 0 8px rgb(var(--accent-rgb) / 0.45)",
              }}
            >
              {ringtoneBanner}
            </div>
          )}

          <div className="hero-actions"><HireMeButton />{children}</div>
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
        <a href="#search" aria-label="Scroll to portfolio search">
          <div className="w-[32px] h-[58px] rounded-3xl flex justify-center items-start pt-2"
            style={{
              border: "2px solid rgb(var(--accent-rgb) / 0.4)",
              boxShadow: "0 0 14px rgb(var(--accent-rgb) / 0.15)",
            }}>
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatType: "loop" }}
              style={{
                width: 10, height: 10, borderRadius: "50%",
                background: "var(--accent)",
                boxShadow: "0 0 10px var(--accent)",
              }}
            />
          </div>
        </a>
      </div>

      {/* Bottom glow line — palette accents */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, transparent 5%, var(--accent-alt) 25%, var(--accent) 50%, var(--accent-alt) 75%, transparent 95%)",
        boxShadow: "0 0 16px rgb(var(--accent-rgb) / 0.5), 0 0 32px rgb(var(--accent-alt-rgb) / 0.3)",
        zIndex: 10,
      }} />
      {bugsActive && <BugsSquashOverlay onClose={() => setBugsActive(false)} />}
    </section>
  );
};

export default Hero;
