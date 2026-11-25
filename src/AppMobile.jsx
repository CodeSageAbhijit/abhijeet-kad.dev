import { SpiritSlot } from "./spirits/SpiritGuestbook";
import Navbar from "./components/Navbar";
import ContactMobile from "./components/ContactMobile";
import PortfolioSearch from "./components/PortfolioSearch";

import HeroMobile from "./components/HeroMobile";
import AboutMobile from "./components/AboutMobile";
import ExperienceMobile from "./components/ExperienceMobile";
import TechMobile from "./components/TechMobile";
import WorksMobile from "./components/WorksMobile";
import { usePortfolioSectionTracking } from "./utils/usePortfolioAnalytics";

const AppMobile = ({ isBooting }) => {
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

      <div className="mobile-intro relative">
        <Navbar />
        <HeroMobile />
        {!isBooting && <SpiritSlot home="hero" />}
      </div>
      
      <PortfolioSearch isBooting={isBooting} />
      {!isBooting && <SpiritSlot home="search" />}
      <AboutMobile />
      {!isBooting && <SpiritSlot home="overview" />}
      <ExperienceMobile />
      
      {/* Optionally hide Tech if it's too heavy on Mobile or keep it */}
      {!isBooting && <SpiritSlot home="work" />}
      <TechMobile />
      {!isBooting && <SpiritSlot home="projects" />}
      <WorksMobile isBooting={isBooting} />
      
      <div className='relative z-0'>
        <ContactMobile isBooting={isBooting} />
      </div>

      {!isBooting && <SpiritSlot home="contact" />}
      {/* Footer tailored for Mobile */}
      <footer style={{
        position: "relative",
        zIndex: 10,
        borderTop: "1px solid rgb(var(--accent-rgb) / 0.15)",
        background: "var(--page)",
        padding: "24px 16px",
        fontFamily: "'Share Tech Mono', monospace",
        textAlign: "center"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
            <span style={{ color: "var(--accent)", fontSize: 13, letterSpacing: 2 }}>root@abhijeet</span>
            <span style={{
              display: "inline-block", width: 8, height: 16,
              background: "var(--accent)", marginLeft: 4,
              animation: "blink 1s step-end infinite",
            }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
            <a href="https://github.com/CodeSageAbhijit" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none", letterSpacing: 1 }}>// github</a>
            <a href="https://www.linkedin.com/in/abhijit-kad/" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none", letterSpacing: 1 }}>// linkedin</a>
            <a href="mailto:abhijitkad62@gmail.com" style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, textDecoration: "none", letterSpacing: 1 }}>// email</a>
          </div>
          <p style={{ fontSize: 10, letterSpacing: 0.8, color: "rgba(255,255,255,0.28)", margin: 0 }}>
            Privacy-friendly analytics enabled (?notrack=1 to opt out)
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AppMobile;
