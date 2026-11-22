import { readFile, writeFile } from "node:fs/promises";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box3, Vector3 } from "three";
import { createComputerCamera, getKeycap } from "../src/components/canvas/portfolioComputerLayout.js";
import { prepareComputer } from "../src/components/canvas/portfolioComputerRig.js";

// The poster is captured from the desktop camera at this aspect ratio.
const aspect = 1.54;
const model = new URL("../public/the_pc/the_pc.gltf", import.meta.url);
const output = new URL("../src/components/canvas/portfolioComputerHitMap.json", import.meta.url);
globalThis.ProgressEvent ??= class ProgressEvent {
  constructor(type, details) { Object.assign(this, { type }, details); }
};
const asset = await new GLTFLoader().parseAsync(await readFile(model, "utf8"), "");
const { rig, screen, keyboard, power } = prepareComputer(asset.scene);
const { camera, resize } = createComputerCamera(rig);
resize(aspect);

function project(point) {
  const { x, y, z } = point.project(camera);
  return [(x + 1) / 2, (1 - y) / 2, z];
}

function outline(points) {
  const sorted = points.sort(([ax, ay], [bx, by]) => ax - bx || ay - by);
  const turn = ([ax, ay], [bx, by], [cx, cy]) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const bend = (ordered) => {
    const edge = [];
    for (const point of ordered) {
      while (edge.length > 1 && turn(edge.at(-2), edge.at(-1), point) <= 0) edge.pop();
      edge.push(point);
    }
    return edge.slice(0, -1);
  };
  return [...bend(sorted), ...bend(sorted.reverse())];
}

const point = new Vector3();
function hitArea(object, centerObject = object) {
  const vertices = [];
  object.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const positions = mesh.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      vertices.push(project(point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld)));
    }
  });
  return {
    center: project(new Box3().setFromObject(centerObject).getCenter(point)).slice(0, 2),
    points: outline(vertices).map((vertex) => vertex.slice(0, 2).map((value) => +value.toFixed(5))),
  };
}

const caps = [];
keyboard.traverse((legend) => {
  const cap = getKeycap(legend);
  if (cap) caps.push({ key: cap.key, ...hitArea(cap.object, legend) });
});

// An inset plane leaves room for the glass curvature on the pre-rendered PC.
const surface = [[-229, 185], [229, 185], [-229, -179]]
  .map(([x, y]) => project(screen.localToWorld(new Vector3(x, y, 329))).slice(0, 2));
const map = {
  aspect,
  surface,
  power: hitArea(power),
  keys: caps,
};
await writeFile(output, JSON.stringify(map) + "\n");
