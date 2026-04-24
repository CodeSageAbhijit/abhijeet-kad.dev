import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { styles } from "../styles";
import { github } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { textVariant } from "../utils/motion";

const TYPE_CONFIG = {
  web:    { icon: "🌐", label: "Web App",    color: "#4fc3f7" },
  mobile: { icon: "📱", label: "Mobile App", color: "#9eff00" },
  desktop:{ icon: "💻", label: "Desktop App", color: "#ffb700" },
};

const FILTERS = ["all", "web", "mobile", "desktop"];

/* ── Browser frame with auto-slider ── */
const BrowserFrame = ({ images, name }) => {
  const scrollRef = React.useRef(null);
  const [idx, setIdx] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const t = setInterval(() => {
      setIdx((prev) => {
        const next = (prev + 1) % images.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ left: scrollRef.current.clientWidth * next, behavior: "smooth" });
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, [images.length, isHovered]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const newIdx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    if (newIdx !== idx) setIdx(newIdx);
  };

  return (
    <div style={{
      borderRadius: 10, overflow: "hidden",
      border: "1px solid rgba(79,195,247,0.2)",
      boxShadow: "0 0 60px rgba(79,195,247,0.06)",
      background: "#111",
    }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{
        background: "#1e1e1e", padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 8,
        borderBottom: "1px solid #2a2a2a",
      }}>
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
        <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
        <div style={{
          flex: 1, background: "#111", borderRadius: 4,
          padding: "3px 12px", marginLeft: 8,
          fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#555",
        }}>
          localhost/{name.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}
        </div>
        {images.length > 1 && (
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#444" }}>
            {idx + 1}/{images.length}
          </span>
        )}
      </div>
      <div style={{ position: "relative" }}>
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="hide-scrollbar"
          style={{ 
            display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", 
            scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "smooth",
            height: 300, cursor: isHovered && images.length > 1 ? "grab" : "auto",
            background: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"40\" viewBox=\"0 0 120 40\"><text x=\"5\" y=\"20\" fill=\"%23333\" font-family=\"monospace\" font-size=\"10\">[loading_img...]</text></svg>') center center no-repeat"
          }}
        >
          {images.map((src, i) => (
             <div key={i} style={{ flex: "0 0 100%", width: "100%", height: "100%", scrollSnapAlign: "start" }}>
               <img
                 src={src}
                 alt={`${name} screenshot ${i + 1}`}
                 loading="lazy"
                 decoding="async"
                 style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
               />
             </div>
          ))}
        </div>
        {images.length > 1 && (
          <div style={{
            position: "absolute", bottom: 10, left: 0, right: 0,
            display: "flex", justifyContent: "center", gap: 6,
          }}>
            {images.map((_, i) => (
              <button key={i} onClick={() => {
                if (scrollRef.current) scrollRef.current.scrollTo({ left: scrollRef.current.clientWidth * i, behavior: "smooth" });
              }} style={{
                width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
                border: "none", padding: 0, cursor: "pointer",
                background: i === idx ? "#4fc3f7" : "rgba(255,255,255,0.4)",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Mobile mockup — display pre-rendered PNG directly ── */
const PhoneFrame = ({ images, name }) => {
  const scrollRef = React.useRef(null);
  const [idx, setIdx] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const t = setInterval(() => {
      setIdx((prev) => {
        const next = (prev + 1) % images.length;
        if (scrollRef.current) {
          scrollRef.current.scrollTo({ left: scrollRef.current.clientWidth * next, behavior: "smooth" });
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(t);
  }, [images.length, isHovered]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const newIdx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    if (newIdx !== idx) setIdx(newIdx);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ position: "relative", textAlign: "center" }}>
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="hide-scrollbar"
          style={{ 
            display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", 
            scrollbarWidth: "none", msOverflowStyle: "none", scrollBehavior: "smooth",
            minHeight: 400, cursor: isHovered && images.length > 1 ? "grab" : "auto",
            alignItems: "center",
            background: "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"40\" viewBox=\"0 0 120 40\"><text x=\"5\" y=\"20\" fill=\"%23333\" font-family=\"monospace\" font-size=\"10\">[loading_img...]</text></svg>') center center no-repeat"
          }}
        >
          {images.map((src, i) => (
             <div key={i} style={{ flex: "0 0 100%", width: "100%", display: "flex", justifyContent: "center", scrollSnapAlign: "center" }}>
               <img
                 src={src}
                 alt={`${name} ${i + 1}`}
                 loading="lazy"
                 decoding="async"
                 style={{ width: "100%", maxWidth: 480, display: "block" }}
               />
             </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
          {images.map((_, i) => (
            <button key={i} onClick={() => {
              if (scrollRef.current) scrollRef.current.scrollTo({ left: scrollRef.current.clientWidth * i, behavior: "smooth" });
            }} style={{
              width: i === idx ? 20 : 6, height: 6, borderRadius: 3,
              border: "none", padding: 0, cursor: "pointer",
              background: i === idx ? "#9eff00" : "rgba(255,255,255,0.2)",
              transition: "all 0.3s",
            }} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Terminal frame for system projects ── */
const TerminalFrame = ({ image, name }) => (
  <div style={{
    borderRadius: 10, overflow: "hidden",
    border: "1px solid rgba(248,161,0,0.25)",
    boxShadow: "0 0 60px rgba(248,161,0,0.06)",
    background: "#0d0d0d",
  }}>
    <div style={{
      background: "#1a1a1a", padding: "10px 16px",
      display: "flex", alignItems: "center", gap: 8,
      borderBottom: "1px solid #2a2a2a",
    }}>
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#febc2e", display: "inline-block" }} />
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28c840", display: "inline-block" }} />
      <span style={{
        flex: 1, textAlign: "center",
        fontFamily: "'Share Tech Mono', monospace", fontSize: 11, color: "#888", letterSpacing: 2,
      }}>
        {name.toLowerCase().replace(/[^a-z0-9]+/g, "-")} — bash
      </span>
    </div>
    <img src={image} alt={name} loading="lazy" decoding="async" style={{ width: "100%", height: 300, objectFit: "cover", objectPosition: "top", display: "block" }} />
  </div>
);

const DeviceFrame = ({ project }) => {
  const images = project.images || [project.image];
  if (project.type === "mobile") return <PhoneFrame images={images} name={project.name} />;
  return <BrowserFrame images={images} name={project.name} />;
};

const Works = () => {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(0);

  const filtered = filter === "all" ? projects : projects.filter(p => p.type === filter);
  const safeActive = Math.min(active, Math.max(0, filtered.length - 1));
  const current = filtered[safeActive];

  const handleFilter = (f) => { setFilter(f); setActive(0); };

  if (!current) return null;

  const cfg = TYPE_CONFIG[current.type] || { icon: "💻", label: "Project", color: "#9eff00" };

  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText}`}>// My work</p>
        <h2 className={`${styles.sectionHeadText}`}>Projects.</h2>
      </motion.div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap", alignItems: "center" }}>
        {FILTERS.map(f => {
          const isActive = filter === f;
          const c = f === "all" ? "#9eff00" : (TYPE_CONFIG[f]?.color || "#9eff00");
          return (
            <button key={f} onClick={() => handleFilter(f)} style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11, letterSpacing: 2, padding: "5px 16px",
              border: isActive ? `1px solid ${c}` : "1px solid rgba(255,255,255,0.1)",
              background: isActive ? `${c}18` : "transparent",
              color: isActive ? c : "rgba(255,255,255,0.3)",
              cursor: "pointer", transition: "all 0.2s",
              textTransform: "uppercase", borderRadius: 4,
            }}>
              {f === "all" ? "// all" : `${TYPE_CONFIG[f]?.icon} ${f}`}
            </button>
          );
        })}
        <span style={{
          marginLeft: "auto",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 10, color: "rgba(158,255,0,0.3)", letterSpacing: 2,
        }}>
          [{filtered.length} project{filtered.length !== 1 ? "s" : ""}]
        </span>
      </div>

      {/* Main layout */}
      <div style={{ marginTop: 36, display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* Left: project list */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 4,
          width: 270, flexShrink: 0,
          borderLeft: "1px solid rgba(158,255,0,0.08)",
        }}>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10, color: "rgba(158,255,0,0.3)",
            letterSpacing: 3, padding: "0 0 12px 16px",
            textTransform: "uppercase",
          }}>select project</div>

          {filtered.map((proj, i) => {
            const pcfg = TYPE_CONFIG[proj.type] || { icon: "💻", color: "#9eff00" };
            const isSelected = i === safeActive;
            return (
              <motion.div
                key={proj.name}
                onClick={() => setActive(i)}
                whileHover={{ x: 4 }}
                style={{
                  padding: "12px 16px",
                  borderLeft: isSelected ? `2px solid ${pcfg.color}` : "2px solid transparent",
                  background: isSelected ? `${pcfg.color}0d` : "transparent",
                  cursor: "pointer", transition: "background 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{pcfg.icon}</span>
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace", fontSize: 13,
                    color: isSelected ? pcfg.color : "rgba(255,255,255,0.55)",
                    transition: "color 0.2s", fontWeight: isSelected ? 700 : 400,
                  }}>{proj.name}</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 22 }}>
                  {proj.tags.slice(0, 3).map(tag => (
                    <span key={tag.name} style={{
                      fontFamily: "'Share Tech Mono', monospace", fontSize: 9, letterSpacing: 1,
                      color: isSelected ? `${pcfg.color}88` : "rgba(255,255,255,0.18)",
                    }}>#{tag.name}</span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right: featured detail */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Type badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: 10, letterSpacing: 3,
                  color: cfg.color, border: `1px solid ${cfg.color}55`,
                  padding: "3px 10px", textTransform: "uppercase", borderRadius: 3,
                }}>
                  {cfg.icon} {cfg.label}
                </span>
                <div style={{ flex: 1, height: 1, background: `${cfg.color}18` }} />
              </div>

              {/* Device mockup */}
              <div className={current.type === "mobile" ? "cyber-border cyber-card-hover rounded-lg overflow-hidden" : ""}>
                <DeviceFrame project={current} />
              </div>

              {/* Info */}
              <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                  <h3 style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "clamp(28px,4vw,40px)", letterSpacing: 3,
                    color: "#fff", lineHeight: 1,
                  }}>{current.name}</h3>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => window.open(current.source_code_link, "_blank")}
                    className="cyber-btn"
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 11, letterSpacing: 2, color: cfg.color,
                      background: `${cfg.color}0d`, border: `1px solid ${cfg.color}44`,
                      padding: "7px 16px", cursor: "pointer", borderRadius: 4,
                      flexShrink: 0, transition: "all 0.2s",
                    }}
                  >
                    <img src={github} alt="github" style={{ width: 14, height: 14, filter: "invert(1) opacity(0.7)" }} />
                    // source
                  </button>

                  {/* Web: live button */}
                  {current.type === "web" && current.live_link && (
                    <button
                      onClick={() => window.open(current.live_link, "_blank")}
                      className="cyber-btn glitch-reveal"
                      data-text="// live"
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 11, letterSpacing: 2, color: "#28c840",
                        background: "rgba(40,200,64,0.07)", border: "1px solid rgba(40,200,64,0.35)",
                        padding: "7px 16px", cursor: "pointer", borderRadius: 4,
                        flexShrink: 0, transition: "all 0.2s",
                      }}
                    >
                      <span style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: "#28c840",
                        display: "inline-block",
                        animation: "pulse-dot 1.4s ease-in-out infinite",
                      }} />
                      // live
                    </button>
                  )}

                  {/* Desktop: exe download button */}
                  {current.type === "desktop" && current.exe_link && (
                    <button
                      onClick={() => window.open(current.exe_link, "_blank")}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 11, letterSpacing: 2, color: "#ffb700",
                        background: "rgba(255,183,0,0.07)", border: "1px solid rgba(255,183,0,0.35)",
                        padding: "7px 16px", cursor: "pointer", borderRadius: 4,
                        flexShrink: 0, transition: "all 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,183,0,0.18)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,183,0,0.07)"}
                    >
                      ↓ // download .exe
                    </button>
                  )}

                  {/* Mobile: APK download button */}
                  {current.type === "mobile" && current.apk_link && !current.apk_blocked && (
                    <button
                      onClick={() => window.open(current.apk_link, "_blank")}
                      style={{
                        display: "flex", alignItems: "center", gap: 8,
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 11, letterSpacing: 2, color: "#9eff00",
                        background: "rgba(158,255,0,0.07)", border: "1px solid rgba(158,255,0,0.35)",
                        padding: "7px 16px", cursor: "pointer", borderRadius: 4,
                        flexShrink: 0, transition: "all 0.2s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(158,255,0,0.18)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(158,255,0,0.07)"}
                    >
                      ↓ // download .apk
                    </button>
                  )}

                  {/* Mobile: blocked APK */}
                  {current.type === "mobile" && current.apk_blocked && (
                    <div style={{ position: "relative" }} className="apk-blocked-wrap">
                      <button
                        disabled
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.25)",
                          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)",
                          padding: "7px 16px", cursor: "not-allowed", borderRadius: 4,
                          flexShrink: 0,
                        }}
                      >
                        🔒 // download .apk
                      </button>
                      <div style={{
                        position: "absolute", bottom: "calc(100% + 8px)", right: 0,
                        background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 6, padding: "8px 12px", whiteSpace: "nowrap",
                        fontFamily: "'Share Tech Mono', monospace", fontSize: 10,
                        color: "rgba(255,255,255,0.45)", letterSpacing: 1,
                        pointerEvents: "none", opacity: 0, transition: "opacity 0.2s",
                      }} className="apk-tooltip">
                        download authorized through their official store only
                      </div>
                    </div>
                  )}
                  </div>
                </div>

                <div style={{ height: 1, background: `${cfg.color}18`, margin: "14px 0" }} />

                <p style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  fontSize: 15, color: "rgba(255,255,255,0.55)", lineHeight: 1.75,
                }}>{current.description}</p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                  {current.tags.map(tag => (
                    <span key={tag.name} style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 11, padding: "4px 12px",
                      border: `1px solid ${cfg.color}33`,
                      color: `${cfg.color}cc`, letterSpacing: 1, borderRadius: 3,
                    }}>#{tag.name}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default SectionWrapper(Works, "projects");

