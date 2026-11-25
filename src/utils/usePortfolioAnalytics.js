import { useEffect } from "react";
import {
  initAnalytics,
  recordOutboundClick,
  recordScrollDepth,
  recordSectionTimeSpent,
  recordSectionViewed,
  registerSectionFlusher,
} from "./analytics";

function classifyDestination(href) {
  const lower = href.toLowerCase();
  if (lower.startsWith("mailto:")) return "email";
  if (lower.includes("github.com")) return "github";
  if (lower.includes("linkedin.com")) return "linkedin";
  if (lower.includes("leetcode.com")) return "leetcode";
  if (lower.includes("resume") || lower.endsWith(".pdf")) return "resume";
  if (lower.includes("twitter.com") || lower.includes("x.com")) return "twitter";
  if (lower.includes("medium.com")) return "medium";
  try {
    return new URL(href, window.location.origin).hostname.replace(/^www\./i, "");
  } catch {
    return "external";
  }
}

function detectPlacement(anchor) {
  if (anchor.dataset.placement) return anchor.dataset.placement;
  if (anchor.closest("footer")) return "footer";
  if (anchor.closest("nav")) return "navbar";
  const sec = anchor.closest("[data-analytics-section]");
  if (sec?.getAttribute("data-analytics-section")) {
    return sec.getAttribute("data-analytics-section");
  }
  if (anchor.closest(".retro-desktop, .retro-station-shell")) return "retro";
  return "page";
}

function getCurrentScrollPct() {
  const doc = document.documentElement;
  const scrollHeight = Math.max(doc.scrollHeight, document.body?.scrollHeight || 0);
  if (scrollHeight <= 0) return 0;
  const bottom = window.scrollY + window.innerHeight;
  return Math.min(100, Math.max(0, Math.round((bottom / scrollHeight) * 100)));
}

/**
 * Initializes analytics once at the root App level and attaches
 * one delegated click listener for all outbound profile/contact <a> links.
 */
export function useGlobalAnalytics() {
  useEffect(() => {
    initAnalytics();

    const handleClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!anchor) return;

      // Project links are tracked separately with Project Link Clicked
      if (anchor.dataset.projectLink === "true") return;

      const rawHref = anchor.getAttribute("href") || "";
      if (!rawHref || rawHref.startsWith("#")) return;

      const isMailto = rawHref.toLowerCase().startsWith("mailto:");
      let isExternal = isMailto;
      if (!isExternal) {
        try {
          const parsed = new URL(rawHref, window.location.origin);
          if (parsed.origin !== window.location.origin) {
            isExternal = true;
          } else if (rawHref.toLowerCase().endsWith(".pdf")) {
            isExternal = true;
          }
        } catch {
          return;
        }
      }

      if (!isExternal) return;

      const url = isMailto ? rawHref : anchor.href || rawHref;
      const destination = classifyDestination(url);
      const placement = detectPlacement(anchor);
      recordOutboundClick(destination, url, placement);
    };

    document.addEventListener("click", handleClick, true);
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);
}

/**
 * Tracks main portfolio Section Viewed, Section Time Spent, and Scroll Depth.
 * Disabled while BootSequence covers the screen so pre-boot frames aren't counted.
 */
export function usePortfolioSectionTracking(enabled = true) {
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let orderCounter = 0;
    const active = new Map(); // section -> { startedVisibleAt, elapsedMs, dwellTimer }

    const pauseAllVisible = (now) => {
      for (const state of active.values()) {
        if (state.startedVisibleAt !== null) {
          state.elapsedMs += Math.max(0, now - state.startedVisibleAt);
          state.startedVisibleAt = null;
        }
      }
    };

    const resumeAllVisible = (now) => {
      for (const state of active.values()) {
        if (state.startedVisibleAt === null) {
          state.startedVisibleAt = now;
        }
      }
    };

    const flushSection = (section, options) => {
      const state = active.get(section);
      if (!state) return;
      if (state.dwellTimer) {
        window.clearTimeout(state.dwellTimer);
        state.dwellTimer = null;
      }
      const runningMs =
        state.startedVisibleAt !== null ? Math.max(0, performance.now() - state.startedVisibleAt) : 0;
      const totalSeconds = (state.elapsedMs + runningMs) / 1000;
      active.delete(section);
      recordSectionTimeSpent(section, totalSeconds, options);
    };

    const flushAllSections = (options) => {
      for (const section of [...active.keys()]) {
        flushSection(section, options);
      }
    };

    registerSectionFlusher(flushAllSections);

    const onVisibilityChange = () => {
      const now = performance.now();
      if (document.hidden) {
        pauseAllVisible(now);
      } else {
        resumeAllVisible(now);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Thresholds include 0.15 so tall mobile sections that exceed viewport height still qualify
    const observer = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        for (const entry of entries) {
          const section = entry.target.getAttribute("data-analytics-section");
          if (!section) continue;

          const fillsMostOfViewport =
            entry.intersectionRect.height >= (window.innerHeight || 800) * 0.45;
          const isClearlyVisible =
            entry.isIntersecting && (entry.intersectionRatio >= 0.45 || fillsMostOfViewport);

          if (isClearlyVisible) {
            if (!active.has(section)) {
              const entryState = {
                startedVisibleAt: document.hidden ? null : now,
                elapsedMs: 0,
                dwellTimer: window.setTimeout(() => {
                  orderCounter += 1;
                  recordSectionViewed(section, orderCounter, getCurrentScrollPct());
                }, 1000),
              };
              active.set(section, entryState);
            }
          } else if (!entry.isIntersecting || entry.intersectionRatio < 0.15) {
            flushSection(section);
          }
        }
      },
      { threshold: [0.05, 0.15, 0.45, 0.6] }
    );

    const elements = Array.from(document.querySelectorAll("[data-analytics-section]"));
    for (const el of elements) {
      observer.observe(el);
    }

    // Throttled Scroll Depth (25 / 50 / 75 / 100)
    const milestones = [25, 50, 75, 100];
    let scrollTimer = null;
    const checkScrollDepth = () => {
      scrollTimer = null;
      const pct = getCurrentScrollPct();
      for (const milestone of milestones) {
        if (pct >= milestone) {
          recordScrollDepth(milestone);
        }
      }
    };

    const onScroll = () => {
      if (scrollTimer !== null) return;
      scrollTimer = window.setTimeout(checkScrollDepth, 150);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    checkScrollDepth();

    return () => {
      if (scrollTimer !== null) window.clearTimeout(scrollTimer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      observer.disconnect();
      flushAllSections();
      registerSectionFlusher(null);
    };
  }, [enabled]);
}
