import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { styles } from "../styles";
import { projects } from "../constants";
import { textVariant } from "../utils/motion";

const TYPE_CONFIG = {
  web: { icon: "🌐", label: "Web App", color: "#4fc3f7" },
  mobile: { icon: "📱", label: "Mobile App", color: "#9eff00" },
  desktop: { icon: "💻", label: "Desktop App", color: "#ffb700" },
};

const FILTERS = ["all", "web", "mobile", "desktop"];

/* Simple mobile-optimized image display */
const SimpleImageCard = ({ images, name }) => {
  const [idx, setIdx] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const t = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(t);
  }, [images.length, isHovered]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full rounded-lg overflow-hidden bg-black"
      style={{
        border: "1px solid rgba(158,255,0,0.1)",
        boxShadow: "0 0 20px rgba(158,255,0,0.04)",
      }}
    >
      {/* Image container */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
        <img
          src={images[idx]}
          alt={`${name} screenshot ${idx + 1}`}
          loading="lazy"
          decoding="async"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            display: "block",
          }}
        />
        {/* Image counter */}
        {images.length > 1 && (
          <div style={{
            position: "absolute", bottom: 8, right: 8,
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 10, 
            background: "rgba(0,0,0,0.6)",
            color: "#9eff00",
            padding: "3px 8px",
            borderRadius: 3,
            border: "1px solid rgba(158,255,0,0.2)",
          }}>
            {idx + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Indicator dots */}
      {images.length > 1 && (
        <div style={{
          display: "flex", justifyContent: "center", gap: 4, padding: "8px 0",
          background: "rgba(0,0,0,0.4)",
          borderTop: "1px solid rgba(158,255,0,0.1)",
        }}>
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: i === idx ? 12 : 6,
                height: 6,
                borderRadius: 3,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === idx ? "#9eff00" : "rgba(255,255,255,0.2)",
                transition: "all 0.3s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ project, index }) => {
  const images = project.images || [project.image];
  const cfg = TYPE_CONFIG[project.type] || { icon: "💻", label: "Project", color: "#9eff00" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, amount: 0.2 }}
      style={{
        borderRadius: 12,
        border: "1px solid rgba(158,255,0,0.1)",
        background: "rgba(0,0,0,0.3)",
        overflow: "hidden",
      }}
    >
      {/* Image */}
      <SimpleImageCard images={images} name={project.name} />

      {/* Content */}
      <div style={{ padding: "16px" }}>
        {/* Type badge + Title */}
        <div style={{ display: "flex", alignItems: "start", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>{cfg.icon}</span>
          <div>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.5rem",
              color: "#ffffff",
              margin: 0,
              lineHeight: 1.2,
            }}>
              {project.name}
            </h3>
            <p style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              color: cfg.color,
              letterSpacing: 1,
              marginTop: 2,
              textTransform: "uppercase",
            }}>
              {cfg.label}
            </p>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: "14px",
          color: "rgba(255,255,255,0.7)",
          lineHeight: 1.5,
          marginBottom: 12,
          margin: 0,
          paddingBottom: 12,
        }}>
          {project.description}
        </p>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {project.tags?.slice(0, 4).map((tag) => (
            <span
              key={tag.name}
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                padding: "3px 8px",
                background: "rgba(158,255,0,0.05)",
                border: "1px solid rgba(158,255,0,0.15)",
                borderRadius: 3,
                color: "rgba(158,255,0,0.8)",
                letterSpacing: 0.5,
              }}
            >
              {tag.name}
            </span>
          ))}
          {project.tags && project.tags.length > 4 && (
            <span style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: 10,
              color: "rgba(158,255,0,0.5)",
            }}>
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {project.source_code_link && (
            <a
              href={project.source_code_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: "1 1 auto",
                minWidth: "120px",
                padding: "8px 12px",
                textAlign: "center",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: "#9eff00",
                border: "1px solid rgba(158,255,0,0.4)",
                borderRadius: 4,
                background: "rgba(158,255,0,0.03)",
                cursor: "pointer",
                transition: "all 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(158,255,0,0.1)";
                e.target.style.boxShadow = "0 0 12px rgba(158,255,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(158,255,0,0.03)";
                e.target.style.boxShadow = "none";
              }}
            >
              code
            </a>
          )}
          {project.live_link && (
            <a
              href={project.live_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: "1 1 auto",
                minWidth: "120px",
                padding: "8px 12px",
                textAlign: "center",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: "#fff",
                border: "1px solid rgba(79,195,247,0.4)",
                borderRadius: 4,
                background: "rgba(79,195,247,0.1)",
                cursor: "pointer",
                transition: "all 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(79,195,247,0.2)";
                e.target.style.boxShadow = "0 0 12px rgba(79,195,247,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(79,195,247,0.1)";
                e.target.style.boxShadow = "none";
              }}
            >
              live
            </a>
          )}
          {project.exe_link && (
            <a
              href={project.exe_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: "1 1 auto",
                minWidth: "120px",
                padding: "8px 12px",
                textAlign: "center",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: "#fff",
                border: "1px solid rgba(248,161,0,0.4)",
                borderRadius: 4,
                background: "rgba(248,161,0,0.1)",
                cursor: "pointer",
                transition: "all 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(248,161,0,0.2)";
                e.target.style.boxShadow = "0 0 12px rgba(248,161,0,0.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(248,161,0,0.1)";
                e.target.style.boxShadow = "none";
              }}
            >
              download
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const WorksMobile = () => {
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? projects : projects.filter(p => p.type === filter);

  const handleFilter = (f) => setFilter(f);

  return (
    <div>
      <motion.div variants={textVariant()}>
        <p className={`${styles.sectionSubText}`}>// My work</p>
        <h2 className={`${styles.sectionHeadText}`}>Projects.</h2>
      </motion.div>

      {/* Filter pills */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
        style={{
          display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap",
          alignItems: "center", justifyContent: "center",
        }}
      >
        {FILTERS.map(f => {
          const isActive = filter === f;
          const c = f === "all" ? "#9eff00" : (TYPE_CONFIG[f]?.color || "#9eff00");
          return (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                letterSpacing: 1,
                padding: "6px 12px",
                border: isActive ? `1px solid ${c}` : "1px solid rgba(255,255,255,0.1)",
                background: isActive ? `${c}18` : "transparent",
                color: isActive ? c : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "all 0.2s",
                textTransform: "uppercase",
                borderRadius: 4,
                whiteSpace: "nowrap",
              }}
            >
              {f === "all" ? "// all" : `${TYPE_CONFIG[f]?.icon} ${f}`}
            </button>
          );
        })}
      </motion.div>

      {/* Project count */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        viewport={{ once: true }}
        style={{
          textAlign: "center",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 10,
          color: "rgba(158,255,0,0.3)",
          letterSpacing: 2,
          marginTop: 12,
          textTransform: "uppercase",
        }}
      >
        [{filtered.length} project{filtered.length !== 1 ? "s" : ""}]
      </motion.div>

      {/* Vertical card feed */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, staggerChildren: 0.1 }}
        viewport={{ once: true, amount: 0.1 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 24,
        }}
      >
        {filtered.map((project, idx) => (
          <ProjectCard key={`${project.name}-${idx}`} project={project} index={idx} />
        ))}
      </motion.div>
    </div>
  );
};

export default WorksMobile;


