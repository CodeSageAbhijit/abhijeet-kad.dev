import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Contact from "./components/Contact";
import SplineSectionMobile from "./components/SplineSectionMobile";

import HeroMobile from "./components/HeroMobile";
import AboutMobile from "./components/AboutMobile";
import ExperienceMobile from "./components/ExperienceMobile";
import TechMobile from "./components/TechMobile";
import WorksMobile from "./components/WorksMobile";

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

const AppMobile = ({ isBooting }) => {
  return (
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
        <HeroMobile />
      </div>
      
      <AboutMobile />
      <ExperienceMobile />
      
      <ViewportRender minHeight={240} rootMargin="400px">
        {(!isBooting) && <SplineSectionMobile />}
      </ViewportRender>

      {/* Optionally hide Tech if it's too heavy on Mobile or keep it */}
      <TechMobile />
      <WorksMobile />
      
      <div className='relative z-0'>
        <Contact isBooting={isBooting} />
      </div>

      {/* Footer tailored for Mobile */}
      <footer style={{
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid rgba(158,255,0,0.15)",
        background: "#050c0a",
        padding: "24px 16px",
        fontFamily: "'Share Tech Mono', monospace",
        textAlign: "center"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <span style={{ color: "#9eff00", fontSize: 13, letterSpacing: 2 }}>root@abhijeet</span>
            <span style={{
              display: "inline-block", width: 8, height: 16,
              background: "#9eff00", marginLeft: 4,
              animation: "blink 1s step-end infinite",
            }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <a href="https://github.com/CodeSageAbhijit" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none", letterSpacing: 1 }}>// github</a>
            <a href="https://www.linkedin.com/in/abhijit-kad/" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none", letterSpacing: 1 }}>// linkedin</a>
            <a href="mailto:abhijitkad62@gmail.com" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none", letterSpacing: 1 }}>// email</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppMobile;
