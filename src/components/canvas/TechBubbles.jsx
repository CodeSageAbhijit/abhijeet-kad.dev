import * as THREE from "three";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Decal, useTexture } from "@react-three/drei";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
} from "@react-three/rapier";

import CanvasLoader from "../Loader";
import { markEasterEggFound, track } from "../../utils/analytics";

const sphereGeometry = new THREE.SphereGeometry(1, 28, 28);
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

const makeSphereConfigs = (count = 15) => {
  const scales = [0.54, 0.6, 0.64, 0.68, 0.72];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    scale: scales[i % scales.length],
  }));
};

function getOrganizedSlot(index, total) {
  const cols = total <= 10 ? 4 : 5;
  const rows = Math.ceil(total / cols);
  const row = Math.floor(index / cols);
  const itemsInRow = row === rows - 1 ? total - row * cols : cols;
  const col = index % cols;

  const spacingX = 2.45;
  const spacingY = 2.35;
  const x = (col - (itemsInRow - 1) / 2) * spacingX;
  const y = ((rows - 1) / 2 - row) * spacingY;
  return [x, y, 0];
}

function getInspectSlot(index, total, focusedIndex) {
  if (index === focusedIndex) {
    return [0, 0.35, 6.2];
  }
  const otherIdx = index < focusedIndex ? index : index - 1;
  const otherTotal = Math.max(1, total - 1);
  const angle = ((otherIdx / Math.max(1, otherTotal - 1)) - 0.5) * Math.PI * 0.92;
  const radiusX = 6.8;
  const x = Math.sin(angle) * radiusX;
  const y = -2.4 + Math.cos(angle) * 0.85;
  const z = -4.2 - Math.abs(Math.sin(angle)) * 1.6;
  return [x, y, z];
}

/**
 * Mystical Magic 8-Ball aura & golden-violet confetti burst when clicking the blank sphere in 1-by-1 mode.
 */
const MysteryOrbSurprise = ({ rollCount }) => {
  const burstRef = useRef(null);
  const haloRef = useRef(null);
  const shakeRef = useRef(0);
  const prevRollRef = useRef(0);

  const sparks = useMemo(() => {
    const palette = ["#fbbf24", "#c084fc", "#f472b6", "#fde68a", "#34d399"];
    return Array.from({ length: 30 }, (_, i) => {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 30);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.32 + (i % 4) * 0.16;
      return {
        pos: [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ],
        color: palette[i % palette.length],
        size: 0.032 + (i % 3) * 0.012,
      };
    });
  }, []);

  useEffect(() => {
    if (rollCount > prevRollRef.current) {
      prevRollRef.current = rollCount;
      shakeRef.current = 1;
    }
  }, [rollCount]);

  useFrame((state, delta) => {
    const d = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;
    shakeRef.current = Math.max(0, shakeRef.current - d * 2.2);

    if (burstRef.current) {
      burstRef.current.rotation.y += d * (0.9 + shakeRef.current * 4.5);
      burstRef.current.rotation.z = Math.sin(t * 2.2) * 0.14;
      const expand = 1 + shakeRef.current * 0.25 + Math.sin(t * 3.1) * 0.03;
      burstRef.current.scale.setScalar(expand);
    }
    if (haloRef.current) {
      haloRef.current.rotation.z -= d * 1.4;
      haloRef.current.rotation.x = 1.15 + Math.sin(t * 1.7) * 0.15;
    }
  });

  return (
    <group ref={burstRef}>
      {/* Golden-violet mystical ring */}
      <mesh ref={haloRef} rotation={[1.15, 0.2, 0]}>
        <torusGeometry args={[1.36, 0.024, 12, 56]} />
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.85} />
      </mesh>
      <mesh rotation={[-1.05, -0.35, 0.4]}>
        <torusGeometry args={[1.22, 0.016, 12, 48]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.7} />
      </mesh>

      {/* Floating multi-color confetti sparks */}
      {sparks.map((s, idx) => (
        <mesh
          key={idx}
          position={s.pos}
          rotation={[idx * 0.4, idx * 0.7, idx * 0.3]}
        >
          <octahedronGeometry args={[s.size, 0]} />
          <meshBasicMaterial color={s.color} />
        </mesh>
      ))}
    </group>
  );
};

const SphereBubble = ({
  index,
  total,
  scale,
  logoTexture,
  isActive,
  mode,
  focusedIndex,
  surpriseActive,
  surpriseRollCount,
  attractingRef,
  pointerWorldRef,
  blastPulseRef,
  onSelect,
}) => {
  const api = useRef(null);
  const holderRef = useRef(null);
  const meshRef = useRef(null);
  const impulseVec = useMemo(() => new THREE.Vector3(), []);
  const tangentVec = useMemo(() => new THREE.Vector3(), []);
  const targetVec = useMemo(() => new THREE.Vector3(), []);
  const currentPos = useMemo(() => new THREE.Vector3(), []);
  const lastBlastSeen = useRef(0);
  const shakeEnergyRef = useRef(0);
  const prevRollRef = useRef(0);

  const startPos = useMemo(() => {
    const a = (index + 1) * 0.73;
    return [
      Math.sin(a * 1.7) * 9.5,
      Math.cos(a * 1.2) * 5.2,
      Math.sin(a * 2.1) * 4.5,
    ];
  }, [index]);

  const isGuided = mode !== "float";
  const isFocused = mode === "inspect" && index === focusedIndex;

  useEffect(() => {
    if (surpriseActive && surpriseRollCount > prevRollRef.current) {
      prevRollRef.current = surpriseRollCount;
      shakeEnergyRef.current = 1;
    }
  }, [surpriseActive, surpriseRollCount]);

  useFrame((state, delta) => {
    if (!isActive || !api.current) return;

    const d = Math.min(0.06, delta);
    const time = state.clock.elapsedTime;
    const t = api.current.translation();
    currentPos.set(t.x, t.y, t.z);
    shakeEnergyRef.current = Math.max(0, shakeEnergyRef.current - d * 2.3);

    if (isGuided) {
      const [tx, ty, tz] =
        mode === "inspect"
          ? getInspectSlot(index, total, focusedIndex)
          : getOrganizedSlot(index, total);

      const shakeX = isFocused ? Math.sin(time * 42) * 0.14 * shakeEnergyRef.current : 0;
      const shakeY = isFocused ? Math.cos(time * 36) * 0.11 * shakeEnergyRef.current : 0;

      targetVec.set(
        tx + shakeX,
        ty + shakeY + (isFocused ? Math.sin(time * 2.0) * 0.1 : Math.sin(time * 1.4 + index) * 0.05),
        tz
      );
      currentPos.lerp(targetVec, 1 - Math.exp(-d * 8.5));
      api.current.setTranslation(currentPos, true);
      api.current.setLinvel({ x: 0, y: 0, z: 0 }, true);

      if (holderRef.current) {
        const desiredScale =
          mode === "inspect" ? (isFocused ? 1.45 : 0.42) : 0.62;
        const nextScale = THREE.MathUtils.lerp(
          holderRef.current.scale.x,
          desiredScale,
          1 - Math.exp(-d * 9)
        );
        holderRef.current.scale.setScalar(nextScale);
      }

      if (meshRef.current) {
        if (isFocused) {
          meshRef.current.rotation.y = Math.sin(time * 1.2) * 0.32;
          meshRef.current.rotation.x = Math.cos(time * 0.9) * 0.12;
        } else {
          meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.15);
          meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.15);
        }
      }
      return;
    }

    if (holderRef.current) {
      const nextScale = THREE.MathUtils.lerp(
        holderRef.current.scale.x,
        scale,
        1 - Math.exp(-d * 8)
      );
      holderRef.current.scale.setScalar(nextScale);
    }

    if (meshRef.current) {
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, 0, 0.12);
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.12);
    }

    if (blastPulseRef.current !== lastBlastSeen.current) {
      lastBlastSeen.current = blastPulseRef.current;
      impulseVec.subVectors(currentPos, pointerWorldRef.current);
      if (impulseVec.lengthSq() < 0.01) {
        impulseVec.set(Math.sin(index + 1), Math.cos(index + 2), 0.3);
      }
      impulseVec.normalize();
      api.current.applyImpulse(
        {
          x: impulseVec.x * 16 * scale,
          y: impulseVec.y * 16 * scale,
          z: impulseVec.z * 8 * scale,
        },
        true
      );
      return;
    }

    if (attractingRef.current) {
      impulseVec.subVectors(pointerWorldRef.current, currentPos);
      const dist = Math.max(0.2, impulseVec.length());
      impulseVec.normalize();
      tangentVec.set(-impulseVec.y, impulseVec.x, 0);

      const pull = Math.min(48, 24 + dist * 3.5) * scale;
      const swirl = 18 * scale;
      api.current.applyImpulse(
        {
          x: (impulseVec.x * pull + tangentVec.x * swirl) * d,
          y: (impulseVec.y * pull + tangentVec.y * swirl) * d,
          z: impulseVec.z * pull * d,
        },
        true
      );
      return;
    }

    impulseVec.copy(currentPos);
    const dist = impulseVec.length();
    if (dist > 0.0001) impulseVec.normalize();

    const centerStrength = Math.max(14, dist * 3.8) * scale;
    const seed = index + 1;
    const driftX = Math.sin(time * 0.9 + seed) * 3.2;
    const driftY = Math.cos(time * 1.1 + seed) * 3.2;
    const driftZ = Math.sin(time * 0.8 + seed) * 2.1;

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
      linearDamping={0.84}
      angularDamping={0.22}
      friction={0.18}
      restitution={0.9}
      position={startPos}
      lockRotations
    >
      <BallCollider args={[scale]} sensor={isGuided} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.15 * scale]}
        args={[0.16 * scale, 0.28 * scale]}
        sensor={isGuided}
      />
      <group ref={holderRef} scale={scale}>
        <mesh
          ref={meshRef}
          castShadow
          receiveShadow
          geometry={sphereGeometry}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(index);
          }}
        >
          <meshPhysicalMaterial
            color={surpriseActive ? "#1e1035" : isFocused ? "#182336" : "#0f141a"}
            roughness={surpriseActive ? 0.06 : isFocused ? 0.08 : 0.14}
            metalness={0.44}
            clearcoat={1}
            clearcoatRoughness={0.08}
            emissive={surpriseActive ? "#7c3aed" : isFocused ? "#3b5998" : "#253044"}
            emissiveIntensity={surpriseActive ? 0.65 : isFocused ? 0.52 : 0.22}
          />
          <Decal
            position={[0, 0, 1]}
            rotation={[0, 0, 0]}
            scale={1.16}
            map={logoTexture}
            flatShading
          />
        </mesh>
        {surpriseActive && <MysteryOrbSurprise rollCount={surpriseRollCount} />}
      </group>
    </RigidBody>
  );
};

const Pointer = ({ isActive, mode, attractingRef, pointerWorldRef }) => {
  const ref = useRef(null);
  const vec = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;

    const wx = (pointer.x * viewport.width) / 2;
    const wy = (pointer.y * viewport.height) / 2;
    pointerWorldRef.current.set(wx, wy, 0);

    if (mode !== "float" || attractingRef.current) {
      ref.current.setNextKinematicTranslation(vec.set(100, 100, 100));
      return;
    }

    const target = vec.lerp(new THREE.Vector3(wx, wy, 0), 0.22);
    ref.current.setNextKinematicTranslation(target);
  });

  return (
    <RigidBody
      ref={ref}
      type='kinematicPosition'
      colliders={false}
      position={[100, 100, 100]}
    >
      <BallCollider args={[1.1]} />
    </RigidBody>
  );
};

const TechBubblesScene = ({
  icons,
  names,
  isActive,
  mode,
  focusedIndex,
  surpriseActive,
  surpriseRollCount,
  attractingRef,
  pointerWorldRef,
  blastPulseRef,
  onSelect,
}) => {
  const safeIcons = useMemo(() => {
    return icons.map((icon) => icon || TRANSPARENT_PIXEL);
  }, [icons]);

  const textures = useTexture(safeIcons);
  const configs = useMemo(() => makeSphereConfigs(safeIcons.length), [safeIcons.length]);

  return (
    <>
      <ambientLight intensity={0.68} />
      <hemisphereLight args={["#e0e9f9", "#080b10", 0.55]} />
      <spotLight
        position={[20, 18, 20]}
        penumbra={1}
        angle={0.22}
        color='#edf2fa'
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[0, 7, -4]} intensity={1.35} color='#dcebfa' />

      <Physics gravity={[0, 0, 0]}>
        <Pointer
          isActive={isActive}
          mode={mode}
          attractingRef={attractingRef}
          pointerWorldRef={pointerWorldRef}
        />
        {configs.map((cfg, i) => (
          <SphereBubble
            key={cfg.id}
            index={i}
            total={configs.length}
            scale={cfg.scale}
            logoTexture={textures[i]}
            isActive={isActive}
            mode={mode}
            focusedIndex={focusedIndex}
            surpriseActive={
              mode === "inspect" &&
              surpriseActive &&
              i === focusedIndex &&
              names[i] === "Three JS"
            }
            surpriseRollCount={surpriseRollCount}
            attractingRef={attractingRef}
            pointerWorldRef={pointerWorldRef}
            blastPulseRef={blastPulseRef}
            onSelect={onSelect}
          />
        ))}
      </Physics>
    </>
  );
};

const TechBubblesCanvas = ({
  technologies,
  mode = "float",
  focusedIndex = 0,
  surpriseActive = false,
  surpriseRollCount = 0,
  onSelectTech,
  onExitInspect,
  soundEngine,
}) => {
  const [isActive, setIsActive] = useState(true);
  const [isSwirling, setIsSwirling] = useState(false);
  const attractingRef = useRef(false);
  const holdTimerRef = useRef(null);
  const pointerWorldRef = useRef(new THREE.Vector3());
  const blastPulseRef = useRef(0);

  const icons = useMemo(() => technologies.map((t) => t.icon), [technologies]);
  const names = useMemo(() => technologies.map((t) => t.name), [technologies]);

  useEffect(() => {
    if (mode !== "float") {
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
      if (attractingRef.current) {
        attractingRef.current = false;
        setIsSwirling(false);
      }
    }
  }, [mode]);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    };
  }, []);

  const startAttract = () => {
    if (mode !== "float" || holdTimerRef.current) return;
    holdTimerRef.current = setTimeout(() => {
      holdTimerRef.current = null;
      attractingRef.current = true;
      setIsSwirling(true);
      soundEngine?.playMagnetHold();
      markEasterEggFound("tech_magnet_swirl", "pointer_hold");
      track("Tech Magnet Activated", { mode: "swirl" });
    }, 160);
  };

  const endAttract = () => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!attractingRef.current) return;
    attractingRef.current = false;
    setIsSwirling(false);
    blastPulseRef.current += 1;
    soundEngine?.playShockwave();
    track("Tech Magnet Released", { mode: "shockwave" });
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        cursor: mode === "float" ? (isSwirling ? "grabbing" : "grab") : "pointer",
      }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => {
        setIsActive(true);
        endAttract();
      }}
      onPointerDown={startAttract}
      onPointerUp={endAttract}
      onPointerCancel={endAttract}
    >
      <Canvas
        shadows
        gl={{ alpha: true, stencil: false, depth: true, antialias: true }}
        camera={{ position: [0, 0, 18], fov: 36, near: 1, far: 100 }}
        onPointerMissed={() => {
          if (mode === "inspect") onExitInspect?.();
        }}
        onCreated={(state) => {
          state.gl.toneMappingExposure = 1.45;
        }}
      >
        <Suspense fallback={<CanvasLoader />}>
          <TechBubblesScene
            icons={icons}
            names={names}
            isActive={isActive}
            mode={mode}
            focusedIndex={focusedIndex}
            surpriseActive={surpriseActive}
            surpriseRollCount={surpriseRollCount}
            attractingRef={attractingRef}
            pointerWorldRef={pointerWorldRef}
            blastPulseRef={blastPulseRef}
            onSelect={onSelectTech}
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default TechBubblesCanvas;
