import React from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import TerminalTitleBar from "./TerminalTitleBar";

import { styles } from "../styles";
import { designFocus, services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

/* ── Syntax-highlighted JSON bio ── */
const BioTerminal = () => {
  const S = { fontSize: "13px", lineHeight: "1.9" };
  const K = { color: "var(--accent-soft)" };          // key
  const V = { color: "#ffe08a" };          // string value
  const N = { color: "#79c0ff" };          // number / bool
  const C = { color: "#a0a0a0" }; // comment / punctuation

  return (
    <div className="term-window" style={{ maxWidth: 680 }}>
      <TerminalTitleBar title="~/portfolio/about.json" />

      {/* code body */}
      <div style={{ padding: "18px 24px", ...S }}>
        <div><span style={C}>{"{"}</span></div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"name"</span><span style={C}>: </span><span style={V}>"Abhijeet Kad"</span><span style={C}>,</span>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"role"</span><span style={C}>: </span><span style={V}>"Full Stack Developer"</span><span style={C}>,</span>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"stack"</span><span style={C}>: [</span>
          <span style={V}>"React"</span><span style={C}>, </span>
          <span style={V}>"Node.js"</span><span style={C}>, </span>
          <span style={V}>"MongoDB"</span><span style={C}>, </span>
          <span style={V}>"Three.js"</span>
          <span style={C}>],</span>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"design_focus"</span><span style={C}>: [</span>
          <span style={V}>{designFocus.map((area) => JSON.stringify(area)).join(", ")}</span>
          <span style={C}>],</span>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"philosophy"</span><span style={C}>: </span>
          <span style={V}>"Define interfaces and document trade-offs"</span>
          <span style={C}>,</span>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"available"</span><span style={C}>: </span><span style={{ ...N, color: "var(--accent)" }}>true</span><span style={C}>,</span>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"leetcode"</span><span style={C}>: </span>
          <a
            href="https://leetcode.com/u/AbhijitKad/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#f8a100", textDecoration: "none", fontFamily: "'Share Tech Mono', monospace", fontSize: "13px" }}
            onMouseEnter={e => e.target.style.textDecoration = "underline"}
            onMouseLeave={e => e.target.style.textDecoration = "none"}
          >"150+ solved · Blind75 ✓ · 100-day streak"</a><span style={C}>,</span>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"contact"</span><span style={C}>: </span><span style={V}>"abhijitkad62@gmail.com"</span>
        </div>
        <div><span style={C}>{"}"}</span></div>
      </div>
    </div>
  );
};

/* ── Cyber service card ── */
const ServiceCard = ({ index, title, icon }) => (
  <Tilt className='xs:w-[220px] w-full' tiltMaxAngleX={20} tiltMaxAngleY={20} scale={1.04} transitionSpeed={500}>
    <motion.div
      variants={fadeIn("right", "spring", index * 0.5, 0.75)}
      className="cyber-card"
      style={{ minHeight: "220px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px" }}
    >
      <div style={{
        width: 56, height: 56,
        background: "rgb(var(--accent-rgb) / 0.07)",
        border: "1px solid rgb(var(--accent-rgb) / 0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <img src={icon} alt={title} style={{ width: 32, height: 32, objectFit: "contain" }} />
      </div>
      <h3 style={{
        fontFamily: "'Rajdhani', sans-serif",
        fontWeight: 700,
        fontSize: "15px",
        color: "#fff",
        letterSpacing: "2px",
        textTransform: "uppercase",
        textAlign: "center",
      }}>{title}</h3>
    </motion.div>
  </Tilt>
);

const About = () => {
  return (
    <>
      <motion.div variants={textVariant()}>
        <p className={styles.sectionSubText}>// Introduction</p>
        <h2 className={styles.sectionHeadText}>Overview.</h2>
      </motion.div>

      <motion.div variants={fadeIn("", "", 0.1, 1)} className="mt-6">
        <BioTerminal />
      </motion.div>

      <div className='mt-16 flex flex-wrap gap-8'>
        {services.map((service, index) => (
          <ServiceCard key={service.title} index={index} {...service} />
        ))}
      </div>
    </>
  );
};

export default SectionWrapper(About, "about", "portfolio");
