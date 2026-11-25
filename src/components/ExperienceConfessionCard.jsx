import { useEffect, useId, useRef, useState } from "react";
import { trackHiddenFeature } from "../utils/analytics";

/**
 * Computes a compact jiggly organic gel-drop SVG path with elastic velocity stretch
 * and multi-harmonic wobble, keeping center coordinates for edge-locked gradients.
 */
function buildJigglyGelBlob(cx, cy, radius, t, seed, vx = 0, vy = 0) {
  const points = 32;
  const speed = Math.hypot(vx, vy);
  const moveAngle = Math.atan2(vy, vx);
  const stretch = Math.min(0.28, speed * 0.013);

  const coords = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    const align = Math.cos(a - moveAngle);
    const directionalDeform = 1 + stretch * (align * align - 0.5);
    const jiggle =
      1 +
      0.16 * Math.sin(2 * a + t * 3.2 + seed) +
      0.14 * Math.sin(3 * a - t * 4.4 + seed * 1.3) +
      0.09 * Math.cos(4 * a + t * 2.9 + seed * 0.6) +
      0.05 * Math.sin(6 * a - t * 5.1);
    const r = radius * directionalDeform * jiggle;
    coords.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }

  const segs = [];
  for (let i = 0; i < coords.length; i++) {
    const curr = coords[i];
    const next = coords[(i + 1) % coords.length];
    const midX = (curr[0] + next[0]) * 0.5;
    const midY = (curr[1] + next[1]) * 0.5;
    if (i === 0) {
      const prev = coords[coords.length - 1];
      segs.push(`M ${((prev[0] + curr[0]) * 0.5).toFixed(1)} ${((prev[1] + curr[1]) * 0.5).toFixed(1)}`);
    }
    segs.push(`Q ${curr[0].toFixed(1)} ${curr[1].toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`);
  }
  segs.push("Z");

  return {
    path: segs.join(" "),
    cx,
    cy,
    baseR: radius,
    r: radius * 1.25,
    pulse: 0.48 + 0.14 * Math.sin(t * 3.4 + seed),
  };
}

function renderStandardStory(experience, compact) {
  if (compact) {
    return (
      <ul className="mt-3 space-y-2">
        {experience.points.map((point, i) => (
          <li
            key={`experience-point-${i}`}
            className="text-white-100 text-[13px] tracking-wide flex items-start gap-2"
          >
            <span className="text-accent mt-1 text-[10px]">▹</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div>
        <h3 className="text-white text-[24px] font-bold">{experience.title}</h3>
        <p className="text-secondary text-[16px] font-semibold" style={{ margin: 0 }}>
          {experience.company_name}
        </p>
        {experience.subtitle && (
          <p className="font-mono text-[13px] text-accent/75" style={{ margin: "4px 0 0" }}>
            {experience.subtitle}
          </p>
        )}
      </div>

      <ul className="mt-5 list-disc ml-5 space-y-2">
        {experience.points.map((point, index) => (
          <li
            key={`experience-point-${index}`}
            className="text-white-100 text-[14px] pl-1 tracking-wider"
          >
            {point}
          </li>
        ))}
      </ul>
    </>
  );
}

function renderConfessionStory(experience, compact) {
  if (compact) {
    return (
      <>
        <p className="font-mono text-[11px] text-amber-300/90 mt-0 mb-2">
          {experience.confessionSubtitle}
        </p>
        <ul className="space-y-2">
          {experience.confessionPoints.map((point, i) => (
            <li
              key={`confession-point-${i}`}
              className="text-white-100 text-[13px] tracking-wide flex items-start gap-2"
            >
              <span className="text-amber-300 mt-1 text-[10px]">▹</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </>
    );
  }

  return (
    <>
      <div>
        <h3 className="text-white text-[24px] font-bold">{experience.confessionTitle}</h3>
        <p className="text-secondary text-[16px] font-semibold" style={{ margin: 0 }}>
          {experience.company_name}
        </p>
        {experience.confessionSubtitle && (
          <p className="font-mono text-[13px] text-accent/75" style={{ margin: "4px 0 0" }}>
            {experience.confessionSubtitle}
          </p>
        )}
      </div>

      <ul className="mt-5 list-disc ml-5 space-y-2">
        {experience.confessionPoints.map((point, index) => (
          <li
            key={`confession-point-${index}`}
            className="text-white-100 text-[14px] pl-1 tracking-wider"
          >
            {point}
          </li>
        ))}
      </ul>
    </>
  );
}

export default function ExperienceConfessionCard({
  experience,
  unlocked,
  compact = false,
}) {
  const wrapRef = useRef(null);
  const uid = useId().replace(/:/g, "");
  const clipId = `exp-blob-${uid}`;
  const glowId = `exp-gel-glow-${uid}`;
  const rimId = `exp-gel-rim-${uid}`;
  const fillId = `exp-gel-fill-${uid}`;
  const neonGradId = `exp-neon-edge-${uid}`;
  const peekLoggedRef = useRef(false);

  const [size, setSize] = useState({ w: 400, h: 220 });
  const [peeking, setPeeking] = useState(false);
  const [blob, setBlob] = useState({
    path: "",
    cx: 180,
    cy: 100,
    r: 28,
    pulse: 0.5,
  });

  const targetPos = useRef({ x: 180, y: 100 });
  const smoothPos = useRef({ x: 180, y: 100 });
  const velocityRef = useRef({ vx: 0, vy: 0 });
  const timeRef = useRef(0);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width && rect.height) {
        setSize({ w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!peeking || unlocked) return;
    let rafId;
    let prev = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      timeRef.current += dt;

      // Underdamped spring velocity gives an authentic jiggly gel lag & wobble
      const dx = targetPos.current.x - smoothPos.current.x;
      const dy = targetPos.current.y - smoothPos.current.y;
      velocityRef.current.vx = velocityRef.current.vx * 0.72 + dx * 0.24;
      velocityRef.current.vy = velocityRef.current.vy * 0.72 + dy * 0.24;
      smoothPos.current.x += velocityRef.current.vx;
      smoothPos.current.y += velocityRef.current.vy;

      const baseR = compact ? 18 : 22;
      const seed = experience.id === "robotics" ? 2.1 : 0.7;
      setBlob(
        buildJigglyGelBlob(
          smoothPos.current.x,
          smoothPos.current.y,
          baseR,
          timeRef.current,
          seed,
          velocityRef.current.vx,
          velocityRef.current.vy
        )
      );
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [peeking, unlocked, compact, experience.id]);

  const handlePointer = (clientX, clientY) => {
    if (unlocked || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    targetPos.current = { x, y };
    if (!peeking) {
      smoothPos.current = { x, y };
      velocityRef.current = { vx: 0, vy: 0 };
      setPeeking(true);
    }
    if (!peekLoggedRef.current) {
      peekLoggedRef.current = true;
      trackHiddenFeature("experience_xray_peek", { company: experience.company_name });
    }
  };

  const isPeeking = peeking && !unlocked;

  return (
    <div
      ref={wrapRef}
      className={`exp-confession-host${unlocked ? " is-unlocked" : ""}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") handlePointer(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => handlePointer(e.clientX, e.clientY)}
      onPointerLeave={() => setPeeking(false)}
    >
      {/* Front Resume Summary (matches normal card layout 1:1) */}
      <div
        className="exp-front-layer"
        style={{
          opacity: unlocked ? 0 : 1,
          pointerEvents: unlocked ? "none" : "auto",
        }}
      >
        {renderStandardStory(experience, compact)}
      </div>

      {/* SVG clipPath + neon-edged clear-center gel-drop overlay */}
      <svg
        className="exp-blob-svg"
        viewBox={`0 0 ${Math.max(1, size.w)} ${Math.max(1, size.h)}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={blob.path || "M0 0 Z"} />
          </clipPath>

          <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="5" />
          </filter>

          <filter id={rimId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>

          <linearGradient
            id={neonGradId}
            gradientUnits="userSpaceOnUse"
            x1={blob.cx - blob.r}
            y1={blob.cy - blob.r}
            x2={blob.cx + blob.r}
            y2={blob.cy + blob.r}
          >
            <stop offset="0%" stopColor="#00f5ff" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#e879f9" />
          </linearGradient>

          {/* Center stays 100% transparent/clear; glow clings strictly to outer meniscus */}
          <radialGradient
            id={fillId}
            gradientUnits="userSpaceOnUse"
            cx={blob.cx}
            cy={blob.cy}
            r={Math.max(1, blob.r)}
          >
            <stop offset="0%" stopColor="#00f5ff" stopOpacity="0" />
            <stop offset="78%" stopColor="#00f5ff" stopOpacity="0" />
            <stop offset="91%" stopColor="#00f5ff" stopOpacity="0.14" />
            <stop offset="98%" stopColor="#38bdf8" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#e879f9" stopOpacity="0.54" />
          </radialGradient>
        </defs>

        {isPeeking && blob.path && (
          <g>
            {/* Outer wide electric neon bloom */}
            <path
              d={blob.path}
              fill="none"
              stroke={`url(#${neonGradId})`}
              strokeWidth="7"
              strokeOpacity={blob.pulse}
              filter={`url(#${glowId})`}
            />
            {/* Edge-only translucent gel tint (dead center completely clear) */}
            <path d={blob.path} fill={`url(#${fillId})`} />
            {/* Mid neon tube halo */}
            <path
              d={blob.path}
              fill="none"
              stroke={`url(#${neonGradId})`}
              strokeWidth="3.2"
              strokeOpacity="0.82"
              filter={`url(#${rimId})`}
            />
            {/* Crisp saturated neon perimeter */}
            <path
              d={blob.path}
              fill="none"
              stroke={`url(#${neonGradId})`}
              strokeWidth="1.6"
              strokeOpacity="0.98"
            />
            {/* White-hot inner neon filament */}
            <path
              d={blob.path}
              fill="none"
              stroke="#ecfeff"
              strokeWidth="0.7"
              strokeOpacity="0.9"
            />
          </g>
        )}
      </svg>

      {/* Clean borderless underlying confession using exact same front-text structure */}
      {(unlocked || (peeking && blob.path)) && (
        <div
          className={`exp-confession-layer ${unlocked ? "is-unlocked" : "is-peek"}`}
          style={
            unlocked
              ? undefined
              : {
                  clipPath: `url(#${clipId})`,
                  WebkitClipPath: `url(#${clipId})`,
                }
          }
        >
          {renderConfessionStory(experience, compact)}
        </div>
      )}
    </div>
  );
}
