import { BrowserRouter } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import Spline from "@splinetool/react-spline";

import { About, Contact, Experience, Hero, Navbar, Tech, Works, StarsCanvas } from "./components";

const SplineSection = () => {
  const hovered = useRef(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handler = (e) => {
      if (hovered.current && (e.code === "Space" || e.key === " ")) e.preventDefault();
    };
    window.addEventListener("keydown", handler, { passive: false });
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLoad = (splineApp) => {
    setLoading(false);
    const canvas = splineApp?.canvas;
    if (!canvas) return;
    const BOOT_TEXT = "Try this minigame for fun!";
    let i = 0;
    setTimeout(() => {
      const interval = setInterval(() => {
        if (i >= BOOT_TEXT.length) { clearInterval(interval); return; }
        const ch = BOOT_TEXT[i];
        canvas.dispatchEvent(new KeyboardEvent("keydown", { key: ch, code: `Key${ch.toUpperCase()}`, bubbles: true, cancelable: true }));
        canvas.dispatchEvent(new KeyboardEvent("keypress", { key: ch, code: `Key${ch.toUpperCase()}`, bubbles: true, cancelable: true }));
        canvas.dispatchEvent(new KeyboardEvent("keyup", { key: ch, code: `Key${ch.toUpperCase()}`, bubbles: true, cancelable: true }));
        i++;
      }, 140);
    }, 800);
  };

  return (
    <div style={{ width: "100%", padding: "60px 0", position: "relative" }}>
      {/* Section heading */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
        <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 13, color: "rgba(158,255,0,0.55)", letterSpacing: 4, marginBottom: 6 }}>
          // interactive demo
        </p>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(32px, 5vw, 56px)", color: "#fff", letterSpacing: 5 }}>
          Try The Mini-Game
        </h2>
      </div>

      {/* Spline model — contained size, centred */}
      <div
        style={{ width: "60%", maxWidth: 720, height: 480, margin: "0 auto", position: "relative" }}
        onMouseEnter={() => { hovered.current = true; }}
        onMouseLeave={() => { hovered.current = false; }}
      >
        {loading && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 2,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 12, pointerEvents: "none",
          }}>
            <span className="canvas-loader" />
            <p style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: 12, color: "rgba(158,255,0,0.6)", letterSpacing: 3 }}>LOADING...</p>
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

const App = () => {
  return (
    <BrowserRouter>
      <div className='relative z-0 bg-primary'>
        {/* Global cyber grid */}
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(158,255,0,0.025) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(158,255,0,0.025) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          pointerEvents: "none",
          zIndex: 0,
        }} />

        {/* Global scanlines overlay */}
        <div className="scanlines" />

        {/* Bottom edge glow */}
        <div style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(90deg, transparent 10%, #9eff00 50%, transparent 90%)",
          boxShadow: "0 0 18px #9eff00",
          zIndex: 50,
          pointerEvents: "none",
        }} />

        <div>
          <Navbar />
          <Hero />
        </div>
        <About />
        <Experience />

        {/* Spline interactive PC — between experience and tech stack */}
        <SplineSection />

        <Tech />
        <Works />
        <div className='relative z-0'>
          <Contact />
          <StarsCanvas />
        </div>

        {/* Footer */}
        <footer style={{
          position: "relative",
          zIndex: 10,
          borderTop: "1px solid rgba(158,255,0,0.15)",
          background: "#050c0a",
          padding: "32px 48px",
          fontFamily: "'Share Tech Mono', monospace",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              {/* Brand */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: "#9eff00", fontSize: 13, letterSpacing: 2 }}>root@abhijeet</span>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>~/portfolio</span>
                <span style={{
                  display: "inline-block", width: 8, height: 16,
                  background: "#9eff00", marginLeft: 4,
                  animation: "blink 1s step-end infinite",
                }} />
              </div>

              {/* Social Links */}
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                <a
                  href="https://github.com/CodeSageAbhijit"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#9eff00"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                >
                  // github
                </a>
                <a
                  href="https://www.linkedin.com/in/abhijit-kad/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#9eff00"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                >
                  // linkedin
                </a>
                <a
                  href="mailto:abhijitkad62@gmail.com"
                  style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "#9eff00"}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}
                >
                  // email
                </a>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(158,255,0,0.08)" }} />

            {/* Bottom row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, letterSpacing: 1 }}>
                © 2026 Abhijeet Kad — eJPTv2 Certified Penetration Tester
              </span>
              <span style={{ color: "rgba(158,255,0,0.35)", fontSize: 11, letterSpacing: 2 }}>
                [ SYSTEM ONLINE ]
              </span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
