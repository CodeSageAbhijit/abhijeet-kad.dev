import { useEffect, useRef } from "react";

const CHARS = "アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()";

export default function MatrixRain({ opacity = 0.07, style = {} }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width  = W;
    canvas.height = H;

    const fontSize  = 14;
    const cols      = Math.floor(W / fontSize);
    const drops     = Array(cols).fill(1);

    function draw() {
      ctx.fillStyle = "rgba(8,14,25,0.05)";
      ctx.fillRect(0, 0, W, H);

      ctx.font = `${fontSize}px "Share Tech Mono", monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];

        // Head char brighter
        if (drops[i] * fontSize < H) {
          ctx.fillStyle = "#e7effa";
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);
        }

        // Trail
        ctx.fillStyle = "#81b6ff";
        ctx.fillText(
          CHARS[Math.floor(Math.random() * CHARS.length)],
          i * fontSize,
          (drops[i] - 1) * fontSize
        );

        if (drops[i] * fontSize > H && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-canvas"
      style={{ opacity, ...style }}
    />
  );
}
