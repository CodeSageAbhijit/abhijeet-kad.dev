import { useEffect, useRef, useState } from "react";

export default function ComputersCanvas({
  display, keystroke, onKey, onFocus, onResult, onPage, sound, onSoundToggle, isBooting, children,
}) {
  const stage = useRef(null);
  const poster = useRef(null);
  const scene = useRef(null);
  const latest = useRef({ display, onKey, onFocus, onResult, onPage });
  const [nearby, setNearby] = useState(false);
  const [requested, setRequested] = useState(false);
  const [status, setStatus] = useState("preview");
  latest.current = { display, onKey, onFocus, onResult, onPage };
  const automatic = !window.matchMedia("(prefers-reduced-motion: reduce)").matches && !navigator.connection?.saveData;
  const enabled = !isBooting && (requested || (automatic && nearby));

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setNearby(true);
        observer.disconnect();
      }
    }, { rootMargin: "120px" });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const abort = new AbortController();
    let instance;
    let usingPreview = false;
    let timeout;
    setStatus("loading");
    const controls = {
      onKey: (key) => latest.current.onKey(key),
      onFocus: () => latest.current.onFocus(),
      onResult: (index) => latest.current.onResult(index),
      onPage: (direction) => latest.current.onPage(direction),
    };

    async function startPreview(error) {
      if (abort.signal.aborted || usingPreview) return;
      usingPreview = true;
      clearTimeout(timeout);
      instance?.dispose();
      instance = null;
      scene.current = null;
      console.warn("Portfolio PC is using its interactive preview.", error);

      try {
        const { mountComputerPreview } = await import("./portfolioComputerPreview");
        if (abort.signal.aborted) return;
        const preview = await mountComputerPreview(stage.current, poster.current, controls, abort.signal);
        if (!preview) return;
        if (abort.signal.aborted) {
          preview.dispose();
          return;
        }
        instance = preview;
        scene.current = instance;
        instance.update(latest.current.display);
        setStatus("fallback");
      } catch {
        if (!abort.signal.aborted) setStatus("error");
      }
    }

    timeout = setTimeout(() => startPreview(new Error("3D loading timed out")), 8000);
    import("./portfolioComputerScene").then(({ mountPortfolioComputer }) => {
      if (abort.signal.aborted || usingPreview) return;
      instance = mountPortfolioComputer(stage.current, {
        ...controls,
        onReady: () => {
          clearTimeout(timeout);
          setStatus("ready");
        },
        onError: startPreview,
      });
      scene.current = instance;
      instance.update(latest.current.display);
    }).catch(startPreview);

    return () => {
      abort.abort();
      clearTimeout(timeout);
      instance?.dispose();
      scene.current = null;
    };
  }, [enabled]);

  useEffect(() => { scene.current?.update(display); }, [display]);
  useEffect(() => { if (keystroke) scene.current?.pressKey(keystroke.key); }, [keystroke]);

  const interactive = status === "ready" || status === "fallback";
  return (
    <div className="portfolio-computer">
      <div className={`pc-stage ${interactive ? "pc-stage-ready" : ""}`} ref={stage}>
        <img
          ref={poster}
          src={`${import.meta.env.BASE_URL}the_pc/preview.webp`}
          alt="Retro desktop computer and keyboard"
          className="pc-poster"
          loading="lazy"
          decoding="async"
        />
        {interactive && children}
      </div>
      <div className="pc-controls">
        <span id="pc-instructions" role="status">
          {status === "ready" ? "Tap the search bar to type, or click the keys" : status === "fallback" ? "Interactive preview · Tap the screen or keys" : status === "loading" ? "Starting the PC…" : status === "error" ? "The PC preview couldn’t load" : "Retro PC preview"}
        </span>
        {interactive && (
          <button type="button" className="pc-button" aria-label="Key click sounds" aria-pressed={sound} onClick={onSoundToggle}>
            Sound {sound ? "on" : "off"}
          </button>
        )}
        {status === "preview" && (
          <button type="button" className="pc-button" disabled={isBooting} onClick={() => setRequested(true)}>Start PC</button>
        )}
      </div>
    </div>
  );
}
