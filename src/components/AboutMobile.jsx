import React from "react";
import { motion } from "framer-motion";
import { styles } from "../styles";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

/* ── Syntax-highlighted JSON bio Mobile Version ── */
const BioTerminalMobile = () => {
  const S = { fontFamily: "'Share Tech Mono', monospace", fontSize: "11px", lineHeight: "1.6" };
  const K = { color: "#c8ffa0" };          
  const V = { color: "#ffe08a" };          
  const N = { color: "#79c0ff" };          
  const C = { color: "rgba(158,255,0,0.4)" }; 

  return (
    <div style={{
      background: "#050f08",
      border: "1px solid rgba(158,255,0,0.25)",
      boxShadow: "0 0 15px rgba(158,255,0,0.06)",
      padding: "0",
      width: "100%",
      position: "relative",
    }}>
      {/* title bar */}
      <div style={{
        background: "rgba(158,255,0,0.07)",
        borderBottom: "1px solid rgba(158,255,0,0.15)",
        padding: "6px 10px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#e63030", display: "inline-block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f0a500", display: "inline-block" }} />
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#9eff00", display: "inline-block" }} />
        <span style={{ ...S, fontSize: "10px", color: "rgba(158,255,0,0.45)", marginLeft: 6 }}>~/portfolio/about.json</span>
      </div>

      {/* code body */}
      <div style={{ padding: "12px 14px", ...S, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        <div><span style={C}>{"{"}</span></div>
        <div style={{ paddingLeft: "12px" }}>
          <span style={K}>"name"</span><span style={C}>: </span><span style={V}>"Abhijeet Kad"</span><span style={C}>,</span>
        </div>
        <div style={{ paddingLeft: "12px" }}>
          <span style={K}>"role"</span><span style={C}>: </span><span style={V}>"Full Stack Developer"</span><span style={C}>,</span>
        </div>
        <div style={{ paddingLeft: "12px" }}>
          <span style={K}>"stack"</span><span style={C}>: [</span>
          <span style={V}>"React"</span><span style={C}>, </span>
          <span style={V}>"Node"</span><span style={C}>, </span>
          <span style={V}>"Three.js"</span>
          <span style={C}>],</span>
        </div>
        <div style={{ paddingLeft: "12px" }}>
          <span style={K}>"certifications"</span><span style={C}>: [</span>
          <span style={{ ...V, color: "#ff7070", fontWeight: 700 }}>"eJPTv2"</span>
          <span style={C}>],</span>
        </div>
        <div style={{ paddingLeft: "12px" }}>
          <span style={K}>"leetcode"</span><span style={C}>: </span>
          <a
            href="https://leetcode.com/u/AbhijitKad/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#f8a100", textDecoration: "none" }}
          >"150+ solved · Blind75"</a><span style={C}>,</span>
        </div>
        <div style={{ paddingLeft: "12px" }}>
          <span style={K}>"contact"</span><span style={C}>: </span><span style={V}>"abhijitkad62@..."</span>
        </div>
        <div><span style={C}>{"}"}</span></div>
      </div>
    </div>
  );
};

/* ── Cyber service card Mobile ── */
const ServiceCardMobile = ({ index, title, icon }) => (
  <motion.div
    variants={fadeIn("up", "spring", index * 0.2, 0.75)}
    style={{ 
      width: "100%", 
      minHeight: "140px", 
      display: "flex", 
      alignItems: "center", 
      gap: "20px", 
      padding: "20px",
      background: "rgba(158,255,0,0.02)",
      border: "1px solid rgba(158,255,0,0.15)",
      borderRadius: "4px"
    }}
  >
    <div style={{
      width: 48, height: 48,
      background: "rgba(158,255,0,0.07)",
      border: "1px solid rgba(158,255,0,0.25)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <img src={icon} alt={title} style={{ width: 24, height: 24, objectFit: "contain" }} />
    </div>
    <h3 style={{
      fontFamily: "'Rajdhani', sans-serif",
      fontWeight: 700,
      fontSize: "14px",
      color: "#fff",
      letterSpacing: "1px",
      textTransform: "uppercase",
      margin: 0
    }}>{title}</h3>
  </motion.div>
);

const AboutMobile = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>// Introduction</p>
        <h2 className={styles.sectionHeadText}>Overview.</h2>
      </motion.div>

      <motion.div variants={fadeIn("", "", 0.1, 1)} className="mt-6">
        <BioTerminalMobile />
      </motion.div>

      <div className='mt-10 flex flex-col gap-4'>
        {services.map((service, index) => (
          <ServiceCardMobile key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(AboutMobile, "about");