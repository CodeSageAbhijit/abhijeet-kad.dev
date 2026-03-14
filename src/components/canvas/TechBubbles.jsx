import * as THREE from "three";
import React, { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Decal, useTexture } from "@react-three/drei";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
} from "@react-three/rapier";

import CanvasLoader from "../Loader";

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const makeSphereConfigs = (count = 26) => {
  const scales = [0.75, 0.88, 1.0, 1.12, 1.2];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    scale: scales[i % scales.length],
  }));
};

const SphereBubble = ({ scale, logoTexture, isActive, seed }) => {
  const api = useRef(null);
  const impulseVec = useMemo(() => new THREE.Vector3(), []);

  const startPos = useMemo(() => {
    const a = seed * 0.73;
    return [
      Math.sin(a * 1.7) * 16,
      Math.cos(a * 1.2) * 10,
      Math.sin(a * 2.1) * 9,
    ];
  }, [seed]);

  useFrame((_state, delta) => {
    if (!isActive || !api.current) return;

    const d = Math.min(0.08, delta);
    const t = api.current.translation();
    impulseVec.set(t.x, t.y, t.z);
    const dist = impulseVec.length();
    if (dist > 0.0001) impulseVec.normalize();

    // Centering force grows with distance — prevents escaping boundary
    const centerStrength = Math.max(22, dist * 4) * scale;

    const time = performance.now() * 0.001 + seed;
    const driftX = Math.sin(time * 1.1) * 6;
    const driftY = Math.cos(time * 1.3) * 6;
    const driftZ = Math.sin(time * 0.9) * 4;

    api.current.applyImpulse(
      {
        x: impulseVec.x * -centerStrength * d + driftX * d,
        y: impulseVec.y * -centerStrength * d + driftY * d,
        z: impulseVec.z * -centerStrength * d + driftZ * d,
      },
      true
    );
  });

  return (
    <RigidBody
      ref={api}
      colliders={false}
      linearDamping={0.72}
      angularDamping={0.16}
      friction={0.18}
      restitution={0.94}
      position={startPos}
      lockRotations
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.15 * scale]}
        args={[0.16 * scale, 0.28 * scale]}
      />
      <mesh
        castShadow
        receiveShadow
        scale={scale}
        geometry={sphereGeometry}
      >
        <meshPhysicalMaterial
          color='#0f141a'
          roughness={0.12}
          metalness={0.42}
          clearcoat={1}
          clearcoatRoughness={0.08}
          emissive='#123321'
          emissiveIntensity={0.22}
        />
        <Decal
          position={[0, 0, 1]}
          rotation={[0, 0, 0]}
          scale={1.16}
          map={logoTexture}
          flatShading
        />
      </mesh>
    </RigidBody>
  );
};

const Pointer = ({ isActive }) => {
  const ref = useRef(null);
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;

    const target = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.22
    );

    ref.current.setNextKinematicTranslation(target);
  });

  return (
    <RigidBody
      ref={ref}
      type='kinematicPosition'
      colliders={false}
      position={[100, 100, 100]}
    >
      <BallCollider args={[1.4]} />
    </RigidBody>
  );
};

const TechBubblesScene = ({ icons, isActive }) => {
  const safeIcons = useMemo(() => {
    const normalized = icons.map((icon) => icon || TRANSPARENT_PIXEL);
    return Array.from(new Set(normalized));
  }, [icons]);

  const textures = useTexture(safeIcons);

  const configs = useMemo(() => makeSphereConfigs(safeIcons.length), [safeIcons.length]);

  return (
    <>
      <ambientLight intensity={0.65} />
      <hemisphereLight
        args={['#a8ffd8', '#050808', 0.52]}
      />
      <spotLight
        position={[20, 18, 20]}
        penumbra={1}
        angle={0.22}
        color='#d8fff0'
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[0, 7, -4]} intensity={1.35} color='#8fffc0' />

      <Physics gravity={[0, 0, 0]}>
        <Pointer isActive={isActive} />
        {configs.map((cfg, i) => (
          <SphereBubble
            key={cfg.id}
            scale={cfg.scale}
            logoTexture={textures[i]}
            isActive={isActive}
            seed={i + 1}
          />
        ))}
      </Physics>
    </>
  );
};

const TechBubblesCanvas = ({ technologies }) => {
  const [isActive, setIsActive] = useState(true);
  const icons = useMemo(() => technologies.map((t) => t.icon), [technologies]);

  return (
    <div
      style={{ width: "100%", height: "100%" }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(true)}
    >
      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: true, antialias: true }}
        camera={{ position: [0, 0, 18], fov: 36, near: 1, far: 100 }}
        onCreated={(state) => {
          state.gl.toneMappingExposure = 1.45;
        }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <TechBubblesScene icons={icons} isActive={isActive} />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default TechBubblesCanvas;
