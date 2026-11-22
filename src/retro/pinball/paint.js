import { BALL_RADIUS, HEIGHT, WIDTH, bumpers, flipperEnd, guides, rim, sides, slings, targets } from "./table";

function trace(ctx, points, close = false) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
  if (close) ctx.closePath();
}

function stroke(ctx, points, color, width) {
  trace(ctx, points);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.stroke();
}

function circle(ctx, x, y, radius, fill) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

function rounded(ctx, x, y, w, h, radius, fill, edge) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (edge) {
    ctx.strokeStyle = edge;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function stencil(ctx, text, x, y, font, color, align = "center") {
  ctx.font = font;
  ctx.textAlign = align;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function paintPanel(ctx) {
  const backdrop = ctx.createLinearGradient(0, 16, 400, 530);
  backdrop.addColorStop(0, "#172435");
  backdrop.addColorStop(0.5, "#1b1930");
  backdrop.addColorStop(1, "#161e2b");
  ctx.fillStyle = backdrop;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.save();
  trace(ctx, [...rim.slice(0, 12), [387, 528]], true);
  ctx.clip();

  stroke(ctx, [[3, 166], [86, 166], [181, 237], [254, 165], [399, 165]], "#4ed5d222", 30);
  stroke(ctx, [[14, 249], [120, 164], [256, 164], [357, 255]], "#de91ec32", 2);
  stroke(ctx, [[29, 278], [118, 193], [185, 238], [256, 193], [350, 278]], "#5cc6d947", 2);
  stroke(ctx, [[66, 307], [183, 239], [302, 306]], "#ffc17065", 1);
  stroke(ctx, [[16, 339], [91, 339], [114, 300], [239, 300], [282, 341], [360, 341]], "#b29be62b", 12);
  stroke(ctx, [[16, 339], [91, 339], [114, 300], [239, 300], [282, 341], [360, 341]], "#b29be66b", 1);
  for (let index = 0; index < 38; index++) {
    const x = 20 + (index * 43) % 325;
    const y = 39 + (index * 101) % 408;
    if (y < 254 || y > 345) circle(ctx, x, y, index % 3 === 0 ? 1.25 : 0.65, "#cee4e96b");
  }

  // Printed ink beneath the hardware, like the artwork on a pinball playfield.
  const towerLine = [[43, 395], [43, 362], [55, 362], [55, 347], [75, 347], [75, 384], [91, 384],
    [91, 356], [104, 356], [104, 340], [116, 340], [116, 323], [126, 323], [126, 338], [136, 338],
    [136, 374], [152, 374], [152, 350], [170, 350], [170, 364], [196, 364], [196, 328],
    [208, 328], [208, 312], [217, 312], [217, 328], [234, 328], [234, 355],
    [253, 355], [253, 341], [270, 341], [270, 382], [284, 382], [284, 352], [309, 352],
    [309, 368], [329, 368], [329, 398]];
  trace(ctx, [[43, 420], ...towerLine, [329, 420]], true);
  ctx.fillStyle = "#303247";
  ctx.fill();
  stroke(ctx, towerLine, "#75709290", 1);
  for (let x = 62; x < 323; x += 11) {
    for (let y = 377; y < 405; y += 8) {
      if ((x + y) % 5 < 3) {
        ctx.fillStyle = (x + y) % 3 === 0 ? "#b7874c88" : "#6b89a886";
        ctx.fillRect(x, y, 4, 2);
      }
    }
  }

  rounded(ctx, 72, 275, 226, 73, 9, "#181a2be8", "#a8796fb5");
  stroke(ctx, [[79, 285], [115, 285]], "#9ebfee", 1);
  stroke(ctx, [[254, 285], [291, 285]], "#9ebfee", 1);
  stencil(ctx, "MIDNIGHT", 185, 300, "800 25px Georgia, serif", "#fff0d6");
  stencil(ctx, "T R A N S I T", 185, 325, "bold 17px monospace", "#8be3da");
  stroke(ctx, [[114, 333], [256, 333]], "#b47a51bd", 1);
  ctx.restore();

  for (const points of [rim, ...guides]) {
    stroke(ctx, points.map(([x, y]) => [x + 2.4, y + 3]), "#080d17", 9);
    stroke(ctx, points, "#6b618d", 5.2);
    stroke(ctx, points, "#b3aac4", 2);
  }
  const lane = ctx.createLinearGradient(357, 0, 385, 0);
  lane.addColorStop(0, "#513f63");
  lane.addColorStop(0.45, "#302847");
  lane.addColorStop(1, "#241e38");
  ctx.fillStyle = lane;
  ctx.fillRect(359, 179, 25, 328);
  for (let y = 198; y <= 468; y += 28) {
    stroke(ctx, [[365, y + 5], [371, y], [377, y + 5]], "#e3a17678", 1.3);
  }
  stencil(ctx, "LINE BONUS", 185, 61, "bold 12px monospace", "#d6c2d9");
  stroke(ctx, [[95, 64], [132, 64]], "#508488", 1);
  stroke(ctx, [[238, 64], [275, 64]], "#508488", 1);
  stencil(ctx, "BALL SAVE", 185, 420, "bold 10px monospace", "#b9b7ce");
  stencil(ctx, "RETURN", 184, 509, "bold 10px monospace", "#79728c");
}

function paintBumper(ctx, bumper, flash, reduced) {
  const { x, y, color, label, radius } = bumper;
  circle(ctx, x + 2, y + 5, radius + 7, "#0a0c18");
  if (flash && !reduced) circle(ctx, x, y, radius + 4 + flash * 15, color + "45");
  circle(ctx, x, y, radius + 3, "#51455d");
  circle(ctx, x, y, radius + 1, color);
  circle(ctx, x, y, radius - 2, "#171727");
  const cap = ctx.createRadialGradient(x - 5, y - 7, 2, x, y, radius - 4);
  cap.addColorStop(0, flash ? "#fff5db" : "#554765");
  cap.addColorStop(1, flash ? color : "#222132");
  circle(ctx, x, y, radius - 4, cap);
  stencil(ctx, label, x, y + 5, "bold 13px monospace", flash ? "#222232" : color);
}

export function makePainter(canvas, reduced) {
  const density = Math.min(2, Math.max(1.5, window.devicePixelRatio || 1));
  canvas.width = WIDTH * density;
  canvas.height = HEIGHT * density;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const base = document.createElement("canvas");
  base.width = canvas.width;
  base.height = canvas.height;
  const art = base.getContext("2d");
  art.scale(density, density);
  paintPanel(art);

  return function paint(table) {
    ctx.setTransform(density, 0, 0, density, 0, 0);
    ctx.drawImage(base, 0, 0, WIDTH, HEIGHT);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    targets.forEach(({ x, y, label }, index) => {
      const lit = table.lamps[index];
      rounded(ctx, x - 17, y - 9, 34, 18, 4, "#161523", "#705d78");
      rounded(ctx, x - 13, y - 6, 26, 11, 2, lit ? "#facb80" : "#57506f", lit ? "#feebbd" : "#9c84a0");
      stencil(ctx, label, x, y + 3, "bold 10px monospace", lit ? "#281f1d" : "#fff0df");
    });

    slings.forEach((points, index) => {
      const lit = Boolean(table.slingFlash[index]);
      trace(ctx, points, true);
      ctx.fillStyle = lit ? "#9a678e" : "#4d395c";
      ctx.fill();
      ctx.strokeStyle = lit ? "#ffcebb" : "#bf8abb";
      ctx.lineWidth = 3;
      ctx.stroke();
      const [x, y] = points[1];
      circle(ctx, x, y, 3, "#f3b383");
    });

    bumpers.forEach((bumper, index) => paintBumper(ctx, bumper, table.bumperFlash[index], reduced));

    const saving = table.saver && (table.mode === "ready" || table.flight < 3.4);
    rounded(ctx, 164, 428, 43, 7, 3.5, saving ? "#8ad5bd" : "#4e465f", saving ? "#c8f2d7" : "#625873");

    for (const side of sides) {
      const f = table.flippers[side];
      const [endX, endY] = flipperEnd(f);
      const outline = [[f.x, f.y], [endX, endY]];
      stroke(ctx, [[f.x + 2, f.y + 3], [endX + 2, endY + 3]], "#0d0c17", 16);
      stroke(ctx, outline, "#752c56", 14);
      stroke(ctx, outline, f.held ? "#ffd0ce" : "#eb9eab", 9);
      stroke(ctx, [[f.x, f.y - 1.5], [endX, endY - 1.5]], "#ffe3c4", 2);
      circle(ctx, f.x, f.y, 4, "#773d61");
      circle(ctx, f.x, f.y, 2, "#e4ad94");
    }

    const charge = table.mode === "ready" ? table.charge : 0;
    rounded(ctx, 361, 507, 21, 15, 3, "#211d30", "#886d8e");
    stroke(ctx, [[371, 494 + charge * 12], [371, 524]], "#a06658", 4);
    stroke(ctx, [[365, 502 + charge * 10], [377, 502 + charge * 10]], "#ffc69d", 5);

    if (table.mode !== "over") {
      const { x, y } = table.ball;
      circle(ctx, x + 1.6, y + 2.7, BALL_RADIUS + 1.5, "#0e1123b0");
      const metal = ctx.createRadialGradient(x - 2.7, y - 3.4, 0.4, x, y, BALL_RADIUS + 0.3);
      metal.addColorStop(0, "#fffdf4");
      metal.addColorStop(0.40, "#e0e5eb");
      metal.addColorStop(0.79, "#8899ab");
      metal.addColorStop(1, "#485166");
      circle(ctx, x, y, BALL_RADIUS, metal);
      circle(ctx, x - 2.4, y - 3.9, 1.45, "#ffffff");
    }

    if (!reduced) {
      for (const { x, y, points, time } of table.pointFlashes) {
        ctx.globalAlpha = Math.min(1, time * 3);
        stencil(ctx, `+${points}`, x, y - (0.52 - time) * 34, "bold 13px monospace", "#ffe4af");
      }
      ctx.globalAlpha = 1;
    }
  };
}
