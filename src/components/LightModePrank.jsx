import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const LightModePrank = ({ onClose }) => {
  const [phase, setPhase] = useState(0); // 0: spread, 1: message, 2: closing
  
  // Grid size - optimized for smoother 60fps rendering to prevent click lag
  const rows = 30;
  const cols = 50;

  useEffect(() => {
    // Start initial low-level vibration as it spreads
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50, 150, 50]); 
    }

    // Timings for the prank sequence
    const timer1 = setTimeout(() => {
      setPhase(1); // Stop spreading & show message
      // Add strong haptic feedback (intense vibration pattern)
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([400, 100, 400, 100, 800, 200, 1000]); 
      }
    }, 4200); // Wait till edge
    const timer2 = setTimeout(() => setPhase(2), 8500); // Start glitch out / close
    const timer3 = setTimeout(() => onClose(), 9000);   // Fully close and remove
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onClose]);

  // Calculate the spread logic to cover almost the entire screen perfectly
  const boxes = [];
  const cx = cols / 2;
  const cy = rows / 2;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Normalized coordinates from center (-1 to 1)
      const dx = (c - cx) / cx;
      const dy = (r - cy) / cy;
      
      const angle = Math.atan2(dy, dx);
      // Base radius of 1.2 covers edges but leaves a tiny vignette near the furthest corners
      const blobShape = 1.2 + Math.sin(angle * 3) * 0.15 + Math.cos(angle * 7) * 0.1;
      
      const d = Math.sqrt(dx * dx + dy * dy);
      const randomNoise = Math.random() * 0.3;
      
      // Almost everywhere but heavily fractured edges
      if (d < blobShape + randomNoise) {
         // Fix: At the direct center (d=0), the delay will now be exactly 0, 
         // meaning it triggers instantly upon clicking instead of waiting on random noise
         const delay = (d * 1.8) + (Math.random() * 0.6 * d);
         boxes.push({ id: `${r}-${c}`, r, c, delay }); 
      }
    }
  }

  return createPortal(
    <>
      <style>
        {`
          @keyframes nanite-infect {
            0% { opacity: 0; transform: scale(0.5); }
            100% { opacity: 1; transform: scale(1); }
          }
          @keyframes error-shake {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            10% { transform: translate(-10px, -10px) rotate(-2deg); }
            20% { transform: translate(10px, 10px) rotate(2deg); }
            30% { transform: translate(-15px, 10px) rotate(-1deg); }
            40% { transform: translate(15px, -10px) rotate(1deg); }
            50% { transform: translate(-5px, -5px) rotate(0deg); }
            60% { transform: translate(5px, 5px) rotate(0deg); }
          }
        `}
      </style>
      {/* Container for the spreading "Light Mode" pixels */}
      <div 
        className="fixed inset-0 pointer-events-none select-none z-[9998]"
        style={{ 
          display: "grid", 
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          opacity: phase === 2 ? 0 : 1,
          transition: "opacity 0.3s ease-out",
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0
        }}
      >
        {boxes.map((box) => (
          <div
            key={box.id}
            style={{
              gridRow: box.r + 1,
              gridColumn: box.c + 1,
              opacity: 0,
              animation: `nanite-infect 0.15s forwards ${box.delay}s`,
              backdropFilter: "invert(1) hue-rotate(180deg)",
              WebkitBackdropFilter: "invert(1) hue-rotate(180deg)",
              willChange: "transform, opacity"
            }}
          />
        ))}
      </div>

      {/* Cyberpunk Glitch Error Message */}
      <AnimatePresence>
        {phase === 1 && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-[rgba(0,0,0,0.6)] pointer-events-auto"
               style={{ width: "100%", height: "100%", top: 0, left: 0, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0, skewX: 10, filter: "hue-rotate(90deg)" }}
              animate={{ scale: 1, opacity: 1, skewX: 0, filter: "hue-rotate(0deg)" }}
              exit={{ scale: 1.1, opacity: 0, filter: "contrast(200%) grayscale(100%) blur(5px)" }}
              transition={{ duration: 0.2 }}
              className="relative bg-[#0a0202] border-2 border-red-600 p-8 max-w-lg w-[90%] shadow-[0_0_50px_rgba(220,38,38,0.4)] overflow-hidden"
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                animation: "error-shake 0.4s ease-out 1",
              }}
            >
              {/* CRT Scanline Overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                  backgroundSize: "100% 2px, 3px 100%",
                }}
              />

              <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div 
                  animate={{ opacity: [1, 0, 1, 1, 0, 1] }} 
                  transition={{ duration: 1.5, repeat: Infinity, repeatType: "mirror" }}
                  className="mb-4 text-red-500 font-bold text-4xl"
                >
                  ⚠ WARNING
                </motion.div>

                <p className="text-red-400 text-lg mb-2 leading-relaxed">
                  <span className="text-white bg-red-600 px-2 py-0.5 mr-2 animate-pulse font-bold">FATAL_ERR:</span>
                  Website Developer hates light mode.
                </p>

                <h2 
                  className="mt-6 text-red-500 font-['Bebas_Neue',sans-serif] text-5xl tracking-[4px] relative"
                  style={{ textShadow: "0 0 10px rgba(220,38,38,0.8)" }}
                >
                  JUST BUZZ OFF
                  <motion.span
                    animate={{ x: [-2, 2, -2, 2, 0], y: [1, -1, 1, -1, 0] }}
                    transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
                    className="absolute inset-0 pointer-events-none opacity-50 mix-blend-screen"
                    style={{ color: "#00ffff", left: "2px", top: "2px", zIndex: 1 }}
                  >
                    JUST BUZZ OFF
                  </motion.span>
                </h2>
                
                <div className="mt-8 text-xs text-red-800 tracking-widest uppercase opacity-70">
                  [ System reverting to dark mode... ]
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

export default LightModePrank;