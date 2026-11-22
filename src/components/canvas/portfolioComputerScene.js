import {
  ACESFilmicToneMapping, AmbientLight, Box3, CanvasTexture, DirectionalLight, Float32BufferAttribute,
  Mesh, MeshBasicMaterial, MeshStandardMaterial, PlaneGeometry, Raycaster, Scene,
  ShadowMaterial, Vector2, Vector3, VSMShadowMap, WebGLRenderer, sRGBEncoding,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import { createComputerCamera, getKeycap } from "./portfolioComputerLayout";
import { prepareComputer } from "./portfolioComputerRig";
import { drawComputerScreen, initialScreen, openScreenControl, SCREEN_HEIGHT, SCREEN_WIDTH } from "./portfolioComputerScreen";

const modelURL = `${import.meta.env.BASE_URL}the_pc/the_pc.gltf`;

function installScreen(mesh) {
  const display = document.createElement("canvas");
  display.width = SCREEN_WIDTH;
  display.height = SCREEN_HEIGHT;
  const context = display.getContext("2d");
  const texture = new CanvasTexture(display);
  texture.encoding = sRGBEncoding;

  // Project the display along the front of the exported curved CRT.
  const positions = mesh.geometry.attributes.position;
  const uv = new Float32Array(positions.count * 2);
  for (let i = 0; i < positions.count; i++) {
    uv[i * 2] = (positions.getX(i) + 262) / 524;
    uv[i * 2 + 1] = (positions.getY(i) + 210) / 420;
  }
  mesh.geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  mesh.material = new MeshBasicMaterial({ map: texture, toneMapped: false });

  return {
    texture,
    draw(state) {
      drawComputerScreen(context, state);
      texture.needsUpdate = true;
    },
  };
}

export function mountPortfolioComputer(container, handlers) {
  const renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.outputEncoding = sRGBEncoding;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = VSMShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  container.append(canvas);

  const scene = new Scene();
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const keyCenter = new Vector3();
  const abort = new AbortController();
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const pressed = new Map();
  const caps = new Map();
  const byAction = new Map();
  const originalMaterials = new Set();
  let rig;
  let imported;
  let screen;
  let power;
  let powerDepth;
  let display;
  let view;
  let frame = 0;
  let disposed = false;
  let displayState = initialScreen;
  let pointerStart = null;

  function draw(time) {
    frame = 0;
    for (const [cap, pressedAt] of pressed) {
      const elapsed = time - pressedAt;
      const progress = Math.max(0, Math.min(1, elapsed / 155));
      cap.object.position.y = cap.y - 17 * Math.sin(Math.PI * progress);
      if (progress === 1) pressed.delete(cap);
    }
    if (view && !document.hidden) renderer.render(scene, view.camera);
    if (pressed.size) invalidate();
  }

  function invalidate() {
    if (!disposed && !frame && !document.hidden) frame = requestAnimationFrame(draw);
  }

  function resize() {
    if (!view) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    if (!width || !height) return;
    view.resize(width / height);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6, Math.sqrt(1100000 / (width * height))));
    renderer.setSize(width, height, false);
    invalidate();
  }

  function press(cap) {
    if (!cap || reducedMotion.matches) return;
    pressed.set(cap, performance.now() - 16);
    invalidate();
  }

  function hitTest(event) {
    if (!view) return null;
    const area = canvas.getBoundingClientRect();
    pointer.set((event.clientX - area.left) / area.width * 2 - 1, -(event.clientY - area.top) / area.height * 2 + 1);
    raycaster.setFromCamera(pointer, view.camera);
    const hit = raycaster.intersectObject(rig, true)[0];
    let object = hit?.object;
    if (object === screen) {
      return { screen: true, x: hit.uv.x * SCREEN_WIDTH, y: (1 - hit.uv.y) * SCREEN_HEIGHT };
    }
    while (object && object !== rig) {
      if (object === power) return { power: true };
      if (caps.has(object)) return caps.get(object);
      object = object.parent;
    }
    if (event.pointerType === "touch") {
      let closest = null;
      let distance = 9;
      for (const cap of caps.values()) {
        cap.legend.geometry.boundingBox.getCenter(keyCenter).applyMatrix4(cap.legend.matrixWorld).project(view.camera);
        const offset = Math.hypot((keyCenter.x - pointer.x) * area.width / 2, (keyCenter.y - pointer.y) * area.height / 2);
        if (offset < distance) {
          distance = offset;
          closest = cap;
        }
      }
      return closest;
    }
    return null;
  }

  function pointerDown(event) {
    if (!event.isPrimary || event.button !== 0) return;
    const hit = hitTest(event);
    pointerStart = { hit, x: event.clientX, y: event.clientY };
    if (hit && (hit.screen || event.pointerType === "mouse")) event.preventDefault();
    if (hit?.power && !reducedMotion.matches) {
      power.position.z = powerDepth - 0.075;
      invalidate();
    } else if (hit && !hit.screen && !hit.power) {
      press(hit);
    }
  }

  function pointerUp(event) {
    if (!event.isPrimary || event.button !== 0) return;
    const start = pointerStart;
    pointerCancel();
    if (!start?.hit || Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
    if (start.hit.power) {
      handlers.onPower();
      return;
    }
    if (!start.hit.screen) {
      handlers.onKey(start.hit.key);
      return;
    }
    openScreenControl(start.hit.x, start.hit.y, displayState, handlers);
  }

  function pointerCancel() {
    if (pointerStart?.hit?.power && power.position.z !== powerDepth) {
      power.position.z = powerDepth;
      invalidate();
    }
    pointerStart = null;
  }

  function visibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
    } else {
      invalidate();
    }
  }

  async function load() {
    try {
      const response = await fetch(modelURL, { signal: abort.signal });
      if (!response.ok) throw new Error("Could not fetch the PC model");
      const data = await response.arrayBuffer();
      if (disposed) return;
      const asset = await new GLTFLoader().parseAsync(data, "");
      imported = asset.scene;
      if (disposed) {
        release(imported);
        return;
      }
      const prepared = prepareComputer(imported);
      ({ rig, screen, power } = prepared);
      const { computer } = prepared;
      powerDepth = power.position.z;
      scene.add(rig);

      const caseMaterial = new MeshStandardMaterial({ color: "#dfd6d0", roughness: 0.47 });
      const keyMaterial = new MeshStandardMaterial({ color: "#e7e0da", roughness: 0.53 });
      const modifierMaterial = new MeshStandardMaterial({ color: "#d1c5be", roughness: 0.54 });
      const legendMaterial = new MeshBasicMaterial({ color: "#373036" });
      const trimMaterial = new MeshStandardMaterial({ color: "#b7a9a5", roughness: 0.66 });
      originalMaterials.add(screen.material);
      display = installScreen(screen);

      computer.traverse((object) => {
        if (!object.isMesh || object === screen) return;
        object.castShadow = true;
        object.receiveShadow = true;
        originalMaterials.add(object.material);
        const parent = object.parent;
        const keycap = getKeycap(object);
        if (keycap) {
          const { object: cap, key } = keycap;
          const entry = { object: cap, y: cap.position.y, key, legend: object };
          caps.set(cap, entry);
          if (key && !byAction.has(key)) byAction.set(key, entry);
          object.material = legendMaterial;
          object.castShadow = false;
        } else if (/^Cap(?:_|$)/.test(parent.name) || parent.parent?.name === "spacebar") {
          const legend = parent.children.find((child) => child.geometry?.userData.parameters?.type === "TextGeometry");
          const text = legend?.geometry.userData.parameters.text;
          object.material = typeof text === "string" && /^(ESC|Backspace|Enter|Shift|Ctrl|Alt|Win|Tab|Caps)/.test(text) ? modifierMaterial : keyMaterial;
        } else {
          object.material = object.name === "components" || object.name === "grafics" ? trimMaterial : caseMaterial;
        }
      });

      const keyLight = new DirectionalLight("#fff6ef", 1.68);
      const bounds = new Box3().setFromObject(rig);
      keyLight.target.position.copy(bounds.getCenter(new Vector3()));
      keyLight.position.copy(keyLight.target.position).add(new Vector3(-6, 21, 9));
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(768, 768);
      keyLight.shadow.radius = 5.5;
      keyLight.shadow.blurSamples = 12;
      Object.assign(keyLight.shadow.camera, { left: -13, right: 13, bottom: -12, top: 12, far: 43 });
      keyLight.shadow.bias = -0.0003;
      keyLight.shadow.normalBias = 0.035;
      keyLight.shadow.camera.updateProjectionMatrix();
      const pinkLight = new DirectionalLight("#ff9da8", 1.16);
      pinkLight.position.set(-8, 3, 11);
      const fill = new DirectionalLight("#d4ccdf", 0.9);
      fill.position.set(7, 5, -10);
      const ground = new Mesh(new PlaneGeometry(36, 34), new ShadowMaterial({ opacity: 0.39 }));
      ground.position.set(keyLight.target.position.x, bounds.min.y - 0.035, keyLight.target.position.z);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(new AmbientLight("#f8eff0", 0.62), keyLight, keyLight.target, pinkLight, fill, ground);
      scene.updateMatrixWorld(true);
      view = createComputerCamera(rig);
      display?.draw(displayState);
      resize();
      renderer.shadowMap.needsUpdate = true;
      renderer.render(scene, view.camera);
      handlers.onReady();
    } catch (error) {
      if (!disposed) handlers.onError(error);
    }
  }

  function release(root) {
    if (!root) return;
    const geometries = new Set();
    const materials = new Set();
    root.traverse((object) => {
      if (!object.isMesh) return;
      geometries.add(object.geometry);
      materials.add(object.material);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
  }

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  canvas.addEventListener("pointerdown", pointerDown);
  canvas.addEventListener("pointerup", pointerUp);
  canvas.addEventListener("pointercancel", pointerCancel);
  canvas.addEventListener("webglcontextlost", handlers.onError);
  document.addEventListener("visibilitychange", visibility);
  load();

  return {
    update(next) {
      displayState = next;
      display?.draw(next);
      invalidate();
    },
    pressKey(key) {
      press(byAction.get(key.length === 1 ? key.toLowerCase() : key));
    },
    dispose() {
      disposed = true;
      abort.abort();
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
      canvas.removeEventListener("pointercancel", pointerCancel);
      canvas.removeEventListener("webglcontextlost", handlers.onError);
      release(scene);
      release(imported);
      originalMaterials.forEach((material) => material.dispose());
      display?.texture.dispose();
      scene.traverse((object) => object.shadow?.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}
