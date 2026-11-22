import { useEffect, useRef, useState } from "react";
// import { useCallback } from "react";
import { Link } from "react-router-dom";
import { CircuitGrid, PacketRun, TileMatch } from "./RetroGames";
import { DisplaySettings, Notes, PortfolioBrowser, ProjectFiles } from "./RetroPrograms";
import RetroCalendar from "./RetroCalendar";
// import RetroCameo, { cartoonCameos } from "./RetroCameo";
import RetroPictures from "./RetroPictures";
import { loadOpenWindows, saveOpenWindows } from "./windowStorage";
import RetroPinball from "./pinball/RetroPinball";
import { playWindowSound } from "./startupSound";
import {
  ControlPanelIcon,
  InternetExplorerIcon,
  MyComputerIcon,
  NotepadIcon,
  PaintIcon,
  PalmAvatar,
  PinballIcon,
  TurnOffComputerIcon,
  WindowsFlagIcon,
  WindowsMediaPlayerIcon,
} from "./RetroIcons";

const applications = {
  browser: {
    name: "Internet Explorer - IE7",
    shortName: "Internet Explorer",
    icon: <InternetExplorerIcon size={16} />,
    largeIcon: <InternetExplorerIcon size={32} />,
    width: 730,
    height: 485,
    Program: PortfolioBrowser,
  },
  files: {
    name: "Projects",
    shortName: "Projects",
    icon: <MyComputerIcon size={16} />,
    largeIcon: <MyComputerIcon size={32} />,
    width: 630,
    height: 440,
    Program: ProjectFiles,
  },
  notes: {
    name: "Untitled - Notepad",
    shortName: "Notepad",
    icon: <NotepadIcon size={16} />,
    largeIcon: <NotepadIcon size={32} />,
    width: 480,
    height: 350,
    Program: Notes,
  },
  pinball: {
    name: "Midnight Transit Pinball",
    shortName: "Pinball",
    icon: <PinballIcon size={16} />,
    largeIcon: <PinballIcon size={32} />,
    width: 600,
    height: 520,
    Program: RetroPinball,
  },
  pictures: {
    name: "Pictures",
    shortName: "Pictures",
    icon: <PaintIcon size={16} />,
    largeIcon: <PaintIcon size={32} />,
    width: 580,
    height: 410,
    Program: RetroPictures,
  },
  settings: {
    name: "Control Panel",
    shortName: "Control Panel",
    icon: <ControlPanelIcon size={16} />,
    largeIcon: <ControlPanelIcon size={32} />,
    width: 420,
    height: 290,
    Program: DisplaySettings,
  },
  calendar: {
    name: "Date and Time Properties",
    shortName: "Calendar",
    icon: <MyComputerIcon size={16} />,
    largeIcon: <MyComputerIcon size={32} />,
    width: 320,
    height: 360,
    Program: RetroCalendar,
  },
  games: {
    name: "Games",
    shortName: "Games",
    icon: <PinballIcon size={16} />,
    largeIcon: <PinballIcon size={32} />,
    width: 370,
    height: 290,
    Program: Games,
  },
  memory: { name: "Tile Match", shortName: "Tile Match", icon: <PinballIcon size={16} />, width: 410, height: 435, Program: TileMatch },
  circuit: { name: "Circuit Grid", shortName: "Circuit Grid", icon: <PinballIcon size={16} />, width: 410, height: 435, Program: CircuitGrid },
  packet: { name: "Packet Run", shortName: "Packet Run", icon: <PinballIcon size={16} />, width: 420, height: 443, Program: PacketRun },
};

const desktopShortcuts = ["browser", "files", "pictures", "notes", "pinball"];
const startPrograms = ["browser", "notes", "pinball", "games"];
const startPlaces = ["files", "pictures", "calendar", "settings"];

function Games({ onLaunch }) {
  return (
    <div className="retro-game-list">
      {["pinball", "memory", "circuit", "packet"].map((id) => (
        <button type="button" className="retro-native-button" key={id} onClick={() => onLaunch(id)}>
          {applications[id].icon} {applications[id].name}
        </button>
      ))}
    </div>
  );
}

function DesktopClock({ onOpen }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      type="button"
      className="retro-clock"
      onClick={onOpen}
      aria-label="Open Date and Time Properties"
      title={now.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
    >
      <time dateTime={now.toISOString()}>
        {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </time>
    </button>
  );
}

function AppWindow({ id, entry, onRaise, onMove, onMinimize, onMaximize, onClose, children }) {
  const { name, width, height, icon } = applications[id];
  const drag = useRef(null);

  function startDrag(event) {
    if (event.button !== 0 || event.target.closest("button") || entry.maximized) return;
    const windowEl = event.currentTarget.parentElement;
    const glass = windowEl.closest(".retro-glass");
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      left: windowEl.offsetLeft,
      top: windowEl.offsetTop,
      inverse: new DOMMatrix(getComputedStyle(glass).transform).inverse(),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (!drag.current) return;
    const area = event.currentTarget.closest(".retro-workspace");
    const start = drag.current;
    const delta = start.inverse.transformPoint(new DOMPoint(event.clientX - start.x, event.clientY - start.y));
    const x = start.left + delta.x;
    const y = start.top + delta.y;
    onMove(
      Math.max(2, Math.min(area.clientWidth - event.currentTarget.offsetWidth - 4, x)),
      Math.max(2, Math.min(area.clientHeight - 78, y))
    );
  }

  return (
    <section
      className={`retro-window retro-window-${id} ${entry.maximized ? "retro-window-maximized" : ""}`}
      aria-labelledby={`retro-window-${id}`}
      hidden={entry.minimized}
      style={{
        "--window-x": `${entry.x}px`,
        "--window-y": `${entry.y}px`,
        "--window-width": `${width}px`,
        "--window-height": `${height}px`,
        zIndex: entry.order,
      }}
      onPointerDown={onRaise}
      onFocus={onRaise}
    >
      <header
        className="retro-window-titlebar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onLostPointerCapture={() => {
          drag.current = null;
        }}
      >
        <h2 id={`retro-window-${id}`}>
          {icon}
          <span>{name}</span>
        </h2>
        <div className="retro-window-controls">
          <button type="button" aria-label={`Minimize ${name}`} onClick={onMinimize} title="Minimize">
            −
          </button>
          <button
            type="button"
            aria-label={`${entry.maximized ? "Restore" : "Maximize"} ${name}`}
            onClick={onMaximize}
            title={entry.maximized ? "Restore Down" : "Maximize"}
          >
            {entry.maximized ? "❐" : "□"}
          </button>
          <button type="button" aria-label={`Close ${name}`} onClick={onClose} title="Close">
            ×
          </button>
        </div>
      </header>
      {children}
    </section>
  );
}

function initialWindows() {
  const restored = loadOpenWindows().filter((id) => id !== "browser" && Object.hasOwn(applications, id));
  return {
    browser: { x: 75, y: 8, order: restored.length + 1, minimized: false, maximized: false },
    ...Object.fromEntries(restored.map((id, index) => [
      id, { x: 42, y: 12, order: index + 1, minimized: true, maximized: false },
    ])),
  };
}

export default function RetroDesktop({ userName, toggles, onType, onRestart, onPowerOff }) {
  const [windows, setWindows] = useState(initialWindows);
  // Cartoon cameos are paused. Media and component source are kept for later.
  // const [cameo, setCameo] = useState({ scene: "welcome", take: 0 });
  // const cameoTake = useRef(0);
  // const lastCameo = useRef("welcome");
  // const seenCameos = useRef(new Set(["welcome"]));
  // const dismissCameo = useCallback(() => setCameo(null), []);
  const desktop = useRef(null);
  const menu = useRef(null);
  const order = useRef(Object.keys(windows).length + 2);
  const desktopSnapshot = useRef([]);
  const savedWindowIds = useRef("");

  useEffect(() => desktop.current?.focus({ preventScroll: true }), []);
  useEffect(() => {
    const ids = Object.keys(windows);
    const key = ids.join(",");
    if (savedWindowIds.current === key) return;
    savedWindowIds.current = key;
    saveOpenWindows(ids);
  }, [windows]);

  function edit(id, changes) {
    setWindows((current) => ({ ...current, [id]: { ...current[id], ...changes } }));
  }

  function raise(id) {
    if (windows[id]?.order === order.current && !windows[id]?.minimized) return;
    order.current += 1;
    edit(id, { order: order.current, minimized: false });
  }

  // function showCameo(scene, replay = false) {
    // if (!toggles.cameos || !Object.hasOwn(cartoonCameos, scene)) return;
    // if (!replay && seenCameos.current.has(scene)) return;
    // seenCameos.current.add(scene);
    // lastCameo.current = scene;
    // setCameo({ scene, take: ++cameoTake.current });
  // }

  function launch(id, options = {}) {
    if (toggles.sound) playWindowSound("open");
    // if (id === "files") showCameo("projects");
    // else if (id !== "browser") dismissCameo();
    order.current += 1;
    const top = order.current;
    if (menu.current) menu.current.open = false;
    desktopSnapshot.current = [];
    setWindows((current) => {
      const offset = (Object.keys(current).length % 5) * 16;
      const position =
        id === "pinball"
          ? { x: 40, y: 10 }
          : { x: 60 + offset, y: 20 + offset };
      return {
        ...current,
        [id]: { ...position, maximized: false, ...current[id], ...options, order: top, minimized: false },
      };
    });
  }

  function remove(id) {
    if (toggles.sound) playWindowSound("close");
    setWindows((current) => {
      const { [id]: closed, ...remaining } = current;
      return remaining;
    });
  }

  const visible = Object.entries(windows).filter(([, entry]) => !entry.minimized);
  const active = visible.reduce((top, pair) => (pair[1].order > (top?.[1].order ?? 0) ? pair : top), null)?.[0];

  function minimize(id) {
    if (toggles.sound) playWindowSound("minimize");
    edit(id, { minimized: true });
  }

  function toggleDesktop() {
    const restore = desktopSnapshot.current;
    const ids = restore.length ? restore : visible.map(([id]) => id);
    desktopSnapshot.current = restore.length ? [] : ids;
    setWindows((current) =>
      Object.fromEntries(
        Object.entries(current).map(([id, entry]) => [
          id,
          ids.includes(id) ? { ...entry, minimized: !restore.length } : entry,
        ])
      )
    );
  }

  return (
    <div className="retro-desktop" ref={desktop} tabIndex={-1} onKeyDown={onType}>
      {/* Workspace with Desktop Icons and Active Windows */}
      <div
        className="retro-workspace"
        onPointerDown={(event) => {
          if (event.target === event.currentTarget && menu.current) menu.current.open = false;
        }}
      >
        {/* Classic Windows XP Desktop Shortcuts (left vertical column) */}
        <nav className="retro-shortcuts" aria-label="Desktop shortcuts">
          {desktopShortcuts.map((id) => (
            <button type="button" key={id} onClick={() => launch(id)}>
              <div className="retro-shortcut-icon-frame">{applications[id].largeIcon}</div>
              <span>{applications[id].shortName}</span>
            </button>
          ))}
        </nav>

        {/* Floating App Windows */}
        {Object.entries(windows).map(([id, entry]) => {
          const { Program } = applications[id];
          return (
            <AppWindow
              key={id}
              id={id}
              entry={entry}
              onRaise={() => raise(id)}
              onMove={(x, y) => edit(id, { x, y })}
              onMinimize={() => minimize(id)}
              onMaximize={() => edit(id, { maximized: !entry.maximized })}
              onClose={() => remove(id)}
            >
              {/* Cartoon cameo prop for Program: onNavigate={showCameo} */}
              <Program
                key={entry.projectName}
                projectName={entry.projectName}
                onLaunch={launch}
                active={id === active}
                onOpenProjects={() => launch("files")}
                onOpenPictures={(projectName) => launch("pictures", { projectName })}
                toggles={toggles}
              />
            </AppWindow>
          );
        })}
        {/* Cartoon cameos paused.
        {toggles.cameos && cameo && (
          <RetroCameo key={cameo.take} scene={cameo.scene} sound={toggles.sound} onDismiss={dismissCameo} />
        )}
        */}
      </div>

      {/* Classic Windows XP Luna Taskbar */}
      <footer className="retro-taskbar" aria-label="Desktop taskbar">
        {/* Start Button & Start Menu */}
        <details className="retro-menu" ref={menu}>
          <summary title="Click here to begin">
            <WindowsFlagIcon size={16} />
            <span className="retro-start-text">start</span>
          </summary>

          {/* Windows XP Authentic Two-Tone Start Menu (Image 3) */}
          <div className="retro-menu-panel">
            {/* Top User Banner */}
            <div className="retro-menu-user-banner">
              <div className="retro-menu-avatar-wrap">
                <PalmAvatar size={38} />
              </div>
              <strong className="retro-menu-username">{userName}</strong>
            </div>

            <div className="retro-menu-columns">
              <div className="retro-menu-left-col">
                {startPrograms.map((id) => (
                  <button type="button" key={id} className="retro-menu-item" onClick={() => launch(id)}>
                    {applications[id].icon}<span>{applications[id].shortName}</span>
                  </button>
                ))}
              </div>
              <div className="retro-menu-right-col">
                {startPlaces.map((id) => (
                  <button type="button" key={id} className="retro-menu-right-item" onClick={() => launch(id)}>
                    {applications[id].icon}<span>{applications[id].shortName}</span>
                  </button>
                ))}
                <button type="button" className="retro-menu-right-item" onClick={toggles.onFocus}>
                  {toggles.focused ? "Fit CRT" : "Zoom CRT"}
                </button>
                <button type="button" className="retro-menu-right-item" onClick={toggles.onFullscreen}>
                  {toggles.fullscreen ? "Exit full screen" : "Full screen"}
                </button>
                {/* Cartoon cameos paused.
                {toggles.cameos && (
                  <button type="button" className="retro-menu-right-item" onClick={() => {
                    menu.current.open = false;
                    showCameo(lastCameo.current, true);
                  }}>Replay cartoon cameo</button>
                )}
                */}
                <Link className="retro-menu-right-item" to="/#search">Back to portfolio ↗</Link>
              </div>
            </div>
            <div className="retro-menu-footer">
              <button type="button" className="retro-menu-footer-btn" onClick={onRestart}>Restart</button>
              <button type="button" className="retro-menu-footer-btn" onClick={onPowerOff}>
                <TurnOffComputerIcon size={18} /> Shut down
              </button>
            </div>
          </div>
        </details>
        <div className="retro-quick-launch">
          <button type="button" className="retro-ql-btn" onClick={toggleDesktop}
            title="Show or restore desktop" aria-label="Show or restore desktop">
            <MyComputerIcon size={16} />
          </button>
        </div>

        {/* Open Application Tabs */}
        <div className="retro-tasks">
          {Object.entries(windows).map(([id, entry]) => (
            <button
              type="button"
              key={id}
              className={`retro-task-tab ${id === active ? "is-active" : ""}`}
              aria-pressed={id === active}
              onClick={() => {
                if (id === active) minimize(id);
                else raise(id);
              }}
            >
              {applications[id].icon}
              <span>{applications[id].shortName || applications[id].name}</span>
            </button>
          ))}
        </div>

        {/* Notification Area / System Tray (Right) */}
        <div className="retro-system-tray">
          <DesktopClock onOpen={() => launch("calendar")} />
        </div>
      </footer>
    </div>
  );
}
