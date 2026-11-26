import { useEffect, useRef, useState } from "react";
import { MediaPlayerClassicIcon } from "./RetroIcons";
import { track } from "../utils/analytics";

export const RETRO_CLASSIC_VIDEOS = [
  {
    id: "zoozoo-zumi",
    src: "/retro/videos/01_zoozoo_zumi.mp4",
    filename: "01. vodafone_zoozoo_zumi.mp4",
    title: "Vodafone ZooZoo — Zumi Zumi",
    era: "2009 Indian TV Ad",
  },
  {
    id: "mentos-evolution",
    src: "/retro/videos/02_mentos_evolution.mp4",
    filename: "02. mentos_dimag_ki_batti.mp4",
    title: "Mentos — Dimag Ki Batti Jala De",
    era: "2000s DD/Cable Era",
  },
  {
    id: "center-fresh",
    src: "/retro/videos/04_center_fresh.mp4",
    filename: "03. center_fresh_lagaam.mp4",
    title: "Center Fresh — Zubaan Pe Lagaam",
    era: "2000s Indian Commercial",
  },
  {
    id: "big-babool",
    src: "/retro/videos/05_big_babool.mp4",
    filename: "04. big_babool_crow.mp4",
    title: "Big Babool — Thirsty Crow Remix",
    era: "2000s Kids TV Ad",
  },
];

function formatSec(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const mins = Math.floor(s / 60);
  const rem = s % 60;
  return `${String(mins).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
}

export default function RetroVideoPlayer() {
  const videoRef = useRef(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [status, setStatus] = useState("playing"); // "playing" | "paused" | "stopped"
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);
  const [crtFilter, setCrtFilter] = useState(false);

  const currentVideo = RETRO_CLASSIC_VIDEOS[selectedIdx] || RETRO_CLASSIC_VIDEOS[0];

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
    if (status !== "stopped") {
      setStatus("playing");
      el.play().catch(() => {
        setStatus("paused");
      });
    }
  }, [selectedIdx]);

  const selectVideo = (idx) => {
    setSelectedIdx(idx);
    setStatus("playing");
    track("Retro Video Played", {
      video_id: RETRO_CLASSIC_VIDEOS[idx].id,
      title: RETRO_CLASSIC_VIDEOS[idx].title,
    });
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

  const handleSeek = (e) => {
    const nextTime = Number(e.target.value);
    const el = videoRef.current;
    if (el) {
      el.currentTime = nextTime;
    }
    setCurrentTime(nextTime);
  };

  return (
    <div className="retro-mpc-window">
      {/* Classic MPC 6.4 Menu Strip */}
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
      </div>

      {/* Main Viewport + Playlist Drawer */}
      <div className="retro-mpc-main">
        <div className={`retro-mpc-stage ${crtFilter ? "has-vhs" : ""}`}>
          <video
            ref={videoRef}
            src={currentVideo.src}
            className="retro-mpc-video"
            playsInline
            preload="metadata"
            onClick={handlePlayPause}
            onLoadedMetadata={(e) => {
              const dur = e.currentTarget.duration;
              if (Number.isFinite(dur) && dur > 0) setDuration(dur);
            }}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
            onEnded={() => stepTrack(1)}
          />

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

        {showPlaylist && (
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
