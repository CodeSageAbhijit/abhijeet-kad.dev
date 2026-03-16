import { useEffect, useRef, useState } from "react";
import Spline from "@splinetool/react-spline";

const SplineSectionDesktop = () => {
  const hovered = useRef(false);
  const [loading, setLoading] = useState(true);
  const typed = useRef(false);

  useEffect(() => {
    const handler = (e) => {
      if (hovered.current && (e.code === "Space" || e.key === " ")) {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler, { passive: false });
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLoad = (splineApp) => {
    setLoading(false);
    if (typed.current) return;

    typed.current = true;
    const canvas = splineApp?.canvas;
    if (!canvas) return;

    const BOOT_TEXT = "$try this minigame for fun!";
    let i = 0;

    setTimeout(() => {
      canvas.focus();
      canvas.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Backspace",
          code: "Backspace",
          bubbles: true,
          cancelable: true,
        })
      );
      canvas.dispatchEvent(
        new KeyboardEvent("keypress", {
          key: "Backspace",
          code: "Backspace",
          bubbles: true,
          cancelable: true,
        })
      );
      canvas.dispatchEvent(
        new KeyboardEvent("keyup", {
          key: "Backspace",
          code: "Backspace",
          bubbles: true,
          cancelable: true,
        })
      );

      const interval = setInterval(() => {
        if (i >= BOOT_TEXT.length) {
          clearInterval(interval);
          return;
        }

        const ch = BOOT_TEXT[i];
        canvas.dispatchEvent(
          new KeyboardEvent("keydown", {
            key: ch,
            code: `Key${ch.toUpperCase()}`,
            bubbles: true,
            cancelable: true,
          })
        );
        canvas.dispatchEvent(
          new KeyboardEvent("keypress", {
            key: ch,
            code: `Key${ch.toUpperCase()}`,
            bubbles: true,
            cancelable: true,
          })
        );
        canvas.dispatchEvent(
          new KeyboardEvent("keyup", {
            key: ch,
            code: `Key${ch.toUpperCase()}`,
            bubbles: true,
            cancelable: true,
          })
        );
        i += 1;
      }, 140);
    }, 800);
  };

  return (
    <div style={{ width: "100%", padding: "60px 0", position: "relative" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <p
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 13,
            color: "rgba(158,255,0,0.55)",
            letterSpacing: 4,
            marginBottom: 6,
          }}
        >
          // interactive demo
        </p>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(32px, 5vw, 56px)",
            color: "#fff",
            letterSpacing: 5,
          }}
        >
          Try The Mini-Game
        </h2>
      </div>

      <div
        style={{
          width: "60%",
          maxWidth: 720,
          height: 480,
          margin: "0 auto",
          position: "relative",
        }}
        onMouseEnter={() => {
          hovered.current = true;
        }}
        onMouseLeave={() => {
          hovered.current = false;
        }}
      >
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              pointerEvents: "none",
            }}
          >
            <span className="canvas-loader" />
            <p
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 12,
                color: "rgba(158,255,0,0.6)",
                letterSpacing: 3,
              }}
            >
              LOADING...
            </p>
          </div>
        )}
        <Spline
          scene="https://prod.spline.design/Mk4Z7Ypk8k-kvji6/scene.splinecode"
          onLoad={handleLoad}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
};

export default SplineSectionDesktop;
