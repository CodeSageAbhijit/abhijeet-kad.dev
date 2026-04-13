import { BrowserRouter } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Tech from "./components/Tech";
import Works from "./components/Works";
import Contact from "./components/Contact";
import StarsCanvas from "./components/canvas/Stars";
import SplineSectionDesktop from "./components/SplineSectionDesktop";
import SplineSectionMobile from "./components/SplineSectionMobile";
import useIsMobile from "./hooks/useIsMobile";

const ViewportRender = ({ children, minHeight = 0, rootMargin = "300px" }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.01 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return <div ref={ref} style={{ minHeight }}>{visible ? children : null}</div>;
};

const App = () => {
  const isMobile = useIsMobile();

  return (
    <BrowserRouter>
      <div className='relative z-0 bg-primary'>


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

        {/* Defer heavy Spline scene until it's near viewport */}
        <ViewportRender minHeight={isMobile ? 240 : 560} rootMargin="400px">
          {isMobile ? <SplineSectionMobile /> : <SplineSectionDesktop />}
        </ViewportRender>

        <Tech />
        <Works />
        <div className='relative z-0'>
          <Contact />
          {!isMobile && <StarsCanvas />}
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
