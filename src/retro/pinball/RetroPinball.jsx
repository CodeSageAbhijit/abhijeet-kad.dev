import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { hasMotion, launchBall, newTable, sides, STEP, stepTable } from "./table";
import { makePainter } from "./paint";
import { createPinballAudio } from "./sound";
import "./pinball.css";

const bestKey = "retro-midnight-transit-best";
const digits = new Intl.NumberFormat();
const keyboard = {
  ArrowLeft: "left", KeyA: "left", ShiftLeft: "left",
  ArrowRight: "right", KeyD: "right", ShiftRight: "right",
  Space: "launch",
};

function getBest() {
  try {
    const value = Number(localStorage.getItem(bestKey));
    return Number.isSafeInteger(value) && value > 0 ? value : 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    localStorage.setItem(bestKey, String(Math.max(value, getBest())));
  } catch {
    // The current session still keeps its score.
  }
}

function statusOf({ score, balls, best, mode, multiplier, message }) {
  return { score, balls, best, mode, multiplier, message };
}

export default function RetroPinball({ toggles, active }) {
  const machine = useRef(null);
  machine.current ??= newTable(getBest());
  const [status, setStatus] = useState(() => statusOf(machine.current));
  const [paused, setPaused] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [canvasMissing, setCanvasMissing] = useState(false);
  const [pressed, setPressed] = useState({});
  const root = useRef(null);
  const glass = useRef(null);
  const painter = useRef(null);
  const audio = useRef(null);
  const frame = useRef(0);
  const lastTime = useRef(null);
  const carry = useRef(0);
  const dirty = useRef(false);
  const savedBest = useRef(machine.current.best);
  const stopped = useRef(false);
  const press = useRef({ left: new Set(), right: new Set(), launch: new Set() });
  const activeRef = useRef(active);
  activeRef.current = active;

  function updateScoreboard() {
    const current = statusOf(machine.current);
    if (current.best > savedBest.current) {
      savedBest.current = current.best;
      saveBest(current.best);
    }
    setStatus(current);
  }

  function emit(cue) {
    audio.current?.play(cue);
    dirty.current = true;
  }

  function invalidate() {
    if (!frame.current && painter.current && activeRef.current && !document.hidden) frame.current = requestAnimationFrame(draw);
  }

  function draw(time) {
    frame.current = 0;
    const current = machine.current;
    const before = lastTime.current;
    lastTime.current = time;
    if (!stopped.current) {
      carry.current += before === null ? 1 / 60 : Math.min(0.034, (time - before) / 1000);
      while (carry.current >= STEP) {
        stepTable(current, STEP, emit);
        carry.current -= STEP;
      }
    }
    painter.current?.(current);
    if (dirty.current) {
      dirty.current = false;
      updateScoreboard();
    }
    if (!stopped.current && hasMotion(current)) invalidate();
    else {
      lastTime.current = null;
      carry.current = 0;
    }
  }

  function clearInput() {
    const current = machine.current;
    for (const id of Object.keys(press.current)) press.current[id].clear();
    for (const side of sides) {
      const f = current.flippers[side];
      f.held = false;
      f.angle = f.rest;
      f.rate = 0;
    }
    current.charging = false;
    current.charge = 0;
    setPressed({});
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    lastTime.current = null;
    carry.current = 0;
    invalidate();
  }

  function setPause(next) {
    stopped.current = next;
    setPaused(next);
    if (next) clearInput();
    else invalidate();
  }

  function begin(id, source) {
    const current = machine.current;
    if (stopped.current || canvasMissing || !activeRef.current) return;
    if (id === "launch" && current.mode !== "ready") return;
    if (press.current[id].has(source)) return;
    const first = press.current[id].size === 0;
    press.current[id].add(source);
    if (!first) return;
    audio.current?.unlock();
    if (id === "launch") current.charging = true;
    else {
      current.flippers[id].held = true;
      audio.current?.play("flip");
    }
    setPressed((previous) => ({ ...previous, [id]: true }));
    invalidate();
  }

  function end(id, source, canceled = false) {
    if (!press.current[id].delete(source) || press.current[id].size) return;
    const current = machine.current;
    if (id === "launch") {
      current.charging = false;
      if (canceled) current.charge = 0;
      else {
        root.current?.focus({ preventScroll: true });
        launchBall(current, emit);
        dirty.current = false;
        updateScoreboard();
      }
    } else current.flippers[id].held = false;
    setPressed((previous) => ({ ...previous, [id]: false }));
    invalidate();
  }

  function pointerControl(id) {
    return {
      onPointerDown(event) {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        begin(id, event.pointerId);
      },
      onPointerUp: (event) => end(id, event.pointerId),
      onPointerCancel: (event) => end(id, event.pointerId, true),
      onLostPointerCapture: (event) => end(id, event.pointerId, true),
      onClick(event) {
        if (event.detail !== 0) return;
        begin(id, "button");
        end(id, "button");
      },
    };
  }

  function onKey(event, down) {
    if (down && expanded && event.code === "Tab") {
      const buttons = [...root.current.querySelectorAll("button:not(:disabled)")];
      const first = buttons.at(0);
      const last = buttons.at(-1);
      if (event.shiftKey && (event.target === first || event.target === root.current)) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && event.target === last) {
        event.preventDefault();
        first?.focus();
      }
      return;
    }
    const id = keyboard[event.code];
    if (id && !event.ctrlKey && !event.altKey && !event.metaKey) {
      event.preventDefault();
      event.stopPropagation();
      if (down) begin(id, event.code);
      else end(id, event.code);
    } else if (down && !event.repeat && event.code === "KeyP" && machine.current.mode === "playing") {
      event.preventDefault();
      event.stopPropagation();
      setPause(!stopped.current);
    } else if (down && event.code === "Escape" && expanded) {
      event.preventDefault();
      event.stopPropagation();
      setExpanded(false);
    }
  }

  useEffect(() => {
    const sound = createPinballAudio();
    audio.current = sound;
    return () => {
      audio.current = null;
      sound.dispose();
    };
  }, []);

  useEffect(() => {
    audio.current?.setEnabled(toggles.sound);
  }, [toggles.sound]);

  useEffect(() => {
    const render = makePainter(glass.current, matchMedia("(prefers-reduced-motion: reduce)").matches);
    painter.current = render;
    setCanvasMissing(!render);
    if (render) {
      render(machine.current);
      invalidate();
    }
    return () => {
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      lastTime.current = null;
      carry.current = 0;
      painter.current = null;
    };
  }, [expanded]);

  useEffect(() => {
    if (active) {
      if (!root.current?.contains(document.activeElement)) root.current?.focus({ preventScroll: true });
      invalidate();
    } else {
      if (machine.current.mode === "playing") setPause(true);
      else clearInput();
      setExpanded(false);
    }
  }, [active, expanded]);

  useEffect(() => {
    function pauseWhenHidden() {
      if (machine.current.mode === "playing") setPause(true);
      else clearInput();
    }
    function visibility() {
      if (document.hidden) pauseWhenHidden();
    }
    window.addEventListener("blur", pauseWhenHidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("blur", pauseWhenHidden);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  function newGame() {
    machine.current = newTable(machine.current.best);
    setPause(false);
    clearInput();
    updateScoreboard();
  }

  const panel = (
    <div className={`pinball ${expanded ? "pinball-expanded" : ""}`} ref={root} tabIndex={0} role="group"
      aria-label="Midnight Transit pinball table" aria-describedby="pinball-help"
      onKeyDown={(event) => onKey(event, true)} onKeyUp={(event) => onKey(event, false)}
      onBlur={(event) => {
        if (!event.relatedTarget || event.currentTarget.contains(event.relatedTarget)) return;
        if (machine.current.mode === "playing") setPause(true);
        else clearInput();
      }}>
      <div className="pinball-cabinet">
        <div className="pinball-playfield">
          <canvas ref={glass} aria-label="Neon rail-themed playfield" role="img" />
          {(paused || status.mode === "over" || canvasMissing) && (
            <div className="pinball-cover">
              {canvasMissing ? "The playfield needs a browser with Canvas support." : (
                <div>
                  <strong>{paused ? "Paused" : "Game over"}</strong>
                  <button type="button" onClick={paused ? () => setPause(false) : newGame}>{paused ? "Resume" : "New game"}</button>
                </div>
              )}
            </div>
          )}
        </div>
        <aside className="pinball-readout">
          <div className="pinball-score"><span>Score</span><strong>{digits.format(status.score)}</strong></div>
          <dl className="pinball-stats">
            <div><dt>Best</dt><dd>{digits.format(status.best)}</dd></div>
            <div><dt>Balls</dt><dd>{status.balls}</dd></div>
            <div><dt>Bonus</dt><dd>{status.multiplier}×</dd></div>
          </dl>
          <p className="pinball-status" role="status">{paused ? "Paused" : status.message}</p>
          <p id="pinball-help" className="pinball-help">← / → flip · Space launches · P pauses</p>
          <div className="pinball-options">
            <button type="button" onClick={() => setExpanded(!expanded)}>{expanded ? "Back to desktop" : "Expand table"}</button>
            <button type="button" disabled={status.mode !== "playing"} onClick={() => setPause(!paused)}>{paused ? "Resume" : "Pause"}</button>
          </div>
        </aside>
      </div>
      <div className="pinball-controls" aria-label="Pinball controls">
        <button type="button" aria-label="Left flipper" aria-pressed={!!pressed.left} {...pointerControl("left")}>← Flip</button>
        <button type="button" aria-label="Launch ball" aria-pressed={!!pressed.launch}
          disabled={paused || status.mode !== "ready" || canvasMissing} {...pointerControl("launch")}>Launch</button>
        <button type="button" aria-label="Right flipper" aria-pressed={!!pressed.right} {...pointerControl("right")}>Flip →</button>
      </div>
    </div>
  );

  return expanded ? createPortal(
    <div className="pinball-screen" role="dialog" aria-modal="true" aria-label="Midnight Transit Pinball">{panel}</div>,
    document.body,
  ) : panel;
}
