import {
  Box3, BoxGeometry, CylinderGeometry, ExtrudeGeometry, Group, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, Shape, TorusGeometry,
} from "three";

function roundedPanel(width, height, depth, radius) {
  const x = width / 2;
  const y = height / 2;
  const shape = new Shape();
  shape.moveTo(-x + radius, -y);
  shape.lineTo(x - radius, -y);
  shape.quadraticCurveTo(x, -y, x, -y + radius);
  shape.lineTo(x, y - radius);
  shape.quadraticCurveTo(x, y, x - radius, y);
  shape.lineTo(-x + radius, y);
  shape.quadraticCurveTo(-x, y, -x, y - radius);
  shape.lineTo(-x, -y + radius);
  shape.quadraticCurveTo(-x, -y, -x + radius, -y);
  return new ExtrudeGeometry(shape, {
    depth, bevelEnabled: true, bevelSize: 0.047, bevelThickness: 0.047,
    bevelSegments: 2, curveSegments: 5,
  });
}

function createTower() {
  const tower = new Group();
  tower.name = "Tower";
  tower.position.set(-5.7, 0, -4.95);
  tower.rotation.y = 0.22;
  const shell = new MeshStandardMaterial({ color: "#ded4ca", roughness: 0.53 });
  const face = new MeshStandardMaterial({ color: "#f0e3d5", roughness: 0.49 });
  const trim = new MeshStandardMaterial({ color: "#938988", roughness: 0.72 });
  const recess = new MeshStandardMaterial({ color: "#453e47", roughness: 0.85 });
  const led = new MeshBasicMaterial({ color: "#b2edcb" });

  function part(parent, geometry, material, x, y, z) {
    const mesh = new Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  part(tower, roundedPanel(2.78, 6.42, 3.42, 0.17), shell, 0, 3.36, -1.72);
  part(tower, roundedPanel(2.56, 6.07, 0.13, 0.14), face, 0, 3.36, 1.72);
  part(tower, new BoxGeometry(2.5, 0.23, 3.15), trim, 0, 0.115, 0);
  for (const height of [5.6, 4.94, 4.3]) {
    part(tower, roundedPanel(2.03, 0.49, 0.04, 0.09), trim, 0, height, 1.88);
    part(tower, new BoxGeometry(1.62, 0.053, 0.045), recess, 0, height + 0.025, 1.966);
    part(tower, new BoxGeometry(0.21, 0.062, 0.041), face, 0.72, height - 0.13, 1.97);
  }

  for (let row = 0; row < 7; row++) {
    part(tower, new BoxGeometry(1.92, 0.066, 0.038), trim, 0, 0.61 + row * 0.15, 1.917);
    part(tower, new BoxGeometry(0.03, 0.055, 1.35), trim, 1.41, 1.13 + row * 0.15, -0.34);
  }

  const power = new Group();
  power.name = "Power";
  power.position.set(0, 2.98, 1.97);
  tower.add(power);
  const ring = part(power, new CylinderGeometry(0.39, 0.39, 0.095, 28), recess, 0, 0, 0);
  ring.rotation.x = Math.PI / 2;
  const button = part(power, new CylinderGeometry(0.304, 0.304, 0.19, 28), trim, 0, 0, 0.078);
  button.rotation.x = Math.PI / 2;
  part(power, new TorusGeometry(0.153, 0.022, 7, 28, Math.PI * 1.62), led, 0, -0.014, 0.18).rotation.z = Math.PI * 0.69;
  part(power, new BoxGeometry(0.04, 0.148, 0.016), led, 0, 0.122, 0.183);
  part(tower, new BoxGeometry(0.22, 0.08, 0.038), led, 0, 2.267, 1.917);

  return { tower, power };
}

export function prepareComputer(assetScene) {
  assetScene.updateMatrixWorld(true);
  const computer = assetScene.getObjectByName("computer");
  const monitor = computer?.getObjectByName("monitor");
  const screen = monitor?.getObjectByName("screen");
  const keyboard = computer?.getObjectByName("keyboard");
  if (!screen?.geometry || !keyboard) throw new Error("The PC model is missing its screen or keyboard");

  const monitorFace = new Group();
  monitor.add(monitorFace);
  for (const name of ["screen", "frame", "grafics"]) {
    monitorFace.add(monitor.getObjectByName(name));
  }
  monitorFace.scale.set(1.22, 1.23, 1.05);
  monitorFace.position.y = 34;

  const rig = new Group();
  rig.attach(computer);
  const { tower, power } = createTower();
  tower.position.y = new Box3().setFromObject(computer).min.y;
  rig.add(tower);
  rig.updateMatrixWorld(true);
  return { rig, computer, screen, keyboard, power };
}
