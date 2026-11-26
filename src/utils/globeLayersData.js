import * as THREE from "three";
import { latLonToVec3 } from "./earthRelay";

/**
 * Curated major global urban centers for Night-Side City Lights.
 * Each metro emits a tight cluster of micro-lights that fade in on the night hemisphere.
 */
const URBAN_HUBS = [
  // India & South Asia (Mumbai primary hub)
  [19.08, 72.88, 1.0], [28.61, 77.21, 1.0], [12.97, 77.59, 0.9], [13.08, 80.27, 0.85],
  [22.57, 88.36, 0.9], [17.38, 78.49, 0.85], [18.52, 73.86, 0.8], [23.02, 72.57, 0.8],
  [26.91, 75.79, 0.7], [21.17, 72.83, 0.7], [24.86, 67.01, 0.85], [31.55, 74.36, 0.8],
  [23.81, 90.41, 0.85], [6.93, 79.86, 0.65], [27.72, 85.32, 0.6],
  // Middle East & Africa
  [25.2, 55.27, 0.95], [24.71, 46.68, 0.85], [25.29, 51.53, 0.75], [32.09, 34.78, 0.8],
  [30.04, 31.24, 0.95], [6.52, 3.38, 0.85], [-26.2, 28.05, 0.8], [-1.29, 36.82, 0.7],
  [33.57, -7.59, 0.75], [36.75, 3.06, 0.7],
  // Europe
  [51.51, -0.13, 1.0], [48.86, 2.35, 1.0], [52.52, 13.4, 0.9], [40.42, -3.7, 0.85],
  [41.9, 12.5, 0.85], [45.46, 9.19, 0.8], [52.37, 4.9, 0.85], [50.85, 4.35, 0.8],
  [48.21, 16.37, 0.75], [52.23, 21.01, 0.8], [55.75, 37.62, 0.95], [59.93, 30.34, 0.8],
  [41.01, 28.98, 0.95], [37.98, 23.73, 0.75], [59.33, 18.07, 0.7], [38.72, -9.14, 0.7],
  // East & SE Asia
  [35.68, 139.69, 1.0], [34.69, 135.5, 0.9], [37.57, 126.98, 0.95], [31.23, 121.47, 1.0],
  [39.9, 116.4, 1.0], [22.32, 114.17, 0.95], [23.13, 113.26, 0.95], [25.03, 121.57, 0.85],
  [1.35, 103.82, 0.95], [13.76, 100.5, 0.9], [-6.21, 106.85, 0.9], [14.6, 120.98, 0.85],
  [21.03, 105.85, 0.8], [10.82, 106.63, 0.8], [3.14, 101.69, 0.8],
  // Americas & Oceania
  [40.71, -74.01, 1.0], [41.88, -87.63, 0.9], [34.05, -118.24, 0.95], [37.77, -122.42, 0.85],
  [29.76, -95.37, 0.85], [25.76, -80.19, 0.85], [43.65, -79.38, 0.85], [45.5, -73.57, 0.75],
  [47.61, -122.33, 0.75], [19.43, -99.13, 0.95], [-23.55, -46.63, 1.0], [-22.91, -43.17, 0.9],
  [-34.6, -58.38, 0.9], [4.71, -74.07, 0.8], [-12.05, -77.04, 0.8], [-33.45, -70.67, 0.8],
  [-33.87, 151.21, 0.85], [-37.81, 144.96, 0.8], [-36.85, 174.76, 0.65],
];

// Deterministic PRNG for stable city-light micro-clusters
function seededRand(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function buildNightCityLightsBuffers(radius = 2.014) {
  const rand = seededRand(20261126);
  const positions = [];
  const intensities = [];

  for (const [lat, lon, weight] of URBAN_HUBS) {
    // Core city dot
    const core = latLonToVec3(lat, lon, radius);
    positions.push(core.x, core.y, core.z);
    intensities.push(weight);

    // Surrounding metropolitan sprawl micro-dots
    const sprawlCount = Math.round(5 + weight * 8);
    for (let i = 0; i < sprawlCount; i += 1) {
      const dLat = (rand() - 0.5) * 3.4 * weight;
      const dLon = (rand() - 0.5) * 4.2 * weight;
      const p = latLonToVec3(lat + dLat, lon + dLon, radius);
      positions.push(p.x, p.y, p.z);
      intensities.push(weight * (0.45 + rand() * 0.5));
    }
  }

  return {
    positions: new Float32Array(positions),
    intensities: new Float32Array(intensities),
    count: positions.length / 3,
  };
}

/**
 * TeleGeography-inspired major Submarine Fiber Cable corridors
 * (Mumbai is a primary global landing station for SEA-ME-WE, IMEWE, FLAG, 2Africa).
 */
const SUBMARINE_CABLE_ROUTES = [
  // SEA-ME-WE 5 / IMEWE: Mumbai -> Fujairah -> Djibouti -> Suez -> Palermo -> Marseille -> UK
  [
    [19.08, 72.88], [24.8, 56.4], [12.6, 43.3], [29.9, 32.5], [37.9, 13.3], [43.3, 5.37], [50.1, -5.5],
  ],
  // SEA-ME-WE / FEA East: Mumbai -> Colombo -> Penang -> Singapore -> Hong Kong -> Tokyo
  [
    [19.08, 72.88], [6.93, 79.86], [5.4, 100.3], [1.35, 103.82], [22.3, 114.2], [35.4, 139.8],
  ],
  // 2Africa / SAFE East-West: Mumbai -> Mombasa -> Cape Town -> Lisbon -> London
  [
    [19.08, 72.88], [-4.05, 39.67], [-33.9, 18.4], [38.7, -9.2], [51.5, -0.13],
  ],
  // Trans-Atlantic (MAREA / Grace Hopper): New York -> Bude (UK) & Bilbao
  [
    [40.71, -74.01], [47.5, -42.0], [50.8, -4.5],
  ],
  [
    [40.71, -74.01], [42.0, -36.0], [43.3, -2.9],
  ],
  // Trans-Pacific (FASTER / Unity): Tokyo -> San Francisco -> Los Angeles
  [
    [35.68, 139.69], [42.0, 175.0], [41.5, -148.0], [37.77, -122.42], [34.05, -118.24],
  ],
  // Americas Ring: Miami -> Fortaleza -> Sao Paulo & Los Angeles -> Panama -> Lima
  [
    [25.76, -80.19], [10.5, -61.5], [-3.7, -38.5], [-23.55, -46.63],
  ],
  [
    [34.05, -118.24], [19.0, -106.0], [8.98, -79.52], [-12.05, -77.04],
  ],
  // Australia-Asia Express: Singapore -> Jakarta -> Perth -> Sydney
  [
    [1.35, 103.82], [-6.21, 106.85], [-31.95, 115.86], [-33.87, 151.21],
  ],
];

export function buildSubmarineCablePositions(radius = 2.008) {
  const segments = [];
  for (const route of SUBMARINE_CABLE_ROUTES) {
    for (let i = 0; i < route.length - 1; i += 1) {
      const a = latLonToVec3(route[i][0], route[i][1], 1).normalize();
      const b = latLonToVec3(route[i + 1][0], route[i + 1][1], 1).normalize();
      const steps = Math.max(8, Math.round(a.angleTo(b) * 28));
      for (let s = 0; s < steps; s += 1) {
        const t0 = s / steps;
        const t1 = (s + 1) / steps;
        const p0 = new THREE.Vector3().lerpVectors(a, b, t0).normalize().multiplyScalar(radius);
        const p1 = new THREE.Vector3().lerpVectors(a, b, t1).normalize().multiplyScalar(radius);
        segments.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
      }
    }
  }
  return new Float32Array(segments);
}

/**
 * Curated jump targets for the God's Eye Command Palette (/ or Ctrl+K)
 */
export const COMMAND_CITIES = [
  { id: "mumbai", name: "Mumbai, IN (Home Hub)", lat: 19.08, lon: 72.88, dist: 3.1 },
  { id: "delhi", name: "New Delhi, IN", lat: 28.61, lon: 77.21, dist: 3.3 },
  { id: "bengaluru", name: "Bengaluru, IN", lat: 12.97, lon: 77.59, dist: 3.3 },
  { id: "tokyo", name: "Tokyo, JP", lat: 35.68, lon: 139.69, dist: 3.6 },
  { id: "singapore", name: "Singapore, SG", lat: 1.35, lon: 103.82, dist: 3.5 },
  { id: "dubai", name: "Dubai, AE", lat: 25.2, lon: 55.27, dist: 3.5 },
  { id: "london", name: "London, UK", lat: 51.51, lon: -0.13, dist: 3.7 },
  { id: "newyork", name: "New York, US", lat: 40.71, lon: -74.01, dist: 3.8 },
  { id: "sf", name: "San Francisco, US", lat: 37.77, lon: -122.42, dist: 3.8 },
  { id: "sydney", name: "Sydney, AU", lat: -33.87, lon: 151.21, dist: 3.8 },
];

/**
 * Estimate minutes until next ISS pass within ~1800 km of Mumbai using live orbit track.
 */
export function estimateNextIssPassOverMumbai(issSnapshot) {
  const pts = issSnapshot?.orbitPoints || [];
  const nowSec = Date.now() / 1000;
  for (const pt of pts) {
    if (pt.timestamp <= nowSec) continue;
    const dLat = ((pt.lat - 19.08) * Math.PI) / 180;
    const dLon = ((pt.lon - 72.88) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((19.08 * Math.PI) / 180) *
        Math.cos((pt.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (km < 2200) {
      return Math.max(1, Math.round((pt.timestamp - nowSec) / 60));
    }
  }
  // Fallback orbital period estimate (~92 min)
  return Math.max(4, Math.round((nowSec / 60) % 92));
}
