import { SpiritSlot } from "./spirits/SpiritGuestbook";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import About from "./components/About";
import Experience from "./components/Experience";
import Tech from "./components/Tech";
import Works from "./components/Works";
import Contact from "./components/Contact";
import StarsCanvas from "./components/canvas/Stars";
import CanvasBoundary from "./components/canvas/CanvasBoundary";
import PortfolioSearch from "./components/PortfolioSearch";
import { usePortfolioSectionTracking } from "./utils/usePortfolioAnalytics";

const AppPC = ({ isBooting }) => {
  usePortfolioSectionTracking(!isBooting);

  return (
    <div className='relative z-0 bg-primary'>
      {/* Bottom edge glow */}
      <div style={{
        position: "fixed",
        bottom: 0, left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent 10%, var(--accent) 50%, transparent 90%)",
        boxShadow: "0 0 18px var(--accent)",
        zIndex: 50,
        pointerEvents: "none",
      }} />

      <div>
        <Navbar />
        <Hero />
      </div>
      {!isBooting && <SpiritSlot home="hero" />}
      <PortfolioSearch isBooting={isBooting} />
      {!isBooting && <SpiritSlot home="search" />}
      <About />
      {!isBooting && <SpiritSlot home="overview" />}
      <Experience />
      
      {!isBooting && <SpiritSlot home="work" />}
      <Tech isBooting={isBooting} />
      {!isBooting && <SpiritSlot home="projects" />}
      <Works isBooting={isBooting} />
      
      <div className='relative z-0'>
        <Contact isBooting={isBooting} />
        {!isBooting && <CanvasBoundary><StarsCanvas /></CanvasBoundary>}
      </div>

      {!isBooting && <SpiritSlot home="contact" />}
      {/* Footer */}
      <footer style={{
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid rgb(var(--accent-rgb) / 0.15)",
        background: "var(--page)",
        padding: "32px 48px",
        fontFamily: "'Share Tech Mono', monospace",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "var(--accent)", fontSize: 13, letterSpacing: 2 }}>root@abhijeet</span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>~/portfolio</span>
              <span style={{
                display: "inline-block", width: 8, height: 16,
                background: "var(--accent)", marginLeft: 4,
                animation: "blink 1s step-end infinite",
              }} />
            </div>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <a href="https://github.com/CodeSageAbhijit" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>// github</a>
              <a href="https://www.linkedin.com/in/abhijit-kad/" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>// linkedin</a>
              <a href="mailto:abhijitkad62@gmail.com" style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, textDecoration: "none", letterSpacing: 1, transition: "color 0.2s" }} onMouseEnter={e => e.target.style.color = "var(--accent)"} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>// email</a>
            </div>
          </div>
          <div style={{ fontSize: 10, letterSpacing: 1, color: "rgba(255,255,255,0.24)", textAlign: "right" }}>
            Privacy-friendly analytics enabled (?notrack=1 to opt out)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppPC;
