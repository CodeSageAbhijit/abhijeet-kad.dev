import SpiritFire from "./SpiritFire";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { guestbook, spiritsEnabled } from "./api";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import "./spirits.css";

const Field = createContext(null);
const names = { hero: "Welcome", search: "Search", overview: "Overview", work: "Experience", projects: "Projects", contact: "Contact", retro: "the XP portfolio" };
const prompts = {
  hero: "What would you tell a friend to try here first?",
  search: "What did you discover on the retro computer?",
  overview: "What surprised you about Abhijit’s work?",
  work: "Which detail from Abhijit’s experience stuck with you?",
  projects: "Which project deserves a closer look, and why?",
  contact: "What will you remember from this visit?",
  retro: "What should the next visitor try on this old PC?",
};
export function SpiritField({ children }) {
  const [homes, setHomes] = useState({});
  const [visible, setVisible] = useState([]);
  const [limit, setLimit] = useState(1);
  const [active, setActive] = useState(null);
  const [landing, setLanding] = useState("");
  const releasedNotes = useRef(new Map());
  const request = useRef(0);
  const refresh = useCallback(async () => {
    const version = ++request.current;
    const result = await guestbook("homes");
    if (version === request.current) setHomes(result);
  }, []);
  const visibility = useCallback(
    (home, on) =>
      setVisible((previous) => {
        if (previous.includes(home) === on) return previous;
        return on ? [...previous, home] : previous.filter((id) => id !== home);
      }),
    [],
  );
  useEffect(() => {
    if (spiritsEnabled) refresh().catch(() => { });
    const media = matchMedia("(min-width: 768px)");
    const resize = () => setLimit(media.matches ? 2 : 1);
    resize();
    media.addEventListener("change", resize);
    return () => media.removeEventListener("change", resize);
  }, [refresh]);
  useEffect(() => {
    if (!landing) return;
    const timer = setTimeout(() => setLanding(""), 4000);
    return () => clearTimeout(timer);
  }, [landing]);
  const populated = Object.values(homes).some(({ total }) => total > 0) || releasedNotes.current.size > 0;
  const slots = visible.filter(id =>
    id === active || id === "hero" || homes[id]?.total > 0 || releasedNotes.current.has(id)
  );
  const priority = (id) => homes[id]?.priority ?? Infinity;
  slots.sort(
    (a, b) =>
      Number(b === active) - Number(a === active) ||
      Number(b === "hero") - Number(a === "hero") ||
      priority(a) - priority(b) ||
      Number(releasedNotes.current.has(b)) - Number(releasedNotes.current.has(a)),
  );
  return (
    <Field.Provider
      value={{
        homes,
        refresh,
        visibility,
        slots: slots.slice(0, limit),
        active,
        setActive,
        setLanding,
        releasedNotes,
      }}
    >
      {children}
      {landing && (
        <div className="spirit-arrival" role="status">
          Your note landed near {names[landing]}.
        </div>
      )}
    </Field.Provider>
  );
}

function flyToHome(trigger, home) {
  if (!trigger || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const start = trigger.getBoundingClientRect();
  const target = document.querySelector(`[data-spirit-home="${home}"] .spirit-perch`)?.getBoundingClientRect();
  const ghost = new Image();
  ghost.src = import.meta.env.BASE_URL + "spirit-fire.webp";
  ghost.className = "spirit-flight";
  const x = start.left + start.width / 2, y = start.top + start.height / 2;
  Object.assign(ghost.style, { left: x - 22 + "px", top: y - 32 + "px" });
  document.body.append(ghost);
  const dx = (target ? target.left + target.width / 2 : innerWidth - 24) - x;
  const dy = Math.max(0, Math.min(innerHeight, target ? target.top : 0)) - y;
  ghost.animate([{ transform: "translate(0,0)" }, { transform: `translate(${dx * .45}px,${dy * .45 - 35}px)`, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(.4)`, opacity: 0 }], { duration: 750, easing: "ease-in-out" }).finished.finally(() => ghost.remove());
}

export function SpiritSlot({ home }) {
  const reduced = useReducedMotion();
  const { homes, refresh, visibility, slots, active, setActive, setLanding, releasedNotes } =
    useContext(Field);
  const lane = useRef(null);
  const trigger = useRef(null);
  const generation = useRef(0);
  const leaveTimer = useRef();
  const submission = useRef(null);
  const saving = useRef(false);
  const [mode, setMode] = useState("closed");
  const [note, setNote] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [above, setAbove] = useState(false);
  const open = active === home && mode !== "closed";
  const composing = mode === "write" || mode === "saving";
  const total = homes[home]?.total || 0;
  const ready = slots.includes(home) || (open && composing);
  const close = useCallback(() => {
    generation.current++;
    clearTimeout(leaveTimer.current);
    setMode("closed");
    setActive((previous) => (previous === home ? null : previous));
  }, [home, setActive]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => visibility(home, entry.isIntersecting),
      { threshold: 0.65 },
    );
    observer.observe(lane.current);
    return () => {
      observer.disconnect();
      visibility(home, false);
      clearTimeout(leaveTimer.current);
      generation.current++;
    };
  }, [home, visibility]);
  useEffect(() => {
    if (!open) return;
    const outside = (event) => {
      if (!lane.current.contains(event.target) && !saving.current) close();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, close]);
  useEffect(() => {
    if (!open || mode !== "read" || !note || !ready) return;
    let timer;
    const observe = () => {
      clearTimeout(timer);
      if (!document.hidden && visibleNote)
        timer = setTimeout(
          () =>
            guestbook("read", { id: note.id })
              .then(refresh)
              .catch(() => { }),
          1000,
        );
    };
    let visibleNote = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleNote = entry.intersectionRatio >= 0.5;
        observe();
      },
      { threshold: 0.5 },
    );
    observer.observe(lane.current.querySelector(".spirit-message"));
    document.addEventListener("visibilitychange", observe);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", observe);
    };
  }, [open, mode, note, ready, refresh]);

  async function reveal(revisit = false, exclude = null) {
    clearTimeout(leaveTimer.current);
    const version = ++generation.current;
    setAbove(trigger.current.getBoundingClientRect().bottom > innerHeight / 2);
    setActive(home);
    setMode("loading");
    setError("");
    setNote(null);
    try {
      // The server excludes the author's own spark from discovery counts.
      // On arrival, show the receipt from their successful cloud write once.
      const arrival = releasedNotes.current.get(home);
      let result;
      if (arrival && !exclude && !revisit) {
        result = arrival;
        releasedNotes.current.delete(home);
      } else {
        result = await guestbook("open", { home, revisit, exclude });
        if (!result && !revisit && total > 0) {
          result = await guestbook("open", { home, revisit: true, exclude });
        }
      }
      if (version !== generation.current) return;
      setNote(result);
      setMode("read");
    } catch {
      if (version === generation.current) {
        setMode("error");
        setError("The guestbook is offline.");
      }
    }
  }
  function enter() {
    clearTimeout(leaveTimer.current);
    if (!open && !saving.current) {
      if (home === "hero") {
        setAbove(trigger.current?.getBoundingClientRect().bottom > innerHeight / 2);
        setActive(home);
        setError("");
        setMode("write");
      } else {
        reveal();
      }
    }
  }
  async function release(event) {
    event.preventDefault();
    if (saving.current || !draft.trim()) return;
    saving.current = true;
    setError("");
    setMode("saving");
    submission.current ??= crypto.randomUUID();
    try {
      const { home: destination, display_name: savedName } = await guestbook("release", {
        id: submission.current,
        body: draft.trim(),
        display_name: displayName.trim() || null,
      });
      releasedNotes.current.set(destination, { id: submission.current, body: draft.trim(), display_name: savedName });
      flyToHome(trigger.current, destination);
      setLanding(destination);
      submission.current = null;
      setDraft("");
      setDisplayName("");
      close();
      refresh().catch(() => { });
    } catch (cause) {
      setMode("write");
      setError(
        cause.message?.includes("moment")
          ? "Give your last spark a moment before sending another."
          : "Couldn’t release your spark. Your draft is here to retry.",
      );
    } finally {
      saving.current = false;
    }
  }

  return (
    <div
      ref={lane}
      className={"spirit-lane spirit-lane-" + home}
      data-spirit-home={home}

    >
      <div
        className="spirit-perch"
        onPointerEnter={() => clearTimeout(leaveTimer.current)}
        onPointerLeave={(event) => {
          if (event.pointerType !== "touch" && !composing)
            leaveTimer.current = setTimeout(close, 180);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget) && !composing)
            close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape" && !saving.current) {
            trigger.current.focus();
            close();
          }
        }}
      >
        {ready && (
          <>
            <button
              ref={trigger}
              className={
                "spirit-trigger" +
                (total && !homes[home]?.unread ? " spirit-seen" : "")
              }
              aria-label={`Discover a spirit near ${names[home]}`}
              aria-expanded={open}
              onFocus={enter}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") enter();
              }}
              onClick={enter}
            ><SpiritFire /></button>
            {/* {!open && home === "hero" && (
              <span className="spirit-hero-hint" aria-hidden="true">
                leave a note
              </span>
            )} */}
          </>
        )}
        <AnimatePresence>
          {ready && open && (
            <motion.div
              key="letter"
              initial={{
                opacity: 0,
                y: reduced ? 0 : above ? 7 : -7,
                scale: reduced ? 1 : 0.96,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: reduced ? 0 : above ? 4 : -4 }}
              transition={{ duration: reduced ? 0 : 0.19, ease: "easeOut" }}
              className={"spirit-bubble" + (above ? " above" : "")}
              aria-label="Spirit note"
            >
              {composing ? (
                <form onSubmit={release}>
                  <label>
                    {prompts[home]}
                    <textarea
                      placeholder="Tell the next explorer your thoughts on this portfolio…"
                      autoFocus
                      required
                      maxLength={180}
                      value={draft}
                      disabled={saving.current}
                      onChange={(event) => {
                        setDraft(event.target.value);
                        submission.current = null;
                      }}
                    />
                  </label>
                  <small className="spirit-length">{draft.length} / 180</small>
                  <label className="spirit-signature-field">
                    Name (optional)
                    <input type="text" maxLength={40} placeholder="Anonymous" value={displayName}
                      disabled={saving.current} onChange={event => {
                        setDisplayName(event.target.value);
                        submission.current = null;
                      }} />
                  </label>
                  <div className="spirit-actions">
                    <button
                      type="button"
                      disabled={saving.current}
                      onClick={close}
                    >
                      Close
                    </button>
                    {total > 0 && (
                      <button
                        type="button"
                        disabled={saving.current}
                        onClick={() => reveal()}
                      >
                        Read sparks
                      </button>
                    )}
                    <button disabled={!draft.trim() || saving.current}>
                      {saving.current ? "Releasing…" : "Release spark"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <p
                    key={note?.id ?? mode}
                    className="spirit-message"
                    aria-live="polite"
                  >
                    {mode === "error" ? null : mode === "loading"
                      ? "Listening…"
                      : note?.body ||
                      (total
                        ? "No other notes here yet."
                        : "Leave a tip for the next explorer.")}
                  </p>
                  {note && <small className="spirit-signature">— {note.display_name || "Anonymous"}</small>}
                  <div className="spirit-actions">
                    {mode === "error" && (
                      <button onClick={() => reveal()}>Retry</button>
                    )}
                    {mode === "read" && total > 0 && (!note || total > 1) && (
                      <button onClick={() => reveal(!note, note?.id)}>
                        {note ? "Another spark" : "Revisit sparks"}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        generation.current++;
                        clearTimeout(leaveTimer.current);
                        setError("");
                        setMode("write");
                      }}
                    >
                      Leave a note
                    </button>
                  </div>
                </>
              )}
              {error && <p role="alert">{error}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
