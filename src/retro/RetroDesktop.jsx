import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CircuitGrid, TileMatch } from "./RetroGames";
import { exitDesktopFullscreen, requestDesktopFullscreen } from "./fullscreen";
import "./retro.css";

const apps = {
  circuit: { name: "Circuit Grid", icon: "ϟ", Game: CircuitGrid },
  memory: { name: "Tile Match", icon: "◆", Game: TileMatch },
};

function DesktopClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(interval);
  }, []);
  return (
    <time className="retro-clock" dateTime={now.toISOString()}>
      {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
    </time>
  );
}

function AppWindow({ id, entry, top, onRaise, onMove, onMinimize, onMaximize, onClose }) {
  const { name, icon, Game } = apps[id];
  const drag = useRef(null);

  function startDrag(event) {
    if (event.button !== 0 || event.target.closest("button") || entry.maximized || innerWidth < 640) return;
    drag.current = { x: event.clientX - entry.x, y: event.clientY - entry.y };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (!drag.current) return;
    const bounds = event.currentTarget.closest(".retro-workspace").getBoundingClientRect();
    const width = event.currentTarget.clientWidth;
    onMove(Math.max(0, Math.min(bounds.width - width, event.clientX - drag.current.x)),
      Math.max(0, Math.min(bounds.height - 90, event.clientY - drag.current.y)));
  }

  return (
    <section
      className={`retro-window ${entry.maximized ? "retro-window-maximized" : ""}`}
      style={{ "--window-x": `${entry.x}px`, "--window-y": `${entry.y}px`, zIndex: top ? 12 : 11 }}
      hidden={entry.minimized}
      aria-labelledby={`retro-window-${id}`}
      onPointerDown={onRaise}
    >
      <header className="retro-window-titlebar" onPointerDown={startDrag} onPointerMove={moveDrag} onLostPointerCapture={() => { drag.current = null; }}>
        <h2 id={`retro-window-${id}`}><span aria-hidden="true">{icon}</span>{name}</h2>
        <div className="retro-window-controls">
          <button type="button" aria-label={`Minimize ${name}`} onClick={onMinimize}>−</button>
          <button type="button" aria-label={`${entry.maximized ? "Restore" : "Maximize"} ${name}`} onClick={onMaximize}>{entry.maximized ? "❐" : "□"}</button>
          <button type="button" aria-label={`Close ${name}`} onClick={onClose}>×</button>
        </div>
      </header>
      <Game />
    </section>
  );
}

export default function RetroDesktop() {
  const [booting, setBooting] = useState(true);
  const [windows, setWindows] = useState({});
  const [active, setActive] = useState(null);
  const [fullscreen, setFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const launcher = useRef(null);
  const desktop = useRef(null);
  const bootPhase = useRef(null);

  useEffect(() => {
    const originalTitle = document.title;
    document.title = "Meadow Desktop · Abhijeet Kad";
    function onFullscreenChange() { setFullscreen(Boolean(document.fullscreenElement)); }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.title = originalTitle;
      exitDesktopFullscreen();
    };
  }, []);

  useEffect(() => {
    if (!booting) {
      desktop.current?.focus({ preventScroll: true });
      return;
    }
    bootPhase.current?.focus({ preventScroll: true });
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = setTimeout(() => setBooting(false), reduced ? 200 : 2300);
    return () => clearTimeout(timer);
  }, [booting]);

  function editWindow(id, changes) {
    setWindows((current) => ({ ...current, [id]: { ...current[id], ...changes } }));
  }

  function launch(id) {
    if (launcher.current) launcher.current.open = false;
    setWindows((current) => {
      const offset = 28 * Object.keys(current).length;
      const x = Math.max(0, Math.min(window.innerWidth - 538, 128 + offset));
      const y = 36 + offset;
      return { ...current, [id]: { x, y, maximized: false, ...current[id], minimized: false } };
    });
    setActive(id);
  }

  function remove(id) {
    setWindows((current) => {
      const { [id]: closed, ...remaining } = current;
      return remaining;
    });
    if (active === id) setActive(null);
  }

  function minimize(id) {
    editWindow(id, { minimized: true });
    if (active === id) setActive(null);
  }

  const returnLink = <Link className="retro-toolbar-button" to="/#search" onClick={exitDesktopFullscreen}>Back to portfolio</Link>;

  if (booting) {
    return (
      <main className="retro-boot" tabIndex={-1} ref={bootPhase}>
        <div className="retro-boot-banner">
          <span className="retro-boot-mark" aria-hidden="true"><i /><i /><i /></span>
          <h1>Meadow Desktop</h1>
          <p role="status">Starting the desktop…</p>
          <div className="retro-boot-progress" aria-hidden="true"><span /></div>
        </div>
        <div className="retro-boot-actions">
          {returnLink}
          <button type="button" className="retro-toolbar-button" onClick={() => setBooting(false)}>Skip startup</button>
        </div>
      </main>
    );
  }

  return (
    <main className="retro-desktop" ref={desktop} tabIndex={-1}>
      <header className="retro-topbar">
        <h1><span aria-hidden="true">▱</span> Meadow Desktop</h1>
        <div className="retro-topbar-actions">
          <button type="button" className="retro-toolbar-button" onClick={fullscreen ? exitDesktopFullscreen : requestDesktopFullscreen}>
            {fullscreen ? "Exit full screen" : "Full screen"}
          </button>
          {returnLink}
        </div>
      </header>

      <div className="retro-workspace">
        <nav className="retro-shortcuts" aria-label="Desktop shortcuts">
          {Object.entries(apps).map(([id, { name, icon }]) => (
            <button type="button" key={id} onClick={() => launch(id)}>
              <span className={`retro-app-icon retro-icon-${id}`} aria-hidden="true">{icon}</span>
              <span>{name}</span>
            </button>
          ))}
        </nav>

        {Object.entries(windows).map(([id, entry]) => (
          <AppWindow
            key={id}
            id={id}
            entry={entry}
            top={id === active}
            onRaise={() => setActive(id)}
            onMove={(x, y) => editWindow(id, { x, y })}
            onMinimize={() => minimize(id)}
            onMaximize={() => editWindow(id, { maximized: !entry.maximized })}
            onClose={() => remove(id)}
          />
        ))}
      </div>

      <footer className="retro-dock" aria-label="Desktop taskbar">
        <details className="retro-launcher" ref={launcher}>
          <summary>Apps</summary>
          <div className="retro-launcher-menu">
            {Object.entries(apps).map(([id, { name, icon }]) => (
              <button type="button" key={id} onClick={() => launch(id)}><span aria-hidden="true">{icon}</span>{name}</button>
            ))}
            <button type="button" onClick={() => {
              setWindows({});
              setActive(null);
              setBooting(true);
            }}><span aria-hidden="true">↻</span>Restart desktop</button>
          </div>
        </details>
        <div className="retro-tasks">
          {Object.entries(windows).map(([id, entry]) => (
            <button type="button" key={id} aria-pressed={id === active && !entry.minimized} onClick={() => {
              if (id === active && !entry.minimized) minimize(id);
              else launch(id);
            }}>{apps[id].name}</button>
          ))}
        </div>
        <DesktopClock />
      </footer>
    </main>
  );
}
