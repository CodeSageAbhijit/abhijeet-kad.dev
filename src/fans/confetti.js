/**
 * High-performance celebratory canvas confetti burst
 */
export function fireConfetti(originX, originY) {
  const canvas = document.createElement("canvas");
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "999999";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = (canvas.width = window.innerWidth * dpr);
  let height = (canvas.height = window.innerHeight * dpr);
  ctx.scale(dpr, dpr);

  const colors = [
    "#00f0ff", // cyan / portfolio accent
    "#38bdf8", // sky blue
    "#ffd700", // gold
    "#ff2a85", // hot pink
    "#a855f7", // neon purple
    "#10b981", // emerald
    "#ffffff", // diamond white
    "#f97316", // electric orange
  ];

  const shapes = ["rect", "circle", "strip"];
  const count = 90;
  const particles = [];

  const startX = originX != null ? originX : window.innerWidth / 2;
  const startY = originY != null ? originY : window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    // 360-degree spread with slight upward bias
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    const speed = 7 + Math.random() * 11;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed * (0.8 + Math.random() * 0.4),
      vy: Math.sin(angle) * speed * (0.8 + Math.random() * 0.4) - 4.5,
      size: 5 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.25,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.08 + Math.random() * 0.1,
      alpha: 1,
      decay: 0.009 + Math.random() * 0.008,
      gravity: 0.24 + Math.random() * 0.08,
      drag: 0.965,
    });
  }

  let animId;
  function update() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let active = 0;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (p.alpha <= 0) continue;
      active++;

      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;

      p.rotation += p.rotationSpeed;
      p.wobble += p.wobbleSpeed;
      p.alpha = Math.max(0, p.alpha - p.decay);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.wobble), 1);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "strip") {
        ctx.fillRect(-p.size * 0.3, -p.size, p.size * 0.6, p.size * 2);
      } else {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      }

      ctx.restore();
    }

    if (active > 0) {
      animId = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animId);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }

  animId = requestAnimationFrame(update);
}
