import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createKeyClick, preloadKeyClicks } from "../components/canvas/keyClick";
import RetroDesktop from "./RetroDesktop";
import CrtTvGlitch from "./CrtTvGlitch";
import { exitDesktopFullscreen, requestDesktopFullscreen } from "./fullscreen";
import { monitorLayout } from "./monitorLayout";
import {
  consumeRetroEntryPoint,
  enterRetroSection,
  exitRetroSection,
  markEasterEggFound,
  trackHiddenFeature,
} from "../utils/analytics";
import {
  playCrtRestoreSfx,
  playCrtStaticBurst,
  playMonitorSmackSfx,
} from "../utils/retroRingtone";
import {
  playShutdownSound,
  playStartupSound,
  releaseStartupSound,
  stopStartupSound,
  unlockStartupSound,
} from "./startupSound";
import { PalmAvatar, TurnOffComputerIcon, WindowsXPLogo } from "./RetroIcons";
import "./retro.css";

const base = import.meta.env.BASE_URL;
const RETRO_USER = "AbhijitKad";

function Startup({ onSkip }) {
  return (
    <div className="retro-boot" role="status" aria-label="Starting the computer">
      <div className="retro-boot-center">
        <WindowsXPLogo width={180} />
        <div className="retro-boot-progress" aria-hidden="true">
          <span>
            <i />
            <i />
            <i />
          </span>
        </div>
      </div>
      <button type="button" className="retro-boot-skip" onClick={onSkip}>
        Skip startup
      </button>
    </div>
  );
}

function SignIn({ onSignIn, onPowerOff }) {
  return (
    <section className="retro-signin" aria-label="Desktop sign-in">
      <header className="retro-logon-band retro-logon-top" />
      <div className="retro-signin-main">
        <div className="retro-signin-left">
          <div className="retro-signin-logo-area">
            <WindowsXPLogo width={140} />
            <p className="retro-signin-prompt">To begin, click your user name</p>
          </div>
        </div>
        <div className="retro-signin-divider" aria-hidden="true" />

        {/* Right Column: User Account Tile */}
        <div className="retro-signin-right">
          <button
            type="button"
            className="retro-user-tile"
            onClick={onSignIn}
            aria-label={`Sign in as ${RETRO_USER}`}
          >
            <div className="retro-user-avatar-frame">
              <PalmAvatar size={46} />
            </div>
            <div className="retro-user-info">
              <strong className="retro-user-name">{RETRO_USER}</strong>
            </div>
          </button>
        </div>
      </div>
      <div className="retro-signin-disclaimer">
        <p>Time passes. Memories remain.</p>
        <p>This project is for educational and nostalgic purposes only. It is not affiliated with or endorsed by Microsoft. Windows and its assets are registered trademarks of Microsoft Corporation. WinXp.it - NoCopyRight</p>
      </div>

      <footer className="retro-logon-band retro-logon-bottom">
        <div className="retro-signin-footer-content">
          <button type="button" className="retro-logon-turnoff" onClick={onPowerOff}>
            <TurnOffComputerIcon size={18} /> <span>Turn off computer</span>
          </button>
          <div className="retro-signin-footer-right">
            <p>After you log on, you can add or change accounts.</p>
            <p>Just go to Control Panel and click User Accounts.</p>
          </div>
        </div>
      </footer>
    </section>
  );
}

function Welcome() {
  return (
    <div className="retro-welcome" role="status" aria-label="Welcome">
      <header className="retro-logon-band retro-logon-top" />
      <span className="retro-welcome-shine" aria-hidden="true" />
      <div className="retro-welcome-message">
        <img
          src={`${base}retro/welcome-text.svg`}
          alt="Welcome"
          className="retro-welcome-text-img"
          draggable={false}
        />
      </div>
      <footer className="retro-logon-band retro-logon-bottom" />
    </div>
  );
}

function ShuttingDown() {
  return (
    <div className="retro-shutdown-screen" role="status" aria-label="Shutting down">
      <header className="retro-logon-band retro-logon-top" />
      <div className="retro-shutdown-center">
        <WindowsXPLogo width={200} />
        <p className="retro-shutdown-text">Windows is shutting down...</p>
      </div>
      <footer className="retro-logon-band retro-logon-bottom" />
    </div>
  );
}

export default function RetroStation() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(state?.boot ? "starting" : "off");
  const [sound, setSound] = useState(state?.sound ?? true);
  // const [cameos, setCameos] = useState(true);
  const [scanlines, setScanlines] = useState(false);
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [viewport, setViewport] = useState(null);
  const [focused, setFocused] = useState(false);
  const stage = useRef(null);
  const audio = useRef(null);
  const [display, setDisplay] = useState({ brightness: 100, contrast: 100 });
  const [adjustment, setAdjustment] = useState(null);
  const adjustmentTimer = useRef(null);
  const screen = useRef(null);
  const hasGlitchedRef = useRef(false);
  const [tvGlitchActive, setTvGlitchActive] = useState(false);
  const [tvGlitchHits, setTvGlitchHits] = useState(0);
  const [tvShowHint, setTvShowHint] = useState(false);
  const [tvBlackout, setTvBlackout] = useState(false);
  const [isSmacking, setIsSmacking] = useState(false);
  const [tvRestoredMsg, setTvRestoredMsg] = useState(false);
  const smackTimer = useRef(null);
  const powered = phase !== "off";

  function returnToPortfolio() {
    stopStartupSound();
    exitDesktopFullscreen();
    exitRetroSection({ destinationSection: "search" });
    navigate("/#search");
  }

  function powerOn() {
    if (sound) unlockStartupSound();
    setPhase("starting");
  }

  function initiateShutDown() {
    if (sound) {
      unlockStartupSound();
      playShutdownSound();
    }
    setPhase("shutting_down");
  }

  function immediatePowerOff() {
    setFocused(false);
    setTvGlitchActive(false);
    returnToPortfolio();
  }

  function adjustDisplay(control) {
    trackHiddenFeature("crt_display_knob", { control });
    const levels = [100, 115, 130, 70, 85];
    const value = levels[(levels.indexOf(display[control]) + 1) % levels.length];
    setDisplay({ ...display, [control]: value });
    setAdjustment(control);
    clearTimeout(adjustmentTimer.current);
    adjustmentTimer.current = setTimeout(() => setAdjustment(null), 1400);
  }

  useEffect(() => () => {
    clearTimeout(adjustmentTimer.current);
    clearTimeout(smackTimer.current);
  }, []);

  // Trigger Doordarshan / CRT cable signal glitch strictly once per /retro visit
  useEffect(() => {
    if (phase !== "desktop" || tvGlitchActive || hasGlitchedRef.current) return;
    const delayMs = 18000 + Math.floor(Math.random() * 14000);
    const timer = setTimeout(() => {
      if (hasGlitchedRef.current) return;
      hasGlitchedRef.current = true;
      setTvGlitchHits(0);
      setTvShowHint(false);
      setTvGlitchActive(true);
      trackHiddenFeature("crt_tv_signal_glitch");
      if (sound) playCrtStaticBurst(0.32, 0.03);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [phase, tvGlitchActive, sound]);

  // Show repair hint 2.5s after glitch starts & flicker screen blackouts
  useEffect(() => {
    if (!tvGlitchActive) {
      setTvBlackout(false);
      setTvShowHint(false);
      return;
    }

    const hintTimer = setTimeout(() => setTvShowHint(true), 2500);
    let flickerTimer;
    const scheduleFlicker = () => {
      const waitMs = tvGlitchHits === 0 ? 280 + Math.random() * 480 : 650 + Math.random() * 750;
      flickerTimer = setTimeout(() => {
        if (tvGlitchHits < 2) {
          setTvBlackout((prev) => !prev);
          if (sound && Math.random() < 0.35) playCrtStaticBurst(0.14, 0.02);
        } else {
          setTvBlackout(false);
        }
        scheduleFlicker();
      }, waitMs);
    };
    scheduleFlicker();

    return () => {
      clearTimeout(hintTimer);
      clearTimeout(flickerTimer);
      setTvBlackout(false);
    };
  }, [tvGlitchActive, tvGlitchHits, sound]);

  useEffect(() => {
    if (!tvRestoredMsg) return;
    const t = setTimeout(() => setTvRestoredMsg(false), 2400);
    return () => clearTimeout(t);
  }, [tvRestoredMsg]);

  function handleTvSmack() {
    if (!tvGlitchActive) return;
    const nextHit = tvGlitchHits + 1;
    clearTimeout(smackTimer.current);
    setIsSmacking(false);
    requestAnimationFrame(() => {
      setIsSmacking(true);
      smackTimer.current = setTimeout(() => setIsSmacking(false), 340);
    });
    if (sound) playMonitorSmackSfx(nextHit);

    if (nextHit >= 3) {
      setTvGlitchActive(false);
      setTvGlitchHits(0);
      setTvBlackout(false);
      setTvRestoredMsg(true);
      if (sound) playCrtRestoreSfx();
      markEasterEggFound("crt_tv_slap_repair", "click");
    } else {
      setTvGlitchHits(nextHit);
    }
  }

  useEffect(() => {
    if (phase !== "shutting_down") return;
    const timer = setTimeout(() => {
      setFocused(false);
      returnToPortfolio();
    }, 2800);
    return () => clearTimeout(timer);
  }, [phase]);

  function signIn() {
    if (sound) unlockStartupSound();
    setPhase("welcome");
  }

  function playTyping(event) {
    if (event.defaultPrevented || !sound || event.ctrlKey || event.metaKey || event.altKey || event.nativeEvent.isComposing) return;
    if (event.key.length !== 1 && !["Backspace", "Delete", "Enter"].includes(event.key)) return;
    try {
      audio.current ??= createKeyClick();
      audio.current?.play(event.key);
    } catch {
      // The desktop remains usable without audio support.
    }
  }

  useEffect(() => {
    enterRetroSection(consumeRetroEntryPoint("direct_url"));
    const original = document.title;
    document.title = "Retro PC · Abhijeet Kad";
    const wallpaper = new Image();
    wallpaper.src = `${base}retro/wallpaper.webp`;
    wallpaper.decode().catch(() => { });
    preloadKeyClicks().catch(() => { });
    const handleFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFullscreen);
    return () => {
      exitRetroSection();
      document.title = original;
      document.removeEventListener("fullscreenchange", handleFullscreen);
      exitDesktopFullscreen();
      releaseStartupSound();
      audio.current?.dispose();
    };
  }, []);

  useEffect(() => {
    const area = stage.current;
    const observer = new ResizeObserver(([{ contentRect: { width, height } }]) => {
      if (width && height) setViewport({ width, height });
    });
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (phase !== "starting" && phase !== "welcome") return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const starting = phase === "starting";
    if (!starting && sound) playStartupSound();
    const timer = setTimeout(
      () => setPhase(starting ? "signin" : "desktop"),
      reduced ? 240 : starting ? 2200 : 2000
    );
    return () => clearTimeout(timer);
  }, [phase, sound]);

  useEffect(() => {
    if (phase !== "desktop") screen.current?.focus({ preventScroll: true });
  }, [phase, viewport]);

  const toggles = {
    sound,
    // cameos,
    scanlines,
    fullscreen,
    focused,
    onSound() {
      if (!sound) unlockStartupSound();
      setSound(!sound);
    },
    onScanlines: () => {
      trackHiddenFeature("crt_scanlines_toggle");
      setScanlines(!scanlines);
    },
    // onCameos: () => setCameos((enabled) => !enabled),
    onFocus: () => {
      trackHiddenFeature("crt_zoom_toggle");
      setFocused(!focused);
    },
    onFullscreen: () => {
      trackHiddenFeature("crt_fullscreen_toggle");
      (fullscreen ? exitDesktopFullscreen : requestDesktopFullscreen)();
    },
  };
  const layout = viewport ? monitorLayout(viewport.width, viewport.height, focused) : null;
  const busy = ["starting", "welcome", "shutting_down"].includes(phase);
  const scale = layout ? Math.min(1, layout.glass.width / 392) : 1;

  return (
    <main
      className={`retro-station${isSmacking ? " retro-station-smack" : ""}`}
      ref={stage}
      aria-label="Retro computer"
    >
      {layout && (
        <>
          <div className="retro-monitor-shadow" aria-hidden="true" style={layout.shadow} />
          <img
            className="retro-station-image"
            src={`${base}retro/crt-monitor.webp`}
            alt="Front of a beige TVM MD-3 CRT monitor"
            style={layout.photo}
          />
          {tvGlitchActive && phase === "desktop" && (
            <div
              className={`retro-monitor-frame-hitbox${tvShowHint ? " is-hinting" : ""}`}
              style={layout.photo}
              onPointerDown={handleTvSmack}
              role="button"
              tabIndex={0}
              aria-label={`Hit the monitor frame to restore TV signal (${tvGlitchHits} of 3)`}
              title="Tap/hit the CRT monitor frame to restore signal"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleTvSmack();
                }
              }}
            />
          )}
          {powered && (
            <span
              className="retro-monitor-led"
              aria-hidden="true"
              style={{
                left: layout.led.left,
                top: layout.led.top,
                width: layout.led.size,
                height: layout.led.size,
              }}
            />
          )}
          <div
            className={`retro-glass ${scanlines ? "retro-glass-scanlines" : ""}${tvGlitchActive ? ` is-tv-glitching hits-${tvGlitchHits}` : ""}`}
            ref={screen}
            tabIndex={-1}
            style={{
              ...layout.glass,
              width: layout.glass.width / scale,
              height: layout.glass.height / scale,
              transform: `scale(${scale})`,
            }}
          >
            <div className={`retro-glass-content${phase === "desktop" ? " retro-glass-content--desktop" : ""}${busy ? " classic-busy" : ""}${tvBlackout ? " is-tv-blackout" : ""}`}
              style={{
                filter: display.brightness === 100 && display.contrast === 100 ? undefined
                  : `brightness(${display.brightness}%) contrast(${display.contrast}%)`
              }}>
              {phase === "off" ? (
                <div className="retro-off">
                  <p>Press the power button</p>
                  <div className="retro-off-links">
                    <button type="button" onClick={toggles.onFullscreen}>
                      {fullscreen ? "Exit full screen" : "Full screen"}
                    </button>
                    <Link to="/#search" onClick={() => exitRetroSection({ destinationSection: "search" })}>
                      Back to portfolio
                    </Link>
                  </div>
                </div>
              ) : phase === "starting" ? (
                <Startup onSkip={() => setPhase("signin")} />
              ) : phase === "signin" ? (
                <SignIn onSignIn={signIn} onPowerOff={initiateShutDown} />
              ) : phase === "welcome" ? (
                <Welcome />
              ) : phase === "shutting_down" ? (
                <ShuttingDown />
              ) : (
                <RetroDesktop
                  userName={RETRO_USER}
                  toggles={toggles}
                  onType={playTyping}
                  onRestart={powerOn}
                  onPowerOff={initiateShutDown}
                />
              )}
            </div>
            {tvGlitchActive && phase === "desktop" && (
              <CrtTvGlitch
                hits={tvGlitchHits}
                maxHits={3}
                showHint={tvShowHint}
              />
            )}
            {tvRestoredMsg && (
              <div className="retro-monitor-osd retro-monitor-osd-ok" role="status">
                ✓ SIGNAL RESTORED · CH-03
              </div>
            )}
            {adjustment && <div className="retro-monitor-osd" role="status">
              {adjustment} {display[adjustment]}%
            </div>}
          </div>
          {Object.entries(layout.controls).map(([id, position]) => {
            if (!position) return null;
            const label = id === "power" ? (powered ? "Power off" : "Power on")
              : `Adjust ${id} (${display[id]}%)`;
            return <button key={id} type="button" className="retro-monitor-power"
              aria-label={label} title={label} style={position}
              onClick={id === "power" ? (powered ? immediatePowerOff : powerOn) : () => adjustDisplay(id)} />;
          })}
        </>
      )}
    </main>
  );
}
