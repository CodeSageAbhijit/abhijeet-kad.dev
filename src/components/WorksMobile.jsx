import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { styles } from "../styles";
import { projects } from "../constants";
import { projectAnchor, projectFromHash } from "../utils/portfolioSearch";
import { track, trackOnce } from "../utils/analytics";
import { ImpactMetrics, ProjectLightbox } from "./ProjectExtras";

const TYPE_CONFIG = {
  web: { icon: "🌐", label: "Web App", color: "#4fc3f7" },
  mobile: { icon: "📱", label: "Mobile App", color: "var(--accent)" },
  desktop: { icon: "💻", label: "Desktop App", color: "#ffb700" },
};

const FILTERS = ["all", "web", "mobile", "desktop"];

const SimpleImageCard = ({
  images,
  name,
  type,
  idx,
  onIdxChange,
  onOpenLightbox,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isHovered) return;
    const t = setInterval(() => {
      onIdxChange((idx + 1) % images.length, "auto");
    }, 3400);
    return () => clearInterval(t);
  }, [images.length, isHovered, idx, onIdxChange]);

  const isMobileApp = type === "mobile";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full overflow-hidden bg-[#0a0a0a]"
      style={{ borderBottom: "1px solid rgb(var(--accent-rgb) / 0.1)" }}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpenLightbox?.();
        }}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: isMobileApp ? "4/5" : "16/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: isMobileApp ? "radial-gradient(circle, #222 0%, #000 100%)" : "#000",
          cursor: "zoom-in",
        }}
      >
        <img
          src={images[idx]}
          alt={`${name} screenshot ${idx + 1}`}
          loading="lazy"
          decoding="async"
          style={{
            width: isMobileApp ? "auto" : "100%",
            height: isMobileApp ? "90%" : "100%",
            objectFit: isMobileApp ? "contain" : "cover",
            objectPosition: "center",
            display: "block",
            borderRadius: isMobileApp ? "12px" : "0",
            boxShadow: isMobileApp ? "0 0 20px rgba(0,0,0,0.8)" : "none",
            border: isMobileApp ? "2px solid #333" : "none",
          }}
        />
        <button
          type="button"
          aria-label="Expand fullscreen"
          onClick={(e) => {
            e.stopPropagation();
            onOpenLightbox?.();
          }}
          className="absolute top-2 right-2 px-2 py-0.5 border border-white/25 bg-black/75 text-white/85 font-mono text-[9px] cursor-pointer"
        >
          ⛶ zoom
        </button>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous screenshot"
              onClick={(e) => {
                e.stopPropagation();
                onIdxChange((idx - 1 + images.length) % images.length, "mobile_arrow");
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center border border-white/25 bg-black/70 text-white font-mono text-sm cursor-pointer"
            >
              &lsaquo;
            </button>
            <button
              type="button"
              aria-label="Next screenshot"
              onClick={(e) => {
                e.stopPropagation();
                onIdxChange((idx + 1) % images.length, "mobile_arrow");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center border border-white/25 bg-black/70 text-white font-mono text-sm cursor-pointer"
            >
              &rsaquo;
            </button>
            <div
              style={{
                position: "absolute",
                bottom: 8,
                right: 8,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                background: "rgba(0,0,0,0.65)",
                color: "var(--accent)",
                padding: "3px 8px",
                borderRadius: 3,
                border: "1px solid rgb(var(--accent-rgb) / 0.2)",
              }}
            >
              {idx + 1}/{images.length}
            </div>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 6,
            padding: "8px 0",
            background: "rgba(0,0,0,0.4)",
            borderTop: "1px solid rgb(var(--accent-rgb) / 0.1)",
          }}
        >
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                onIdxChange(i, "mobile_dot");
              }}
              style={{
                width: i === idx ? 18 : 8,
                height: 6,
                borderRadius: 3,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === idx ? "var(--accent)" : "rgba(255,255,255,0.25)",
                transition: "all 0.25s",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ProjectCard = ({ project, index, onOpenLightbox }) => {
  const images = project.images || [project.image];
  const [idx, setIdx] = useState(0);
  const cfg = TYPE_CONFIG[project.type] || { icon: "💻", label: "Project", color: "var(--accent)" };

  const handleIdx = (nextIdx, source = "manual") => {
    const wrapped = ((nextIdx % images.length) + images.length) % images.length;
    setIdx(wrapped);
    if (source !== "auto") {
      track("Project Slide Viewed", {
        project_name: project.name,
        slide: wrapped + 1,
        total: images.length,
        source,
      });
    }
  };

  return (
    <motion.div
      id={projectAnchor(project.name)}
      data-project-anchor
      tabIndex={-1}
      onClick={() => trackOnce("Project Opened", { project_name: project.name }, `project_opened:${project.name}`)}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      viewport={{ once: true, amount: 0.1 }}
      style={{
        borderRadius: 12,
        border: "1px solid rgb(var(--accent-rgb) / 0.18)",
        background: "rgba(0,0,0,0.5)",
        boxShadow: "0 0 20px rgb(var(--accent-rgb) / 0.05)",
        overflow: "hidden",
      }}
    >
      <SimpleImageCard
        images={images}
        name={project.name}
        type={project.type}
        idx={idx}
        onIdxChange={handleIdx}
        onOpenLightbox={() => onOpenLightbox?.(project, idx)}
      />

      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "start", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: "18px", flexShrink: 0 }}>{cfg.icon}</span>
          <div>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "1.5rem",
                color: "#ffffff",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {project.name}
            </h3>
            <p
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                color: cfg.color,
                letterSpacing: 1,
                marginTop: 2,
                textTransform: "uppercase",
              }}
            >
              {cfg.label}
            </p>
          </div>
        </div>

        <ImpactMetrics metrics={project.metrics} accentColor={cfg.color} compact />

        <p
          style={{
            fontSize: "14px",
            color: "rgba(255,255,255,0.72)",
            lineHeight: 1.5,
            margin: 0,
            paddingBottom: 12,
          }}
        >
          {project.description}
        </p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {project.tags?.slice(0, 4).map((tag) => (
            <span
              key={tag.name}
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                padding: "3px 8px",
                background: "rgb(var(--accent-rgb) / 0.05)",
                border: "1px solid rgb(var(--accent-rgb) / 0.15)",
                borderRadius: 3,
                color: "rgb(var(--accent-rgb) / 0.8)",
                letterSpacing: 0.5,
              }}
            >
              {tag.name}
            </span>
          ))}
          {project.tags && project.tags.length > 4 && (
            <span
              style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 10,
                color: "rgb(var(--accent-rgb) / 0.5)",
              }}
            >
              +{project.tags.length - 4}
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {project.source_code_link && (
            <a
              href={project.source_code_link}
              target="_blank"
              rel="noopener noreferrer"
              data-project-link="true"
              onClick={(e) => {
                e.stopPropagation();
                track(
                  "Project Link Clicked",
                  { project_name: project.name, link_type: "github", url: project.source_code_link },
                  { transport: "sendBeacon" }
                );
              }}
              style={{
                flex: "1 1 auto",
                minWidth: "120px",
                padding: "8px 12px",
                textAlign: "center",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: 11,
                color: "var(--accent)",
                border: "1px solid rgb(var(--accent-rgb) / 0.4)",
                borderRadius: 4,
                background: "rgb(var(--accent-rgb) / 0.03)",
                cursor: "pointer",
                transition: "all 0.2s",
                textDecoration: "none",
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
              data-project-link="true"
              onClick={(e) => {
                e.stopPropagation();
                track(
                  "Project Link Clicked",
                  { project_name: project.name, link_type: "live", url: project.live_link },
                  { transport: "sendBeacon" }
                );
              }}
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
            >
              live
            </a>
          )}
          {project.exe_link && (
            <a
              href={project.exe_link}
              target="_blank"
              rel="noopener noreferrer"
              data-project-link="true"
              onClick={(e) => {
                e.stopPropagation();
                track(
                  "Project Link Clicked",
                  { project_name: project.name, link_type: "download", url: project.exe_link },
                  { transport: "sendBeacon" }
                );
              }}
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
            >
              download
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const WorksMobile = ({ isBooting }) => {
  const [filter, setFilter] = useState("all");
  const [pendingProject, setPendingProject] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const { hash, key } = useLocation();

  useEffect(() => {
    const project = projectFromHash(hash);
    if (isBooting || !project) return;
    setFilter("all");
    setPendingProject(projectAnchor(project.name));
  }, [hash, key, isBooting]);

  useEffect(() => {
    if (!pendingProject || filter !== "all") return;
    const card = document.getElementById(pendingProject);
    card?.scrollIntoView();
    card?.focus({ preventScroll: true });
    setPendingProject(null);
  }, [filter, pendingProject]);

  const filtered = filter === "all" ? projects : projects.filter((p) => p.type === filter);

  const handleFilter = (f) => {
    setFilter(f);
    track("Project Filter Changed", { filter: f });
  };

  return (
    <div id="projects" className="w-full px-6 py-10" data-tone="portfolio" data-project-anchor>
      <div>
        <p className={`${styles.sectionSubText}`}>// My work</p>
        <h2 className={`${styles.sectionHeadText}`}>Projects.</h2>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 20,
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {FILTERS.map((f) => {
          const isActive = filter === f;
          const c = f === "all" ? "var(--accent)" : TYPE_CONFIG[f]?.color || "var(--accent)";
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
                background: isActive ? `color-mix(in srgb, ${c} 9%, transparent)` : "transparent",
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
      </div>

      <div
        style={{
          textAlign: "center",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 10,
          color: "rgb(var(--accent-rgb) / 0.3)",
          letterSpacing: 2,
          marginTop: 12,
          textTransform: "uppercase",
        }}
      >
        [{filtered.length} project{filtered.length !== 1 ? "s" : ""}]
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginTop: 24,
        }}
      >
        {filtered.map((project, idx) => (
          <ProjectCard
            key={`${project.name}-${idx}`}
            project={project}
            index={idx}
            onOpenLightbox={(proj, slideIndex) => {
              setLightbox({ images: proj.images || [proj.image], index: slideIndex, name: proj.name });
              track("Project Lightbox Opened", {
                project_name: proj.name,
                slide: slideIndex + 1,
                trigger: "mobile_tap",
              });
            }}
          />
        ))}
      </div>

      {lightbox && (
        <ProjectLightbox
          images={lightbox.images}
          index={lightbox.index}
          name={lightbox.name}
          onClose={() => setLightbox(null)}
          onStep={(nextIdx) =>
            setLightbox((prev) => (prev ? { ...prev, index: nextIdx } : null))
          }
        />
      )}
    </div>
  );
};

export default WorksMobile;
