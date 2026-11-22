export const WIDTH = 400;
export const HEIGHT = 530;
export const BALL_RADIUS = 7;
export const STEP = 1 / 240;

export const rim = [
  [14, 528], [14, 103], [26, 70], [49, 45], [83, 28],
  [120, 24], [285, 24], [326, 31], [354, 49], [377, 77],
  [387, 109], [387, 517], [356, 517], [356, 99],
];
export const guides = [
  [[14, 385], [46, 422], [79, 439], [118, 471]],
  [[356, 389], [324, 422], [285, 440], [251, 471]],
  [[21, 274], [47, 298], [53, 331]],
  [[348, 275], [322, 298], [316, 331]],
];
export const bumpers = [
  { x: 115, y: 164, radius: 22, color: "#80efe1", label: "01" },
  { x: 256, y: 164, radius: 22, color: "#f4b867", label: "02" },
  { x: 185, y: 238, radius: 23, color: "#d2a2fa", label: "03" },
];
export const targets = [
  { x: 102, y: 105, label: "L" }, { x: 157, y: 93, label: "I" },
  { x: 213, y: 93, label: "N" }, { x: 268, y: 105, label: "E" },
];
export const slings = [
  [[59, 345], [65, 398], [117, 425]],
  [[311, 345], [306, 398], [254, 425]],
];
const FLIPPER_LENGTH = 51;
const FLIPPER_RADIUS = 6;
const SHOT_X = 371;
export const sides = ["left", "right"];

function polyline(points) {
  return points.slice(1).map(([x, y], index) => [points[index][0], points[index][1], x, y]);
}

const rails = [...polyline(rim), ...guides.flatMap(polyline)];
const slingRails = slings.map((points) => polyline([...points, points[0]]));
const targetRails = targets.map(({ x, y }, index) => {
  const slope = index % 2 === 0 ? 2.5 : -2.5;
  return [x - 15, y - slope, x + 15, y + slope];
});

export function newTable(best = 0) {
  return {
    score: 0, best, balls: 3, multiplier: 1, mode: "ready",
    ball: { x: SHOT_X, y: 496, vx: 0, vy: 0 },
    flippers: {
      left: { x: 118, y: 471, rest: 0.42, up: -0.65, angle: 0.42, rate: 0, held: false },
      right: { x: 251, y: 471, rest: Math.PI - 0.42, up: Math.PI + 0.65, angle: Math.PI - 0.42, rate: 0, held: false },
    },
    lamps: targets.map(() => false),
    bumperFlash: bumpers.map(() => 0),
    slingFlash: slings.map(() => 0),
    bankFlash: 0,
    pointFlashes: [],
    saver: true, inLane: false, flight: 0, charge: 0, charging: false,
    message: "Hold and release to launch",
  };
}

export function flipperEnd(flipper) {
  return [
    flipper.x + Math.cos(flipper.angle) * FLIPPER_LENGTH,
    flipper.y + Math.sin(flipper.angle) * FLIPPER_LENGTH,
  ];
}

export function launchBall(table, emit) {
  if (table.mode !== "ready") return;
  const strength = Math.max(table.charge, 0.18);
  table.mode = "playing";
  table.ball = { x: SHOT_X, y: 496, vx: 0, vy: -850 - strength * 255 };
  table.inLane = true;
  table.flight = 0;
  table.charge = 0;
  table.charging = false;
  table.message = table.saver ? "Ball save is lit" : "Hit L I N E to raise the multiplier";
  emit("launch");
}

function score(table, amount, x, y, event, emit) {
  const points = amount * table.multiplier;
  table.score += points;
  table.best = Math.max(table.best, table.score);
  table.pointFlashes.push({ x, y, points, time: 0.52 });
  emit(event);
}

function drain(table, emit) {
  if (table.flight < 3.4 && table.saver) {
    table.saver = false;
    table.mode = "ready";
    table.message = "Ball saved · Launch again";
    emit("save");
  } else {
    table.balls--;
    table.mode = table.balls ? "ready" : "over";
    table.saver = Boolean(table.balls);
    table.message = table.balls ? "Ball lost · Launch the next ball" : "Game over";
    emit("drain");
  }
  table.ball = { x: SHOT_X, y: 496, vx: 0, vy: 0 };
  table.inLane = false;
}

function collide(ball, ax, ay, bx, by, padding, rebound, surfaceX = 0, surfaceY = 0) {
  const dx = bx - ax;
  const dy = by - ay;
  const span = dx * dx + dy * dy;
  const along = span ? Math.max(0, Math.min(1, ((ball.x - ax) * dx + (ball.y - ay) * dy) / span)) : 0;
  const offX = ball.x - (ax + dx * along);
  const offY = ball.y - (ay + dy * along);
  const distance = Math.hypot(offX, offY);
  const reach = BALL_RADIUS + padding;
  if (distance >= reach || distance < 0.0001) return false;
  const nx = offX / distance;
  const ny = offY / distance;
  ball.x += nx * (reach - distance + 0.02);
  ball.y += ny * (reach - distance + 0.02);
  const toward = (ball.vx - surfaceX * along) * nx + (ball.vy - surfaceY * along) * ny;
  if (toward >= 0) return false;
  const impulse = -(1 + rebound) * toward;
  ball.vx += nx * impulse;
  ball.vy += ny * impulse;
  return true;
}

export function stepTable(table, dt, emit) {
  for (const side of sides) {
    const f = table.flippers[side];
    const angle = f.angle;
    const goal = f.held ? f.up : f.rest;
    const limit = (f.held ? 22 : 13) * dt;
    f.angle += Math.max(-limit, Math.min(limit, goal - f.angle));
    f.rate = (f.angle - angle) / dt;
  }
  if (table.charging) table.charge = Math.min(1, table.charge + dt * 1.15);
  for (const flashes of [table.bumperFlash, table.slingFlash]) {
    for (let index = 0; index < flashes.length; index++) flashes[index] = Math.max(0, flashes[index] - dt);
  }
  for (let index = table.pointFlashes.length - 1; index >= 0; index--) {
    table.pointFlashes[index].time -= dt;
    if (table.pointFlashes[index].time <= 0) table.pointFlashes.splice(index, 1);
  }
  if (table.bankFlash > 0) {
    table.bankFlash = Math.max(0, table.bankFlash - dt);
    if (table.bankFlash === 0) table.lamps.fill(false);
  }
  if (table.mode !== "playing") return;

  const ball = table.ball;
  table.flight += dt;
  ball.vy += 625 * dt;
  ball.vx *= 1 - dt * 0.11;
  ball.vy *= 1 - dt * 0.11;
  const speed = Math.hypot(ball.vx, ball.vy);
  if (speed > 1200) {
    ball.vx *= 1200 / speed;
    ball.vy *= 1200 / speed;
  }
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  if (table.inLane && ball.y < 85) {
    ball.vx = Math.min(ball.vx, -205);
    table.inLane = false;
  }
  // The lane gate deflects returning shots into the playfield.
  if (!table.inLane && ball.x > 353 && ball.y >= 87 && ball.y < 108 && ball.vy > 0) {
    ball.y = 86;
    ball.vy = -170;
    ball.vx = Math.min(ball.vx, -265);
  }
  if (ball.x > 356 && ball.y > 503 && ball.vy > 0) {
    ball.vy = -910;
    table.inLane = true;
  }
  rails.forEach((rail) => collide(ball, ...rail, 1.8, 0.78));
  bumpers.forEach(({ x, y, radius }, index) => {
    if (!collide(ball, x, y, x, y, radius, 1.11) || table.bumperFlash[index] > 0.19) return;
    const distance = Math.hypot(ball.x - x, ball.y - y);
    ball.vx += (ball.x - x) / distance * 220;
    ball.vy += (ball.y - y) / distance * 220;
    table.bumperFlash[index] = 0.27;
    score(table, 125, x, y - 12, "bumper", emit);
  });
  targetRails.forEach((rail, index) => {
    if (!collide(ball, ...rail, 4, 0.88) || table.lamps[index]) return;
    table.lamps[index] = true;
    const { x, y } = targets[index];
    score(table, 250, x, y + 12, "target", emit);
    if (table.lamps.every(Boolean)) {
      score(table, 1000, WIDTH / 2, 128, "bank", emit);
      table.multiplier = Math.min(5, table.multiplier + 1);
      table.message = `Line complete · ${table.multiplier}× scoring`;
      table.bankFlash = 0.88;
    }
  });
  slingRails.forEach((group, index) => {
    const hit = group.some((rail) => collide(ball, ...rail, 3, 0.87));
    if (!hit || table.slingFlash[index] > 0.16) return;
    ball.vx += index === 0 ? 174 : -174;
    ball.vy -= 178;
    table.slingFlash[index] = 0.24;
    score(table, 55, ball.x, ball.y - 18, "sling", emit);
  });
  for (const side of sides) {
    const f = table.flippers[side];
    const [x, y] = flipperEnd(f);
    const swung = f.held && Math.abs(f.rate) > 2;
    if (collide(ball, f.x, f.y, x, y, FLIPPER_RADIUS, swung ? 0.68 : 0.37,
      -(y - f.y) * f.rate, (x - f.x) * f.rate) && swung) {
      ball.vy = Math.min(ball.vy, -440);
      emit("strike");
    }
  }
  if (ball.y > HEIGHT + 12 || ball.y < 0 || ball.x < 0 || ball.x > WIDTH) drain(table, emit);
}

export function hasMotion(table) {
  return table.mode === "playing" || (table.charging && table.charge < 1) ||
    table.pointFlashes.length > 0 || sides.some((side) => {
      const f = table.flippers[side];
      return Math.abs(f.angle - (f.held ? f.up : f.rest)) > 0.0001;
    });
}
