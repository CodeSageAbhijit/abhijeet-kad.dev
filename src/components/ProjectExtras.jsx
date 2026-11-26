import React, { useEffect } from "react";

export function ImpactMetrics({ metrics = [], accentColor = "var(--accent)", compact = false }) {
  if (!metrics.length) return null;
  return (
    <div className={`flex flex-wrap gap-2 ${compact ? "mb-3" : "mb-3.5"}`}>
      {metrics.map((metric) => (
        <span
          key={metric}
          style={{
            borderColor: `color-mix(in srgb, ${accentColor} 38%, transparent)`,
            background: `color-mix(in srgb, ${accentColor} 10%, transparent)`,
            color: accentColor,
          }}
          className={`font-mono uppercase tracking-[1.4px] border px-2.5 py-1 ${
            compact ? "text-[9px]" : "text-[10px]"
          }`}
        >
          // {metric}
        </span>
      ))}
    </div>
  );
}

export function ProjectLightbox({
  images = [],
  index = 0,
  name = "",
  onClose,
  onStep,
}) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
      else if (e.key === "ArrowRight") onStep?.(index + 1);
      else if (e.key === "ArrowLeft") onStep?.(index - 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, onClose, onStep]);

  if (!images.length) return null;
  const safeIdx = ((index % images.length) + images.length) % images.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name} screenshot preview`}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(4, 7, 14, 0.92)",
        backdropFilter: "blur(8px)",
      }}
      className="flex flex-col items-center justify-center p-4 sm:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl flex items-center justify-between mb-3 font-mono text-xs uppercase tracking-[2px]"
      >
        <span className="text-white/90">
          {name}{" "}
          <span className="text-accent ml-2">
            {String(safeIdx + 1).padStart(2, "0")}/{String(images.length).padStart(2, "0")}
          </span>
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1 border border-white/25 text-white/80 hover:text-white hover:border-white cursor-pointer"
        >
          [ esc / close ]
        </button>
      </div>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-5xl w-full flex items-center justify-center border border-[rgb(var(--accent-rgb)/0.35)] bg-[#060911] p-2 sm:p-4"
      >
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onStep?.(safeIdx - 1)}
            aria-label="Previous screenshot"
            className="absolute left-3 z-10 w-10 h-10 flex items-center justify-center border border-white/20 bg-black/75 text-white hover:border-accent hover:text-accent cursor-pointer font-mono text-lg"
          >
            &lsaquo;
          </button>
        )}

        <img
          src={images[safeIdx]}
          alt={`${name} fullscreen screenshot ${safeIdx + 1}`}
          className="max-h-[78vh] max-w-full object-contain select-none"
        />

        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onStep?.(safeIdx + 1)}
            aria-label="Next screenshot"
            className="absolute right-3 z-10 w-10 h-10 flex items-center justify-center border border-white/20 bg-black/75 text-white hover:border-accent hover:text-accent cursor-pointer font-mono text-lg"
          >
            &rsaquo;
          </button>
        )}
      </div>
    </div>
  );
}
