import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

import { styles } from "../styles";
import { github } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { projectFromHash } from "../utils/portfolioSearch";
import { markEasterEggFound, track } from "../utils/analytics";
import { ImpactMetrics, ProjectLightbox } from "./ProjectExtras";

const TYPE_CONFIG = {
  web: { icon: "🌐", label: "Web App", color: "#4fc3f7" },
  mobile: { icon: "📱", label: "Mobile App", color: "var(--accent)" },
  desktop: { icon: "💻", label: "Desktop App", color: "#ffb700" },
};

const FILTERS = ["all", "web", "mobile", "desktop"];

function slugifyName(name = "") {
  return name.toLowerCase().replace(/&/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function resolveSecretRoute(rawInput, defaultUrl) {
  const val = rawInput.trim().toLowerCase();
  if (!val || val === defaultUrl || val === `/${slugifyName(defaultUrl.replace("localhost/", ""))}`) {
    return null;
  }
  const route = val.replace(/^https?:\/\//, "").replace(/^localhost\//, "").replace(/^\/+/, "");
  if (route === ".env" || route === "env") return "env";
  if (route === "admin" || route === "wp-admin") return "admin";
  if (route === "help" || route === "routes") return "help";
  return "404";
}

/* ── Secret localhost route view ── */
const SecretRouteScreen = ({ route, name, defaultUrl, onReset }) => {
  return (
    <div
      style={{
        height: 300,
        background: "#070a10",
        padding: "20px 24px",
        fontFamily: "'Share Tech Mono', monospace",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflowY: "auto",
      }}
    >
      {route === "env" ? (
        <div style={{ fontSize: 12, lineHeight: 1.8 }}>
          <div style={{ color: "#ff5f57", marginBottom: 8 }}># [SECRET] {defaultUrl}/.env</div>
          <div style={{ color: "#94a3b8" }}>COFFEE_LEVEL=<span style={{ color: "#febc2e" }}>CRITICAL</span></div>
          <div style={{ color: "#94a3b8" }}>BUGS_FIXED=<span style={{ color: "#4ade80" }}>42</span></div>
          <div style={{ color: "#94a3b8" }}>BUGS_CREATED=<span style={{ color: "#ff5f57" }}>43</span></div>
          <div style={{ color: "#94a3b8" }}>HIRE_SIGNAL=<span style={{ color: "#4fc3f7" }}>STRONG_YES</span></div>
        </div>
      ) : route === "admin" ? (
        <div style={{ margin: "auto 0", textAlign: "center" }}>
          <div style={{ color: "#ff5f57", fontSize: 22, letterSpacing: 3, marginBottom: 8 }}>
            403 // ACCESS DENIED
          </div>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
            Nice try snooping /admin on {name}.<br />Clearance required: <code>sudo hire abhijeet</code>
          </p>
        </div>
      ) : route === "help" ? (
        <div style={{ fontSize: 12, lineHeight: 1.9, color: "rgba(255,255,255,0.75)" }}>
          <div style={{ color: "var(--accent)", marginBottom: 6 }}># Hidden localhost/ routes</div>
          <div>&bull; <code>.env</code> &mdash; Inspect leaked environment secrets</div>
          <div>&bull; <code>admin</code> &mdash; Attempt privileged admin login</div>
          <div>&bull; <code>404</code> &mdash; Trigger route-not-found screen</div>
        </div>
      ) : (
        <div style={{ margin: "auto 0", textAlign: "center" }}>
          <div style={{ color: "#febc2e", fontSize: 24, letterSpacing: 3, marginBottom: 8 }}>
            404 // ROUTE_NOT_FOUND
          </div>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>
            Try typing <code>.env</code>, <code>admin</code>, or <code>help</code> in the address bar.
          </p>
        </div>
      )}

      <div>
        <button
          type="button"
          onClick={onReset}
          className="px-3 py-1.5 border border-[rgb(var(--accent-rgb)/0.45)] text-accent text-[11px] uppercase tracking-[2px] hover:text-white cursor-pointer"
        >
          &larr; back to {name}
        </button>
      </div>
    </div>
  );
};

/* ── Interactive Browser frame with working traffic-light dots, URL bar & slider ── */
const BrowserFrame = ({
  images,
  name,
  idx,
  onIdxChange,
  onOpenLightbox,
  onWindowEvent,
}) => {
  const scrollRef = useRef(null);
  const programmaticScrollRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const [windowState, setWindowState] = useState("normal"); // "normal" | "minimized" | "crashed"
  const defaultUrl = `localhost/${slugifyName(name)}`;
  const [urlValue, setUrlValue] = useState(defaultUrl);
  const [urlFocused, setUrlFocused] = useState(false);
  const [secretRoute, setSecretRoute] = useState(null);

  useEffect(() => {
    setWindowState("normal");
    setUrlValue(defaultUrl);
    setSecretRoute(null);
  }, [defaultUrl]);

  useEffect(() => {
    if (images.length <= 1 || isHovered || windowState !== "normal" || secretRoute) return;
    const t = setInterval(() => {
      onIdxChange((idx + 1) % images.length, "auto");
    }, 3400);
    return () => clearInterval(t);
  }, [images.length, isHovered, windowState, secretRoute, idx, onIdxChange]);

  useEffect(() => {
    if (!scrollRef.current || windowState !== "normal" || secretRoute) return;
    programmaticScrollRef.current = true;
    scrollRef.current.scrollTo({
      left: scrollRef.current.clientWidth * idx,
      behavior: "smooth",
    });
    const timer = setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 500);
    return () => clearTimeout(timer);
  }, [idx, windowState, secretRoute]);

  const handleScroll = () => {
    if (programmaticScrollRef.current || !scrollRef.current || !scrollRef.current.clientWidth) return;
    const newIdx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    if (newIdx !== idx) onIdxChange(newIdx, "scroll");
  };

  const submitUrl = (candidate) => {
    const target = (candidate ?? urlValue).trim();
    const resolved = resolveSecretRoute(target, defaultUrl);
    if (!resolved) {
      setSecretRoute(null);
      setUrlValue(defaultUrl);
      return;
    }
    setUrlValue(`localhost/${resolved}`);
    setSecretRoute(resolved);
    setWindowState("normal");
    markEasterEggFound("works_localhost_secret", resolved);
    track("Project Localhost Route Visited", { project_name: name, route: resolved });
  };

  return (
    <div
      style={{
        borderRadius: 10,
        overflow: "hidden",
        border: "1px solid rgba(79,195,247,0.22)",
        boxShadow: "0 0 60px rgba(79,195,247,0.06)",
        background: "#111",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Window Titlebar */}
      <div
        style={{
          background: "#1b1d24",
          padding: "9px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderBottom: "1px solid #2a2d38",
        }}
      >
        <button
          type="button"
          title="Close preview (warning: unstable)"
          aria-label="Simulate crash preview"
          onClick={(e) => {
            e.stopPropagation();
            setWindowState((prev) => (prev === "crashed" ? "normal" : "crashed"));
            markEasterEggFound("works_window_crash", "red_dot_click");
            onWindowEvent?.("close_crash");
          }}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#ff5f57",
            border: "none",
            padding: 0,
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <button
          type="button"
          title={windowState === "minimized" ? "Restore window" : "Minimize window"}
          aria-label={windowState === "minimized" ? "Restore window" : "Minimize window"}
          onClick={(e) => {
            e.stopPropagation();
            setWindowState((prev) => (prev === "minimized" ? "normal" : "minimized"));
            onWindowEvent?.("minimize");
          }}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#febc2e",
            border: "none",
            padding: 0,
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <button
          type="button"
          title="Open fullscreen preview"
          aria-label="Open fullscreen preview"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox?.("green_dot");
          }}
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--accent)",
            border: "none",
            padding: 0,
            cursor: "pointer",
            flexShrink: 0,
          }}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitUrl();
          }}
          onClick={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            background: "#0d0f14",
            border: urlFocused
              ? "1px solid rgb(var(--accent-rgb) / 0.55)"
              : "1px solid rgba(255,255,255,0.08)",
            borderRadius: 4,
            padding: "2px 10px",
            marginLeft: 6,
            gap: 6,
          }}
        >
          <input
            type="text"
            value={urlValue}
            aria-label="Browser address bar (try .env, admin, help)"
            onChange={(e) => setUrlValue(e.target.value)}
            onFocus={() => setUrlFocused(true)}
            onBlur={() => setTimeout(() => setUrlFocused(false), 150)}
            style={{
              width: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 11,
              color: urlFocused ? "#ffffff" : "#8b949e",
            }}
          />
          {urlFocused && (
            <span className="hidden sm:inline font-mono text-[9px] text-accent/70 whitespace-nowrap">
              try: .env / admin / help
            </span>
          )}
        </form>

        {images.length > 1 && windowState === "normal" && !secretRoute && (
          <span style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 10, color: "#6e7681" }}>
            {idx + 1}/{images.length}
          </span>
        )}
      </div>

      {windowState === "minimized" ? (
        <div className="px-4 py-3 bg-[#090c12] flex items-center justify-between font-mono text-[11px] text-white/60">
          <span>// {name} minimized</span>
          <button
            type="button"
            onClick={() => setWindowState("normal")}
            className="text-accent hover:text-white cursor-pointer"
          >
            [ restore ]
          </button>
        </div>
      ) : windowState === "crashed" ? (
        <div
          style={{ height: 300 }}
          className="p-6 bg-[#07090e] font-mono flex flex-col justify-center items-start gap-3"
        >
          <div className="text-[#ff5f57] text-sm tracking-[2px] uppercase">
            *** SEGMENTATION FAULT (SIGSEGV) ***
          </div>
          <p className="text-xs text-white/65 leading-relaxed">
            Process <code>{slugifyName(name)}</code> terminated unexpectedly (0xDEAD_BEEF).
            <br />
            Cause: Clicked the forbidden red dot.
          </p>
          <button
            type="button"
            onClick={() => setWindowState("normal")}
            className="mt-2 px-3.5 py-1.5 border border-[#ff5f57]/60 text-[#ff5f57] text-[11px] uppercase tracking-[2px] hover:bg-[#ff5f57]/15 cursor-pointer"
          >
            [ reboot preview ]
          </button>
        </div>
      ) : secretRoute ? (
        <SecretRouteScreen
          route={secretRoute}
          name={name}
          defaultUrl={defaultUrl}
          onReset={() => {
            setSecretRoute(null);
            setUrlValue(defaultUrl);
          }}
        />
      ) : (
        <div style={{ position: "relative" }}>
          <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="hide-scrollbar"
            style={{
              display: "flex",
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              scrollBehavior: "smooth",
              height: 300,
              cursor: "zoom-in",
              background: "#07090e",
            }}
          >
            {images.map((src, i) => (
              <div
                key={i}
                onClick={() => onOpenLightbox?.("image_click")}
                style={{ flex: "0 0 100%", width: "100%", height: "100%", scrollSnapAlign: "start" }}
              >
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

          <button
            type="button"
            title="Expand fullscreen"
            aria-label="Expand screenshot fullscreen"
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox?.("expand_btn");
            }}
            className="absolute top-2.5 right-2.5 px-2 py-1 border border-white/25 bg-black/70 text-white/85 hover:text-accent hover:border-accent font-mono text-[10px] cursor-pointer"
          >
            ⛶ zoom
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous screenshot"
                onClick={(e) => {
                  e.stopPropagation();
                  onIdxChange((idx - 1 + images.length) % images.length, "arrow_prev");
                }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-white/25 bg-black/70 text-white hover:border-accent hover:text-accent font-mono text-base cursor-pointer"
              >
                &lsaquo;
              </button>
              <button
                type="button"
                aria-label="Next screenshot"
                onClick={(e) => {
                  e.stopPropagation();
                  onIdxChange((idx + 1) % images.length, "arrow_next");
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-white/25 bg-black/70 text-white hover:border-accent hover:text-accent font-mono text-base cursor-pointer"
              >
                &rsaquo;
              </button>

              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 0,
                  right: 0,
                  display: "flex",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {images.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`View screenshot ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIdxChange(i, "dot");
                    }}
                    style={{
                      width: i === idx ? 26 : 10,
                      height: 6,
                      borderRadius: 3,
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      background: i === idx ? "#4fc3f7" : "rgba(255,255,255,0.45)",
                      transition: "all 0.25s",
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Mobile Phone mockup with bigger slider arrows & zoom ── */
const PhoneFrame = ({ images, name, idx, onIdxChange, onOpenLightbox }) => {
  const scrollRef = useRef(null);
  const programmaticScrollRef = useRef(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const t = setInterval(() => {
      onIdxChange((idx + 1) % images.length, "auto");
    }, 3400);
    return () => clearInterval(t);
  }, [images.length, isHovered, idx, onIdxChange]);

  useEffect(() => {
    if (!scrollRef.current) return;
    programmaticScrollRef.current = true;
    scrollRef.current.scrollTo({
      left: scrollRef.current.clientWidth * idx,
      behavior: "smooth",
    });
    const timer = setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 500);
    return () => clearTimeout(timer);
  }, [idx]);

  const handleScroll = () => {
    if (programmaticScrollRef.current || !scrollRef.current || !scrollRef.current.clientWidth) return;
    const newIdx = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth);
    if (newIdx !== idx) onIdxChange(newIdx, "scroll");
  };

  return (
    <div onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div style={{ position: "relative", textAlign: "center" }}>
        <style>{`.hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="hide-scrollbar"
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            scrollBehavior: "smooth",
            minHeight: 400,
            cursor: "zoom-in",
            alignItems: "center",
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              onClick={() => onOpenLightbox?.("image_click")}
              style={{
                flex: "0 0 100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                scrollSnapAlign: "center",
              }}
            >
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

        <button
          type="button"
          title="Expand fullscreen"
          aria-label="Expand screenshot fullscreen"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox?.("expand_btn");
          }}
          className="absolute top-2.5 right-2.5 px-2 py-1 border border-white/25 bg-black/70 text-white/85 hover:text-accent hover:border-accent font-mono text-[10px] cursor-pointer"
        >
          ⛶ zoom
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous screenshot"
              onClick={(e) => {
                e.stopPropagation();
                onIdxChange((idx - 1 + images.length) % images.length, "arrow_prev");
              }}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-white/25 bg-black/70 text-white hover:border-accent hover:text-accent font-mono text-base cursor-pointer"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              aria-label="Next screenshot"
              onClick={(e) => {
                e.stopPropagation();
                onIdxChange((idx + 1) % images.length, "arrow_next");
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center border border-white/25 bg-black/70 text-white hover:border-accent hover:text-accent font-mono text-base cursor-pointer"
            >
              &rsaquo;
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12, paddingBottom: 10 }}>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`View screenshot ${i + 1}`}
              onClick={() => onIdxChange(i, "dot")}
              style={{
                width: i === idx ? 26 : 10,
                height: 6,
                borderRadius: 3,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === idx ? "var(--accent)" : "rgba(255,255,255,0.28)",
                transition: "all 0.25s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Works = ({ isBooting }) => {
  const [filter, setFilter] = useState("all");
  const [active, setActive] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { hash, key } = useLocation();
  const heading = useRef(null);

  useEffect(() => {
    const project = projectFromHash(hash);
    if (isBooting || !project) return;
    setFilter("all");
    setActive(projects.indexOf(project));
    setSlideIdx(0);
    document.getElementById("projects")?.scrollIntoView();
    heading.current?.focus({ preventScroll: true });
  }, [hash, key, isBooting]);

  const filtered = filter === "all" ? projects : projects.filter((p) => p.type === filter);
  const safeActive = Math.min(active, Math.max(0, filtered.length - 1));
  const current = filtered[safeActive];
  const currentImages = current ? current.images || [current.image] : [];

  const handleFilter = (f) => {
    setFilter(f);
    setActive(0);
    setSlideIdx(0);
    track("Project Filter Changed", { filter: f });
  };

  const selectProject = (idx, trigger = "sidebar") => {
    const nextIdx = (idx + filtered.length) % filtered.length;
    setActive(nextIdx);
    setSlideIdx(0);
    if (filtered[nextIdx]) {
      track("Project Opened", { project_name: filtered[nextIdx].name, trigger });
    }
  };

  const handleSlideChange = (nextIdx, source = "manual") => {
    if (!currentImages.length) return;
    const wrapped = ((nextIdx % currentImages.length) + currentImages.length) % currentImages.length;
    setSlideIdx(wrapped);
    if (source !== "auto") {
      track("Project Slide Viewed", {
        project_name: current.name,
        slide: wrapped + 1,
        total: currentImages.length,
        source,
      });
    }
  };

  const openLightbox = (trigger = "image_click") => {
    setLightboxOpen(true);
    track("Project Lightbox Opened", {
      project_name: current?.name,
      slide: slideIdx + 1,
      trigger,
    });
  };

  useEffect(() => {
    if (lightboxOpen) return;
    const onKeyDown = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "ArrowDown" && e.altKey) {
        e.preventDefault();
        selectProject(safeActive + 1, "keyboard");
      } else if (e.key === "ArrowUp" && e.altKey) {
        e.preventDefault();
        selectProject(safeActive - 1, "keyboard");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, safeActive, filtered.length]);

  if (!current) return null;

  const cfg = TYPE_CONFIG[current.type] || { icon: "💻", label: "Project", color: "var(--accent)" };

  return (
    <>
      <div>
        <p className={`${styles.sectionSubText}`}>// My work</p>
        <h2 ref={heading} tabIndex={-1} className={styles.sectionHeadText}>
          Projects.
        </h2>
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap", alignItems: "center" }}>
        {FILTERS.map((f) => {
          const isActive = filter === f;
          const c = f === "all" ? "var(--accent)" : TYPE_CONFIG[f]?.color || "var(--accent)";
          return (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                letterSpacing: 2,
                padding: "5px 16px",
                border: isActive ? `1px solid ${c}` : "1px solid rgba(255,255,255,0.1)",
                background: isActive ? `color-mix(in srgb, ${c} 9%, transparent)` : "transparent",
                color: isActive ? c : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "all 0.2s",
                textTransform: "uppercase",
                borderRadius: 4,
              }}
            >
              {f === "all" ? "// all" : `${TYPE_CONFIG[f]?.icon} ${f}`}
            </button>
          );
        })}
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10,
            color: "rgb(var(--accent-rgb) / 0.38)",
            letterSpacing: 2,
          }}
        >
          [{filtered.length} project{filtered.length !== 1 ? "s" : ""}]
        </span>
      </div>

      {/* Main layout */}
      <div style={{ marginTop: 36, display: "flex", gap: 40, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* Left: project list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            width: 270,
            flexShrink: 0,
            borderLeft: "1px solid rgb(var(--accent-rgb) / 0.08)",
          }}
        >
          <div
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              color: "rgb(var(--accent-rgb) / 0.35)",
              letterSpacing: 3,
              padding: "0 0 12px 16px",
              textTransform: "uppercase",
            }}
          >
            select project
          </div>

          {filtered.map((proj, i) => {
            const pcfg = TYPE_CONFIG[proj.type] || { icon: "💻", color: "var(--accent)" };
            const isSelected = i === safeActive;
            return (
              <motion.button
                type="button"
                key={proj.name}
                onClick={() => selectProject(i, "sidebar")}
                whileHover={{ x: 4 }}
                className="text-left bg-transparent border-0"
                style={{
                  padding: "12px 16px",
                  borderLeft: isSelected ? `2px solid ${pcfg.color}` : "2px solid transparent",
                  background: isSelected ? `color-mix(in srgb, ${pcfg.color} 5%, transparent)` : "transparent",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{pcfg.icon}</span>
                  <span
                    style={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 13,
                      color: isSelected ? pcfg.color : "rgba(255,255,255,0.55)",
                      transition: "color 0.2s",
                      fontWeight: isSelected ? 700 : 400,
                    }}
                  >
                    {proj.name}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", paddingLeft: 22 }}>
                  {proj.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.name}
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 9,
                        letterSpacing: 1,
                        color: isSelected
                          ? `color-mix(in srgb, ${pcfg.color} 53%, transparent)`
                          : "rgba(255,255,255,0.18)",
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </motion.button>
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
              transition={{ duration: 0.28 }}
            >
              {/* Type badge */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 10,
                    letterSpacing: 3,
                    color: cfg.color,
                    border: `1px solid color-mix(in srgb, ${cfg.color} 33%, transparent)`,
                    padding: "3px 10px",
                    textTransform: "uppercase",
                    borderRadius: 3,
                  }}
                >
                  {cfg.icon} {cfg.label}
                </span>
                <div style={{ flex: 1, height: 1, background: `color-mix(in srgb, ${cfg.color} 12%, transparent)` }} />
              </div>

              {/* Device mockup */}
              <div className={current.type === "mobile" ? "cyber-border cyber-card-hover rounded-lg overflow-hidden" : ""}>
                {current.type === "mobile" ? (
                  <PhoneFrame
                    images={currentImages}
                    name={current.name}
                    idx={slideIdx}
                    onIdxChange={handleSlideChange}
                    onOpenLightbox={openLightbox}
                  />
                ) : (
                  <BrowserFrame
                    images={currentImages}
                    name={current.name}
                    idx={slideIdx}
                    onIdxChange={handleSlideChange}
                    onOpenLightbox={openLightbox}
                    onWindowEvent={(dot) =>
                      track("Project Window Dot Clicked", { dot, project_name: current.name })
                    }
                  />
                )}
              </div>

              {/* Info */}
              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "clamp(28px,4vw,40px)",
                      letterSpacing: 3,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {current.name}
                  </h3>
                  <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        track(
                          "Project Link Clicked",
                          { project_name: current.name, link_type: "github", url: current.source_code_link },
                          { transport: "sendBeacon" }
                        );
                        window.open(current.source_code_link, "_blank");
                      }}
                      className="cyber-btn"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 11,
                        letterSpacing: 2,
                        color: cfg.color,
                        background: `color-mix(in srgb, ${cfg.color} 5%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${cfg.color} 27%, transparent)`,
                        padding: "7px 16px",
                        cursor: "pointer",
                        borderRadius: 4,
                        flexShrink: 0,
                        transition: "all 0.2s",
                      }}
                    >
                      <img src={github} alt="github" style={{ width: 14, height: 14, filter: "invert(1) opacity(0.7)" }} />
                      // source
                    </button>

                    {current.type === "web" && current.live_link && (
                      <button
                        onClick={() => {
                          track(
                            "Project Link Clicked",
                            { project_name: current.name, link_type: "live", url: current.live_link },
                            { transport: "sendBeacon" }
                          );
                          window.open(current.live_link, "_blank");
                        }}
                        className="cyber-btn glitch-reveal"
                        data-text="// live"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 11,
                          letterSpacing: 2,
                          color: "var(--accent)",
                          background: "rgb(var(--accent-rgb) / 0.07)",
                          border: "1px solid rgb(var(--accent-rgb) / 0.35)",
                          padding: "7px 16px",
                          cursor: "pointer",
                          borderRadius: 4,
                          flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "var(--accent)",
                            display: "inline-block",
                            animation: "pulse-dot 1.4s ease-in-out infinite",
                          }}
                        />
                        // live
                      </button>
                    )}

                    {current.type === "desktop" && current.exe_link && (
                      <button
                        onClick={() => {
                          track(
                            "Project Link Clicked",
                            { project_name: current.name, link_type: "download", url: current.exe_link },
                            { transport: "sendBeacon" }
                          );
                          window.open(current.exe_link, "_blank");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 11,
                          letterSpacing: 2,
                          color: "#ffb700",
                          background: "rgba(255,183,0,0.07)",
                          border: "1px solid rgba(255,183,0,0.35)",
                          padding: "7px 16px",
                          cursor: "pointer",
                          borderRadius: 4,
                          flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,183,0,0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,183,0,0.07)")}
                      >
                        ↓ // download .exe
                      </button>
                    )}

                    {current.type === "mobile" && current.apk_link && !current.apk_blocked && (
                      <button
                        onClick={() => {
                          track(
                            "Project Link Clicked",
                            { project_name: current.name, link_type: "download", url: current.apk_link },
                            { transport: "sendBeacon" }
                          );
                          window.open(current.apk_link, "_blank");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: 11,
                          letterSpacing: 2,
                          color: "var(--accent)",
                          background: "rgb(var(--accent-rgb) / 0.07)",
                          border: "1px solid rgb(var(--accent-rgb) / 0.35)",
                          padding: "7px 16px",
                          cursor: "pointer",
                          borderRadius: 4,
                          flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgb(var(--accent-rgb) / 0.18)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgb(var(--accent-rgb) / 0.07)")}
                      >
                        ↓ // download .apk
                      </button>
                    )}

                    {current.type === "mobile" && current.apk_blocked && (
                      <div style={{ position: "relative" }} className="apk-blocked-wrap">
                        <button
                          disabled
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: 11,
                            letterSpacing: 2,
                            color: "rgba(255,255,255,0.25)",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            padding: "7px 16px",
                            cursor: "not-allowed",
                            borderRadius: 4,
                            flexShrink: 0,
                          }}
                        >
                          🔒 // download .apk
                        </button>
                        <div
                          style={{
                            position: "absolute",
                            bottom: "calc(100% + 8px)",
                            right: 0,
                            background: "#1a1a1a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: 6,
                            padding: "8px 12px",
                            whiteSpace: "nowrap",
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: 10,
                            color: "rgba(255,255,255,0.45)",
                            letterSpacing: 1,
                            pointerEvents: "none",
                            opacity: 0,
                            transition: "opacity 0.2s",
                          }}
                          className="apk-tooltip"
                        >
                          download authorized through their official store only
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ height: 1, background: `color-mix(in srgb, ${cfg.color} 9%, transparent)`, margin: "14px 0" }} />

                <ImpactMetrics metrics={current.metrics} accentColor={cfg.color} />

                <p
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    fontSize: 15,
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: 1.75,
                  }}
                >
                  {current.description}
                </p>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
                  {current.tags.map((tag) => (
                    <span
                      key={tag.name}
                      style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: 11,
                        padding: "4px 12px",
                        border: `1px solid color-mix(in srgb, ${cfg.color} 20%, transparent)`,
                        color: `color-mix(in srgb, ${cfg.color} 80%, transparent)`,
                        letterSpacing: 1,
                        borderRadius: 3,
                      }}
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {lightboxOpen && (
        <ProjectLightbox
          images={currentImages}
          index={slideIdx}
          name={current.name}
          onClose={() => setLightboxOpen(false)}
          onStep={(nextIdx) => handleSlideChange(nextIdx, "lightbox")}
        />
      )}
    </>
  );
};

export default SectionWrapper(Works, "projects", "portfolio");
