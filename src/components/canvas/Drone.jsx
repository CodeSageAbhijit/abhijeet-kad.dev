import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ROTOR_OFFSETS = [
  { x: 0.92, z: 0.85, dir: 1, led: "#38bdf8" },   // front-right (cyan)
  { x: -0.92, z: 0.85, dir: -1, led: "#38bdf8" }, // front-left (cyan)
  { x: 0.92, z: -0.85, dir: -1, led: "#fb7185" }, // rear-right (crimson)
  { x: -0.92, z: -0.85, dir: 1, led: "#fb7185" }, // rear-left (crimson)
];

function computeFlightPose(p, outPos, outRot) {
  const c = Math.max(0, Math.min(1, p));
  // Smooth cinematic diagonal S-sweep kept squarely inside viewport frustum
  const x =
    2.1 * Math.pow(1 - c, 2) -
    1.85 * Math.sin(c * Math.PI * 1.45) +
    2.05 * Math.pow(c, 2.2);
  const y =
    1.05 * Math.pow(1 - c, 2) -
    0.4 * Math.sin(c * Math.PI) +
    1.15 * Math.pow(c, 2.3);
  const z = 0.35 + Math.sin(c * Math.PI) * 1.15;

  outPos.set(x, y, z);

  const cNext = Math.min(1, c + 0.025);
  const xNext =
    2.1 * Math.pow(1 - cNext, 2) -
    1.85 * Math.sin(cNext * Math.PI * 1.45) +
    2.05 * Math.pow(cNext, 2.2);
  const yNext =
    1.05 * Math.pow(1 - cNext, 2) -
    0.4 * Math.sin(cNext * Math.PI) +
    1.15 * Math.pow(cNext, 2.3);

  const dx = (xNext - x) * 40;
  const dy = (yNext - y) * 40;

  const yaw = Math.atan2(dx, 2.2) - 0.28;
  const roll = THREE.MathUtils.clamp(-dx * 0.08, -0.4, 0.4);
  const pitch = THREE.MathUtils.clamp(0.18 - dy * 0.04, -0.3, 0.36);
  outRot.set(pitch, yaw, roll);
}

function QuadcopterModel({ progressRef }) {
  const groupRef = useRef();
  const rotorRefs = useRef([]);
  const ledMatRefs = useRef([]);
  const smoothedProgress = useRef(progressRef.current);
  const targetPos = useMemo(() => new THREE.Vector3(), []);
  const targetRot = useMemo(() => new THREE.Euler(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;

    // Spin propellers cleanly in opposite CW/CCW pairs
    ROTOR_OFFSETS.forEach(({ dir }, idx) => {
      const rotor = rotorRefs.current[idx];
      if (rotor) {
        rotor.rotation.y += dir * dt * 38;
      }
    });

    ledMatRefs.current.forEach((mat, idx) => {
      if (mat) {
        mat.emissiveIntensity = 1.9 + Math.sin(t * 7 + idx) * 0.8;
      }
    });

    smoothedProgress.current = THREE.MathUtils.lerp(
      smoothedProgress.current,
      progressRef.current,
      1 - Math.exp(-dt * 8)
    );

    if (groupRef.current) {
      computeFlightPose(smoothedProgress.current, targetPos, targetRot);
      const bobY = Math.sin(t * 2.8) * 0.06;
      const hoverRoll = Math.sin(t * 2.0) * 0.04;

      groupRef.current.position.set(targetPos.x, targetPos.y + bobY, targetPos.z);
      groupRef.current.rotation.set(
        targetRot.x + Math.cos(t * 2.1) * 0.03,
        targetRot.y,
        targetRot.z + hoverRoll
      );
    }
  });

  return (
    <group ref={groupRef} scale={0.96}>
      {/* Central fuselage */}
      <mesh>
        <boxGeometry args={[0.74, 0.22, 1.08]} />
        <meshStandardMaterial color="#334155" metalness={0.72} roughness={0.28} />
      </mesh>

      {/* Pearl-silver canopy + cyan spine */}
      <mesh position={[0, 0.15, -0.04]}>
        <boxGeometry args={[0.52, 0.11, 0.72]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.65} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.215, -0.04]}>
        <boxGeometry args={[0.14, 0.025, 0.56]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={1.8} />
      </mesh>

      {/* Gimbal camera + subtle scan beam */}
      <group position={[0, -0.17, 0.45]}>
        <mesh>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.18} />
        </mesh>
        <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 16]} />
          <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={2.2} />
        </mesh>
        <mesh position={[0, -0.9, 0.18]} rotation={[0.24, 0, 0]}>
          <coneGeometry args={[0.58, 1.75, 24, 1, true]} />
          <meshBasicMaterial
            color="#38bdf8"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Landing skids */}
      {[-0.38, 0.38].map((xSide) => (
        <group key={xSide} position={[xSide, -0.3, 0]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.96, 8]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.75} roughness={0.28} />
          </mesh>
          {[-0.25, 0.25].map((zStrut) => (
            <mesh key={zStrut} position={[0, 0.12, zStrut]} rotation={[0, 0, xSide > 0 ? 0.24 : -0.24]}>
              <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.65} roughness={0.32} />
            </mesh>
          ))}
        </group>
      ))}

      {/* 4 Arms, Motors, LEDs & Spinning Propellers */}
      {ROTOR_OFFSETS.map(({ x, z, led }, idx) => {
        const angle = Math.atan2(x, z);
        const armLen = Math.hypot(x, z);
        return (
          <group key={idx}>
            <mesh position={[x * 0.5, 0.02, z * 0.5]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.1, 0.07, armLen]} />
              <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
            </mesh>

            <group position={[x, 0.06, z]}>
              <mesh>
                <cylinderGeometry args={[0.14, 0.15, 0.15, 16]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.85} roughness={0.2} />
              </mesh>
              <mesh position={[0, -0.01, 0]}>
                <cylinderGeometry args={[0.145, 0.145, 0.045, 16]} />
                <meshStandardMaterial color="#f59e0b" metalness={0.85} roughness={0.22} />
              </mesh>
              <mesh position={[0, -0.1, 0]}>
                <sphereGeometry args={[0.055, 12, 12]} />
                <meshStandardMaterial
                  ref={(el) => { ledMatRefs.current[idx] = el; }}
                  color={led}
                  emissive={led}
                  emissiveIntensity={2.2}
                />
              </mesh>

              {/* Spinning Propellers */}
              <group position={[0, 0.1, 0]} ref={(el) => { rotorRefs.current[idx] = el; }}>
                <mesh>
                  <coneGeometry args={[0.045, 0.08, 12]} />
                  <meshStandardMaterial color="#f8fafc" metalness={0.9} roughness={0.15} />
                </mesh>
                <mesh position={[0, 0.01, 0]} rotation={[0.08, 0, 0]}>
                  <boxGeometry args={[1.15, 0.018, 0.12]} />
                  <meshStandardMaterial color="#f8fafc" metalness={0.5} roughness={0.25} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
                  <ringGeometry args={[0.14, 0.58, 32]} />
                  <meshBasicMaterial
                    color={led}
                    transparent
                    opacity={0.24}
                    side={THREE.DoubleSide}
                    depthWrite={false}
                  />
                </mesh>
              </group>
            </group>
          </group>
        );
      })}
    </group>
  );
}

/**
 * Scroll-choreographed 3D Quadcopter Drone active strictly between mid-end of Overview (#about)
 * and the end of Work Experience (#work). Mounts Canvas only when active so R3F's RAF loop starts cleanly.
 */
export default function DroneCanvas({ isBooting = false }) {
  const progressRef = useRef(0);
  const [active, setActive] = useState(false);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (isBooting || typeof window === "undefined") return;

    let rafId = null;

    const updateFromScroll = () => {
      rafId = null;
      const aboutEl = document.querySelector('[data-analytics-section="about"]');
      const workEl = document.querySelector('[data-analytics-section="work"]');
      if (!aboutEl || !workEl) return;

      const vh = window.innerHeight || 800;
      const aboutRect = aboutEl.getBoundingClientRect();
      const workRect = workEl.getBoundingClientRect();

      const aboutDocTop = window.scrollY + aboutRect.top;
      const workDocTop = window.scrollY + workRect.top;

      const startScroll = aboutDocTop + aboutRect.height * 0.5 - vh * 0.58;
      const endScroll = Math.max(startScroll + 650, workDocTop + workRect.height - vh * 0.35);
      const span = endScroll - startScroll;

      const raw = (window.scrollY - startScroll) / span;
      const p = Math.max(0, Math.min(1, raw));
      progressRef.current = p;

      if (raw <= 0 || raw >= 1) {
        setActive(false);
        setOpacity(0);
      } else {
        setActive(true);
        const fadeIn = Math.min(1, Math.max(0.35, p / 0.03));
        const fadeOut = Math.min(1, Math.max(0, (1 - p) / 0.05));
        setOpacity(Math.min(fadeIn, fadeOut));
      }
    };

    const schedule = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(updateFromScroll);
    };

    updateFromScroll();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [isBooting]);

  if (isBooting || !active) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 30,
        pointerEvents: "none",
        opacity,
        transition: "opacity 100ms linear",
      }}
    >
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.6, 5.8], fov: 45 }}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <ambientLight intensity={1.3} />
        <directionalLight position={[5, 8, 6]} intensity={2.4} color="#f0f9ff" />
        <directionalLight position={[-5, 2, 4]} intensity={1.2} color="#38bdf8" />
        <pointLight position={[0, -2, 3]} intensity={1.1} color="#a78bfa" />
        <Suspense fallback={null}>
          <QuadcopterModel progressRef={progressRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
