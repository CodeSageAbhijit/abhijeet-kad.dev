// Measurements on a 1,000-pixel-wide reference of the TVM MD-3 photo.
const photo = { width: 1000, height: 1000 * 1633 / 2079 };
const cabinet = { x: 27, y: 107, width: 943, height: 644 };
const screen = { x: 157, y: 203, width: 606, height: 430 };

// Trace the inner edge of the photographed glass, leaving the dark seal visible.
const screenEdge = [
  [167, 203], [225, 207], [285, 207], [365, 210], [475, 208], [620, 209], [748, 208],
  [756, 213], [762, 225], [761, 302], [759, 360], [757, 420], [754, 480], [750, 540],
  [747, 580], [745, 599], [741, 609], [733, 615], [692, 620], [650, 624], [600, 627],
  [545, 630], [468, 632], [420, 630], [370, 627], [320, 624], [260, 621], [225, 617],
  [198, 613], [181, 610], [177, 596], [174, 573], [171, 542], [167, 480], [164, 420],
  [161, 360], [159, 300], [157, 246], [159, 220], [162, 207],
];
const glassClip = `polygon(${screenEdge.map(([x, y]) => (
  `${((x - screen.x) / screen.width * 100).toFixed(2)}% ${((y - screen.y) / screen.height * 100).toFixed(2)}%`
)).join(", ")})`;

const knobs = {
  power: { x: 891, y: 537, diameter: 53 },
  brightness: { x: 886, y: 601, diameter: 54 },
  contrast: { x: 882, y: 667, diameter: 56 },
};
const led = { x: 894, y: 462, diameter: 9 };

export function monitorLayout(width, height, focused = false) {
  const fit = focused ? screen : cabinet;
  const scale = Math.min(width * 0.95 / fit.width, height * 0.94 / fit.height);
  const left = (width - fit.width * scale) / 2 - fit.x * scale;
  const top = (height - fit.height * scale) / 2 - fit.y * scale;
  const locate = ({ x, y, diameter }) => ({
    left: left + x * scale,
    top: top + y * scale,
    size: diameter * scale,
  });
  const controls = Object.fromEntries(Object.entries(knobs).map(([id, knob]) => {
    const button = locate(knob);
    if (button.left < 12 || button.left > width - 12 || button.top < 12 || button.top > height - 12) return [id, null];
    return [id, {
      left: button.left,
      top: button.top,
      width: Math.max(44, button.size),
      height: Math.min(63 * scale, Math.max(44, button.size)),
    }];
  }));
  return {
    photo: { left, top, width: photo.width * scale, height: photo.height * scale },
    glass: {
      left: left + screen.x * scale,
      top: top + screen.y * scale,
      width: screen.width * scale,
      height: screen.height * scale,
      clipPath: glassClip,
    },
    shadow: { left: left + (cabinet.x + cabinet.width / 2) * scale, top: top + (cabinet.y + cabinet.height - 5) * scale, width: cabinet.width * scale },
    controls,
    led: locate(led),
  };
}
