import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

import CanvasLoader from "../Loader";
import {
  HOME_NODE,
  buildCoastlinePositions,
  buildContinentPositions,
  buildGraticulePositions,
  buildIndiaCorridorPositions,
  buildIndiaHubPoints,
  buildIndiaSectorPositions,
  clusterRelayData,
  haversineKm,
  latLonToVec3,
  launchGlobalEarthSignal,
  subscribeEarthRelay,
} from "../../utils/earthRelay";
import { sampleIssMotion, subscribeIssTelemetry } from "../../utils/issTracker";
import { markEasterEggFound, track, trackOnce } from "../../utils/analytics";

const GLOBE_RADIUS = 1.98;
const DEFAULT_CAMERA_POS = latLonToVec3(20, 62, 6.45);
const INDIA_CENTER_DIR = latLonToVec3(20.5, 78.5, 1).normalize();
const NASA_ISS_VIDEO_ID = "ROboUHfPUrU";
const NASA_ISS_EMBED_URL = `https://www.youtube.com/embed/${NASA_ISS_VIDEO_ID}?autoplay=1&mute=1&rel=0&modestbranding=1&playsinline=1`;
const NASA_ISS_WATCH_URL = `https://www.youtube.com/watch?v=${NASA_ISS_VIDEO_ID}`;

function getCameraLod(camDist) {
  return THREE.MathUtils.clamp((camDist - GLOBE_RADIUS) / 4.2, 0.28, 1.0);
}

function playRelayPingSound(kind = "ping") {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const notes =
      kind === "contact"
        ? [587.33, 880, 1174.66]
        : kind === "lock"
          ? [740]
          : [440, 659.25];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.03, t + 0.18);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(kind === "lock" ? 0.03 : 0.055, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
        if (i === notes.length - 1 && ctx.state !== "closed") {
          ctx.close().catch(() => {});
        }
      };
      osc.start(t);
      osc.stop(t + 0.22);
    });
  } catch {
    // Ignore autoplay/WebAudio errors
  }
}

/* ── Smooth God's Eye Camera Controller: regional sector drill-down, ISS tracking & auto-reset ── */
const CameraZoomDirector = ({
  controlsRef,
  activeBeams,
  resetTick,
  issFocusTick,
  issSnapshot,
  onZoomChange,
  onDrillModeChange,
}) => {
  const { camera } = useThree();
  const focusGoalRef = useRef(null); // { dir: Vector3, dist: number, expiresAt: number }
  const seenBeamIdsRef = useRef(new Set());
  const issSnapshotRef = useRef(issSnapshot);
  const desiredPosVec = useMemo(() => new THREE.Vector3(), []);
  const drillActiveRef = useRef(false);

  issSnapshotRef.current = issSnapshot;

  useEffect(() => {
    camera.position.copy(DEFAULT_CAMERA_POS);
    camera.lookAt(0, 0, 0);
  }, [camera]);

  useEffect(() => {
    if (!resetTick) return;
    focusGoalRef.current = {
      dir: DEFAULT_CAMERA_POS.clone().normalize(),
      dist: 6.45,
      expiresAt: performance.now() + 1400,
    };
  }, [resetTick]);

  useEffect(() => {
    if (!issFocusTick || !issSnapshotRef.current) return;
    const motion = sampleIssMotion(issSnapshotRef.current, performance.now());
    focusGoalRef.current = {
      dir: motion.normal.clone(),
      dist: 2.68,
      expiresAt: performance.now() + 5600,
    };
    onZoomChange?.(true);
  }, [issFocusTick, onZoomChange]);

  useEffect(() => {
    if (!activeBeams.length) return;
    const latest = activeBeams[activeBeams.length - 1];
    if (!latest || seenBeamIdsRef.current.has(latest.id)) return;
    seenBeamIdsRef.current.add(latest.id);

    const startVec = latLonToVec3(latest.from.lat, latest.from.lon, 1).normalize();
    const endVec = latLonToVec3(latest.to.lat, latest.to.lon, 1).normalize();
    const angle = startVec.angleTo(endVec);

    let midDir = startVec.clone().lerp(endVec, 0.55).normalize();
    let zoomDist = 5.35;

    if (latest.isLocalBounce && latest.satRelay) {
      // Frame Mumbai hub, Konkan coast, and overhead SAT-04 (r=2.54) comfortably inside frustum
      const satDir = latLonToVec3(latest.satRelay.lat, latest.satRelay.lon, 1).normalize();
      midDir = endVec.clone().lerp(satDir, 0.35).normalize();
      zoomDist = 3.12;
    } else if (angle < 0.08) {
      // Ultra-close regional corridor (e.g., Pune -> Mumbai)
      zoomDist = 2.68;
    } else if (angle < 0.32) {
      // Pan-India regional corridor (e.g., Bengaluru / Delhi -> Mumbai)
      zoomDist = 3.25;
    } else if (angle < 1.0) {
      zoomDist = 4.25;
    }

    focusGoalRef.current = {
      dir: midDir,
      dist: zoomDist,
      expiresAt: performance.now() + 4500,
    };
    onZoomChange?.(true);
  }, [activeBeams, onZoomChange]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const cancelAutoFocus = () => {
      focusGoalRef.current = null;
      onZoomChange?.(false);
    };
    controls.addEventListener("start", cancelAutoFocus);
    return () => controls.removeEventListener("start", cancelAutoFocus);
  }, [controlsRef, onZoomChange]);

  useFrame((_, delta) => {
    const camDist = camera.position.length();
    const facingIndia = camera.position.clone().normalize().dot(INDIA_CENTER_DIR) > 0.55;
    const inIndiaSector = camDist < 3.85 && facingIndia;
    if (inIndiaSector !== drillActiveRef.current) {
      drillActiveRef.current = inIndiaSector;
      onDrillModeChange?.(inIndiaSector);
    }

    const goal = focusGoalRef.current;
    if (!goal) return;

    const now = performance.now();
    if (now > goal.expiresAt) {
      focusGoalRef.current = null;
      onZoomChange?.(false);
      return;
    }

    const d = Math.min(0.05, delta);
    const remaining = goal.expiresAt - now;
    const targetDist = remaining < 1000 ? 6.2 : goal.dist;

    desiredPosVec.copy(goal.dir).multiplyScalar(targetDist);
    camera.position.lerp(desiredPosVec, 1 - Math.exp(-d * 3.8));
    controlsRef.current?.update();
  });

  return null;
};

/* ── Volumetric Cyan/Ice God's Eye Atmosphere Fresnel Rim ── */
const AtmosphereRim = ({ locked }) => {
  const matRef = useRef(null);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color("#38bdf8") },
      uPower: { value: 0.55 },
    }),
    []
  );

  useFrame((_, delta) => {
    if (!matRef.current) return;
    const targetPower = locked ? 0.85 : 0.55;
    matRef.current.uniforms.uPower.value = THREE.MathUtils.lerp(
      matRef.current.uniforms.uPower.value,
      targetPower,
      Math.min(1, delta * 4)
    );
  });

  return (
    <mesh scale={1.075}>
      <sphereGeometry args={[GLOBE_RADIUS, 48, 32]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec3 vNormal;
          varying vec3 vViewPos;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vViewPos = -mvPosition.xyz;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uPower;
          varying vec3 vNormal;
          varying vec3 vViewPos;
          void main() {
            vec3 viewDir = normalize(vViewPos);
            float rim = pow(clamp(1.0 + dot(vNormal, viewDir), 0.0, 1.0), 3.0);
            gl_FragColor = vec4(uColor, rim * uPower);
          }
        `}
      />
    </mesh>
  );
};

/* ── Progressive India Sector Drill-Down Layer (fades in smoothly when zoomed over South Asia) ── */
const IndiaSectorOverlay = () => {
  const borderMatRef = useRef(null);
  const corridorMatRef = useRef(null);
  const hubMatRef = useRef(null);
  const camDir = useMemo(() => new THREE.Vector3(), []);

  const { sectorGeo, corridorGeo, hubGeo } = useMemo(() => {
    const sGeo = new THREE.BufferGeometry();
    sGeo.setAttribute("position", new THREE.BufferAttribute(buildIndiaSectorPositions(2.021), 3));
    const cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute("position", new THREE.BufferAttribute(buildIndiaCorridorPositions(2.019), 3));
    const hGeo = new THREE.BufferGeometry();
    hGeo.setAttribute("position", new THREE.BufferAttribute(buildIndiaHubPoints(2.023), 3));
    return { sectorGeo: sGeo, corridorGeo: cGeo, hubGeo: hGeo };
  }, []);

  useEffect(() => {
    return () => {
      sectorGeo.dispose();
      corridorGeo.dispose();
      hubGeo.dispose();
    };
  }, [sectorGeo, corridorGeo, hubGeo]);

  useFrame(({ camera }) => {
    const dist = camera.position.length();
    camDir.copy(camera.position).normalize();
    const align = THREE.MathUtils.smoothstep(camDir.dot(INDIA_CENTER_DIR), 0.25, 0.85);
    const zoomFactor = THREE.MathUtils.smoothstep(4.75 - dist, 0, 1.95);
    const strength = align * zoomFactor;

    if (borderMatRef.current) borderMatRef.current.opacity = strength * 0.62;
    if (corridorMatRef.current) corridorMatRef.current.opacity = strength * 0.28;
    if (hubMatRef.current) hubMatRef.current.opacity = strength * 0.72;
  });

  return (
    <group>
      <lineSegments geometry={sectorGeo}>
        <lineBasicMaterial ref={borderMatRef} color="#38bdf8" transparent opacity={0} />
      </lineSegments>
      <lineSegments geometry={corridorGeo}>
        <lineBasicMaterial ref={corridorMatRef} color="#00f5ff" transparent opacity={0} />
      </lineSegments>
      <points geometry={hubGeo}>
        <pointsMaterial ref={hubMatRef} color="#93c5fd" size={0.022} sizeAttenuation transparent opacity={0} />
      </points>
    </group>
  );
};

/* ── Animated Latitude Sweep & Multi-Axis God's Eye Gimbals ── */
const GodsEyeGimbals = ({ lockProgress, activeBeamsCount }) => {
  const outerRef = useRef(null);
  const midRef = useRef(null);
  const innerRef = useRef(null);
  const sweepBandRef = useRef(null);

  useFrame((state, delta) => {
    const d = Math.min(0.05, delta);
    const t = state.clock.elapsedTime;
    const boost = 1 + lockProgress * 1.4 + (activeBeamsCount > 0 ? 1.5 : 0);

    if (outerRef.current) outerRef.current.rotation.z += d * 0.24 * boost;
    if (midRef.current) {
      midRef.current.rotation.y -= d * 0.46 * boost;
      midRef.current.rotation.x += d * 0.14 * boost;
    }
    if (innerRef.current) {
      innerRef.current.rotation.z -= d * 0.62 * boost;
      innerRef.current.rotation.y += d * 0.34 * boost;
    }
    if (sweepBandRef.current) {
      const yOffset = Math.sin(t * 0.85) * 1.55;
      const bandRadius = Math.sqrt(Math.max(0.2, (GLOBE_RADIUS + 0.04) ** 2 - yOffset ** 2));
      sweepBandRef.current.position.y = yOffset;
      sweepBandRef.current.scale.setScalar(bandRadius / (GLOBE_RADIUS + 0.04));
    }
  });

  const ringColor = lockProgress >= 0.99 || activeBeamsCount > 0 ? "#fbbf24" : "#38bdf8";

  return (
    <group>
      <mesh ref={sweepBandRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[GLOBE_RADIUS + 0.04, 0.005, 8, 72]} />
        <meshBasicMaterial color="#00f5ff" transparent opacity={0.32} />
      </mesh>

      <group ref={outerRef} rotation={[0.42, 0.2, 0]}>
        {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((rot, idx) => (
          <mesh key={idx} rotation={[0, 0, rot]}>
            <torusGeometry args={[2.58, 0.011, 8, 32, Math.PI * 0.36]} />
            <meshBasicMaterial color={ringColor} transparent opacity={0.52} />
          </mesh>
        ))}
        {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((ang, idx) => (
          <mesh key={`tick-${idx}`} position={[Math.cos(ang) * 2.58, Math.sin(ang) * 2.58, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.04]} />
            <meshBasicMaterial color="#e0f2fe" />
          </mesh>
        ))}
      </group>

      <group ref={midRef} rotation={[-0.55, 0.8, 0.25]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[2.38, 0.008, 8, 96]} />
          <meshBasicMaterial color="#81b6ff" transparent opacity={0.3} />
        </mesh>
        <mesh position={[2.38, 0, 0]}>
          <octahedronGeometry args={[0.05, 0]} />
          <meshBasicMaterial color="#00f5ff" />
        </mesh>
        <mesh position={[-2.38, 0, 0]}>
          <octahedronGeometry args={[0.042, 0]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      </group>

      <group ref={innerRef} rotation={[0.95, -0.35, 0.4]}>
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((rot, idx) => (
          <mesh key={idx} rotation={[0, 0, rot]}>
            <torusGeometry args={[2.18, 0.008, 8, 28, Math.PI * 0.42]} />
            <meshBasicMaterial color="#00f5ff" transparent opacity={0.38} />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/* ── Tier 1: Distance-Adaptive Tactical Target Reticle (Mumbai Hub & Active Beam Origin) ── */
const TargetBeacon = ({
  lat,
  lon,
  color = "#00f5ff",
  size = 0.04,
  isLocked = false,
  fast = false,
  pulse = true,
}) => {
  const lodRef = useRef(null);
  const outerRef = useRef(null);
  const pulseRef = useRef(null);

  const { pos, quat, mastLen } = useMemo(() => {
    const p = latLonToVec3(lat, lon, GLOBE_RADIUS + 0.025);
    const normal = p.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    return { pos: p, quat: q, mastLen: 0.095 };
  }, [lat, lon]);

  useFrame((state, delta) => {
    const d = Math.min(0.05, delta);
    const lod = getCameraLod(state.camera.position.length());
    if (lodRef.current) {
      lodRef.current.scale.setScalar(lod);
    }
    if (outerRef.current) {
      outerRef.current.rotation.z += d * (isLocked ? 3.2 : 1.1);
    }
    if (pulseRef.current && pulse) {
      const speed = fast || isLocked ? 3.0 : 1.5;
      const phase = (state.clock.elapsedTime * speed + Math.abs(lat + lon) * 0.1) % 1;
      pulseRef.current.scale.setScalar(0.85 + phase * (isLocked ? 2.4 : 1.7));
      pulseRef.current.material.opacity = (1 - phase) * 0.72;
    }
  });

  return (
    <group position={pos} quaternion={quat}>
      <group ref={lodRef}>
        <mesh>
          <sphereGeometry args={[size, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
        {(isLocked || fast) && (
          <mesh position={[0, 0, mastLen * 0.5]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.004, 0.009, mastLen, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.75} />
          </mesh>
        )}
        <group ref={outerRef}>
          {[0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].map((rot, idx) => (
            <mesh key={idx} rotation={[0, 0, rot]}>
              <ringGeometry args={[size * 1.65, size * 2.08, 8, 1, 0, Math.PI * 0.28]} />
              <meshBasicMaterial color={color} transparent opacity={0.85} side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
        {pulse && (
          <mesh ref={pulseRef}>
            <ringGeometry args={[size * 1.15, size * 1.5, 24]} />
            <meshBasicMaterial color={color} transparent opacity={0.72} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  );
};

/* ── Tier 2: Spiderfied Live Online Peer Node (clean pinpoint + tether, zero city overlap) ── */
const PeerNode = ({ node, onSelect }) => {
  const lodRef = useRef(null);
  const pulseRef = useRef(null);
  const isComposing = node.status === "composing";
  const color = isComposing ? "#fbbf24" : "#00f5ff";

  const { pos, quat, tetherGeo } = useMemo(() => {
    const p = latLonToVec3(node.displayLat, node.displayLon, GLOBE_RADIUS + 0.025);
    const normal = p.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);

    let geo = null;
    if (node.spiderfied && Number.isFinite(node.anchorLat) && Number.isFinite(node.anchorLon)) {
      const aPos = latLonToVec3(node.anchorLat, node.anchorLon, GLOBE_RADIUS + 0.023);
      geo = new THREE.BufferGeometry().setFromPoints([aPos, p]);
    }
    return { pos: p, quat: q, tetherGeo: geo };
  }, [node.displayLat, node.displayLon, node.spiderfied, node.anchorLat, node.anchorLon]);

  useEffect(() => () => tetherGeo?.dispose(), [tetherGeo]);

  useFrame((state) => {
    const lod = getCameraLod(state.camera.position.length());
    if (lodRef.current) {
      lodRef.current.scale.setScalar(lod);
    }
    if (pulseRef.current) {
      if (isComposing) {
        const phase = (state.clock.elapsedTime * 3.1) % 1;
        pulseRef.current.visible = true;
        pulseRef.current.scale.setScalar(1 + phase * 2.2);
        pulseRef.current.material.opacity = (1 - phase) * 0.78;
      } else {
        pulseRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {tetherGeo && (
        <lineSegments geometry={tetherGeo}>
          <lineBasicMaterial color={color} transparent opacity={0.42} />
        </lineSegments>
      )}
      <group position={pos} quaternion={quat}>
        <group ref={lodRef}>
          <mesh
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.({
                id: `peer-${node.key}`,
                city: node.city || "Live Visitor",
                country: node.country || "",
                status: node.status || "browsing",
                isPeer: true,
              });
            }}
          >
            <sphereGeometry args={[0.025, 10, 10]} />
            <meshBasicMaterial color={color} />
          </mesh>
          <mesh>
            <ringGeometry args={[0.036, 0.048, 18]} />
            <meshBasicMaterial color={color} transparent opacity={0.55} side={THREE.DoubleSide} />
          </mesh>
          <mesh ref={pulseRef} visible={false}>
            <ringGeometry args={[0.032, 0.045, 20]} />
            <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

/* ── Tier 3: Calm Clustered City Ember (aggregates repeated India/global pings with zero reticle noise) ── */
const ClusterEmber = ({ cluster, isSelected, onSelect }) => {
  const lodRef = useRef(null);
  const { pos, quat, baseRadius } = useMemo(() => {
    const p = latLonToVec3(cluster.lat, cluster.lon, GLOBE_RADIUS + 0.023);
    const normal = p.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    const r = 0.015 + Math.min(0.012, Math.log2(cluster.count) * 0.0045);
    return { pos: p, quat: q, baseRadius: r };
  }, [cluster.lat, cluster.lon, cluster.count]);

  useFrame(({ camera }) => {
    if (lodRef.current) {
      lodRef.current.scale.setScalar(getCameraLod(camera.position.length()));
    }
  });

  const emberColor = isSelected ? "#00f5ff" : "#a49aff";

  return (
    <group position={pos} quaternion={quat}>
      <group ref={lodRef}>
        <mesh
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(cluster);
          }}
        >
          <sphereGeometry args={[baseRadius, 8, 8]} />
          <meshBasicMaterial color={emberColor} transparent opacity={isSelected ? 0.95 : 0.72} />
        </mesh>
        {(cluster.count > 1 || isSelected) && (
          <mesh>
            <ringGeometry args={[baseRadius * 1.45, baseRadius * 1.85, 16]} />
            <meshBasicMaterial color={emberColor} transparent opacity={isSelected ? 0.85 : 0.4} side={THREE.DoubleSide} />
          </mesh>
        )}
      </group>
    </group>
  );
};

/* ── Dual-Mode Signal Beam: LEO Recon Satellite Bounce (same-city/local) OR Crisp Great-Circle Arc ── */
const SignalArc = ({ beam }) => {
  const headRef = useRef(null);
  const trailMatRef = useRef(null);
  const trail2MatRef = useRef(null);
  const impactRingRef = useRef(null);
  const satGroupRef = useRef(null);
  const satPulseRef = useRef(null);

  const geometryData = useMemo(() => {
    const startVec = latLonToVec3(beam.from.lat, beam.from.lon, GLOBE_RADIUS + 0.022);
    const endVec = latLonToVec3(beam.to.lat, beam.to.lon, GLOBE_RADIUS + 0.022);
    const dPos = latLonToVec3(beam.to.lat, beam.to.lon, GLOBE_RADIUS + 0.032);
    const dQuat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      dPos.clone().normalize()
    );

    if (beam.isLocalBounce && beam.satRelay) {
      const satPos = latLonToVec3(
        beam.satRelay.lat,
        beam.satRelay.lon,
        GLOBE_RADIUS + beam.satRelay.altOffset
      );
      const satQuat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        satPos.clone().normalize()
      );
      const midUp = startVec.clone().lerp(satPos, 0.5).normalize().multiplyScalar(
        (startVec.length() + satPos.length()) * 0.5 + 0.04
      );
      const midDown = satPos.clone().lerp(endVec, 0.5).normalize().multiplyScalar(
        (satPos.length() + endVec.length()) * 0.5 + 0.04
      );

      const upCurve = new THREE.QuadraticBezierCurve3(startVec, midUp, satPos);
      const downCurve = new THREE.QuadraticBezierCurve3(satPos, midDown, endVec);
      const upGeo = new THREE.TubeGeometry(upCurve, 28, 0.0055, 8, false);
      const downGeo = new THREE.TubeGeometry(downCurve, 28, 0.0055, 8, false);

      return {
        isBounce: true,
        upCurve,
        downCurve,
        upGeo,
        downGeo,
        satPos,
        satQuat,
        destPos: dPos,
        destQuat: dQuat,
        headScaleFactor: 0.45,
      };
    }

    const angle = Math.max(0.004, startVec.angleTo(endVec));
    const steps = 48;
    const axis = new THREE.Vector3().crossVectors(startVec, endVec);
    if (axis.lengthSq() < 1e-6) axis.set(0, 1, 0);
    axis.normalize();

    const arcAltitude = THREE.MathUtils.clamp(angle * 0.45, 0.035, 1.25);
    const points = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const q = new THREE.Quaternion().setFromAxisAngle(axis, angle * u);
      const pt = startVec.clone().applyQuaternion(q).normalize();
      const r = GLOBE_RADIUS + 0.022 + Math.sin(u * Math.PI) * arcAltitude;
      points.push(pt.multiplyScalar(r));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    const tubeRadius =
      angle < 0.08 ? 0.0045 : angle < 0.35 ? 0.008 : beam.kind === "contact" ? 0.018 : 0.014;
    const trailGeo = new THREE.TubeGeometry(curve, steps, tubeRadius, 8, false);

    return {
      isBounce: false,
      curve,
      trailGeo,
      destPos: dPos,
      destQuat: dQuat,
      headScaleFactor: angle < 0.15 ? 0.46 : angle < 0.5 ? 0.65 : 0.9,
    };
  }, [beam]);

  useEffect(() => {
    return () => {
      geometryData.trailGeo?.dispose();
      geometryData.upGeo?.dispose();
      geometryData.downGeo?.dispose();
    };
  }, [geometryData]);

  const beamColor = beam.kind === "contact" ? "#fbbf24" : "#00f5ff";

  useFrame(({ camera }, delta) => {
    const elapsedSec = (performance.now() - beam.startedAt) / 1000;
    const lod = getCameraLod(camera.position.length());
    const fadeOut = elapsedSec > 3.5 ? Math.max(0, 1 - (elapsedSec - 3.5) / 1.4) : 1;

    if (geometryData.isBounce) {
      const upProgress = THREE.MathUtils.clamp(elapsedSec / 0.95, 0, 1);
      const downProgress = THREE.MathUtils.clamp((elapsedSec - 0.95) / 0.95, 0, 1);

      if (headRef.current) {
        const pt =
          elapsedSec < 0.95
            ? geometryData.upCurve.getPointAt(upProgress)
            : geometryData.downCurve.getPointAt(downProgress);
        headRef.current.position.copy(pt);
        headRef.current.scale.setScalar(lod * geometryData.headScaleFactor);
        headRef.current.visible = elapsedSec < 1.9;
      }

      if (geometryData.upGeo.index) {
        const ringTris = 8 * 6;
        geometryData.upGeo.setDrawRange(
          0,
          Math.min(geometryData.upGeo.index.count, Math.ceil(upProgress * 28) * ringTris)
        );
      }
      if (geometryData.downGeo.index) {
        const ringTris = 8 * 6;
        geometryData.downGeo.setDrawRange(
          0,
          Math.min(geometryData.downGeo.index.count, Math.ceil(downProgress * 28) * ringTris)
        );
      }

      if (trailMatRef.current) trailMatRef.current.opacity = 0.9 * fadeOut;
      if (trail2MatRef.current) trail2MatRef.current.opacity = 0.9 * fadeOut;

      if (satGroupRef.current) {
        satGroupRef.current.rotation.z += Math.min(0.05, delta) * 2.1;
      }
      if (satPulseRef.current) {
        if (elapsedSec >= 0.9 && elapsedSec < 1.9) {
          const t = (elapsedSec - 0.9) / 1.0;
          satPulseRef.current.visible = true;
          satPulseRef.current.scale.setScalar(1 + t * 3.8);
          satPulseRef.current.material.opacity = (1 - t) * 0.92;
        } else {
          satPulseRef.current.visible = false;
        }
      }

      if (impactRingRef.current) {
        if (elapsedSec > 1.75) {
          const ringT = Math.min(1, (elapsedSec - 1.75) / 1.25);
          impactRingRef.current.visible = ringT < 1;
          impactRingRef.current.scale.setScalar(lod * (0.7 + ringT * 3.2));
          impactRingRef.current.material.opacity = (1 - ringT) * 0.95;
        } else {
          impactRingRef.current.visible = false;
        }
      }
      return;
    }

    const travel = Math.min(1, elapsedSec / 1.9);
    if (headRef.current) {
      const p = geometryData.curve.getPointAt(travel);
      headRef.current.position.copy(p);
      headRef.current.scale.setScalar(lod * geometryData.headScaleFactor);
      headRef.current.visible = travel < 0.99;
    }
    if (geometryData.trailGeo?.index) {
      const ringTris = 8 * 6;
      const drawCount = Math.min(
        geometryData.trailGeo.index.count,
        Math.ceil(travel * 48) * ringTris
      );
      geometryData.trailGeo.setDrawRange(0, drawCount);
    }
    if (trailMatRef.current) {
      trailMatRef.current.opacity = 0.88 * fadeOut;
    }
    if (impactRingRef.current) {
      if (travel > 0.85) {
        const ringT = Math.min(1, (elapsedSec - 1.61) / 1.4);
        impactRingRef.current.visible = ringT >= 0 && ringT < 1;
        impactRingRef.current.scale.setScalar(lod * (0.8 + ringT * 3.8));
        impactRingRef.current.material.opacity = (1 - ringT) * 0.95;
      } else {
        impactRingRef.current.visible = false;
      }
    }
  });

  return (
    <group>
      {geometryData.isBounce ? (
        <>
          <mesh geometry={geometryData.upGeo}>
            <meshBasicMaterial ref={trailMatRef} color={beamColor} transparent opacity={0.9} />
          </mesh>
          <mesh geometry={geometryData.downGeo}>
            <meshBasicMaterial ref={trail2MatRef} color="#fbbf24" transparent opacity={0.9} />
          </mesh>
          {/* Overhead LEO Recon Relay Satellite (SAT-04) */}
          <group position={geometryData.satPos} quaternion={geometryData.satQuat}>
            <group ref={satGroupRef}>
              <mesh>
                <octahedronGeometry args={[0.028, 0]} />
                <meshBasicMaterial color="#00f5ff" />
              </mesh>
              <mesh position={[0.048, 0, 0]}>
                <boxGeometry args={[0.045, 0.016, 0.004]} />
                <meshBasicMaterial color="#7dd3fc" transparent opacity={0.85} />
              </mesh>
              <mesh position={[-0.048, 0, 0]}>
                <boxGeometry args={[0.045, 0.016, 0.004]} />
                <meshBasicMaterial color="#7dd3fc" transparent opacity={0.85} />
              </mesh>
            </group>
            <mesh ref={satPulseRef} visible={false}>
              <ringGeometry args={[0.032, 0.052, 24]} />
              <meshBasicMaterial color="#fbbf24" transparent opacity={0.9} side={THREE.DoubleSide} />
            </mesh>
          </group>
        </>
      ) : (
        <mesh geometry={geometryData.trailGeo}>
          <meshBasicMaterial ref={trailMatRef} color={beamColor} transparent opacity={0.88} />
        </mesh>
      )}

      <mesh ref={headRef}>
        <sphereGeometry args={[0.034, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh
        ref={impactRingRef}
        position={geometryData.destPos}
        quaternion={geometryData.destQuat}
        visible={false}
      >
        <ringGeometry args={[0.032, 0.064, 28]} />
        <meshBasicMaterial color={beamColor} transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>
      <TargetBeacon
        lat={beam.from.lat}
        lon={beam.from.lon}
        color={beamColor}
        size={0.028}
        isLocked
        fast
      />
    </group>
  );
};

/* ── Error Boundary isolating GLTF/Draco ISS loader from the rest of the God's Eye canvas ── */
class ISSSafeBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* ── NASA 3D International Space Station (NORAD 25544) on Real-Time LEO Orbit ── */
const ISSStationOrbit = ({ issSnapshot, onTrackIss }) => {
  const { scene } = useGLTF("/iss/iss.glb", "/draco/");
  const issRootRef = useRef(null);
  const issScaleRef = useRef(null);
  const nadirGroupRef = useRef(null);
  const nadirPulseRef = useRef(null);
  const hasMountedPosRef = useRef(false);

  const targetVec = useMemo(() => new THREE.Vector3(), []);
  const yAxis = useMemo(() => new THREE.Vector3(), []);
  const zAxis = useMemo(() => new THREE.Vector3(), []);
  const rotMat = useMemo(() => new THREE.Matrix4(), []);
  const nadirQuat = useMemo(() => new THREE.Quaternion(), []);
  const zUnit = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  const { preparedScene, modelOffset, normScale } = useMemo(() => {
    const cloned = scene.clone(true);
    cloned.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      const mat = obj.material.clone();
      const name = (obj.name || mat.name || "").toLowerCase();
      const isSolarArray = name.includes("polysurfa");
      mat.color = new THREE.Color(isSolarArray ? "#bae6fd" : "#e2e8f0");
      mat.emissive = new THREE.Color(isSolarArray ? "#0284c7" : "#0ea5e9");
      mat.emissiveIntensity = isSolarArray ? 0.36 : 0.22;
      mat.metalness = isSolarArray ? 0.62 : 0.45;
      mat.roughness = isSolarArray ? 0.28 : 0.38;
      mat.side = THREE.DoubleSide;
      obj.material = mat;
    });

    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    return {
      preparedScene: cloned,
      modelOffset: [-center.x, -center.y, -center.z],
      normScale: 1 / maxDim,
    };
  }, [scene]);

  useEffect(() => {
    return () => {
      preparedScene.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          obj.material.dispose?.();
        }
      });
    };
  }, [preparedScene]);

  const { orbitLineGeo, groundTrackGeo } = useMemo(() => {
    const pts = issSnapshot?.orbitPoints || [];
    if (pts.length < 3) return { orbitLineGeo: null, groundTrackGeo: null };

    const dirs = pts.map((p) => latLonToVec3(p.lat, p.lon, 1).normalize());
    const spaceSegs = [];
    const groundSegs = [];
    const subSteps = 6;

    for (let i = 0; i < dirs.length - 1; i++) {
      const a = dirs[i];
      const b = dirs[i + 1];
      const axis = new THREE.Vector3().crossVectors(a, b);
      const angle = a.angleTo(b);
      if (axis.lengthSq() < 1e-8) axis.set(0, 1, 0);
      axis.normalize();

      for (let s = 0; s < subSteps; s++) {
        const u1 = s / subSteps;
        const u2 = (s + 1) / subSteps;
        const d1 = a.clone().applyAxisAngle(axis, angle * u1).normalize();
        const d2 = a.clone().applyAxisAngle(axis, angle * u2).normalize();
        spaceSegs.push(
          d1.x * (GLOBE_RADIUS + 0.145),
          d1.y * (GLOBE_RADIUS + 0.145),
          d1.z * (GLOBE_RADIUS + 0.145),
          d2.x * (GLOBE_RADIUS + 0.145),
          d2.y * (GLOBE_RADIUS + 0.145),
          d2.z * (GLOBE_RADIUS + 0.145)
        );
        // Dashed ground-projection footprint path across continents/oceans
        if (s % 2 === 0) {
          groundSegs.push(
            d1.x * (GLOBE_RADIUS + 0.021),
            d1.y * (GLOBE_RADIUS + 0.021),
            d1.z * (GLOBE_RADIUS + 0.021),
            d2.x * (GLOBE_RADIUS + 0.021),
            d2.y * (GLOBE_RADIUS + 0.021),
            d2.z * (GLOBE_RADIUS + 0.021)
          );
        }
      }
    }

    const oGeo = new THREE.BufferGeometry();
    oGeo.setAttribute("position", new THREE.Float32BufferAttribute(spaceSegs, 3));
    const gGeo = new THREE.BufferGeometry();
    gGeo.setAttribute("position", new THREE.Float32BufferAttribute(groundSegs, 3));
    return { orbitLineGeo: oGeo, groundTrackGeo: gGeo };
  }, [issSnapshot?.orbitPoints]);

  useEffect(() => {
    return () => {
      orbitLineGeo?.dispose();
      groundTrackGeo?.dispose();
    };
  }, [orbitLineGeo, groundTrackGeo]);

  const nadirLineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
    return geo;
  }, []);

  useEffect(() => () => nadirLineGeo.dispose(), [nadirLineGeo]);

  useFrame((state, delta) => {
    if (!issSnapshot || !issRootRef.current) return;
    const now = performance.now();
    const motion = sampleIssMotion(issSnapshot, now);

    const altRadius =
      GLOBE_RADIUS + 0.145 + THREE.MathUtils.clamp((motion.altitude - 400) * 0.00035, 0, 0.04);
    targetVec.copy(motion.normal).multiplyScalar(altRadius);

    if (!hasMountedPosRef.current) {
      issRootRef.current.position.copy(targetVec);
      hasMountedPosRef.current = true;
    } else {
      issRootRef.current.position.lerp(targetVec, 1 - Math.exp(-Math.min(0.05, delta) * 6));
    }

    // Align ISS GLB axes to real LVLH flight frame: X = zenith radial, Y = forward velocity, Z = truss wings
    yAxis
      .copy(motion.forward)
      .sub(zAxis.copy(motion.normal).multiplyScalar(motion.forward.dot(motion.normal)))
      .normalize();
    zAxis.crossVectors(motion.normal, yAxis).normalize();
    rotMat.makeBasis(motion.normal, yAxis, zAxis);
    issRootRef.current.quaternion.setFromRotationMatrix(rotMat);

    const lod = getCameraLod(state.camera.position.length());
    if (issScaleRef.current) {
      const s = 0.24 * (0.55 + 0.45 * lod);
      issScaleRef.current.scale.setScalar(normScale * s);
    }

    const posArr = nadirLineGeo.attributes.position.array;
    const groundR = GLOBE_RADIUS + 0.022;
    posArr[0] = motion.normal.x * groundR;
    posArr[1] = motion.normal.y * groundR;
    posArr[2] = motion.normal.z * groundR;
    posArr[3] = issRootRef.current.position.x;
    posArr[4] = issRootRef.current.position.y;
    posArr[5] = issRootRef.current.position.z;
    nadirLineGeo.attributes.position.needsUpdate = true;

    if (nadirGroupRef.current) {
      nadirGroupRef.current.position.set(posArr[0], posArr[1], posArr[2]);
      nadirQuat.setFromUnitVectors(zUnit, motion.normal);
      nadirGroupRef.current.quaternion.copy(nadirQuat);
      nadirGroupRef.current.scale.setScalar(lod);
    }

    if (nadirPulseRef.current) {
      const phase = (state.clock.elapsedTime * 1.4) % 1;
      nadirPulseRef.current.scale.setScalar(0.9 + phase * 1.6);
      nadirPulseRef.current.material.opacity = (1 - phase) * 0.65;
    }
  });

  if (!issSnapshot) return null;

  return (
    <group>
      {/* Orbital SGP4 space trajectory */}
      {orbitLineGeo && (
        <lineSegments geometry={orbitLineGeo}>
          <lineBasicMaterial color="#38bdf8" transparent opacity={0.34} />
        </lineSegments>
      )}

      {/* Dashed ground track projection across Earth's surface */}
      {groundTrackGeo && (
        <lineSegments geometry={groundTrackGeo}>
          <lineBasicMaterial color="#f59e0b" transparent opacity={0.28} />
        </lineSegments>
      )}

      {/* Live vertical nadir laser line from ISS down to sub-satellite Earth surface */}
      <lineSegments geometry={nadirLineGeo}>
        <lineBasicMaterial color="#fbbf24" transparent opacity={0.55} />
      </lineSegments>

      {/* Surface Nadir Footprint Ring directly beneath ISS */}
      <group
        ref={nadirGroupRef}
        onClick={(e) => {
          e.stopPropagation();
          onTrackIss?.();
        }}
      >
        <mesh>
          <ringGeometry args={[0.028, 0.038, 24]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={nadirPulseRef}>
          <ringGeometry args={[0.044, 0.056, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      </group>

      {/* Exact NASA 3D ISS Model centered & scaled along orbital flight path */}
      <group
        ref={issRootRef}
        onClick={(e) => {
          e.stopPropagation();
          onTrackIss?.();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          document.body.style.cursor = "";
        }}
      >
        <pointLight intensity={0.55} distance={1.1} color="#e0f2fe" />
        {/* Forgiving invisible click target around orbiting spacecraft */}
        <mesh>
          <sphereGeometry args={[0.16, 10, 10]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
        <group ref={issScaleRef}>
          <primitive object={preparedScene} position={modelOffset} />
        </group>
      </group>
    </group>
  );
};

/* ── Main Fast & Furious God's Eye 3D Globe Scene ── */
const GodsEyeGlobeScene = ({
  relayState,
  clustered,
  issSnapshot,
  selectedCluster,
  onSelectCluster,
  onTrackIss,
}) => {
  const continentGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(buildContinentPositions(2.012), 3));
    return geo;
  }, []);

  const coastlineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(buildCoastlinePositions(2.018), 3));
    return geo;
  }, []);

  const graticuleGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(buildGraticulePositions(2.0), 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => {
      continentGeo.dispose();
      coastlineGeo.dispose();
      graticuleGeo.dispose();
    };
  }, [continentGeo, coastlineGeo, graticuleGeo]);

  const lockProgress = relayState.lockProgress || 0;

  return (
    <group>
      {/* World core sphere */}
      <mesh>
        <sphereGeometry args={[1.96, 48, 32]} />
        <meshStandardMaterial color="#040812" roughness={0.75} metalness={0.28} />
      </mesh>

      {/* Geodesic wireframe lattice */}
      <mesh>
        <icosahedronGeometry args={[1.985, 3]} />
        <meshBasicMaterial color="#0ea5e9" wireframe transparent opacity={0.12 + lockProgress * 0.08} />
      </mesh>

      {/* Geodetic grid lines */}
      <lineSegments geometry={graticuleGeo}>
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.1} />
      </lineSegments>

      {/* Crisp vector coastline borders */}
      <lineSegments geometry={coastlineGeo}>
        <lineBasicMaterial color="#7dd3fc" transparent opacity={0.56} />
      </lineSegments>

      {/* Progressive high-resolution India Sector & Corridor overlay on zoom-in */}
      <IndiaSectorOverlay />

      {/* Glowing continent dots */}
      <points geometry={continentGeo}>
        <pointsMaterial color="#e0f2fe" size={0.028} sizeAttenuation transparent opacity={0.82} />
      </points>

      <AtmosphereRim locked={lockProgress >= 0.99 || relayState.activeBeams.length > 0} />

      {/* Tier 1: Anonymous coarse Mumbai Maharashtra Hub */}
      <TargetBeacon
        lat={HOME_NODE.lat}
        lon={HOME_NODE.lon}
        color="#fbbf24"
        size={0.04}
        isLocked={lockProgress >= 0.66}
        fast
      />

      {/* Tier 3: Clustered historical embers (zero reticle pileup across India/world) */}
      {clustered.historyClusters.map((cluster) => (
        <ClusterEmber
          key={cluster.id}
          cluster={cluster}
          isSelected={selectedCluster?.id === cluster.id}
          onSelect={onSelectCluster}
        />
      ))}

      {/* Tier 2: Spiderfied live online visitors */}
      {clustered.liveNodes.map((node) => (
        <PeerNode key={node.key} node={node} onSelect={onSelectCluster} />
      ))}

      {/* Active great-circle or orbital satellite-bounce request arcs */}
      {relayState.activeBeams.map((beam) => (
        <SignalArc key={beam.id} beam={beam} />
      ))}

      {/* Real-time NASA 3D International Space Station (NORAD 25544) */}
      <ISSSafeBoundary>
        <Suspense fallback={null}>
          <ISSStationOrbit issSnapshot={issSnapshot} onTrackIss={onTrackIss} />
        </Suspense>
      </ISSSafeBoundary>

      {/* Counter-rotating gyroscopic God's Eye tracking gimbals */}
      <GodsEyeGimbals
        lockProgress={lockProgress}
        activeBeamsCount={relayState.activeBeams.length}
      />
    </group>
  );
};

const EarthCanvas = () => {
  const [relayState, setRelayState] = useState(null);
  const [issSnapshot, setIssSnapshot] = useState(null);
  const [cooldown, setCooldown] = useState(false);
  const [isAutoZooming, setIsAutoZooming] = useState(false);
  const [isIndiaSectorZoom, setIsIndiaSectorZoom] = useState(false);
  const [resetTick, setResetTick] = useState(0);
  const [issFocusTick, setIssFocusTick] = useState(0);
  const [trackingIss, setTrackingIss] = useState(false);
  const [issFeedOpen, setIssFeedOpen] = useState(false);
  const [issFeedExpanded, setIssFeedExpanded] = useState(false);
  const [issDisplayTick, setIssDisplayTick] = useState(0);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeEarthRelay((snap) => {
      setRelayState(snap);
      if (snap.connected) {
        trackOnce(
          "Earth Relay Connected",
          {
            city: snap.selfGeo.city,
            country: snap.selfGeo.country,
            continent: snap.selfGeo.continent,
            online_count: Math.max(1, snap.peers.length),
          },
          "earth_relay_connected"
        );
      }
    });
    return unsub;
  }, []);

  useEffect(() => subscribeIssTelemetry(setIssSnapshot), []);

  useEffect(() => {
    if (!trackingIss) return;
    const id = setInterval(() => setIssDisplayTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [trackingIss]);

  const clustered = useMemo(() => {
    if (!relayState) {
      return {
        historyClusters: [],
        liveNodes: [],
        homeClusterPings: 0,
        indiaPings: 0,
        liveCount: 1,
      };
    }
    return clusterRelayData({
      peers: relayState.peers,
      recentSignals: relayState.recentSignals,
      selfGeo: relayState.selfGeo,
      selfStatus: relayState.selfStatus,
    });
  }, [relayState]);

  const liveIssReadout = useMemo(() => {
    if (!issSnapshot) return null;
    void issDisplayTick;
    return sampleIssMotion(issSnapshot, typeof performance !== "undefined" ? performance.now() : 0);
  }, [issSnapshot, issDisplayTick]);

  if (!relayState) return null;

  const lockPct = Math.round((relayState.lockProgress || 0) * 100);
  const distanceKm = haversineKm(
    relayState.selfGeo.lat,
    relayState.selfGeo.lon,
    HOME_NODE.lat,
    HOME_NODE.lon
  );
  const latestSignal = relayState.recentSignals[0];
  const activeLatestBeam = relayState.activeBeams[relayState.activeBeams.length - 1];

  const statusTag = activeLatestBeam?.isLocalBounce
    ? "SAT-04 RELAY"
    : trackingIss
      ? "ISS LOCK"
      : isAutoZooming
        ? "TRACKING ZOOM"
        : isIndiaSectorZoom
          ? "SECTOR LOCK"
          : lockPct >= 100
            ? "LOCKED"
            : `SYNC ${lockPct}%`;

  const handleBroadcastPing = async () => {
    if (cooldown) return;
    setCooldown(true);
    setSelectedCluster(null);
    setTrackingIss(false);
    setTimeout(() => setCooldown(false), 1200);

    playRelayPingSound("ping");
    const beam = await launchGlobalEarthSignal("ping");
    markEasterEggFound("global_earth_signal_beam", "ping_button");
    track("Earth Signal Launched", {
      kind: "ping",
      from_city: beam.from.city,
      from_country: beam.from.country,
      from_continent: beam.from.continent,
      distance_km: beam.distanceKm,
      local_bounce: Boolean(beam.isLocalBounce),
    });
  };

  const handleSelectCluster = (cluster) => {
    setTrackingIss(false);
    setSelectedCluster(cluster);
    playRelayPingSound("lock");
  };

  const handleTrackIss = () => {
    setSelectedCluster(null);
    setTrackingIss(true);
    setIssFeedOpen(true);
    setIssFocusTick((t) => t + 1);
    playRelayPingSound("lock");
    if (liveIssReadout) {
      track("Earth ISS Tracked", {
        live: liveIssReadout.live,
        lat: +liveIssReadout.lat.toFixed(1),
        lon: +liveIssReadout.lon.toFixed(1),
        altitude_km: Math.round(liveIssReadout.altitude),
        feed_opened: true,
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col border border-[rgb(var(--accent-rgb)/0.18)] bg-[rgb(var(--page-rgb)/0.55)] p-3">
      <span className="pointer-events-none absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00f5ff]" />
      <span className="pointer-events-none absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00f5ff]" />
      <span className="pointer-events-none absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00f5ff]" />
      <span className="pointer-events-none absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00f5ff]" />

      {/* Top HUD Telemetry Bar (Anonymous coarse Mumbai Hub, zero exact coords) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-white/10 font-mono text-[10px] uppercase tracking-[1.6px]">
        <div className="flex items-center gap-2 text-white/90">
          <span
            className="inline-block w-2 h-2 rounded-full animate-pulse"
            style={{
              background: relayState.connected ? "#4ade80" : "#00f5ff",
              boxShadow: relayState.connected ? "0 0 8px #4ade80" : "0 0 8px #00f5ff",
            }}
          />
          <span>
            GOD&apos;S EYE //{" "}
            <strong className="text-[#00f5ff]">
              {clustered.liveCount} LIVE
            </strong>
            {clustered.indiaPings > 0 && (
              <span className="text-white/55"> · IN×{clustered.indiaPings}</span>
            )}
          </span>
        </div>

        <span className="text-white/65">
          DEST: MUMBAI, MH [ANON]{" "}
          <span
            className={
              activeLatestBeam?.isLocalBounce || lockPct >= 100
                ? "text-[#fbbf24]"
                : "text-accent"
            }
          >
            [{statusTag}]
          </span>
        </span>
      </div>

      {/* 3D Interactive & Auto-Zooming Canvas */}
      <div className="relative flex-1 min-h-[245px] sm:min-h-[290px]" style={{ cursor: "grab" }}>
        {issFeedOpen && (
          <div
            onPointerDown={(e) => e.stopPropagation()}
            onWheel={(e) => e.stopPropagation()}
            className={`absolute top-2 right-2 z-20 border border-[#fbbf24]/65 bg-[#040812]/95 shadow-[0_8px_28px_rgba(0,0,0,0.82)] backdrop-blur-sm transition-all ${
              issFeedExpanded ? "w-[260px] sm:w-[330px]" : "w-[196px] sm:w-[248px]"
            }`}
            style={{ cursor: "default" }}
          >
            <div className="flex items-center justify-between gap-2 px-2 py-1 border-b border-white/10 font-mono text-[9px] uppercase tracking-[1.4px] text-white/85">
              <div className="flex items-center gap-1.5 truncate">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse shrink-0" />
                <span className="truncate">NASA ISS // LIVE CAM</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIssFeedExpanded((v) => !v)}
                  title={issFeedExpanded ? "Compact window" : "Expand window"}
                  className="text-white/60 hover:text-[#00f5ff] transition-colors cursor-pointer px-0.5"
                >
                  {issFeedExpanded ? "−" : "⛶"}
                </button>
                <a
                  href={NASA_ISS_WATCH_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open stream on YouTube"
                  className="text-white/60 hover:text-[#fbbf24] transition-colors px-0.5"
                >
                  ↗
                </a>
                <button
                  type="button"
                  onClick={() => setIssFeedOpen(false)}
                  aria-label="Close ISS live feed"
                  className="text-white/65 hover:text-[#ff5f57] transition-colors cursor-pointer px-0.5"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={NASA_ISS_EMBED_URL}
                title="Live High-Definition Views from the International Space Station (Official NASA Stream)"
                className="w-full h-full border-0 block"
                credentialless=""
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <Canvas
          dpr={[1, 1.5]}
          gl={{ alpha: true, antialias: true }}
          camera={{
            fov: 42,
            near: 0.1,
            far: 200,
          }}
        >
          <ambientLight intensity={0.75} />
          <directionalLight position={[5, 4, 5]} intensity={1.35} color="#dbeafe" />
          <directionalLight position={[-5, -2, -4]} intensity={0.55} color="#00f5ff" />
          <Suspense fallback={<CanvasLoader />}>
            <OrbitControls
              ref={controlsRef}
              autoRotate={!isAutoZooming}
              autoRotateSpeed={0.35 + (relayState.lockProgress || 0) * 0.65}
              enableZoom
              zoomSpeed={0.75}
              minDistance={2.38}
              maxDistance={8.5}
              enablePan={false}
              maxPolarAngle={Math.PI * 0.85}
              minPolarAngle={Math.PI * 0.15}
            />
            <CameraZoomDirector
              controlsRef={controlsRef}
              activeBeams={relayState.activeBeams}
              resetTick={resetTick}
              issFocusTick={issFocusTick}
              issSnapshot={issSnapshot}
              onZoomChange={setIsAutoZooming}
              onDrillModeChange={setIsIndiaSectorZoom}
            />
            <GodsEyeGlobeScene
              relayState={relayState}
              clustered={clustered}
              issSnapshot={issSnapshot}
              selectedCluster={selectedCluster}
              onSelectCluster={handleSelectCluster}
              onTrackIss={handleTrackIss}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Bottom Tracking Strip + Interactive Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 font-mono text-[10px]">
        <div className="text-white/65 truncate max-w-full sm:max-w-[56%]">
          {activeLatestBeam?.isLocalBounce ? (
            <span>
              <span className="text-[#fbbf24]">SAT-04 BOUNCE:</span> {activeLatestBeam.from.city} &rarr; LEO &rarr; Mumbai, MH
            </span>
          ) : trackingIss && liveIssReadout ? (
            <span>
              <span className="text-[#fbbf24]">ISS {liveIssReadout.live ? "[LIVE]" : "[EST]"}:</span>{" "}
              {Math.abs(liveIssReadout.lat).toFixed(1)}°{liveIssReadout.lat >= 0 ? "N" : "S"}{" "}
              {Math.abs(liveIssReadout.lon).toFixed(1)}°{liveIssReadout.lon >= 0 ? "E" : "W"} &middot;{" "}
              {Math.round(liveIssReadout.altitude)}km &middot; {Math.round(liveIssReadout.velocity).toLocaleString()} km/h
            </span>
          ) : selectedCluster ? (
            selectedCluster.isPeer ? (
              <span>
                <span className="text-[#00f5ff]">LIVE NODE:</span> {selectedCluster.city}
                {selectedCluster.country ? `, ${selectedCluster.country}` : ""} [{selectedCluster.status}]
              </span>
            ) : (
              <span>
                <span className="text-[#00f5ff]">CLUSTER:</span> {selectedCluster.city}
                {selectedCluster.country ? `, ${selectedCluster.country}` : ""} ({selectedCluster.count} ping{selectedCluster.count > 1 ? "s" : ""})
              </span>
            )
          ) : latestSignal ? (
            <>
              <span className="text-[#00f5ff]">PKT:</span> {latestSignal.city},{" "}
              {latestSignal.country} &rarr; Mumbai, MH (
              {distanceKm > 0 ? `${distanceKm.toLocaleString()} km` : "local relay"})
            </>
          ) : (
            <span>
              Scroll to drill into India &middot; Click ISS / clusters
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTrackIss}
            className={`px-2 py-1 border uppercase tracking-[1.2px] transition-colors cursor-pointer ${
              trackingIss
                ? "border-[#fbbf24] bg-[#fbbf24]/15 text-[#fbbf24]"
                : "border-white/15 bg-[var(--term-bg)] text-white/65 hover:text-[#fbbf24] hover:border-[#fbbf24]/60"
            }`}
          >
            iss
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedCluster(null);
              setTrackingIss(false);
              setResetTick((t) => t + 1);
            }}
            className="px-2 py-1 border border-white/15 bg-[var(--term-bg)] text-white/65 uppercase tracking-[1.2px] hover:text-white hover:border-white/40 transition-colors cursor-pointer"
          >
            reset view
          </button>
          <button
            type="button"
            onClick={handleBroadcastPing}
            disabled={cooldown}
            className="px-2.5 py-1 border border-[#00f5ff]/55 bg-[var(--term-bg)] text-[#00f5ff] uppercase tracking-[1.5px] hover:text-white hover:border-[#00f5ff] transition-colors cursor-pointer disabled:opacity-50"
          >
            {cooldown ? "zooming..." : "⌖ ping"}
          </button>
        </div>
      </div>
    </div>
  );
};

export { playRelayPingSound };
export default EarthCanvas;
