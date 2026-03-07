import React from "react";
import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";

import { styles } from "../styles";
import { services } from "../constants";
import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

/* ── Syntax-highlighted JSON bio ── */
const BioTerminal = () => {
  const S = { fontFamily: "'Share Tech Mono', monospace", fontSize: "13px", lineHeight: "1.9" };
  const K = { color: "#c8ffa0" };          // key
  const V = { color: "#ffe08a" };          // string value
  const N = { color: "#79c0ff" };          // number / bool
  const C = { color: "rgba(158,255,0,0.4)" }; // comment / punctuation
  const H = { color: "#9eff00" };          // highlight

  return (
    <div style={{
      background: "#050f08",
      border: "1px solid rgba(158,255,0,0.25)",
      boxShadow: "0 0 30px rgba(158,255,0,0.06)",
      padding: "0",
      maxWidth: "680px",
      position: "relative",
    }}>
      {/* title bar */}
      <div style={{
        background: "rgba(158,255,0,0.07)",
        borderBottom: "1px solid rgba(158,255,0,0.15)",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
      }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#e63030", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f0a500", display: "inline-block" }} />
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#9eff00", display: "inline-block" }} />
        <span style={{ ...S, fontSize: "11px", color: "rgba(158,255,0,0.45)", marginLeft: 8 }}>~/portfolio/about.json</span>
      </div>

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
          <span style={K}>"certifications"</span><span style={C}>: [</span>
          <span style={{
            ...V,
            background: "linear-gradient(to right, #e63030, #ff7070)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
          }}>"eJPTv2"</span>
          <span style={C}>],</span>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"philosophy"</span><span style={C}>: </span>
          <span style={C}>&quot;</span>
          <span style={{ ...V, color: "rgba(255,180,180,0.85)" }}>security</span>
          <span style={{ color: "rgba(230,48,48,0.7)" }}>-first</span>
          <span style={{ ...V, color: "rgba(200,255,160,0.7)" }}>, scalable by default</span>
          <span style={C}>&quot;</span>
          <span style={C}>,</span>
        </div>
        <div style={{ paddingLeft: "20px" }}>
          <span style={K}>"available"</span><span style={C}>: </span><span style={{ ...N, color: "#9eff00" }}>true</span><span style={C}>,</span>
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
        <div style={{ marginTop: "6px" }}>
          <span style={{ fontSize: "11px" }}>
            <span style={{ color: "rgba(158,255,0,0.35)" }}>// bridging dev &amp; </span>
            <span style={{ color: "rgba(230,48,48,0.55)" }}>security</span>
            <span style={{ color: "rgba(158,255,0,0.35)" }}> — let's build something powerful</span>
          </span>
        </div>
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
        background: "rgba(158,255,0,0.07)",
        border: "1px solid rgba(158,255,0,0.25)",
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

export default SectionWrapper(About, "about");
