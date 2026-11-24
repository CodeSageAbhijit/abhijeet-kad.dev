import { useState, useRef, useEffect, useCallback } from "react";

export default function RetroViceCity({ active = true }) {
  const [showControls, setShowControls] = useState(false);
  const [crtShader, setCrtShader] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // By default on localhost/127.0.0.1, direct iframe embedding is permitted by quenq.com's CSP.
  // In production (custom domain/Vercel), browsers enforce quenq's CSP frame-ancestors block,
  // so we display the authentic Windows XP Game Launcher by default with 1-click launch.
  const isLocalhost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname.endsWith(".local"));

  const [useIframe, setUseIframe] = useState(isLocalhost);

  const containerRef = useRef(null);
  const iframeRef = useRef(null);

  const launchStandalone = useCallback(() => {
    // Open in dedicated resizable game window
    const w = 1200;
    const h = 700;
    const left = Math.max(0, (window.screen.width - w) / 2);
    const top = Math.max(0, (window.screen.height - h) / 2);
    window.open(
      "https://quenqgta.com/gta-vice-city-online",
      "ViceCityPlayer",
      `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=no,status=no,toolbar=no,menubar=no`
    );
  }, []);

  const focusGame = useCallback(() => {
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.focus();
      }
    } catch {
      // Cross-origin safe
    }
  }, []);

  useEffect(() => {
    if (active && useIframe) {
      focusGame();
    }
  }, [active, useIframe, focusGame]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const doc = document;
    const fullscreenEl =
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement;

    if (!fullscreenEl && !isFullscreen) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => setIsFullscreen(true));
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen().catch(() => setIsFullscreen(false));
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else {
        setIsFullscreen(false);
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    function onFullscreenChange() {
      const doc = document;
      const isFs = Boolean(
        doc.fullscreenElement ||
          doc.webkitFullscreenElement ||
          doc.mozFullScreenElement ||
          doc.msFullscreenElement
      );
      setIsFullscreen(isFs);
      setTimeout(focusGame, 100);
    }

    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
    };
  }, [focusGame]);

  // Fullscreen shortcut 'F' when not in inputs
  useEffect(() => {
    function handleKeyDown(e) {
      if (!active) return;
      if (e.key === "f" || e.key === "F") {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          toggleFullscreen();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className={`retro-emulator-app ${isFullscreen ? "retro-emulator-fullscreen-fallback" : ""}`}
      onClick={focusGame}
    >
      {/* XP Window Toolbar */}
      <div className="retro-emulator-toolbar">
        <div className="retro-emulator-toolbar-left">
          <span className="retro-emulator-badge">PC / WebGL 3D</span>
          <span className="retro-emulator-file-tag">Grand Theft Auto: Vice City</span>
        </div>
        <div className="retro-emulator-toolbar-right">
          <button
            type="button"
            className="retro-emulator-tool-btn"
            onClick={launchStandalone}
            title="Launch in a standalone popup game window"
          >
            ↗ Launch Game
          </button>
          <button
            type="button"
            className={`retro-emulator-tool-btn ${!useIframe ? "active" : ""}`}
            onClick={() => setUseIframe(!useIframe)}
            title="Toggle between Iframe mode and Launcher mode"
          >
            {useIframe ? "🗔 Launcher View" : "🔲 Iframe Mode"}
          </button>
          <button
            type="button"
            className={`retro-emulator-tool-btn ${crtShader ? "active" : ""}`}
            onClick={() => setCrtShader(!crtShader)}
            title="Toggle CRT Scanline Shader"
          >
            📺 CRT {crtShader ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            className="retro-emulator-tool-btn"
            onClick={() => setShowControls(!showControls)}
            title="View keyboard and mouse controls"
          >
            🎮 Controls
          </button>
          <button
            type="button"
            className="retro-emulator-tool-btn"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen (or press F)"
          >
            {isFullscreen ? "🗗 Windowed" : "⛶ Fullscreen"}
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="retro-emulator-viewport" style={{ position: "relative", overflow: "hidden" }}>
        {useIframe ? (
          <div className="retro-emulator-stage" style={{ width: "100%", height: "100%", maxWidth: "100%" }}>
            <iframe
              ref={iframeRef}
              src="https://vc.quenq.com/"
              title="Grand Theft Auto: Vice City"
              className="retro-emulator-iframe"
              width="100%"
              height="100%"
              allowFullScreen
              allow="gamepad; fullscreen; autoplay; keyboard-map"
              credentialless=""
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
                background: "#000000",
              }}
            />
          </div>
        ) : (
          /* Authentic Windows XP Vice City Game Launcher */
          <div className="retro-vc-launcher">
            <div className="retro-vc-launcher-banner">
              <div className="retro-vc-neon-badge">1986 // MIAMI BEACH</div>
              <h1 className="retro-vc-title">GRAND THEFT AUTO</h1>
              <div className="retro-vc-sub">VICE CITY</div>
              <p className="retro-vc-tagline">
                PC 3D Edition · Tommy Vercetti · WebGL / WebAssembly
              </p>
            </div>

            <div className="retro-vc-launcher-body">
              <div className="retro-vc-notice">
                <span className="retro-vc-notice-icon">ℹ️</span>
                <div className="retro-vc-notice-text">
                  The upstream game server (<code>vc.quenq.com</code>) restricts direct iframe embedding on third-party production domains via browser security policies. Launch the standalone game window below to play at full 60 FPS with complete controller, audio, and save support!
                </div>
              </div>

              <div className="retro-vc-actions">
                <button
                  type="button"
                  className="retro-vc-play-btn"
                  onClick={launchStandalone}
                >
                  <span className="retro-vc-play-icon">▶</span>
                  <span>PLAY VICE CITY ONLINE</span>
                </button>
                <button
                  type="button"
                  className="retro-vc-secondary-btn"
                  onClick={() => setUseIframe(true)}
                  title="Attempt to load the iframe inside this window (only works on localhost)"
                >
                  Try In-Window Iframe (Localhost Only)
                </button>
              </div>

              <div className="retro-vc-controls-strip">
                <div className="retro-vc-ctrl-item">
                  <strong>WASD</strong> <span>Move / Drive</span>
                </div>
                <div className="retro-vc-ctrl-item">
                  <strong>Mouse</strong> <span>Look & Aim</span>
                </div>
                <div className="retro-vc-ctrl-item">
                  <strong>Space</strong> <span>Jump / Handbrake</span>
                </div>
                <div className="retro-vc-ctrl-item">
                  <strong>F / Enter</strong> <span>Enter Vehicle</span>
                </div>
                <div className="retro-vc-ctrl-item">
                  <strong>Shift</strong> <span>Sprint</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Optional CRT Scanline Shader Overlay */}
        {crtShader && (
          <div
            className="retro-emulator-crt-overlay"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 255, 0, 0.04))",
              backgroundSize: "100% 3px, 4px 100%",
              zIndex: 10,
            }}
          />
        )}

        {/* Controls Modal Overlay */}
        {showControls && (
          <div
            className="retro-emulator-controls-overlay"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(10, 10, 20, 0.88)",
              backdropFilter: "blur(3px)",
              zIndex: 20,
              padding: "16px",
              overflowY: "auto",
              color: "#ffffff",
              fontFamily: "Tahoma, sans-serif",
              fontSize: "12px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", borderBottom: "1px solid #ff007f", paddingBottom: "6px" }}>
              <strong style={{ fontSize: "14px", color: "#00ffff", letterSpacing: "1px" }}>
                🌴 GTA: VICE CITY CONTROLS CHEAT SHEET
              </strong>
              <button
                type="button"
                className="retro-emulator-tool-btn"
                onClick={() => setShowControls(false)}
                style={{ cursor: "pointer", padding: "2px 8px" }}
              >
                ✕ Close
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", lineHeight: "1.6" }}>
              <div>
                <h4 style={{ color: "#ff77a8", margin: "0 0 4px 0", fontSize: "12px" }}>On Foot Controls:</h4>
                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                  <li><strong>W, A, S, D:</strong> Move Tommy</li>
                  <li><strong>Mouse:</strong> Look / Free camera</li>
                  <li><strong>Left Click:</strong> Attack / Fire weapon</li>
                  <li><strong>Right Click:</strong> Target lock / Aim</li>
                  <li><strong>Space:</strong> Jump</li>
                  <li><strong>Left Shift:</strong> Sprint</li>
                  <li><strong>C:</strong> Crouch</li>
                  <li><strong>F / Enter:</strong> Enter vehicle / Action</li>
                  <li><strong>Mouse Wheel / Q, E:</strong> Switch weapon</li>
                  <li><strong>Tab:</strong> Answer pager / phone</li>
                </ul>
              </div>

              <div>
                <h4 style={{ color: "#ff77a8", margin: "0 0 4px 0", fontSize: "12px" }}>Vehicle Controls:</h4>
                <ul style={{ margin: 0, paddingLeft: "18px" }}>
                  <li><strong>W:</strong> Accelerate / Drive forward</li>
                  <li><strong>S:</strong> Reverse / Brake</li>
                  <li><strong>A, D:</strong> Steer left / right</li>
                  <li><strong>Space:</strong> Handbrake / Drift</li>
                  <li><strong>Left Click / Ctrl:</strong> Drive-by shooting</li>
                  <li><strong>Q, E:</strong> Look left / right</li>
                  <li><strong>Left Shift / Num 0:</strong> Horn / Siren</li>
                  <li><strong>R:</strong> Change radio station</li>
                  <li><strong>Caps Lock:</strong> Trigger vigilante/taxi mission</li>
                  <li><strong>F / Enter:</strong> Exit vehicle</li>
                </ul>
              </div>
            </div>

            <div style={{ marginTop: "14px", padding: "8px 10px", background: "rgba(255, 0, 128, 0.15)", border: "1px solid rgba(255, 0, 128, 0.4)", borderRadius: "4px" }}>
              <p style={{ margin: 0, fontSize: "11px", color: "#fbcfe8" }}>
                💡 <strong>Saving Game Progress:</strong> When you complete missions, visit Tommy&apos;s safehouse (Ocean View Hotel) and walk into the floating floppy disk icon to save your progress in browser local storage.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="retro-emulator-footer">
        <span>🎮 WASD: Move | Mouse: Look & Shoot | F/Enter: Vehicle | Space: Jump/Brake</span>
        <span className="retro-emulator-disclaimer">Grand Theft Auto: Vice City © Rockstar Games. WebGL port by Quenq.</span>
      </div>
    </div>
  );
}
