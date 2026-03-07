import React, { useState, useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";

// Text to auto-type on the vintage PC screen when the scene first loads
const BOOT_TEXT = "Try this minigame for fun!";

const ComputersCanvas = () => {
  const [loading, setLoading] = useState(true);
  const hovered = useRef(false);

  // Prevent spacebar from scrolling the page while user types into the Spline scene
  useEffect(() => {
    const preventScroll = (e) => {
      if (hovered.current && (e.code === "Space" || e.key === " ")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", preventScroll, { passive: false });
    return () => window.removeEventListener("keydown", preventScroll);
  }, []);

  const handleLoad = (splineApp) => {
    setLoading(false);

    // Auto-type BOOT_TEXT onto the Spline canvas after a short delay
    const canvas = splineApp?.canvas;
    if (!canvas) return;

    let i = 0;
    const delay = 800; // ms before typing starts
    const speed = 140; // ms per character

    setTimeout(() => {
      const interval = setInterval(() => {
        if (i >= BOOT_TEXT.length) {
          clearInterval(interval);
          return;
        }
        const ch = BOOT_TEXT[i];
        canvas.dispatchEvent(new KeyboardEvent("keydown", { key: ch, code: `Key${ch.toUpperCase()}`, bubbles: true, cancelable: true }));
        canvas.dispatchEvent(new KeyboardEvent("keypress", { key: ch, code: `Key${ch.toUpperCase()}`, bubbles: true, cancelable: true }));
        canvas.dispatchEvent(new KeyboardEvent("keyup",   { key: ch, code: `Key${ch.toUpperCase()}`, bubbles: true, cancelable: true }));
        i++;
      }, speed);
    }, delay);
  };

  return (
    <div
      style={{ width: "100%", height: "100%", position: "relative" }}
      onMouseEnter={() => { hovered.current = true; }}
      onMouseLeave={() => { hovered.current = false; }}
    >
      {loading && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 2,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 12, pointerEvents: "none",
        }}>
          <span className="canvas-loader" />
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 12, color: "rgba(158,255,0,0.6)", letterSpacing: 3,
          }}>LOADING...</p>
        </div>
      )}
      <Spline
        scene="https://prod.spline.design/Mk4Z7Ypk8k-kvji6/scene.splinecode"
        onLoad={handleLoad}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};

export default ComputersCanvas;
