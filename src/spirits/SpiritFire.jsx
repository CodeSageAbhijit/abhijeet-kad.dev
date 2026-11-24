import { useEffect, useRef } from "react";


export default function SpiritFire() {
  const canvas = useRef(null);
  useEffect(() => {
    const element = canvas.current;
    const volume = element.parentElement;
    const trigger = volume.closest("button");
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    element.width = Math.ceil(element.clientWidth * ratio) || 80;
    element.height = Math.ceil(element.clientHeight * ratio) || 106;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const seed = Math.random() * 20;
    let fire;
    let disposed = false;
    let timer;
    const perch = trigger.parentElement;
    let phase = seed;
    let previous = performance.now();
    let view = 0;
    let target = 0;
    function paint() {
      clearTimeout(timer);
      if (!fire || document.hidden) return;
      view += (target - view) * .23;
      const time = seed + (reduced.matches ? 0 : performance.now() / 1000);
      const now = performance.now();
      if (!reduced.matches && !perch.matches(":hover, :focus-within, :has(.spirit-bubble)")) {
        phase += Math.min(now - previous, 90) * .0011;
        const depth = Math.sin(phase);
        const lift = -6*Math.sin(phase*2) - 4*Math.cos(phase);
        perch.style.setProperty("--flight-x", (1-Math.cos(phase))/2);
        perch.style.setProperty("--flight-y", lift+"px");
        perch.style.setProperty("--flight-z", (depth*64-8)+"px");
        perch.style.setProperty("--shadow-width", 1-lift*.024);
        perch.style.setProperty("--shadow-strength", .55+lift*.025);
      }
      previous = now;
      if (fire) {
        fire.draw(time, reduced.matches ? 0 : view + .45*Math.sin(phase));
        volume.classList.add("is-live");
      }
      if (!reduced.matches) timer = setTimeout(paint, 42);
    }
    async function start() {
      const module = await import("./fireVolume").catch(() => null);
      if (disposed) return;
      fire = module?.mountFire(element);
      paint();
    }
    function lost(event) {
      event.preventDefault();
      clearTimeout(timer);
      volume.classList.remove("is-live");
      fire = null;
      paint();
    }
    function move(event) {
      const box = trigger.getBoundingClientRect();
      target = ((event.clientX - box.left) / box.width - .5) * .8;
    }
    const center = () => { target = 0; };
    start();
    trigger.addEventListener("pointermove", move);
    trigger.addEventListener("pointerleave", center);
    element.addEventListener("webglcontextlost", lost);
    element.addEventListener("webglcontextrestored", start);
    reduced.addEventListener("change", paint);
    document.addEventListener("visibilitychange", paint);
    return () => {
      disposed = true;
      clearTimeout(timer);
      trigger.removeEventListener("pointermove", move);
      trigger.removeEventListener("pointerleave", center);
      element.removeEventListener("webglcontextlost", lost);
      element.removeEventListener("webglcontextrestored", start);
      reduced.removeEventListener("change", paint);
      document.removeEventListener("visibilitychange", paint);
      fire?.dispose();
    };
  }, []);
  const base = import.meta.env.BASE_URL;
  return <span className="spirit-fire-volume" aria-hidden="true">
    <picture><source media="(prefers-reduced-motion: reduce)" srcSet={base+"spirit-fire.webp"}/>
      <img src={base+"spirit-fire-loop.webp"} alt=""/></picture>
    <canvas ref={canvas}/>
  </span>;
}
