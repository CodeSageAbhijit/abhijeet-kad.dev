import { useState, useRef, useEffect, useCallback } from "react";

export default function RetroViceCity({ active = true }) {
  const [showControls, setShowControls] = useState(false);
  const [crtShader, setCrtShader] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef(null);
  const iframeRef = useRef(null);

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
    if (active) {
      focusGame();
    }
  }, [active, focusGame]);

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
            onClick={() => window.open("https://vc.quenq.com/", "_blank")}
            title="Open in a new standalone browser tab"
          >
            ↗ Popout
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

        {/* Optional CRT Scanline Shader Overlay */}
        {crtShader && (
          <div
            className="retro-emulator-crt-overlay"
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background:
                "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.35) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.04), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.04))",
              backgroundSize: "100% 3px, 4px 100%",
              zIndex: 10,
            }}
          />
        )}

        {/* Controls Cheat Sheet Modal */}
        {showControls && (
          <div className="retro-emulator-controls-overlay" onClick={() => setShowControls(false)}>
            <div className="retro-emulator-controls-modal" onClick={(e) => e.stopPropagation()}>
              <div className="retro-emulator-modal-header">
                <h4>GTA: Vice City Controls (PC)</h4>
                <button type="button" onClick={() => setShowControls(false)}>
                  ×
                </button>
              </div>
              <div className="retro-emulator-modal-body">
                <div className="retro-controls-grid">
                  <div className="retro-controls-section">
                    <h5>⌨ Movement & On Foot</h5>
                    <table>
                      <tbody>
                        <tr>
                          <td><strong>Move</strong></td>
                          <td><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or Arrows</td>
                        </tr>
                        <tr>
                          <td><strong>Look / Aim</strong></td>
                          <td>Mouse cursor</td>
                        </tr>
                        <tr>
                          <td><strong>Attack / Shoot</strong></td>
                          <td>Left Click or <kbd>Ctrl</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Aim Weapon</strong></td>
                          <td>Right Click</td>
                        </tr>
                        <tr>
                          <td><strong>Sprint</strong></td>
                          <td><kbd>Shift</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Jump</strong></td>
                          <td><kbd>Space</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Crouch</strong></td>
                          <td><kbd>C</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Change Weapon</strong></td>
                          <td>Mouse Wheel or <kbd>Tab</kbd></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="retro-controls-section">
                    <h5>🚗 Vehicles & Menus</h5>
                    <table>
                      <tbody>
                        <tr>
                          <td><strong>Enter / Exit Car</strong></td>
                          <td><kbd>F</kbd> or <kbd>Enter</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Steer / Accelerate</strong></td>
                          <td><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Handbrake</strong></td>
                          <td><kbd>Space</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Radio Station</strong></td>
                          <td><kbd>R</kbd> or Mouse Wheel</td>
                        </tr>
                        <tr>
                          <td><strong>Horn / Siren</strong></td>
                          <td><kbd>Shift</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Look Left / Right</strong></td>
                          <td><kbd>Q</kbd> / <kbd>E</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Look Behind</strong></td>
                          <td><kbd>Caps Lock</kbd></td>
                        </tr>
                        <tr>
                          <td><strong>Pause / Menu</strong></td>
                          <td><kbd>Esc</kbd></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <footer className="retro-emulator-footer">
        <div className="retro-emulator-help-hint">
          ⌨ WASD: Move | Mouse: Look & Shoot | F/Enter: Vehicle | Space: Jump/Brake | Fullscreen: F
        </div>
        <div className="retro-emulator-disclaimer">
          Grand Theft Auto: Vice City © Rockstar Games. WebGL port by Quenq.
        </div>
      </footer>
    </div>
  );
}
