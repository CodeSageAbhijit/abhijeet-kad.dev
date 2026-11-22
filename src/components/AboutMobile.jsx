import React from "react";
import { motion } from "framer-motion";
import TerminalTitleBar from "./TerminalTitleBar";
import { styles } from "../styles";
import { designFocus, services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

/* ── Syntax-highlighted JSON bio Mobile Version ── */
const BioTerminalMobile = () => {
  const S = { fontSize: "11px", lineHeight: "1.6" };
  const K = { color: "var(--accent-soft)" };
  const V = { color: "#ffe08a" };          
  const N = { color: "#79c0ff" };          
  const C = { color: "#a0a0a0" };

  return (
    <div className="term-window">
      <TerminalTitleBar title="~/portfolio/about.json" />

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
          <span style={K}>"design_focus"</span><span style={C}>: [</span>
          <span style={V}>{designFocus.map((area) => JSON.stringify(area)).join(", ")}</span>
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
      background: "rgb(var(--accent-rgb) / 0.02)",
      border: "1px solid rgb(var(--accent-rgb) / 0.15)",
      borderRadius: "4px"
    }}
  >
    <div style={{
      width: 48, height: 48,
      background: "rgb(var(--accent-rgb) / 0.07)",
      border: "1px solid rgb(var(--accent-rgb) / 0.25)",
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

export default SectionWrapper(AboutMobile, "about", "portfolio");
