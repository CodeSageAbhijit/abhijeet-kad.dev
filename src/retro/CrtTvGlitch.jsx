import { useEffect, useRef } from "react";

/**
 * Visual CRT static ("ant war"), rolling sync tears, and classic TV OSD hint.
 * Pointer events stay disabled here so only hitting the physical monitor bezel works.
 */
export default function CrtTvGlitch({ hits, maxHits = 3, showHint }) {
  const canvasRef = useRef(null);
  const snowAlpha = hits === 0 ? 0.84 : hits === 1 ? 0.54 : 0.22;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const imgData = ctx.createImageData(w, h);
    const buf = new Uint32Array(imgData.data.buffer);

    let frameId;
    let tearY = 0;

    const draw = () => {
      const len = buf.length;
      const speckProb = hits === 0 ? 0.88 : hits === 1 ? 0.62 : 0.3;

      for (let i = 0; i < len; i++) {
        if (Math.random() < speckProb) {
          const v = (Math.random() * 235) | 0;
          buf[i] = (255 << 24) | (v << 16) | (v << 8) | v;
        } else {
          buf[i] = 0xff101418;
        }
      }
      ctx.putImageData(imgData, 0, 0);

      tearY = (tearY + (hits === 0 ? 7 : hits === 1 ? 4 : 2)) % h;
      ctx.fillStyle = "rgba(255, 255, 255, 0.36)";
      ctx.fillRect(0, tearY, w, hits === 0 ? 9 : 4);
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, (tearY + 22) % h, w, 4);

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [hits]);

  return (
    <div className={`retro-tv-glitch-layer hits-${hits}`} aria-hidden="true">
      <canvas
        ref={canvasRef}
        width={180}
        height={135}
        className="retro-tv-snow-canvas"
        style={{ opacity: snowAlpha }}
      />

      <div className="retro-tv-osd-top">
        <span>{hits === 0 ? "CH-03 · NO SIGNAL" : `CH-03 · SYNCING (${hits}/${maxHits})`}</span>
        <span>DD-CABLE</span>
      </div>

      {showHint && (
        <div className="retro-tv-hint-box" role="status">
          <div className="retro-tv-hint-row">
            <span className="retro-tv-hint-badge">SIGNAL LOST</span>
            <span className="retro-tv-hint-bars" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <i key={i} className={i < hits ? "is-lit" : ""} />
              ))}
            </span>
          </div>
          <p className="retro-tv-hint-sub">
            {hits === 0
              ? "Something is loose — tap the CRT bezel/frame around the screen to fix it."
              : hits === 1
                ? "Picture clearing up! Give the monitor frame another tap."
                : "Almost locked in! One more tap on the monitor frame."}
          </p>
        </div>
      )}
    </div>
  );
}
