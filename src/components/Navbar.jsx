import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { styles } from "../styles";
import { navLinks } from "../constants";
import { menu, close } from "../assets";
import LightModePrank from "./LightModePrank";

const NAV_STYLE = {
  fontFamily: "'Share Tech Mono', monospace",
  fontSize: "12px",
  letterSpacing: "2px",
  textTransform: "uppercase",
};

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [prankActive, setPrankActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${styles.paddingX} w-full flex items-center py-4 fixed top-0 z-20`}
      style={{
        background: scrolled
          ? "rgb(var(--page-rgb) / 0.92)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgb(var(--accent-rgb) / 0.2)"
          : "none",
        transition: "background 0.3s, border 0.3s",
      }}
    >
      {/* top scanline accent */}
      {scrolled && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent 5%, var(--accent) 50%, transparent 95%)",
          boxShadow: "0 0 8px var(--accent)",
        }} />
      )}

      <div className='w-full flex justify-between items-center max-w-7xl mx-auto'>
        {/* Logo / Brand */}
        <Link
          to='/'
          className='flex items-center gap-3'
          onClick={() => { setActive(""); window.scrollTo(0, 0); }}
        >
          {/* Terminal prompt icon */}
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "20px",
            color: "var(--accent)",
            textShadow: "0 0 10px var(--accent)",
            letterSpacing: "0",
            userSelect: "none",
          }}>{"root@"}</span>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "20px",
            color: "#ffffff",
            letterSpacing: "3px",
          }}>ABHIJEET KAD</span>
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "11px",
            color: "rgb(var(--accent-rgb) / 0.5)",
            letterSpacing: "2px",
            display: "none",
          }} className="sm:inline-block">:~$</span>
        </Link>

        {/* Desktop Nav */}
        <ul className='list-none hidden md:flex flex-row gap-4 lg:gap-8 items-center'>
          {navLinks.map((nav) => (
            <li
              key={nav.id}
              onClick={() => setActive(nav.title)}
              style={{ position: "relative", cursor: "pointer" }}
            >
              <a
                href={`#${nav.id}`}
                style={{
                  ...NAV_STYLE,
                  color: active === nav.title ? "var(--accent)" : "rgb(var(--accent-rgb) / 0.7)",
                  textShadow: active === nav.title ? "0 0 8px var(--accent)" : "none",
                  transition: "color 0.2s, text-shadow 0.2s",
                  paddingBottom: "4px",
                }}
                onMouseEnter={e => { e.target.style.color = "var(--accent)"; e.target.style.textShadow = "0 0 8px var(--accent)"; }}
                onMouseLeave={e => {
                  if (active !== nav.title) {
                    e.target.style.color = "rgb(var(--accent-rgb) / 0.7)";
                    e.target.style.textShadow = "none";
                  }
                }}
              >
                <span style={{ color: "rgb(var(--accent-rgb) / 0.45)", marginRight: "3px" }}>#</span>
                {nav.title}
              </a>
              {active === nav.title && (
                <div style={{
                  position: "absolute", bottom: -4, left: 0, right: 0, height: 1,
                  background: "var(--accent)",
                  boxShadow: "0 0 6px var(--accent)",
                }} />
              )}
            </li>
          ))}
          {/* Status dot */}
          <li style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span className="status-dot" />
            <span style={{ ...NAV_STYLE, fontSize: "10px", color: "rgb(var(--accent-rgb) / 0.5)" }}>
              ONLINE
            </span>
          </li>
          
          {/* Light Mode Prank Toggle */}
          <li>
             <button
                onClick={() => setPrankActive(true)}
                title="Toggle Light Mode"
                style={{
                  background: "transparent", border: "1px solid rgba(255, 235, 59, 0.4)", width: "32px", height: "32px", 
                  borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                  color: "#ffeb3b", transition: "all 0.3s ease",
                  boxShadow: "0 0 10px rgba(255, 235, 59, 0.1) inset"
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 15px rgba(255, 235, 59, 0.4) inset, 0 0 15px rgba(255, 235, 59, 0.4)"; e.currentTarget.style.borderColor = "#ffeb3b" }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 10px rgba(255, 235, 59, 0.1) inset"; e.currentTarget.style.borderColor = "rgba(255, 235, 59, 0.4)" }}
             >
                ☼
             </button>
          </li>
        </ul>

        {/* Mobile hamburger & Prank (Right side) */}
        <div className='flex md:hidden flex-1 justify-end items-center gap-4'>
          {/* Light Mode Prank Toggle for Mobile */}
          <button
            onClick={() => setPrankActive(true)}
            title="Toggle Light Mode"
            style={{
              background: "transparent", border: "1px solid rgba(255, 235, 59, 0.4)", width: "32px", height: "32px", 
              borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              color: "#ffeb3b", transition: "all 0.3s ease",
              boxShadow: "0 0 10px rgba(255, 235, 59, 0.1) inset"
            }}
          >
            ☼
          </button>

          <button
            onClick={() => setToggle(!toggle)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <img src={toggle ? close : menu} alt='menu' className='w-[28px] h-[28px] object-contain'
              style={{ filter: "brightness(0) invert(1)" }} />
          </button>

          {toggle && (
            <div style={{
              position: "absolute", top: "64px", right: "16px",
              background: "rgb(var(--page-rgb) / 0.97)",
              border: "1px solid rgb(var(--accent-rgb) / 0.3)",
              boxShadow: "0 0 20px rgb(var(--accent-rgb) / 0.15)",
              padding: "20px 28px",
              minWidth: "180px",
              zIndex: 10,
            }}>
              {/* top accent */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "var(--accent)", boxShadow: "0 0 6px var(--accent)" }} />
              <ul className='list-none flex flex-col gap-5'>
                {navLinks.map((nav) => (
                  <li
                    key={nav.id}
                    onClick={() => { setToggle(false); setActive(nav.title); }}
                  >
                    <a
                      href={`#${nav.id}`}
                      style={{
                        ...NAV_STYLE,
                        color: active === nav.title ? "var(--accent)" : "rgb(var(--accent-rgb) / 0.8)",
                        textShadow: active === nav.title ? "0 0 8px var(--accent)" : "none",
                      }}
                    >
                      <span style={{ color: "rgb(var(--accent-rgb) / 0.4)", marginRight: "4px" }}>#</span>
                      {nav.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {prankActive && <LightModePrank onClose={() => setPrankActive(false)} />}
    </nav>
  );
};

export default Navbar;

