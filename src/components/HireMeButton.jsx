import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HireMeButton = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="relative mt-10 w-fit flex flex-col items-start">
      <motion.a
        href="#contact"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative inline-flex items-center px-10 py-3 overflow-hidden group"
        style={{
          background: "rgba(158,255,0,0.03)",
          border: "1px solid rgba(158,255,0,0.3)",
          outline: "none",
          cursor: "pointer",
          textDecoration: "none",
        }}
        whileHover={{
          borderColor: "rgba(158,255,0,1)",
          boxShadow: "0 0 25px rgba(158,255,0,0.4), inset 0 0 10px rgba(158,255,0,0.15)",
        }}
        whileTap={{ scale: 0.96 }}
      >
        {/* Animated Scanning Line */}
        <div className="btn-scanline" />

        {/* Background Hover Effect */}
        <motion.div
          className="absolute inset-0 z-0 bg-[#9eff00]"
          initial={{ x: "-100%" }}
          animate={{ x: isHovered ? "0%" : "-100%" }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          style={{ mixBlendMode: "overlay", opacity: 0.15 }}
        />

        {/* Corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#9eff00] opacity-50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#9eff00] opacity-50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#9eff00] opacity-50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#9eff00] opacity-50" />

        {/* Button Content */}
        <div className="relative z-10 flex items-center gap-3">
          <motion.span
            animate={{
              opacity: isHovered ? [1, 0.4, 1] : 1,
            }}
            transition={{ duration: 0.2, repeat: isHovered ? Infinity : 0 }}
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "14px",
              color: "#9eff00",
            }}
          >
            ❯
          </motion.span>

          <div className="relative flex items-center justify-center">
            <span
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "24px",
                letterSpacing: "3px",
                color: isHovered ? "#ffffff" : "#9eff00",
                textShadow: isHovered ? "0 0 8px rgba(255,255,255,0.6)" : "0 0 10px rgba(158,255,0,0.3)",
                transition: "all 0.3s ease",
                marginTop: "2px", // aligns bebas better with monospace
              }}
              className={isHovered ? "glitch-hover" : ""}
              data-text="HIRE_ME"
            >
              HIRE_ME
            </span>

            {/* Glitch Overlay Text (shown only on hover via CSS/Motion) */}
            <AnimatePresence>
              {isHovered && (
                <>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "24px",
                      letterSpacing: "3px",
                      color: "#e63030",
                      zIndex: 5,
                      mixBlendMode: "screen",
                      animation: "btn-glitch-1 0.3s infinite",
                      marginTop: "2px",
                      left: "-2px", // subtle offset
                    }}
                  >
                    HIRE_ME
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: "24px",
                      letterSpacing: "3px",
                      color: "#9eff00",
                      zIndex: 5,
                      mixBlendMode: "screen",
                      animation: "btn-glitch-1 0.3s infinite reverse",
                      marginTop: "2px",
                      left: "2px", // subtle offset opposite
                    }}
                  >
                    HIRE_ME
                  </motion.span>
                </>
              )}
            </AnimatePresence>
          </div>

          <motion.span
            animate={{
              x: isHovered ? [0, 4, 0] : 0,
            }}
            transition={{ duration: 0.6, repeat: Infinity }}
            style={{
              color: "rgba(158,255,0,0.6)",
              fontSize: "14px",
              fontFamily: "'Share Tech Mono', monospace",
            }}
          >
            _
          </motion.span>
        </div>
      </motion.a>

      {/* Decorative text below button */}
      <div
        className="mt-2 opacity-30 select-none pointer-events-none"
        style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "9px",
          color: "#9eff00",
          letterSpacing: "1px",
          textAlign: "left",
        }}
      >
        [ STATUS: READY_TO_COLLABORATE ]
      </div>
    </div>
  );
};

export default HireMeButton;
