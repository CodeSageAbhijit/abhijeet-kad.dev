import { useEffect, useRef, useState } from "react";
import { fireConfetti } from "../fans/confetti";
import { markEasterEggFound, trackHiddenFeature } from "../utils/analytics";
import { playBugSquashSfx, playVictoryFanfare } from "../utils/retroRingtone";

const BUG_COUNT = 5;
const ROUND_SECONDS = 30;

function createBugs() {
  const w = typeof window !== "undefined" ? window.innerWidth : 1024;
  const h = typeof window !== "undefined" ? window.innerHeight : 768;
  return Array.from({ length: BUG_COUNT }, (_, id) => {
    const angle = (Math.PI * 2 * id) / BUG_COUNT + Math.random() * 0.8;
    const speed = 62 + Math.random() * 38;
    return {
      id,
      x: Math.max(48, Math.min(w - 72, w * (0.2 + Math.random() * 0.6))),
      y: Math.max(92, Math.min(h - 90, h * (0.22 + Math.random() * 0.55))),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alive: true,
      splatUntil: 0,
    };
  });
}

function PixelBugSvg() {
  return (
    <svg width="26" height="26" viewBox="0 0 16 16" aria-hidden="true" style={{ shapeRendering: "crispEdges" }}>
      <rect x="6" y="2" width="4" height="2" fill="#22c55e" />
      <rect x="4" y="4" width="8" height="7" rx="1" fill="#16a34a" />
      <rect x="5" y="5" width="2" height="2" fill="#fef08a" />
      <rect x="9" y="5" width="2" height="2" fill="#fef08a" />
      <rect x="7" y="7" width="2" height="3" fill="#052e16" />
      <rect x="2" y="4" width="2" height="1" fill="#4ade80" />
      <rect x="12" y="4" width="2" height="1" fill="#4ade80" />
      <rect x="1" y="7" width="3" height="1" fill="#4ade80" />
      <rect x="12" y="7" width="3" height="1" fill="#4ade80" />
      <rect x="2" y="10" width="2" height="1" fill="#4ade80" />
      <rect x="12" y="10" width="2" height="1" fill="#4ade80" />
    </svg>
  );
}

export default function BugsSquashOverlay({ onClose }) {
  const bugsRef = useRef(createBugs());
  const [, setTick] = useState(0);
  const [squashed, setSquashed] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [completed, setCompleted] = useState(false);

  const timedOut = !completed && timeLeft <= 0;

  useEffect(() => {
    if (completed || timedOut) return;

    let frameId;
    let last = performance.now();

    const step = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      const maxX = Math.max(120, window.innerWidth - 44);
      const maxY = Math.max(160, window.innerHeight - 44);

      for (const b of bugsRef.current) {
        if (!b.alive) continue;
        b.vx += (Math.random() - 0.5) * 18;
        b.vy += (Math.random() - 0.5) * 18;
        const speed = Math.hypot(b.vx, b.vy) || 1;
        if (speed > 112) {
          b.vx = (b.vx / speed) * 112;
          b.vy = (b.vy / speed) * 112;
        } else if (speed < 55) {
          b.vx = (b.vx / speed) * 72;
          b.vy = (b.vy / speed) * 72;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.x < 16) { b.x = 16; b.vx = Math.abs(b.vx); }
        if (b.x > maxX) { b.x = maxX; b.vx = -Math.abs(b.vx); }
        if (b.y < 76) { b.y = 76; b.vy = Math.abs(b.vy); }
        if (b.y > maxY) { b.y = maxY; b.vy = -Math.abs(b.vy); }
      }

      setTick((t) => (t + 1) % 10000);
      frameId = requestAnimationFrame(step);
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [completed, timedOut]);

  useEffect(() => {
    if (completed || timedOut) return;
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [completed, timedOut]);

  useEffect(() => {
    if (timedOut) {
      trackHiddenFeature("bugs_squashed_timeout", { squashed });
    }
  }, [timedOut, squashed]);

  useEffect(() => {
    if (!completed) return;
    const timer = setTimeout(() => onClose(), 4600);
    return () => clearTimeout(timer);
  }, [completed, onClose]);

  const retry = () => {
    bugsRef.current = createBugs();
    setSquashed(0);
    setTimeLeft(ROUND_SECONDS);
    setCompleted(false);
    setTick((t) => t + 1);
  };

  const squash = (bug, e) => {
    if (!bug.alive || timedOut || completed) return;
    bug.alive = false;
    bug.splatUntil = performance.now() + 700;
    playBugSquashSfx();

    const nextCount = bugsRef.current.filter((b) => !b.alive).length;
    setSquashed(nextCount);

    if (nextCount >= BUG_COUNT) {
      setCompleted(true);
      playVictoryFanfare();
      markEasterEggFound("qa_debugger_certified", "click");
      try {
        fireConfetti(e?.clientX || window.innerWidth / 2, e?.clientY || 120);
      } catch {
        // Ignore confetti errors
      }
    }
  };

  const now = performance.now();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9500, pointerEvents: "none" }}>
      <div
        role="status"
        style={{
          position: "fixed",
          top: 82,
          left: "50%",
          transform: "translateX(-50%)",
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: completed ? "10px 16px" : "7px 14px",
          background: "rgba(6, 15, 24, 0.95)",
          border: completed
            ? "1px solid #22c55e"
            : timedOut
              ? "1px solid #f87171"
              : "1px solid var(--accent)",
          boxShadow: completed
            ? "0 0 24px rgba(34, 197, 94, 0.45)"
            : "0 0 18px rgb(var(--accent-rgb) / 0.3)",
          borderRadius: 6,
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 12,
          color: completed ? "#4ade80" : timedOut ? "#fca5a5" : "#ffffff",
          letterSpacing: 1,
          whiteSpace: "nowrap",
        }}
      >
        {completed ? (
          <span>★ CERTIFIED QA DEBUGGER — {BUG_COUNT}/{BUG_COUNT} Squashed in {ROUND_SECONDS - timeLeft}s!</span>
        ) : timedOut ? (
          <>
            <span>⏱ TIME&apos;S UP! {squashed}/{BUG_COUNT} Squashed</span>
            <button
              type="button"
              onClick={retry}
              style={{
                background: "rgb(var(--accent-rgb) / 0.15)",
                border: "1px solid var(--accent)",
                color: "var(--accent)",
                padding: "2px 8px",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 11,
              }}
            >
              ↻ Retry
            </button>
          </>
        ) : (
          <>
            <span>🐛 BUGS: {squashed} / {BUG_COUNT}</span>
            <span
              style={{
                padding: "1px 7px",
                borderRadius: 4,
                background: timeLeft <= 8 ? "rgba(239,68,68,0.2)" : "rgb(var(--accent-rgb) / 0.14)",
                color: timeLeft <= 8 ? "#fca5a5" : "var(--accent)",
                fontWeight: 700,
              }}
            >
              ⏱ {timeLeft}s
            </span>
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close bug hunt"
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(255,255,255,0.65)",
            cursor: "pointer",
            fontSize: 15,
            lineHeight: 1,
            padding: "0 2px",
          }}
        >
          ×
        </button>
      </div>

      {!timedOut && bugsRef.current.map((bug) => {
        if (!bug.alive && now > bug.splatUntil) return null;
        const rotDeg = Math.round((Math.atan2(bug.vy, bug.vx) * 180) / Math.PI) + 90;
        if (!bug.alive) {
          return (
            <div
              key={bug.id}
              style={{
                position: "fixed",
                left: bug.x,
                top: bug.y,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: "#4ade80",
                textShadow: "0 0 8px #22c55e",
                pointerEvents: "none",
              }}
            >
              *SQUASH!*
            </div>
          );
        }
        return (
          <button
            key={bug.id}
            type="button"
            onClick={(e) => squash(bug, e)}
            aria-label={`Squash pixel bug ${bug.id + 1}`}
            style={{
              position: "fixed",
              left: bug.x,
              top: bug.y,
              width: 34,
              height: 34,
              display: "grid",
              placeItems: "center",
              background: "transparent",
              border: "none",
              cursor: "crosshair",
              pointerEvents: "auto",
              transform: `rotate(${rotDeg}deg)`,
              filter: "drop-shadow(0 0 6px rgba(74, 222, 128, 0.7))",
            }}
          >
            <PixelBugSvg />
          </button>
        );
      })}
    </div>
  );
}
