import { Box3, OrthographicCamera, Vector3 } from "three";

const keyAliases = { esc: "Escape", enter: "Enter", backspace: "Backspace", del: "Delete" };

export function getKeycap(legendMesh) {
  const parameters = legendMesh.geometry?.userData.parameters;
  const parent = legendMesh.parent;
  if (parameters?.type !== "TextGeometry" || !parent) return null;

  if (parent.parent?.name === "spacebar") return { object: parent.parent, key: " " };
  if (!/^Cap(?:_|$)/.test(parent.name)) return null;

  const legend = parameters.text?.textValue ?? parameters.text ?? "";
  const firstLine = legend.split("\n")[0].trim().toLowerCase();
  const key = keyAliases[firstLine] ?? (firstLine.length === 1 ? firstLine : null);
  return { object: parent, key };
}

export function createComputerCamera(computer) {
  const camera = new OrthographicCamera(-8, 8, 6, -6, 0.1, 90);
  const center = new Box3().setFromObject(computer).getCenter(new Vector3());
  camera.position.copy(center).add(new Vector3(19, 17, 25));
  camera.lookAt(center);
  camera.updateMatrixWorld(true);
  const bounds = new Box3();
  const point = new Vector3();

  computer.traverse((object) => {
    if (!object.isMesh) return;
    object.geometry.computeBoundingBox();
    const { min, max } = object.geometry.boundingBox;
    for (const x of [min.x, max.x]) {
      for (const y of [min.y, max.y]) {
        for (const z of [min.z, max.z]) {
          bounds.expandByPoint(point.set(x, y, z).applyMatrix4(object.matrixWorld).applyMatrix4(camera.matrixWorldInverse));
        }
      }
    }
  });

  return {
    camera,
    resize(aspect) {
      const size = bounds.getSize(new Vector3());
      const midpoint = bounds.getCenter(new Vector3());
      const halfHeight = Math.max(size.y, size.x / aspect) * 0.525;
      camera.left = midpoint.x - halfHeight * aspect;
      camera.right = midpoint.x + halfHeight * aspect;
      camera.top = midpoint.y + halfHeight;
      camera.bottom = midpoint.y - halfHeight;
      camera.updateProjectionMatrix();
    },
  };
}
