import { readFile, writeFile } from "node:fs/promises";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Box3, Vector3 } from "three";
import { createComputerCamera, getKeycap } from "../src/components/canvas/portfolioComputerLayout.js";

// The poster is captured from the desktop camera at this aspect ratio.
const aspect = 1.54;
const model = new URL("../public/the_pc/the_pc.gltf", import.meta.url);
const output = new URL("../src/components/canvas/portfolioComputerHitMap.json", import.meta.url);
globalThis.ProgressEvent ??= class ProgressEvent {
  constructor(type, details) { Object.assign(this, { type }, details); }
};
const asset = await new GLTFLoader().parseAsync(await readFile(model, "utf8"), "");
asset.scene.updateMatrixWorld(true);
const computer = asset.scene.getObjectByName("computer");
const { camera, resize } = createComputerCamera(computer);
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

const caps = [];
const point = new Vector3();
computer.getObjectByName("keyboard").traverse((legend) => {
  const cap = getKeycap(legend);
  if (!cap) return;
  const vertices = [];
  cap.object.traverse((mesh) => {
    if (!mesh.isMesh) return;
    const positions = mesh.geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      vertices.push(project(point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld)));
    }
  });
  caps.push({
    key: cap.key,
    center: project(new Box3().setFromObject(legend).getCenter(point)).slice(0, 2),
    points: outline(vertices).map((vertex) => vertex.slice(0, 2).map((value) => +value.toFixed(5))),
  });
});

const screen = computer.getObjectByName("screen");
// An inset plane leaves room for the glass curvature on the pre-rendered PC.
const surface = [[-229, 185], [229, 185], [-229, -179]]
  .map(([x, y]) => project(screen.localToWorld(new Vector3(x, y, 329))).slice(0, 2));
const map = {
  aspect,
  surface,
  keys: caps,
};
await writeFile(output, JSON.stringify(map) + "\n");
