import React, { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { HOME_NODE, latLonToVec3 } from "../../utils/earthRelay";
import {
  buildNightCityLightsBuffers,
  buildSubmarineCablePositions,
} from "../../utils/globeLayersData";

/* ── Subtle Scanline + Vignette + Edge Chromatic Aberration Post Shader ── */
const SubtleScreenShader = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2(1280, 720) },
    uTime: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uTime;
    varying vec2 vUv;
    void main() {
      vec2 centered = vUv - 0.5;
      float dist = length(centered);
      // Tiny chromatic aberration strongest near viewport edges
      float ca = dist * dist * 0.0022;
      vec2 dir = dist > 0.0001 ? centered / dist : vec2(0.0);
      float r = texture2D(tDiffuse, vUv + dir * ca).r;
      vec4 base = texture2D(tDiffuse, vUv);
      float b = texture2D(tDiffuse, vUv - dir * ca).b;
      vec3 col = vec3(r, base.g, b);

      // Very faint horizontal scanlines
      float scan = sin(vUv.y * uResolution.y * 1.15) * 0.018;
      col -= scan;

      // Subtle dark corner vignette
      float vig = smoothstep(0.95, 0.34, dist);
      col *= mix(0.76, 1.0, vig);

      gl_FragColor = vec4(col, base.a);
    }
  `,
};

/* ── UnrealBloomPass + Subtle Screen FX Composer ── */
export const BloomAndScreenFX = () => {
  const { gl, scene, camera, size } = useThree();

  const { composer, bloomPass, screenPass } = useMemo(() => {
    const comp = new EffectComposer(gl);
    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);

    const bloom = new UnrealBloomPass(
      new THREE.Vector2(size.width || 800, size.height || 600),
      0.5, // strength
      0.42, // radius
      0.56 // threshold
    );
    comp.addPass(bloom);

    const screen = new ShaderPass(SubtleScreenShader);
    comp.addPass(screen);

    return { composer: comp, bloomPass: bloom, screenPass: screen };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gl, scene, camera]);

  useEffect(() => {
    const w = Math.max(1, size.width);
    const h = Math.max(1, size.height);
    composer.setSize(w, h);
    bloomPass.setSize(w, h);
    screenPass.uniforms.uResolution.value.set(w, h);
  }, [composer, bloomPass, screenPass, size.width, size.height]);

  useEffect(() => {
    return () => {
      composer.dispose();
    };
  }, [composer]);

  useFrame((state) => {
    screenPass.uniforms.uTime.value = state.clock.elapsedTime;
    composer.render();
  }, 1);

  return null;
};

/* ── Deep Space Parallax Starfield ── */
export const DeepSpaceStarfield = () => {
  const nearRef = useRef(null);
  const farRef = useRef(null);

  const { nearGeo, farGeo } = useMemo(() => {
    const makeStars = (count, minR, maxR, seedOffset) => {
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count; i += 1) {
        const u = Math.sin((i + 1 + seedOffset) * 12.9898) * 43758.5453;
        const v = Math.sin((i + 1 + seedOffset) * 78.233) * 43758.5453;
        const w = Math.sin((i + 1 + seedOffset) * 37.719) * 43758.5453;
        const theta = (u - Math.floor(u)) * Math.PI * 2;
        const phi = Math.acos(2 * (v - Math.floor(v)) - 1);
        const r = minR + (w - Math.floor(w)) * (maxR - minR);
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.cos(phi);
        pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return g;
    };
    return {
      nearGeo: makeStars(320, 14, 24, 17),
      farGeo: makeStars(520, 26, 48, 93),
    };
  }, []);

  useEffect(() => () => {
    nearGeo.dispose();
    farGeo.dispose();
  }, [nearGeo, farGeo]);

  useFrame((_, delta) => {
    if (nearRef.current) nearRef.current.rotation.y += delta * 0.012;
    if (farRef.current) farRef.current.rotation.y += delta * 0.004;
  });

  return (
    <group>
      <points ref={farRef} geometry={farGeo}>
        <pointsMaterial color="#94a3b8" size={0.075} transparent opacity={0.45} sizeAttenuation depthWrite={false} />
      </points>
      <points ref={nearRef} geometry={nearGeo}>
        <pointsMaterial color="#bae6fd" size={0.11} transparent opacity={0.72} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  );
};

/* ── Depth-Aware Continent Dots + Periodic Orbital Shimmer Wave (Night-Side Dot Style) ── */
export const DepthAwareContinents = ({ geometry, sunDir }) => {
  const matRef = useRef(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSunDir: { value: sunDir ? sunDir.clone() : new THREE.Vector3(0, 0, 1) },
      uColor: { value: new THREE.Color("#e0f2fe") },
      uShimmerColor: { value: new THREE.Color("#38bdf8") },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (sunDir && matRef.current) {
      matRef.current.uniforms.uSunDir.value.copy(sunDir);
    }
  }, [sunDir]);

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform vec3 uSunDir;
          varying float vLimb;
          varying float vWave;
          varying float vNightWeight;
          void main() {
            vec3 worldNorm = normalize(mat3(modelMatrix) * normalize(position));
            float ndotl = dot(worldNorm, normalize(uSunDir));
            // Keep full dot-matrix style on night side, fade dots smoothly on sunlit satellite imagery
            vNightWeight = smoothstep(0.24, -0.10, ndotl);

            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vec3 viewDir = normalize(-mvPos.xyz);
            vec3 viewNormal = normalize(normalMatrix * normalize(position));
            vLimb = clamp(dot(viewNormal, viewDir), 0.0, 1.0);

            // Periodic horizontal-latitudinal shimmer wave every ~7 seconds
            float cycle = mod(uTime * 0.65, 4.5) - 2.25;
            float distToWave = abs(position.y - cycle);
            vWave = smoothstep(0.32, 0.0, distToWave);

            gl_PointSize = (2.1 + vLimb * 2.5 + vWave * 1.4) * (4.8 / max(1.5, -mvPos.z));
            gl_Position = projectionMatrix * mvPos;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform vec3 uShimmerColor;
          varying float vLimb;
          varying float vWave;
          varying float vNightWeight;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            if (dot(c, c) > 0.25) discard;
            float soft = 1.0 - smoothstep(0.12, 0.25, dot(c, c));
            float baseDot = (0.18 + vLimb * 0.68) * vNightWeight;
            float alpha = (baseDot + vWave * 0.26) * soft;
            if (alpha < 0.02) discard;
            vec3 col = mix(uColor, uShimmerColor, vWave * 0.65);
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </points>
  );
};

/* ── Night-Side Urban City Lights (Fade in ONLY on dark half driven by sunDir) ── */
export const NightCityLights = ({ sunDir, visible = true }) => {
  const matRef = useRef(null);
  const geo = useMemo(() => {
    const data = buildNightCityLightsBuffers(2.014);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    g.setAttribute("aIntensity", new THREE.BufferAttribute(data.intensities, 1));
    return g;
  }, []);

  const uniforms = useMemo(
    () => ({
      uSunDir: { value: sunDir.clone() },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (matRef.current) matRef.current.uniforms.uSunDir.value.copy(sunDir);
  }, [sunDir]);

  useEffect(() => () => geo.dispose(), [geo]);

  if (!visible) return null;

  return (
    <points geometry={geo}>
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float aIntensity;
          uniform vec3 uSunDir;
          varying float vNight;
          varying float vIntensity;
          varying float vLimb;
          void main() {
            vec3 worldNorm = normalize(mat3(modelMatrix) * normalize(position));
            float ndotl = dot(worldNorm, normalize(uSunDir));
            vNight = smoothstep(0.08, -0.22, ndotl);
            vIntensity = aIntensity;
            vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
            vec3 viewDir = normalize(-mvPos.xyz);
            vec3 viewNorm = normalize(normalMatrix * normalize(position));
            vLimb = clamp(dot(viewNorm, viewDir), 0.0, 1.0);
            gl_PointSize = (2.2 + aIntensity * 2.4) * (4.5 / max(1.5, -mvPos.z));
            gl_Position = projectionMatrix * mvPos;
          }
        `}
        fragmentShader={`
          varying float vNight;
          varying float vIntensity;
          varying float vLimb;
          void main() {
            if (vNight < 0.02) discard;
            vec2 c = gl_PointCoord - 0.5;
            float r2 = dot(c, c);
            if (r2 > 0.25) discard;
            float glow = exp(-r2 * 14.0);
            vec3 warmGold = mix(vec3(0.96, 0.62, 0.04), vec3(1.0, 0.88, 0.45), vIntensity);
            gl_FragColor = vec4(warmGold, glow * vNight * vIntensity * (0.25 + vLimb * 0.75));
          }
        `}
      />
    </points>
  );
};

/* ── TeleGeography-style Undersea Submarine Fiber Cables ── */
export const UnderseaCablesLayer = ({ visible }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(buildSubmarineCablePositions(2.008), 3));
    return g;
  }, []);

  useEffect(() => () => geo.dispose(), [geo]);

  if (!visible) return null;

  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color="#06b6d4" transparent opacity={0.42} />
    </lineSegments>
  );
};

/* ── Rotating Radar Sweep Wedge around Mumbai Home Hub ── */
export const MumbaiRadarSweep = () => {
  const matRef = useRef(null);
  const { pos, quat } = useMemo(() => {
    const p = latLonToVec3(HOME_NODE.lat, HOME_NODE.lon, 2.022);
    const n = p.clone().normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    return { pos: p, quat: q };
  }, []);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = state.clock.elapsedTime;
  });

  return (
    <mesh position={pos} quaternion={quat}>
      <circleGeometry args={[0.22, 36]} />
      <shaderMaterial
        ref={matRef}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv * 2.0 - 1.0;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          void main() {
            float r = length(vUv);
            if (r > 1.0 || r < 0.18) discard;
            float angle = atan(vUv.y, vUv.x);
            float sweep = mod(angle + uTime * 2.1, 6.2831853);
            float wedge = smoothstep(1.35, 0.0, sweep);
            float ring = smoothstep(0.06, 0.0, abs(r - 0.96));
            vec3 col = mix(vec3(0.0, 0.96, 1.0), vec3(0.98, 0.75, 0.14), ring * 0.7);
            float alpha = (wedge * 0.34 + ring * 0.45) * (1.0 - r * 0.25);
            gl_FragColor = vec4(col, alpha);
          }
        `}
      />
    </mesh>
  );
};

/* ── Invisible Raycast Surface for Live Cursor Lat/Lon Coordinates ── */
export const CursorGlobeRaycaster = ({ onCursorCoords }) => {
  return (
    <mesh
      onPointerMove={(e) => {
        const p = e.point.clone().normalize();
        const lat = 90 - (Math.acos(THREE.MathUtils.clamp(p.y, -1, 1)) * 180) / Math.PI;
        const theta = Math.atan2(p.z, -p.x);
        let lon = (theta * 180) / Math.PI - 180;
        if (lon < -180) lon += 360;
        if (lon > 180) lon -= 360;
        onCursorCoords({ lat, lon });
      }}
      onPointerOut={() => onCursorCoords(null)}
    >
      <sphereGeometry args={[2.02, 24, 16]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
};

/* ── 3D-to-2D Screen Projection for Hover/Click Leader-Line Callouts ── */
export const CalloutProjector = ({ targetVec, onProject }) => {
  const { camera, size } = useThree();
  const v = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!targetVec) {
      onProject(null);
      return;
    }
    v.copy(targetVec).project(camera);
    const inFront = v.z < 1 && targetVec.clone().normalize().dot(camera.position.clone().normalize()) > 0.05;
    if (!inFront) {
      onProject(null);
      return;
    }
    const x = (v.x * 0.5 + 0.5) * size.width;
    const y = (-v.y * 0.5 + 0.5) * size.height;
    onProject({ x, y });
  });

  return null;
};
