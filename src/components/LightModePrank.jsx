import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useIsMobile from "../hooks/useIsMobile";
import "./LightModePrank.css";

const rows = 30;
const columns = 50;
const growTime = 150;

function infectionGrid() {
  return Array.from({ length: rows }, (_, row) => Array.from({ length: columns }, (_, column) => {
    const x = (column - columns / 2) / (columns / 2);
    const y = (row - rows / 2) / (rows / 2);
    const angle = Math.atan2(y, x);
    const boundary = 1.2 + Math.sin(angle * 3) * 0.15 + Math.cos(angle * 7) * 0.1;
    const distance = Math.hypot(x, y);
    return distance < boundary + Math.random() * 0.3
      ? distance * (1800 + Math.random() * 600) : Infinity;
  }));
}

// Combine finished cells into horizontal runs so the effect clips one filtered surface.
function revealPixels(surface) {
  const grid = infectionGrid();
  const duration = Math.max(...grid.flat().filter(Number.isFinite)) + growTime;
  const start = performance.now();
  let width;
  let height;
  let frame;

  function paint(elapsed) {
    const paths = [];
    function rectangle(x, y, w, h) {
      paths.push(`M${(x * width).toFixed(1)} ${(y * height).toFixed(1)}h${(w * width + 0.12).toFixed(1)}v${(h * height + 0.12).toFixed(1)}h-${(w * width + 0.12).toFixed(1)}Z`);
    }

    grid.forEach((line, row) => {
      let run = -1;
      for (let column = 0; column <= columns; column++) {
        const age = elapsed - (line[column] ?? Infinity);
        if (age >= growTime) {
          if (run < 0) run = column;
          continue;
        }
        if (run >= 0) {
          rectangle(run, row, column - run, 1);
          run = -1;
        }
        if (age >= 0) {
          const size = 0.5 + 0.5 * (1 - (1 - age / growTime) ** 3);
          const inset = (1 - size) / 2;
          rectangle(column + inset, row + inset, size, size);
        }
      }
    });
    surface.style.clipPath = `path("${paths.join("")}")`;
  }

  function draw(now) {
    const elapsed = Math.min(duration, now - start);
    paint(elapsed);
    if (elapsed < duration) frame = requestAnimationFrame(draw);
  }

  function resize() {
    width = surface.clientWidth / columns;
    height = surface.clientHeight / rows;
    paint(performance.now() - start);
  }

  resize();
  frame = requestAnimationFrame(draw);
  window.addEventListener("resize", resize);
  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", resize);
  };
}

export default function LightModePrank({ onClose }) {
  const isMobile = useIsMobile();
  const surface = useRef(null);
  const [phase, setPhase] = useState("spread");

  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stopPixels = !isMobile && !reduced ? revealPixels(surface.current) : undefined;
    if (!reduced) navigator.vibrate?.(isMobile ? [50, 150, 50, 150, 50, 150] : [50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50]);

    const reveal = setTimeout(() => {
      setPhase("warning");
      if (!reduced) navigator.vibrate?.([400, 100, 400, 100, 800, 200, 1000]);
    }, reduced ? 150 : isMobile ? 2500 : 4200);
    const fade = setTimeout(() => setPhase("closing"), reduced ? 3250 : isMobile ? 6500 : 8500);
    const close = setTimeout(onClose, reduced ? 3500 : isMobile ? 7000 : 9000);

    return () => {
      stopPixels?.();
      clearTimeout(reveal);
      clearTimeout(fade);
      clearTimeout(close);
      if (!reduced) navigator.vibrate?.(0);
    };
  }, [isMobile, onClose]);

  return createPortal(
    <div className={`light-prank light-prank--${phase}${isMobile ? " light-prank--mobile" : ""}`}>
      <div className="light-prank__surface" ref={surface} aria-hidden="true" />
      {phase !== "spread" && (
        <div className="light-prank__veil">
          <div className="light-prank__warning" role="alert">
            <strong className="light-prank__heading">⚠ WARNING</strong>
            <p><b>{isMobile ? "FATAL:" : "FATAL_ERR:"}</b> {isMobile ? "Web" : "Website"} Developer hates light mode.</p>
            <h2>JUST BUZZ OFF<span aria-hidden="true">JUST BUZZ OFF</span></h2>
            <small>[ {isMobile ? "Reverting" : "System reverting"} to dark mode... ]</small>
          </div>
        </div>
      )}
    </div>, document.body,
  );
}
