const outline =
  "M21 3a18 18 0 1 0 0 36c11 0 15-8 18-17L46 3H21zm0 12a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm22-12h30c-3 9-9 13-20 13l13 1c-4 7-10 10-18 10-4 9-12 13-23 12 9-5 12-23 18-36z";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";

export default function FanSculpture({ clicked }) {
  const canvas = useRef(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(260, 260, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0.1, 8.5);

    /* ── Lighting (360 coverage for spinning logo) ── */
    const key = new THREE.DirectionalLight(0xdceeff, 2.8);
    key.position.set(-3, 4, 6);
    const fill = new THREE.DirectionalLight(0x6699cc, 1.4);
    fill.position.set(5, 1, 3);
    const backKey = new THREE.DirectionalLight(0x99ccff, 2.2);
    backKey.position.set(3, 3, -6);
    const backFill = new THREE.DirectionalLight(0x4477aa, 1.2);
    backFill.position.set(-4, -1, -4);
    const top = new THREE.DirectionalLight(0xffffff, 0.8);
    top.position.set(0, 8, 0);
    scene.add(key, fill, backKey, backFill, top);
    scene.add(new THREE.HemisphereLight(0xddeeff, 0x112233, 1.4));

    /* ── Logo ── */
    const shapes = new SVGLoader()
      .parse('<svg><path fill-rule="evenodd" d="' + outline + '"/></svg>')
      .paths.flatMap((p) => SVGLoader.createShapes(p));

    const logoGeo = new THREE.ExtrudeGeometry(shapes, {
      depth: 5,
      bevelThickness: 0.8,
      bevelSize: 0.7,
      bevelSegments: 6,
    });
    logoGeo.center();
    logoGeo.computeVertexNormals();

    const logoMat = new THREE.MeshStandardMaterial({
      color: 0x5ba4d9,
      metalness: 0.82,
      roughness: 0.12,
    });
    const logo = new THREE.Mesh(logoGeo, logoMat);
    logo.scale.set(0.048, -0.048, 0.048);
    logo.position.set(0, 0, 0);
    scene.add(logo);

    /* ── Animation state ── */
    const render = () => renderer.render(scene, camera);
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let elapsed = 0;
    let last = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let currentRotationY = 0;
    let clickBounce = 0;

    function sync() {
      last = 0;
      renderer.setAnimationLoop(
        visible && !document.hidden && !media.matches
          ? (time) => {
              if (last) {
                const delta = Math.min((time - last) * 0.001, 0.1);
                currentRotationY += 1.4 * delta;
                elapsed += delta;
              }
              last = time;

              // Smooth lerp toward pointer target
              currentX += (targetX - currentX) * 0.07;
              currentY += (targetY - currentY) * 0.07;

              // Gentle idle float + continuous 360 rotation
              const floatY = Math.sin(elapsed * 1.5) * 0.06;

              // Click bounce decay
              if (clickBounce > 0.001) clickBounce *= 0.93;
              else clickBounce = 0;
              const bounceScale = 1 + clickBounce * 0.15;

              logo.position.y = floatY;
              logo.rotation.x = currentX * 0.25;
              logo.rotation.y = currentRotationY + currentY * 0.35;
              logo.scale.set(
                0.048 * bounceScale,
                -0.048 * bounceScale,
                0.048 * bounceScale
              );

              render();
            }
          : null
      );
      render();
    }

    function onPointerMove(e) {
      const rect = el.getBoundingClientRect();
      targetY = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      targetX = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    }
    function onPointerLeave() {
      targetX = 0;
      targetY = 0;
    }

    // Expose a bounce trigger for clicks
    el._triggerBounce = () => {
      clickBounce = 1;
    };

    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerleave", onPointerLeave);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    media.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    setLive(true);

    return () => {
      el._triggerBounce = null;
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerleave", onPointerLeave);
      observer.disconnect();
      media.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
      renderer.setAnimationLoop(null);
      logoGeo.dispose();
      logoMat.dispose();
      renderer.dispose();
    };
  }, []);

  /* Trigger bounce on click */
  useEffect(() => {
    if (clicked) canvas.current?._triggerBounce?.();
  }, [clicked]);

  return (
    <span className={"fan-sculpture" + (live ? " live" : "")}>
      <canvas ref={canvas} aria-hidden="true" />
    </span>
  );
}
