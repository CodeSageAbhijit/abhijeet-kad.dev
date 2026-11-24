import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Console metadata specifications
 */
export const CONSOLE_SPECS = {
  mario: {
    id: "mario",
    title: "Super Mario Bros.",
    system: "Nintendo Entertainment System",
    core: "nes",
    aspectRatio: "4/3",
    fileExts: ".nes,.zip",
    fileDesc: "NES ROM (.nes, .zip)",
  },
  sonic: {
    id: "sonic",
    title: "Sonic the Hedgehog",
    system: "Sega Genesis / Mega Drive",
    core: "segaMD",
    aspectRatio: "4/3",
    fileExts: ".bin,.md,.gen,.smd,.zip",
    fileDesc: "Genesis ROM (.bin, .md, .gen, .zip)",
  },
  pokemon: {
    id: "pokemon",
    title: "Pokémon Emerald",
    system: "Game Boy Advance",
    core: "gba",
    aspectRatio: "3/2",
    fileExts: ".gba,.zip",
    fileDesc: "GBA ROM (.gba, .zip)",
  },
  gta: {
    id: "gta",
    title: "Grand Theft Auto: Chinatown Wars",
    system: "Nintendo DS",
    core: "nds",
    aspectRatio: "2/3",
    fileExts: ".nds,.zip",
    fileDesc: "Nintendo DS ROM (.nds, .zip)",
    needsCpuNote: true,
  },
  zelda: {
    id: "zelda",
    title: "The Legend of Zelda: A Link to the Past",
    system: "Super Nintendo (SNES)",
    core: "snes",
    aspectRatio: "4/3",
    fileExts: ".smc,.sfc,.zip",
    fileDesc: "SNES ROM (.smc, .sfc, .zip)",
  },
  pacman: {
    id: "pacman",
    title: "Pac-Man",
    system: "NES / Arcade",
    core: "nes",
    aspectRatio: "4/3",
    fileExts: ".nes,.zip",
    fileDesc: "NES / Arcade ROM (.nes, .zip)",
  },
};

export default function RetroEmulatorApp({ gameId = "mario", active = true }) {
  const spec = CONSOLE_SPECS[gameId] || CONSOLE_SPECS.mario;

  const [gameUrl, setGameUrl] = useState("");
  const [biosUrl, setBiosUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [isPreconfigured, setIsPreconfigured] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [crtShader, setCrtShader] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const containerRef = useRef(null);
  const iframeRef = useRef(null);
  const fileBlobRef = useRef(null);
  const biosBlobRef = useRef(null);

  // Check /roms/games.json for optional pre-configured ROMs
  useEffect(() => {
    let isMounted = true;
    async function loadGamesConfig() {
      try {
        const res = await fetch("/roms/games.json");
        if (res.ok) {
          const list = await res.json();
          const match = Array.isArray(list) ? list.find((g) => g.id === gameId) : null;
          if (match && match.gameUrl && match.gameUrl.trim().length > 0) {
            if (isMounted) {
              setGameUrl(match.gameUrl.trim());
              setFileName(match.title || match.gameUrl);
              setIsPreconfigured(true);
              if (match.biosUrl) setBiosUrl(match.biosUrl.trim());
            }
          }
        }
      } catch {
        // Fallback to "Bring your own file" mode
      } finally {
        if (isMounted) setLoadingConfig(false);
      }
    }
    loadGamesConfig();
    return () => {
      isMounted = false;
    };
  }, [gameId]);

  // Clean up any generated blob URLs when component unmounts or ROM is changed
  const cleanupBlobs = useCallback(() => {
    if (fileBlobRef.current) {
      URL.revokeObjectURL(fileBlobRef.current);
      fileBlobRef.current = null;
    }
    if (biosBlobRef.current) {
      URL.revokeObjectURL(biosBlobRef.current);
      biosBlobRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupBlobs();
    };
  }, [cleanupBlobs]);

  // Handle local file drop or selection
  function handleFileSelected(file) {
    if (!file) return;
    cleanupBlobs();
    const url = URL.createObjectURL(file);
    fileBlobRef.current = url;
    setGameUrl(url);
    setFileName(file.name);
  }

  function handleBiosSelected(file) {
    if (!file) return;
    if (biosBlobRef.current) URL.revokeObjectURL(biosBlobRef.current);
    const url = URL.createObjectURL(file);
    biosBlobRef.current = url;
    setBiosUrl(url);
  }

  function handleEject() {
    cleanupBlobs();
    setGameUrl("");
    setBiosUrl("");
    setFileName("");
    setIsPreconfigured(false);
  }

  // Refocus iframe canvas when window is clicked or active
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
    if (active && gameUrl) {
      focusGame();
    }
  }, [active, gameUrl, focusGame]);

  // Handle Fullscreen via Fullscreen API with iOS Safari fallback
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
        // iOS Safari fallback
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

  // Forward keys to the emulator iframe and prevent scrolling / OS navigation while playing
  useEffect(() => {
    function handleParentKeyEvent(e) {
      if (!active || !gameUrl) return;

      // Fullscreen shortcut 'F' (when not inside an input field)
      if ((e.key === "f" || e.key === "F") && e.type === "keydown") {
        if (e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
          toggleFullscreen();
          return;
        }
      }

      const gameKeys = [
        "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
        " ", "Enter", "Shift", "x", "X", "z", "Z", "s", "S", "a", "A", "q", "Q", "e", "E", "c", "C", "d", "D"
      ];

      if (gameKeys.includes(e.key) && e.target.tagName !== "INPUT" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        try {
          if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
              type: "RETRO_KEY_EVENT",
              eventType: e.type,
              keyCode: e.keyCode,
              key: e.key,
              code: e.code
            }, "*");
          }
        } catch {
          // Cross-origin safe
        }
      }
    }

    window.addEventListener("keydown", handleParentKeyEvent, { passive: false });
    window.addEventListener("keyup", handleParentKeyEvent, { passive: false });
    return () => {
      window.removeEventListener("keydown", handleParentKeyEvent);
      window.removeEventListener("keyup", handleParentKeyEvent);
    };
  }, [active, gameUrl, toggleFullscreen]);

  // Resolve gameUrl to an absolute URL so that fetch/XHR inside the emulator iframe always succeeds
  const resolvedGameUrl = gameUrl
    ? gameUrl.startsWith("http:") || gameUrl.startsWith("https:") || gameUrl.startsWith("blob:") || gameUrl.startsWith("data:")
      ? gameUrl
      : `${window.location.origin}${gameUrl.startsWith("/") ? "" : "/"}${gameUrl}`
    : "";

  const emulatorSrc = gameUrl
    ? `/retro/emulator.html?core=${encodeURIComponent(spec.core)}&gameName=${encodeURIComponent(
        spec.title
      )}&gameUrl=${encodeURIComponent(resolvedGameUrl)}${
        biosUrl ? `&biosUrl=${encodeURIComponent(biosUrl)}` : ""
      }${crtShader ? "&shader=crt" : ""}`
    : "";

  return (
    <div
      ref={containerRef}
      className={`retro-emulator-app ${isFullscreen ? "retro-emulator-fullscreen-fallback" : ""}`}
      onClick={focusGame}
    >
      {/* Emulator XP Toolbar */}
      <div className="retro-emulator-toolbar">
        <div className="retro-emulator-toolbar-left">
          <span className="retro-emulator-badge">{spec.system}</span>
          {fileName && <span className="retro-emulator-file-tag">{fileName}</span>}
        </div>
        <div className="retro-emulator-toolbar-right">
          {gameUrl && (
            <button
              type="button"
              className="retro-emulator-tool-btn"
              onClick={handleEject}
              title="Eject / Select another game file"
            >
              ⏏ Eject
            </button>
          )}
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
            title="View keyboard and gamepad cheat-sheet"
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
      <div className="retro-emulator-viewport">
        {loadingConfig ? (
          <div className="retro-emulator-loading">
            <span className="retro-emulator-spinner">⌛</span>
            <span>Checking configuration...</span>
          </div>
        ) : !gameUrl ? (
          /* XP Styled "Bring your own file" Dialog */
          <div className="retro-emulator-dialog-wrapper">
            <div
              className={`retro-emulator-dialog ${isDragOver ? "drag-over" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelected(e.dataTransfer.files[0]);
                }
              }}
            >
              <div className="retro-emulator-dialog-header">
                <h3>Select Game File: {spec.title}</h3>
                <p>Drag and drop your console ROM or click browse to play.</p>
              </div>

              <div className="retro-emulator-dropzone">
                <div className="retro-emulator-drop-icon">💾</div>
                <div className="retro-emulator-drop-text">
                  Drop <strong>{spec.fileDesc}</strong> here
                </div>
                <div className="retro-emulator-drop-sub">Local playback only — nothing is uploaded</div>

                <label className="retro-native-button retro-file-picker-label">
                  Browse File...
                  <input
                    type="file"
                    accept={spec.fileExts}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelected(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              {spec.needsCpuNote && (
                <div className="retro-emulator-ds-note">
                  <div className="retro-emulator-note-badge">NOTE FOR NINTENDO DS</div>
                  <p>
                    Nintendo DS uses dual stacked screens (256×384) with touchscreen input.
                    Use your mouse cursor on the bottom screen as the touch stylus.
                  </p>
                  <p className="retro-emulator-perf-warning">
                    ⚠️ DS emulation requires more CPU resources and may run slowly on low-power devices.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Running Game Emulator Frame */
          <div
            className={`retro-emulator-stage ${
              spec.aspectRatio === "3/2"
                ? "retro-aspect-3-2"
                : spec.aspectRatio === "2/3"
                ? "retro-aspect-2-3"
                : "retro-aspect-4-3"
            }`}
          >
            <iframe
              key={`${gameId}-${resolvedGameUrl}-${crtShader}`}
              ref={iframeRef}
              title={`Emulator - ${spec.title}`}
              src={emulatorSrc}
              className="retro-emulator-iframe"
              allow="autoplay; fullscreen; gamepad"
            />
          </div>
        )}

        {/* Controls Cheat Sheet Modal */}
        {showControls && (
          <div className="retro-emulator-controls-overlay" onClick={() => setShowControls(false)}>
            <div className="retro-emulator-controls-modal" onClick={(e) => e.stopPropagation()}>
              <div className="retro-emulator-modal-header">
                <h4>Game Controls Cheat-Sheet</h4>
                <button type="button" onClick={() => setShowControls(false)}>
                  ×
                </button>
              </div>
              <div className="retro-emulator-modal-body">
                <div className="retro-controls-grid">
                  <div className="retro-controls-section">
                    <h5>⌨ Keyboard Layout ({spec.system})</h5>
                    <table>
                      <tbody>
                        <tr>
                          <td><strong>D-Pad</strong></td>
                          <td>Arrow Keys (↑, ↓, ←, →)</td>
                        </tr>
                        {spec.core === "segaMD" ? (
                          <>
                            <tr>
                              <td><strong>A Button</strong></td>
                              <td><kbd>Z</kbd></td>
                            </tr>
                            <tr>
                              <td><strong>B Button</strong></td>
                              <td><kbd>X</kbd></td>
                            </tr>
                            <tr>
                              <td><strong>C Button</strong></td>
                              <td><kbd>C</kbd></td>
                            </tr>
                            <tr>
                              <td><strong>X / Y / Z</strong></td>
                              <td><kbd>A</kbd> / <kbd>S</kbd> / <kbd>D</kbd></td>
                            </tr>
                            <tr>
                              <td><strong>Start</strong></td>
                              <td><kbd>Enter</kbd></td>
                            </tr>
                            <tr>
                              <td><strong>Mode</strong></td>
                              <td><kbd>Shift</kbd></td>
                            </tr>
                          </>
                        ) : (
                          <>
                            <tr>
                              <td><strong>A Button</strong></td>
                              <td><kbd>X</kbd></td>
                            </tr>
                            <tr>
                              <td><strong>B Button</strong></td>
                              <td><kbd>Z</kbd></td>
                            </tr>
                            {(spec.core === "snes" || spec.core === "nds") && (
                              <>
                                <tr>
                                  <td><strong>X Button</strong></td>
                                  <td><kbd>S</kbd></td>
                                </tr>
                                <tr>
                                  <td><strong>Y Button</strong></td>
                                  <td><kbd>A</kbd></td>
                                </tr>
                              </>
                            )}
                            {(spec.core === "snes" || spec.core === "nds" || spec.core === "gba") && (
                              <>
                                <tr>
                                  <td><strong>L Shoulder</strong></td>
                                  <td><kbd>Q</kbd></td>
                                </tr>
                                <tr>
                                  <td><strong>R Shoulder</strong></td>
                                  <td><kbd>E</kbd></td>
                                </tr>
                              </>
                            )}
                            <tr>
                              <td><strong>Start</strong></td>
                              <td><kbd>Enter</kbd></td>
                            </tr>
                            <tr>
                              <td><strong>Select</strong></td>
                              <td><kbd>Shift</kbd></td>
                            </tr>
                          </>
                        )}
                        <tr>
                          <td><strong>Fullscreen</strong></td>
                          <td><kbd>F</kbd></td>
                        </tr>
                        {spec.core === "nds" && (
                          <tr>
                            <td><strong>DS Stylus</strong></td>
                            <td>Mouse click & drag on bottom screen</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="retro-controls-section">
                    <h5>🎮 Gamepad & Features</h5>
                    <p>Standard USB & Bluetooth controllers are automatically mapped.</p>
                    <ul>
                      {spec.aspectRatio === "2/3" && (
                        <li><strong>Touchscreen:</strong> The bottom DS screen responds directly to mouse clicks and drag gestures.</li>
                      )}
                      <li><strong>Remapping:</strong> Click the in-emulator ⚙ gear menu to rebind any key or controller button.</li>
                      <li><strong>Touch:</strong> On-screen virtual gamepad enabled on touchscreens.</li>
                      <li><strong>Save States:</strong> Available directly from the emulator menu. Progress is saved locally in your browser.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Disclaimer */}
      <footer className="retro-emulator-footer">
        <div className="retro-emulator-help-hint">
          ⌨ D-Pad: Arrows | A: X | B: Z | Start: Enter | Select: Shift {spec.aspectRatio === "2/3" ? "| Stylus: Mouse on bottom screen" : "| Fullscreen: F"}
        </div>
        <div className="retro-emulator-disclaimer">
          Game files are provided by the user. All trademarks belong to their respective owners.
        </div>
      </footer>
    </div>
  );
}
