import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const LightModePrankMobile = ({ onClose }) => {
  const [phase, setPhase] = useState(0); // 0: spread, 1: message, 2: closing

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([50, 150, 50, 150, 50, 150]); 
    }

    const timer1 = setTimeout(() => {
      setPhase(1); 
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([400, 100, 400, 100, 800, 200, 1000]); 
      }
    }, 2500); // Faster time for mobile to keep them engaged
    
    const timer2 = setTimeout(() => setPhase(2), 6500); 
    const timer3 = setTimeout(() => onClose(), 7000);   
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onClose]);

  return createPortal(
    <>
      <style>
        {`
          @keyframes mobile-infect {
            0% { clip-path: circle(0% at center center); opacity: 0; }
            5% { opacity: 1; }
            100% { clip-path: circle(150% at center center); opacity: 1; }
          }
          @keyframes error-shake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-5px, -5px) rotate(-1deg); }
            20% { transform: translate(5px, 5px) rotate(1deg); }
            30% { transform: translate(-8px, 5px) rotate(-0.5deg); }
            40% { transform: translate(8px, -5px) rotate(0.5deg); }
            50% { transform: translate(-3px, -3px) rotate(0deg); }
            60% { transform: translate(3px, 3px) rotate(0deg); }
          }
        `}
      </style>
      
      {/* Optimized Single Div Spread for Mobile */}
      <div 
        className="fixed inset-0 pointer-events-none select-none z-[9998]"
        style={{ 
          opacity: phase === 2 ? 0 : 1,
          transition: "opacity 0.3s ease-out",
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
          background: "transparent",
          backdropFilter: phase === 0 ? "invert(1) hue-rotate(180deg)" : "none",
          WebkitBackdropFilter: phase === 0 ? "invert(1) hue-rotate(180deg)" : "none",
          animation: phase === 0 ? `mobile-infect 2.5s ease-out forwards` : "none",
          willChange: "clip-path, opacity",
          backgroundColor: phase >= 1 ? "rgba(255, 255, 255, 0.95)" : "transparent", // when phase 1 hits, lock it as bright so the glitch dialog shows nicely
        }}
      />
      {phase >= 1 && (
        <div 
          className="fixed inset-0 pointer-events-none select-none z-[9998]"
          style={{
            backdropFilter: "invert(1) hue-rotate(180deg)",
            WebkitBackdropFilter: "invert(1) hue-rotate(180deg)",
            width: "100vw",
            height: "100vh",
            opacity: phase === 2 ? 0 : 1,
          }}
        />
      )}

      {/* Cyberpunk Glitch Error Message */}
      <AnimatePresence>
        {phase === 1 && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(0,0,0,0.6)] pointer-events-auto"
               style={{ width: "100%", height: "100%", top: 0, left: 0, backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0, skewX: 10, filter: "hue-rotate(90deg)" }}
              animate={{ scale: 1, opacity: 1, skewX: 0, filter: "hue-rotate(0deg)" }}
              exit={{ scale: 1.1, opacity: 0, filter: "contrast(200%) grayscale(100%) blur(5px)" }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#0a0202] border border-red-600 p-6 max-w-sm w-[85%] shadow-[0_0_30px_rgba(220,38,38,0.4)] overflow-hidden"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                animation: "error-shake 0.4s ease-out 1",
              }}
            >
              <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div 
                  animate={{ opacity: [1, 0, 1, 1, 0, 1] }} 
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                  className="mb-3 text-red-500 font-bold text-2xl"
                >
                  ⚠ WARNING
                </motion.div>

                <p className="text-red-400 text-sm mb-2 leading-relaxed">
                  <span className="text-white bg-red-600 px-1 py-0.5 mr-1 animate-pulse font-bold">FATAL:</span>
                  Web Developer hates light mode.
                </p>

                <h2 
                  className="mt-4 text-red-500 font-['Bebas_Neue',sans-serif] text-4xl tracking-[2px] relative"
                  style={{ textShadow: "0 0 10px rgba(220,38,38,0.8)" }}
                >
                  JUST BUZZ OFF
                  <motion.span
                    animate={{ x: [-1, 1, -1, 1, 0], y: [1, -1, 1, -1, 0] }}
                    transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute inset-0 pointer-events-none opacity-50 mix-blend-screen"
                    style={{ color: "#00ffff", left: "1px", top: "1px", zIndex: 1 }}
                  >
                    JUST BUZZ OFF
                  </motion.span>
                </h2>
                
                <div className="mt-6 text-[10px] text-red-800 tracking-widest uppercase opacity-70">
                  [ Reverting to dark mode... ]
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body
  );
};

export default LightModePrankMobile;
