import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const bootLogs = [
  { text: "INITIALIZING PORTFOLIO KERNEL...", hex: "0x00A1" },
  { text: "ALLOCATING VRAM FOR WEBGL CONTEXT...", hex: "0x02B4" },
  { text: "LOADING SECURE REACT MODULES: [OK]", hex: "0x03C9" },
  { text: "ESTABLISHING HOST CONNECTIONS: [SUCCESS]", hex: "0x04D2" },
  { text: "FETCHING GITHUB REPOSITORIES...", hex: "0x05E5" },
  { text: "COMPILING 3D ASSETS: THREE.JS ONLINE", hex: "0x06F1" },
  { text: "DECRYPTING DEVELOPER PROFILE...", hex: "0x08A8" },
  { text: "BYPASSING NORMALIZATION ALGORITHMS...", hex: "0x09B3" },
  { text: "CYBERPUNK THEME OVERRIDE: [ACTIVE]", hex: "0x0AC7" },
  { text: "PORTFOLIO SYSTEM: ONLINE", hex: "0x0BD9" },
  { text: "LAUNCH SEQUENCE: COMPLETE.", hex: "0x0CFF" }
];

// Random string generator for hacker decode effect
const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
const generateRandomString = (length) => {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Component for text that scrambles before revealing its true content
const ScrambleText = ({ text }) => {
  const [display, setDisplay] = useState(generateRandomString(text.length));
  const [isDecoding, setIsDecoding] = useState(true);

  useEffect(() => {
    let iterations = 0;
    const interval = text.length > 15 ? 30 : 50; 
    
    const maxIterations = 15;

    const timer = setInterval(() => {
      setDisplay((prev) =>
        prev
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iterations >= text.length) {
        clearInterval(timer);
        setIsDecoding(false);
      }

      iterations += 1 / 2; // Decodes half a letter per tick (slower reveal)
    }, interval);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className={isDecoding ? "text-white" : ""}>
      {display}
    </span>
  );
};

const BootSequence = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [phase, setPhase] = useState("booting"); // booting, glitch, finish
  const [progress, setProgress] = useState(0);

  // Log and Progress Phase
  useEffect(() => {
    if (phase !== "booting") return;
    
    let timeoutIds = [];
    let currentLog = 0;

    const printLog = () => {
      if (currentLog < bootLogs.length) {
        setLogs(prev => [...prev, bootLogs[currentLog]]);
        setProgress(Math.floor(((currentLog + 1) / bootLogs.length) * 100));
        currentLog++;
        
        const delay = Math.random() * 200 + 100;
        timeoutIds.push(setTimeout(printLog, delay));
      } else {
        setPhase("glitch");
      }
    };

    timeoutIds.push(setTimeout(printLog, 200)); 

    return () => {
      timeoutIds.forEach(clearTimeout);
    };
  }, [phase]);

  // Glitch to Finish Phase
  useEffect(() => {
    if (phase === "glitch") {
      const finishTimer = setTimeout(() => {
        setPhase("finish");
      }, 500); // Super quick glitch before clearing out

      return () => {
        clearTimeout(finishTimer);
      };
    }
  }, [phase, onComplete]);

  useEffect(() => {
    if (phase !== "finish") return;

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 0);

    return () => clearTimeout(completeTimer);
  }, [phase, onComplete]);

  // Generate ASCII progress bar
  const renderProgressBar = () => {
    const totalBars = 30;
    const filledBars = Math.floor((progress / 100) * totalBars);
    const emptyBars = totalBars - filledBars;
    return `[${"█".repeat(filledBars)}${"░".repeat(emptyBars)}] ${progress}%`;
  };

  return (
    <AnimatePresence>
      {phase !== "finish" && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "circIn" } }}
          className="fixed inset-0 z-[10000] bg-[#0a0004] flex flex-col justify-end p-8 sm:p-16 overflow-hidden pointer-events-auto"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          {/* CRT Scanline Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
              backgroundSize: "100% 2px, 3px 100%",
              zIndex: 10
            }}
          />

          {/* Terminal Logs (Will Glitch Out) */}
          <motion.div 
            className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-start justify-end h-full text-[#ff003c]"
            animate={phase === "glitch" ? { 
              x: [-10, 10, -5, 10, 0],
              y: [5, -5, 10, -10, 0],
              opacity: [1, 0.5, 1, 0.2, 0],
              filter: ["blur(0px) contrast(1)", "blur(4px) contrast(3) invert(0.5)", "blur(0px)", "blur(8px) contrast(4)", "blur(10px)"],
              scale: [1, 1.05, 0.95, 1.1, 1.2]
            } : {}}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            
            <div className="w-full flex-1 flex flex-col items-center justify-center mt-10">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ duration: 1 }}
                 className="text-[#ff003c] text-opacity-80 text-xl sm:text-3xl md:text-5xl text-center mb-8 font-bold tracking-[0.2em]"
                 style={{ 
                   fontFamily: "'Share Tech Mono', monospace",
                   textShadow: "0 0 15px rgba(255,0,60,0.8)"
                 }}
               >
                <ScrambleText text="[ ABHIJEET KAD ]" /><br/>
                <span className="text-sm sm:text-xl md:text-2xl mt-4 block text-white opacity-70 tracking-[0.5em] font-normal" style={{ textShadow: "0 0 10px rgba(255,255,255,0.6)" }}>
                  <ScrambleText text="SYS.INIT" />
                </span>
               </motion.div>
                 
                 {/* ASCII Progress Bar */}
                 <div className="w-full max-w-2xl mt-4 opacity-90 text-sm md:text-base font-bold whitespace-pre-wrap text-center" style={{ textShadow: "0 0 8px rgba(255,0,60,0.8)" }}>
                   {renderProgressBar()}
                 </div>
              </div>
            
            {/* Booting Logs Footer */}
            <div className="w-full mt-auto mb-10 h-64 overflow-y-auto flex flex-col justify-end space-y-2 pb-4">
              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-xs sm:text-sm md:text-base leading-none flex items-start"
                  style={{ textShadow: "0 0 5px rgba(255,0,60,0.7)" }}
                >
                  <span className="text-gray-500 mr-2 opacity-70">[{log.hex}]</span>
                  <span className="text-gray-500 mr-4">[{new Date().toISOString().substring(11, 23)}]</span>
                  
                  <span className="flex-1">
                    {log.text.includes("[OK]") || log.text.includes("[SUCCESS]") || log.text.includes("ONLINE") || log.text.includes("COMPLETE") || log.text.includes("[ACTIVE]") ? (
                      <span dangerouslySetInnerHTML={{ 
                        __html: log.text.replace(/(\[OK\]|\[SUCCESS\]|ONLINE|COMPLETE|\[ACTIVE\])/, '<span class="text-white font-bold" style="text-shadow: 0 0 10px rgba(255,255,255,0.8)">$1</span>') 
                      }} />
                    ) : (
                      <ScrambleText text={log.text} />
                    )}
                  </span>
                </motion.div>
              ))}
              
              {/* Current typing block cursor */}
              <div className="animate-pulse text-xs sm:text-sm md:text-base mt-2 inline-block">
                <span className="text-gray-500 mr-2 opacity-70">[      ]</span>
                <span className="text-gray-500 mr-4">[{new Date().toISOString().substring(11, 23)}]</span>
                <span className="text-[#ff003c] opacity-80" style={{ fontSize: "16px", textShadow: "0 0 10px rgba(255,0,60,0.8)" }}>█</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BootSequence;