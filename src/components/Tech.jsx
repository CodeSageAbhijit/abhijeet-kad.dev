import React, { useEffect, useMemo, useState } from "react";

import TechBubblesCanvas from "./canvas/TechBubbles";
import CanvasBoundary from "./canvas/CanvasBoundary";
import { TechIcons } from "./TechMobile";
import { createTechSoundEngine } from "./canvas/techSounds";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { styles } from "../styles";
import { markEasterEggFound, track, trackHiddenFeature } from "../utils/analytics";

const ORB_FORTUNES = [
  "Magic 8-Ball says: Strong hire. Zero bias detected from this orb.",
  "2:14 AM deploys teach more than 10 tutorials ever will.",
  "You found the blank orb! Not all blank canvases stay empty.",
  "Outlook hazy... try checking the Retro PC at /retro for more secrets.",
  "Plot twist: The real tech stack is persistence + curiosity.",
];

const Tech = () => {
  const [mode, setMode] = useState("float"); // "float" | "organized" | "inspect"
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [orbUnlocked, setOrbUnlocked] = useState(false);
  const [orbRollCount, setOrbRollCount] = useState(0);

  const soundEngine = useMemo(() => createTechSoundEngine(), []);
  useEffect(() => () => soundEngine.dispose(), [soundEngine]);

  const currentTech = technologies[focusedIndex] || technologies[0];
  const isBlankOrb = mode === "inspect" && currentTech?.name === "Three JS";
  const currentFortune =
    ORB_FORTUNES[(Math.max(1, orbRollCount) - 1) % ORB_FORTUNES.length];

  const setViewMode = (nextMode) => {
    if (nextMode === mode) return;
    setOrbUnlocked(false);
    setMode(nextMode);
    if (nextMode === "organized") {
      soundEngine.playOrganize();
    } else if (nextMode === "float") {
      soundEngine.playFloat();
    }
    track("Tech Stack Organized", {
      organized: nextMode === "organized",
      mode: nextMode,
      previous_mode: mode,
    });
  };

  const stepInspect = (nextIdx, action) => {
    const wrapped = (nextIdx + technologies.length) % technologies.length;
    setOrbUnlocked(false);
    setFocusedIndex(wrapped);
    setMode("inspect");
    soundEngine.playInspect(wrapped);
    const techName = technologies[wrapped]?.name || "unknown";
    track("Tech Stack Inspected", {
      tech: techName,
      index: wrapped + 1,
      total: technologies.length,
      action,
    });
    trackHiddenFeature("tech_one_by_one_inspect", { first_tech: techName });
  };

  const handleSphereClick = (idx) => {
    const clickedTech = technologies[idx];
    // Hidden Easter Egg: clicking the focused blank sphere in 1-by-1 mode shakes it like a Magic 8-Ball
    if (mode === "inspect" && idx === focusedIndex && clickedTech?.name === "Three JS") {
      const nextRoll = orbRollCount + 1;
      const fortune = ORB_FORTUNES[(nextRoll - 1) % ORB_FORTUNES.length];
      setOrbUnlocked(true);
      setOrbRollCount(nextRoll);
      soundEngine.playSurprise();
      markEasterEggFound("mystery_orb_fortune", "inspect_ball_click");
      track("Mystery Orb Shaken", {
        roll_count: nextRoll,
        fortune,
        mode: "1-by-1",
      });
      return;
    }
    stepInspect(idx, "sphere_click");
  };

  const exitInspect = () => {
    setOrbUnlocked(false);
    setMode("organized");
    soundEngine.playOrganize();
    track("Tech Stack Inspect Exited", {
      last_tech: currentTech?.name || "unknown",
    });
  };

  useEffect(() => {
    if (mode !== "inspect") return;
    const onKeyDown = (e) => {
      if (e.key === "ArrowRight") stepInspect(focusedIndex + 1, "keyboard_next");
      else if (e.key === "ArrowLeft") stepInspect(focusedIndex - 1, "keyboard_prev");
      else if (e.key === "Escape") exitInspect();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, focusedIndex]);

  return (
    <>
      <div>
        <p className={`${styles.sectionSubText}`}>// Technologies I use</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className={`${styles.sectionHeadText}`}>Tech Stack.</h2>

          <div
            role="group"
            aria-label="Tech stack view controls"
            className="inline-flex flex-wrap items-center border border-[rgb(var(--accent-rgb)/0.3)] bg-[var(--term-bg)] font-mono text-[11px] uppercase tracking-[2px]"
          >
            {[
              { id: "float", label: "// float" },
              { id: "organized", label: "// grid" },
              { id: "inspect", label: "// 1-by-1" },
            ].map((tab, idx) => {
              const active = mode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.id === "inspect") {
                      if (mode === "inspect") exitInspect();
                      else stepInspect(focusedIndex, "start");
                    } else {
                      setViewMode(tab.id);
                    }
                  }}
                  style={
                    active
                      ? {
                        background: "rgb(var(--accent-rgb) / 0.16)",
                        color: "#ffffff",
                        boxShadow: "inset 0 -2px 0 var(--accent), 0 0 12px rgb(var(--accent-rgb) / 0.18)",
                        textShadow: "0 0 8px rgb(var(--accent-rgb) / 0.6)",
                      }
                      : undefined
                  }
                  className={`px-3.5 py-2 transition-all cursor-pointer ${idx > 0 ? "border-l border-[rgb(var(--accent-rgb)/0.2)]" : ""
                    } ${active ? "" : "text-secondary/80 hover:text-white hover:bg-white/5"}`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-2 font-mono text-[11px] text-secondary/80">
          {mode === "float"
            ? "// Hold click inside canvas to swirl & burst · Click any sphere to inspect"
            : mode === "organized"
              ? "// Neat grid view · Click any sphere to spotlight it"
              : orbUnlocked && isBlankOrb
                ? "// Click the orb again for another fortune"
                : isBlankOrb
                  ? `// Inspecting ${String(focusedIndex + 1).padStart(2, "0")}/${technologies.length} · Blank sphere? Click it...`
                  : `// Inspecting ${String(focusedIndex + 1).padStart(2, "0")}/${technologies.length} · Use Prev/Next or arrow keys`}
        </p>
      </div>

      <CanvasBoundary fallback={<TechIcons />}>
        <div className="relative w-full mt-4" style={{ height: 520 }}>
          <TechBubblesCanvas
            technologies={technologies}
            mode={mode}
            focusedIndex={focusedIndex}
            surpriseActive={orbUnlocked}
            surpriseRollCount={orbRollCount}
            onSelectTech={handleSphereClick}
            onExitInspect={exitInspect}
            soundEngine={soundEngine}
          />

          {mode === "inspect" && orbUnlocked && isBlankOrb && (
            <div
              className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 max-w-md w-[90%] px-4 py-2.5 border border-[#fbbf24]/60 bg-[var(--term-bg)]/95 font-mono text-[12px] text-center text-[#fde68a]"
              style={{ boxShadow: "0 0 22px rgba(251, 191, 36, 0.22)" }}
            >
              {currentFortune}
            </div>
          )}

          {mode === "inspect" && (
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 border border-[rgb(var(--accent-rgb)/0.45)] bg-[var(--term-bg)]/95 font-mono text-[11px] uppercase tracking-[2px]"
              style={{ boxShadow: "0 0 18px rgb(var(--accent-rgb) / 0.16)" }}
            >
              <button
                type="button"
                onClick={() => stepInspect(focusedIndex - 1, "prev")}
                aria-label="Previous technology"
                className="px-2 py-0.5 text-accent hover:text-white cursor-pointer"
              >
                &lt; prev
              </button>
              <span className="text-white/90 whitespace-nowrap border-x border-[rgb(var(--accent-rgb)/0.25)] px-3">
                {String(focusedIndex + 1).padStart(2, "0")}/{technologies.length} &middot;{" "}
                <strong className="text-accent">
                  {orbUnlocked && isBlankOrb ? "FORTUNE ORB" : currentTech?.name}
                </strong>
              </span>
              <button
                type="button"
                onClick={() => stepInspect(focusedIndex + 1, "next")}
                aria-label="Next technology"
                className="px-2 py-0.5 text-accent hover:text-white cursor-pointer"
              >
                next &gt;
              </button>
            </div>
          )}
        </div>
      </CanvasBoundary>
    </>
  );
};

export default SectionWrapper(Tech, "skills", "tools");
