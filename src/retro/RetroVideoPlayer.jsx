import { useCallback, useEffect, useRef, useState } from "react";
import { MediaPlayerClassicIcon } from "./RetroIcons";
import { track } from "../utils/analytics";

export const RETRO_CLASSIC_VIDEOS = [
  {
    id: "doraemon-hindi",
    src: "/retro/videos/06_doraemon_hindi.mp4",
    filename: "01. doraemon_hindi_intro.mp4",
    title: "Doraemon — Zindagi Sawar Doon",
    era: "Hungama / Disney Hindi",
    category: "intro",
  },
  {
    id: "perman-hindi",
    src: "/retro/videos/07_perman_hindi.mp4",
    filename: "02. perman_hindi_opening.mp4",
    title: "Perman — Hindi Opening Song",
    era: "Nick / Hungama Hindi",
    category: "intro",
  },
  {
    id: "niyander-hindi",
    src: "/retro/videos/08_niyander_hindi.mp4",
    filename: "03. masked_niyander_hindi.mp4",
    title: "Mighty Cat Masked Niyander — Hindi",
    era: "Nickelodeon India Intro",
    category: "intro",
  },
  {
    id: "ninja-hattori-hindi",
    src: "/retro/videos/13_ninja_hattori_hindi.mp4",
    filename: "04. ninja_hattori_original_hindi.mp4",
    title: "Ninja Hattori — Original Hindi Intro",
    era: "Nick India Classic",
    category: "intro",
  },
  {
    id: "kiteretsu-hindi",
    src: "/retro/videos/15_kiteretsu_hindi.mp4",
    filename: "05. kiteretsu_hindi_intro.mp4",
    title: "Kiteretsu — Hindi Opening Song",
    era: "Hungama / Disney Hindi",
    category: "intro",
  },
  {
    id: "ben10-hindi",
    src: "/retro/videos/14_ben10_hindi.mp4",
    filename: "06. ben_10_hindi_theme.mp4",
    title: "Ben 10 — Classic Hindi Theme",
    era: "Cartoon Network India",
    category: "intro",
  },
  {
    id: "supa-strikas-hindi",
    src: "/retro/videos/16_supa_strikas_hindi.mp4",
    filename: "07. supa_strikas_hindi.mp4",
    title: "Supa Strikas — Hindi Theme Song",
    era: "Disney XD / Sonic Classic",
    category: "intro",
  },
  {
    id: "shinchan-hindi",
    src: "/retro/videos/12_shinchan_hindi.mp4",
    filename: "08. shinchan_hindi_intro.mp4",
    title: "Shinchan — Mera Naam Bhi Shinchan",
    era: "Hungama TV Classic",
    category: "intro",
  },
  {
    id: "power-rangers-spd",
    src: "/retro/videos/09_power_rangers_spd.mp4",
    filename: "09. power_rangers_spd_hindi.mp4",
    title: "Power Rangers S.P.D. — Hindi Theme",
    era: "Jetix / Disney XD India",
    category: "intro",
  },
  {
    id: "power-rangers-mystic",
    src: "/retro/videos/10_power_rangers_mystic.mp4",
    filename: "10. mystic_force_hindi.mp4",
    title: "Power Rangers Mystic Force — Hindi",
    era: "Jetix India Intro",
    category: "intro",
  },
  {
    id: "ryukendo-hindi",
    src: "/retro/videos/11_ryukendo_hindi.mp4",
    filename: "11. ryukendo_hindi_theme.mp4",
    title: "Madan Senki Ryukendo — Hindi",
    era: "Disney XD / Jetix Classic",
    category: "intro",
  },
  {
    id: "rescue-force-hindi",
    src: "/retro/videos/17_rescue_force_hindi.mp4",
    filename: "12. rescue_force_hindi.mp4",
    title: "Tomica Hero Rescue Force — Hindi",
    era: "Disney XD / Jetix Intro",
    category: "intro",
  },
  {
    id: "zoozoo-zumi",
    src: "/retro/videos/01_zoozoo_zumi.mp4",
    filename: "13. vodafone_zoozoo_zumi.mp4",
    title: "Vodafone ZooZoo — Zumi Zumi",
    era: "2009 Indian TV Ad",
    category: "ad",
  },
  {
    id: "mentos-evolution",
    src: "/retro/videos/02_mentos_evolution.mp4",
    filename: "14. mentos_dimag_ki_batti.mp4",
    title: "Mentos — Dimag Ki Batti Jala De",
    era: "2000s Indian TV Ad",
    category: "ad",
  },
  {
    id: "airtel-rahman",
    src: "/retro/videos/03_airtel_rahman.mp4",
    filename: "15. airtel_ar_rahman_ad.mp4",
    title: "Airtel × A.R. Rahman — Original Jingle",
    era: "2002 Airtel Signature Ad",
    category: "ad",
  },
  {
    id: "center-fresh",
    src: "/retro/videos/04_center_fresh.mp4",
    filename: "16. center_fresh_lagaam.mp4",
    title: "Center Fresh — Zubaan Pe Lagaam",
    era: "2000s Indian TV Ad",
    category: "ad",
  },
  {
    id: "big-babool",
    src: "/retro/videos/05_big_babool.mp4",
    filename: "17. big_babool_crow.mp4",
    title: "Big Babool — Thirsty Crow Remix",
    era: "2000s Kids TV Ad",
    category: "ad",
  },
];

function formatSec(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

export default function RetroVideoPlayer({ active = true }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [status, setStatus] = useState("playing"); // "playing" | "paused" | "stopped"
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [crtFilter, setCrtFilter] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCssFallback, setIsCssFallback] = useState(false);
  const cssFallbackRef = useRef(false);
  const watchSessionRef = useRef({
    video: null,
    watchedMs: 0,
    playStartedAt: null,
    duration: 0,
  });
  const viewedClipIdxRef = useRef(null);

  const setCssOverlay = useCallback((activeFallback) => {
    cssFallbackRef.current = activeFallback;
    setIsCssFallback(activeFallback);
    setIsFullscreen(activeFallback);
  }, []);

  const currentVideo = RETRO_CLASSIC_VIDEOS[selectedIdx] || RETRO_CLASSIC_VIDEOS[0];

  const pauseWatchClock = useCallback(() => {
    const s = watchSessionRef.current;
    if (s.playStartedAt !== null) {
      s.watchedMs += Math.max(0, performance.now() - s.playStartedAt);
      s.playStartedAt = null;
    }
  }, []);

  const resumeWatchClock = useCallback((video, dur) => {
    const s = watchSessionRef.current;
    s.video = video;
    if (Number.isFinite(dur) && dur > 0) s.duration = dur;
    if (s.playStartedAt === null && typeof document !== "undefined" && !document.hidden) {
      s.playStartedAt = performance.now();
    }
  }, []);

  const flushWatchTime = useCallback(
    (completed = false, options) => {
      pauseWatchClock();
      const s = watchSessionRef.current;
      const watchedSeconds = Math.round(s.watchedMs / 1000);
      if (s.video && watchedSeconds >= 1) {
        track(
          "Retro Video Watched",
          {
            video_id: s.video.id,
            title: s.video.title,
            era: s.video.era,
            category: s.video.category,
            watched_seconds: watchedSeconds,
            duration_seconds: Math.round(s.duration || 0),
            completed: Boolean(completed),
          },
          options
        );
      }
      s.watchedMs = 0;
      s.playStartedAt = null;
      s.video = null;
      s.duration = 0;
    },
    [pauseWatchClock]
  );

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        pauseWatchClock();
      } else if (videoRef.current && !videoRef.current.paused && !videoRef.current.ended) {
        resumeWatchClock(currentVideo, videoRef.current.duration);
      }
    };
    const onPageHide = () => flushWatchTime(false, { transport: "sendBeacon" });
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [currentVideo, flushWatchTime, pauseWatchClock, resumeWatchClock]);

  useEffect(() => {
    return () => flushWatchTime(false, { transport: "sendBeacon" });
  }, [flushWatchTime]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.volume = volume;
    el.muted = muted;
  }, [volume, muted]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    setCurrentTime(0);
    setDuration(0);
    el.currentTime = 0;
    viewedClipIdxRef.current = null;
    if (status !== "stopped") {
      setStatus("playing");
      el.play().catch(() => {
        setStatus("paused");
      });
    }
  }, [selectedIdx]);

  const selectVideo = (idx) => {
    if (idx !== selectedIdx) {
      flushWatchTime(false);
    }
    setSelectedIdx(idx);
    setStatus("playing");
  };

  const handlePlayPause = () => {
    const el = videoRef.current;
    if (!el) return;
    if (status === "playing") {
      el.pause();
      setStatus("paused");
    } else {
      setStatus("playing");
      el.play().catch(() => {});
    }
  };

  const handleStop = () => {
    flushWatchTime(false);
    viewedClipIdxRef.current = null;
    const el = videoRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setCurrentTime(0);
    setStatus("stopped");
  };

  const stepTrack = (delta) => {
    const nextIdx =
      (selectedIdx + delta + RETRO_CLASSIC_VIDEOS.length) % RETRO_CLASSIC_VIDEOS.length;
    selectVideo(nextIdx);
  };

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const doc = document;
    const fullscreenEl =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;
    const isPlayerFs = fullscreenEl === el || cssFallbackRef.current;

    if (!isPlayerFs) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => setCssOverlay(true));
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else {
        setCssOverlay(true);
      }
    } else {
      if (fullscreenEl === el && doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => setCssOverlay(false));
      } else if (fullscreenEl === el && doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else {
        setCssOverlay(false);
      }
    }
  }, [setCssOverlay]);

  useEffect(() => {
    const syncFullscreen = () => {
      const doc = document;
      const fsEl =
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement;
      const isNativeFs = fsEl === containerRef.current;
      if (isNativeFs) {
        cssFallbackRef.current = false;
        setIsCssFallback(false);
        setIsFullscreen(true);
      } else if (!cssFallbackRef.current) {
        setIsCssFallback(false);
        setIsFullscreen(false);
      }
    };

    document.addEventListener("fullscreenchange", syncFullscreen);
    document.addEventListener("webkitfullscreenchange", syncFullscreen);
    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreen);
      document.removeEventListener("webkitfullscreenchange", syncFullscreen);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!active && !isFullscreen) return;
      if (e.key === "Escape" && cssFallbackRef.current) {
        e.preventDefault();
        setCssOverlay(false);
        return;
      }
      if (!e.metaKey && !e.ctrlKey && (e.key === "f" || e.key === "F")) {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, isFullscreen, setCssOverlay, toggleFullscreen]);

  const handleSeek = (e) => {
    const nextTime = Number(e.target.value);
    const el = videoRef.current;
    if (el) {
      el.currentTime = nextTime;
    }
    setCurrentTime(nextTime);
  };

  return (
    <div
      ref={containerRef}
      className={`retro-mpc-window ${isFullscreen ? "is-fullscreen" : ""} ${
        isCssFallback ? "retro-mpc-fullscreen-fallback" : ""
      }`}
    >
      {/* Classic MPC 6.4 Menu Strip */}
      {!isFullscreen && (
        <div className="retro-mpc-menubar">
          <button type="button" onClick={() => setShowPlaylist((v) => !v)}>
            {showPlaylist ? "Hide Playlist" : "View Playlist"}
          </button>
          <button type="button" onClick={() => stepTrack(-1)}>
            Previous
          </button>
          <button type="button" onClick={() => stepTrack(1)}>
            Next
          </button>
          <button
            type="button"
            className={crtFilter ? "is-toggled" : ""}
            onClick={() => setCrtFilter((v) => !v)}
            title="Toggle retro VHS scanline overlay"
          >
            VHS Scanlines
          </button>
          <button
            type="button"
            className="retro-mpc-fs-menu-btn"
            onClick={toggleFullscreen}
            title="Maximize video to full screen (F)"
          >
            ⛶ Full Screen
          </button>
        </div>
      )}

      {/* Main Viewport + Playlist Drawer */}
      <div className="retro-mpc-main">
        <div
          className={`retro-mpc-stage ${crtFilter ? "has-vhs" : ""}`}
          onDoubleClick={toggleFullscreen}
        >
          <video
            ref={videoRef}
            src={currentVideo.src}
            className="retro-mpc-video"
            playsInline
            preload="metadata"
            onClick={handlePlayPause}
            onDoubleClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            onPlay={(e) => {
              resumeWatchClock(currentVideo, e.currentTarget.duration);
              if (viewedClipIdxRef.current !== selectedIdx) {
                viewedClipIdxRef.current = selectedIdx;
                track("Retro Video Viewed", {
                  video_id: currentVideo.id,
                  title: currentVideo.title,
                  era: currentVideo.era,
                  category: currentVideo.category,
                  playlist_index: selectedIdx + 1,
                });
              }
            }}
            onPause={pauseWatchClock}
            onLoadedMetadata={(e) => {
              const dur = e.currentTarget.duration;
              if (Number.isFinite(dur) && dur > 0) {
                setDuration(dur);
                watchSessionRef.current.duration = dur;
              }
            }}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
            onEnded={() => {
              flushWatchTime(true);
              stepTrack(1);
            }}
          />

          {isFullscreen && (
            <button
              type="button"
              className="retro-mpc-exit-fs-pill"
              onClick={toggleFullscreen}
              title="Exit Full Screen (Esc or F)"
            >
              ✕ Exit Full Screen
            </button>
          )}

          {status === "stopped" && (
            <div className="retro-mpc-stopped">
              <MediaPlayerClassicIcon size={40} />
              <strong>Media Player Classic</strong>
              <span>{currentVideo.filename} — Stopped</span>
              <button type="button" className="retro-native-button" onClick={handlePlayPause}>
                ▶ Play Clip
              </button>
            </div>
          )}
        </div>

        {!isFullscreen && showPlaylist && (
          <aside className="retro-mpc-playlist" aria-label="Indian Nostalgia Video Playlist">
            <header className="retro-mpc-pl-head">
              <span>Nostalgia Clips ({RETRO_CLASSIC_VIDEOS.length})</span>
            </header>
            <div className="retro-mpc-pl-list" role="listbox">
              {RETRO_CLASSIC_VIDEOS.map((vid, idx) => {
                const selected = idx === selectedIdx;
                return (
                  <button
                    key={vid.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`retro-mpc-pl-item ${selected ? "is-selected" : ""}`}
                    onClick={() => selectVideo(idx)}
                  >
                    <span className="retro-mpc-pl-file">{vid.filename}</span>
                    <small>{vid.era}</small>
                  </button>
                );
              })}
            </div>
          </aside>
        )}
      </div>

      {/* Seek Trackbar + Transport Controls */}
      <div className="retro-mpc-controls">
        <div className="retro-mpc-seek-row">
          <input
            type="range"
            min={0}
            max={Math.max(1, duration)}
            step={0.1}
            value={Math.min(currentTime, duration || 0)}
            onChange={handleSeek}
            aria-label="Seek video timeline"
            className="retro-mpc-seek"
          />
        </div>

        <div className="retro-mpc-btn-row">
          <button
            type="button"
            className="retro-native-button"
            onClick={handlePlayPause}
            title={status === "playing" ? "Pause" : "Play"}
          >
            {status === "playing" ? "⏸" : "▶"}
          </button>
          <button type="button" className="retro-native-button" onClick={handleStop} title="Stop">
            ■
          </button>
          <button
            type="button"
            className="retro-native-button"
            onClick={() => stepTrack(-1)}
            title="Previous Video"
          >
            |◀
          </button>
          <button
            type="button"
            className="retro-native-button"
            onClick={() => stepTrack(1)}
            title="Next Video"
          >
            ▶|
          </button>
          <button
            type="button"
            className="retro-native-button"
            onClick={() => setMuted((m) => !m)}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setMuted(false);
              setVolume(Number(e.target.value));
            }}
            aria-label="Volume"
            className="retro-mpc-vol"
          />
          <span className="retro-mpc-now">{currentVideo.title}</span>
          <button
            type="button"
            className={`retro-native-button retro-mpc-fs-btn ${isFullscreen ? "is-active" : ""}`}
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Full Screen (F / Esc)" : "Full Screen (F / Double-click)"}
            aria-label={isFullscreen ? "Exit Full Screen" : "Full Screen"}
          >
            {isFullscreen ? "❐" : "⛶"}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <footer className="retro-mpc-statusbar">
        <span>
          {status === "playing" ? "Playing" : status === "paused" ? "Paused" : "Stopped"} ·{" "}
          {currentVideo.era}
        </span>
        <span>
          {formatSec(currentTime)} / {formatSec(duration)}
        </span>
      </footer>
    </div>
  );
}
