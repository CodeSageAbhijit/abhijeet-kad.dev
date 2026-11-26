import React, { useEffect, useMemo, useState } from "react";
import { SectionWrapper } from "../hoc";
import { technologies } from "../constants";
import { styles } from "../styles";
import { createTechSoundEngine } from "./canvas/techSounds";
import { markEasterEggFound, track, trackHiddenFeature } from "../utils/analytics";

const ORB_FORTUNES = [
  "Magic 8-Ball says: Strong hire. Zero bias detected from this orb.",
  "2:14 AM deploys teach more than 10 tutorials ever will.",
  "You found the blank orb! Not all blank canvases stay empty.",
  "Outlook hazy... try checking the Retro PC at /retro for more secrets.",
  "Plot twist: The real tech stack is persistence + curiosity.",
];

export function TechIcons() {
  return (
    <div className='w-full mt-10 grid grid-cols-4 gap-6 place-items-center' style={{ minHeight: 300 }}>
      {technologies.map((tech) => (
        <div key={tech.name} className='flex flex-col items-center justify-center gap-2'>
          <div className='w-16 h-16 rounded-full bg-tertiary flex items-center justify-center border border-white/10 shadow-[0_0_10px_rgb(var(--accent-rgb)/0.1)]'>
            <img
              src={tech.icon}
              alt={tech.name}
              className='w-10 h-10 object-contain'
            />
          </div>
          <p className='text-[10px] text-secondary tracking-wider text-center'>
            {tech.name}
          </p>
        </div>
      ))}
    </div>
  );
}

const TechMobile = () => {
  const [inspecting, setInspecting] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [orbUnlocked, setOrbUnlocked] = useState(false);
  const [orbRollCount, setOrbRollCount] = useState(0);

  const activeTech = technologies[focusedIndex] || technologies[0];
  const isBlankOrb = activeTech?.name === "Three JS";
  const currentFortune =
    ORB_FORTUNES[(Math.max(1, orbRollCount) - 1) % ORB_FORTUNES.length];

  const soundEngine = useMemo(() => createTechSoundEngine(), []);
  useEffect(() => () => soundEngine.dispose(), [soundEngine]);

  const stepInspect = (nextIdx, action) => {
    const wrapped = (nextIdx + technologies.length) % technologies.length;
    setOrbUnlocked(false);
    setFocusedIndex(wrapped);
    setInspecting(true);
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

  const handleMobileOrbTap = () => {
    if (!isBlankOrb) return;
    const nextRoll = orbRollCount + 1;
    const fortune = ORB_FORTUNES[(nextRoll - 1) % ORB_FORTUNES.length];
    setOrbUnlocked(true);
    setOrbRollCount(nextRoll);
    soundEngine.playSurprise();
    markEasterEggFound("mystery_orb_fortune", "mobile_inspect_tap");
    track("Mystery Orb Shaken", {
      roll_count: nextRoll,
      fortune,
      mode: "mobile_1-by-1",
    });
  };

  return (
    <>
      <div>
        <p className={`${styles.sectionSubText}`}>// Technologies I use</p>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className={`${styles.sectionHeadText}`}>Tech Stack.</h2>
          <button
            type="button"
            onClick={() => {
              if (inspecting) {
                setOrbUnlocked(false);
                setInspecting(false);
                soundEngine.playOrganize();
              } else {
                stepInspect(focusedIndex, "mobile_start");
              }
            }}
            className="cyber-btn px-3 py-1.5 font-mono text-[11px] uppercase tracking-[2px] cursor-pointer"
          >
            {inspecting ? "// show all" : "// 1-by-1"}
          </button>
        </div>
      </div>

      {inspecting ? (
        <div className="mt-8 p-6 border border-[rgb(var(--accent-rgb)/0.4)] bg-[var(--term-bg)] flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleMobileOrbTap}
            aria-label={isBlankOrb ? "Shake blank mystery orb" : activeTech.name}
            className={`w-24 h-24 rounded-full flex items-center justify-center border transition-all ${orbUnlocked && isBlankOrb
                ? "border-[#fbbf24] bg-[#1e1035] shadow-[0_0_28px_rgba(251,191,36,0.45)]"
                : "border-[rgb(var(--accent-rgb)/0.45)] bg-tertiary shadow-[0_0_24px_rgb(var(--accent-rgb)/0.2)]"
              } ${isBlankOrb ? "cursor-pointer" : "cursor-default"}`}
          >
            {orbUnlocked && isBlankOrb ? (
              <span className="font-mono text-2xl font-bold text-[#fde68a]">8</span>
            ) : (
              <img
                src={activeTech.icon}
                alt={activeTech.name}
                className="w-14 h-14 object-contain"
              />
            )}
          </button>
          <p className="font-mono text-xs text-white uppercase tracking-[2px] text-center">
            {String(focusedIndex + 1).padStart(2, "0")}/{technologies.length} ·{" "}
            <span className="text-accent">
              {orbUnlocked && isBlankOrb ? "FORTUNE ORB" : activeTech.name}
            </span>
          </p>
          {orbUnlocked && isBlankOrb && (
            <p className="font-mono text-[11px] text-[#fde68a] text-center max-w-xs">
              {currentFortune}
            </p>
          )}
          <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[2px]">
            <button
              type="button"
              onClick={() => stepInspect(focusedIndex - 1, "mobile_prev")}
              className="px-3 py-1.5 border border-white/15 text-accent cursor-pointer"
            >
              &lt; prev
            </button>
            <button
              type="button"
              onClick={() => stepInspect(focusedIndex + 1, "mobile_next")}
              className="px-3 py-1.5 border border-white/15 text-accent cursor-pointer"
            >
              next &gt;
            </button>
          </div>
        </div>
      ) : (
        <TechIcons />
      )}
    </>
  );
};

export default SectionWrapper(TechMobile, "skills", "tools");
