import map from "./portfolioComputerHitMap.json";
import { drawComputerScreen, initialScreen, openScreenControl, SCREEN_HEIGHT, SCREEN_WIDTH } from "./portfolioComputerScreen";

export async function mountComputerPreview(container, image, handlers, signal) {
  await image.decode();
  if (signal.aborted) return null;

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  canvas.setAttribute("aria-hidden", "true");
  const screen = document.createElement("canvas");
  screen.width = SCREEN_WIDTH;
  screen.height = SCREEN_HEIGHT;
  const screenContext = screen.getContext("2d");
  const keys = map.keys.map(({ key, center, points }) => {
    const path = new Path2D();
    points.forEach(([x, y], index) => index ? path.lineTo(x, y) : path.moveTo(x, y));
    path.closePath();
    return { key, center, path };
  });
  const [[left, top], [right, rise], [lowerLeft, bottom]] = map.surface;
  const horizontal = [right - left, rise - top];
  const vertical = [lowerLeft - left, bottom - top];
  const determinant = horizontal[0] * vertical[1] - horizontal[1] * vertical[0];

  let width;
  let height;
  let insetX;
  let insetY;
  let pixelRatio;
  let pointer;
  let pressed;
  let release;
  let display = initialScreen;

  function draw() {
    if (!width || !height) return;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.clearRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);
    context.translate(insetX, insetY);
    context.scale(width, height);
    context.drawImage(image, 0, 0, 1, 1);

    context.save();
    context.transform(horizontal[0], horizontal[1], vertical[0], vertical[1], left, top);
    context.drawImage(screen, 0, 0, 1, 1);
    context.restore();

    if (pressed) {
      context.fillStyle = "#704b6880";
      context.fill(pressed.path);
    }
    context.resetTransform();
  }

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    pixelRatio = Math.min(devicePixelRatio || 1, 1.6);
    canvas.width = w * pixelRatio;
    canvas.height = h * pixelRatio;
    width = Math.min(w, h * map.aspect);
    height = width / map.aspect;
    insetX = (w - width) / 2;
    insetY = (h - height) / 2;
    draw();
  }

  function press(key) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    pressed = key;
    clearTimeout(release);
    draw();
    release = setTimeout(() => { pressed = null; draw(); }, 115);
  }

  function findKey(x, y, touch) {
    let closest;
    let distance = Infinity;
    for (const key of keys) {
      const [cx, cy] = key.center;
      const offset = Math.hypot((x - cx) * width, (y - cy) * height);
      if (offset < distance && (context.isPointInPath(key.path, x, y) || (touch && offset < 9))) {
        closest = key;
        distance = offset;
      }
    }
    return closest;
  }

  function pointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return;
    const area = canvas.getBoundingClientRect();
    const x = (event.clientX - area.left - insetX) / width;
    const y = (event.clientY - area.top - insetY) / height;
    const u = ((x - left) * vertical[1] - (y - top) * vertical[0]) / determinant;
    const v = ((y - top) * horizontal[0] - (x - left) * horizontal[1]) / determinant;
    const hit = u >= 0 && u <= 1 && v >= 0 && v <= 1
      ? { u, v }
      : findKey(x, y, event.pointerType === "touch");
    if (!hit) return;
    if ("u" in hit || event.pointerType === "mouse") event.preventDefault();
    if ("key" in hit) press(hit);
    pointer = { hit, x: event.clientX, y: event.clientY };
  }

  function pointerUp(event) {
    if (!event.isPrimary || event.button !== 0) return;
    const start = pointer;
    pointer = null;
    if (!start || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
    if ("key" in start.hit) handlers.onKey(start.hit.key);
    else openScreenControl(start.hit.u * SCREEN_WIDTH, start.hit.v * SCREEN_HEIGHT, display, handlers);
  }

  function pointerCancel() { pointer = null; }

  container.append(canvas);
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerCancel);
  drawComputerScreen(screenContext, display);
  resize();

  return {
    update(state) {
      display = state;
      drawComputerScreen(screenContext, state);
      draw();
    },
    pressKey(key) {
      const cap = keys.find((entry) => entry.key === (key.length === 1 ? key.toLowerCase() : key));
      if (cap) press(cap);
    },
    dispose() {
      clearTimeout(release);
      observer.disconnect();
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerCancel);
      canvas.remove();
    },
  };
}
