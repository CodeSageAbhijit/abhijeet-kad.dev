import * as THREE from "three";
import { authenticatedClient, spiritsEnabled } from "../spirits/api.js";

export const HOME_NODE = {
  city: "Mumbai",
  region: "Maharashtra",
  country: "IN",
  continent: "Asia",
  // Coarse arbitrary point in Mumbai region (keeps exact location anonymous)
  lat: 19.08,
  lon: 72.88,
};

// Curated offline-safe timezone-to-location lookup spanning all inhabited continents
const TIMEZONE_LOCATIONS = {
  "Asia/Kolkata": { city: "Maharashtra Node", country: "IN", continent: "Asia", lat: 19.88, lon: 75.34 },
  "Asia/Calcutta": { city: "West India Node", country: "IN", continent: "Asia", lat: 18.52, lon: 73.86 },
  "Asia/Tokyo": { city: "Tokyo", country: "JP", continent: "Asia", lat: 35.68, lon: 139.69 },
  "Asia/Singapore": { city: "Singapore", country: "SG", continent: "Asia", lat: 1.35, lon: 103.82 },
  "Asia/Seoul": { city: "Seoul", country: "KR", continent: "Asia", lat: 37.57, lon: 126.98 },
  "Asia/Shanghai": { city: "Shanghai", country: "CN", continent: "Asia", lat: 31.23, lon: 121.47 },
  "Asia/Hong_Kong": { city: "Hong Kong", country: "HK", continent: "Asia", lat: 22.32, lon: 114.17 },
  "Asia/Dubai": { city: "Dubai", country: "AE", continent: "Asia", lat: 25.2, lon: 55.27 },
  "Asia/Bangkok": { city: "Bangkok", country: "TH", continent: "Asia", lat: 13.76, lon: 100.5 },
  "Asia/Jakarta": { city: "Jakarta", country: "ID", continent: "Asia", lat: -6.21, lon: 106.85 },
  "Asia/Taipei": { city: "Taipei", country: "TW", continent: "Asia", lat: 25.03, lon: 121.57 },
  "Asia/Karachi": { city: "Karachi", country: "PK", continent: "Asia", lat: 24.86, lon: 67.01 },
  "Asia/Dhaka": { city: "Dhaka", country: "BD", continent: "Asia", lat: 23.81, lon: 90.41 },
  "Asia/Manila": { city: "Manila", country: "PH", continent: "Asia", lat: 14.6, lon: 120.98 },
  "Asia/Jerusalem": { city: "Tel Aviv", country: "IL", continent: "Asia", lat: 32.09, lon: 34.78 },
  "Asia/Riyadh": { city: "Riyadh", country: "SA", continent: "Asia", lat: 24.71, lon: 46.68 },
  "America/New_York": { city: "New York", country: "US", continent: "North America", lat: 40.71, lon: -74.01 },
  "America/Chicago": { city: "Chicago", country: "US", continent: "North America", lat: 41.88, lon: -87.63 },
  "America/Denver": { city: "Denver", country: "US", continent: "North America", lat: 39.74, lon: -104.99 },
  "America/Los_Angeles": { city: "San Francisco", country: "US", continent: "North America", lat: 37.77, lon: -122.42 },
  "America/Phoenix": { city: "Phoenix", country: "US", continent: "North America", lat: 33.45, lon: -112.07 },
  "America/Toronto": { city: "Toronto", country: "CA", continent: "North America", lat: 43.65, lon: -79.38 },
  "America/Vancouver": { city: "Vancouver", country: "CA", continent: "North America", lat: 49.28, lon: -123.12 },
  "America/Mexico_City": { city: "Mexico City", country: "MX", continent: "North America", lat: 19.43, lon: -99.13 },
  "America/Sao_Paulo": { city: "Sao Paulo", country: "BR", continent: "South America", lat: -23.55, lon: -46.63 },
  "America/Argentina/Buenos_Aires": { city: "Buenos Aires", country: "AR", continent: "South America", lat: -34.6, lon: -58.38 },
  "America/Bogota": { city: "Bogota", country: "CO", continent: "South America", lat: 4.71, lon: -74.07 },
  "America/Santiago": { city: "Santiago", country: "CL", continent: "South America", lat: -33.45, lon: -70.67 },
  "America/Lima": { city: "Lima", country: "PE", continent: "South America", lat: -12.05, lon: -77.04 },
  "Europe/London": { city: "London", country: "UK", continent: "Europe", lat: 51.51, lon: -0.13 },
  "Europe/Dublin": { city: "Dublin", country: "IE", continent: "Europe", lat: 53.35, lon: -6.26 },
  "Europe/Berlin": { city: "Berlin", country: "DE", continent: "Europe", lat: 52.52, lon: 13.4 },
  "Europe/Paris": { city: "Paris", country: "FR", continent: "Europe", lat: 48.86, lon: 2.35 },
  "Europe/Amsterdam": { city: "Amsterdam", country: "NL", continent: "Europe", lat: 52.37, lon: 4.9 },
  "Europe/Madrid": { city: "Madrid", country: "ES", continent: "Europe", lat: 40.42, lon: -3.7 },
  "Europe/Rome": { city: "Rome", country: "IT", continent: "Europe", lat: 41.9, lon: 12.5 },
  "Europe/Zurich": { city: "Zurich", country: "CH", continent: "Europe", lat: 47.37, lon: 8.54 },
  "Europe/Stockholm": { city: "Stockholm", country: "SE", continent: "Europe", lat: 59.33, lon: 18.07 },
  "Europe/Warsaw": { city: "Warsaw", country: "PL", continent: "Europe", lat: 52.23, lon: 21.01 },
  "Europe/Istanbul": { city: "Istanbul", country: "TR", continent: "Europe", lat: 41.01, lon: 28.98 },
  "Europe/Athens": { city: "Athens", country: "GR", continent: "Europe", lat: 37.98, lon: 23.73 },
  "Europe/Lisbon": { city: "Lisbon", country: "PT", continent: "Europe", lat: 38.72, lon: -9.14 },
  "Africa/Cairo": { city: "Cairo", country: "EG", continent: "Africa", lat: 30.04, lon: 31.24 },
  "Africa/Lagos": { city: "Lagos", country: "NG", continent: "Africa", lat: 6.52, lon: 3.38 },
  "Africa/Johannesburg": { city: "Johannesburg", country: "ZA", continent: "Africa", lat: -26.2, lon: 28.05 },
  "Africa/Nairobi": { city: "Nairobi", country: "KE", continent: "Africa", lat: -1.29, lon: 36.82 },
  "Africa/Casablanca": { city: "Casablanca", country: "MA", continent: "Africa", lat: 33.57, lon: -7.59 },
  "Australia/Sydney": { city: "Sydney", country: "AU", continent: "Oceania", lat: -33.87, lon: 151.21 },
  "Australia/Melbourne": { city: "Melbourne", country: "AU", continent: "Oceania", lat: -37.81, lon: 144.96 },
  "Australia/Perth": { city: "Perth", country: "AU", continent: "Oceania", lat: -31.95, lon: 115.86 },
  "Pacific/Auckland": { city: "Auckland", country: "NZ", continent: "Oceania", lat: -36.85, lon: 174.76 },
};

// Simplified continental polygons [lon, lat] for crisp 3D dotted world map
const CONTINENT_POLYGONS = [
  // North America
  [[-168, 66], [-162, 56], [-136, 58], [-125, 49], [-124, 40], [-117, 32], [-110, 23], [-97, 26], [-90, 29], [-83, 25], [-80, 32], [-75, 39], [-70, 42], [-66, 45], [-60, 47], [-66, 58], [-78, 63], [-95, 68], [-120, 71], [-156, 71]],
  // Greenland
  [[-54, 60], [-42, 60], [-20, 70], [-22, 82], [-58, 82], [-68, 76]],
  // South America
  [[-80, 9], [-75, 11], [-62, 10], [-50, 1], [-35, -6], [-39, -15], [-44, -23], [-53, -33], [-64, -42], [-69, -54], [-74, -52], [-73, -38], [-71, -18], [-81, -5]],
  // Europe
  [[-9, 37], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 55], [10, 58], [5, 61], [18, 69], [30, 70], [42, 66], [42, 52], [32, 46], [28, 41], [23, 37], [15, 38], [12, 43], [4, 43], [-4, 36]],
  // UK & Ireland
  [[-10, 52], [-5, 50], [2, 51], [-2, 58], [-8, 56]],
  // Africa
  [[-17, 15], [-13, 28], [-6, 36], [10, 37], [25, 32], [33, 31], [43, 12], [51, 12], [44, 0], [40, -14], [34, -26], [20, -35], [14, -22], [10, -4], [4, 5], [-8, 5], [-16, 11]],
  // Madagascar
  [[44, -25], [47, -25], [50, -14], [46, -15]],
  // Asia + Detailed India peninsula + SE Asia
  [
    [27, 41], [35, 37], [36, 30], [40, 16], [54, 17], [59, 24], [67.0, 24.8],
    [68.4, 23.8], [69.0, 22.8], [70.2, 22.9], [69.0, 22.2], [70.4, 20.8], [72.2, 21.6], [72.6, 21.8],
    [72.8, 20.4], [72.85, 19.08], [73.1, 17.6], [73.8, 15.4], [74.8, 12.9], [76.2, 10.0], [77.55, 8.08],
    [78.15, 8.8], [79.2, 9.3], [79.85, 10.3], [80.3, 13.1], [80.1, 15.3], [82.2, 16.9], [83.3, 17.7],
    [85.2, 19.6], [87.0, 21.5], [89.1, 21.9], [91.8, 22.3], [92.3, 20.8], [94.3, 18.0], [97.0, 16.0],
    [98.6, 10.0], [101.0, 2.0], [104.0, 1.3], [104.2, 11.0], [109.0, 14.0], [107.0, 21.0], [116.0, 22.0],
    [122.0, 31.0], [121.0, 39.0], [129.0, 36.0], [131.0, 43.0], [141.0, 52.0], [158.0, 56.0],
    [175.0, 66.0], [140.0, 71.0], [100.0, 75.0], [70.0, 71.0], [58.0, 68.0], [44.0, 55.0], [40.0, 44.0],
  ],
  // Sri Lanka
  [[80.0, 9.6], [81.8, 7.6], [80.5, 6.0], [79.8, 7.8]],
  // Japan
  [[130, 32], [136, 34], [141, 38], [145, 44], [140, 42], [136, 36]],
  // Australia
  [[114, -22], [122, -17], [130, -12], [136, -12], [143, -11], [150, -22], [153, -29], [148, -38], [138, -36], [129, -32], [115, -34]],
  // New Zealand
  [[167, -46], [174, -41], [178, -37], [173, -35], [171, -42]],
];

function pointInPolygon(lon, lat, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    const intersect =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function latLonToVec3(lat, lon, radius = 2.05) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return new THREE.Vector3(x, y, z);
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/**
 * Deterministically samples a crisp dotted continent map (~1,600 dots) onto a 3D sphere.
 */
export function buildContinentPositions(radius = 2.015) {
  const positions = [];
  for (let lat = -58; lat <= 82; lat += 2.75) {
    // Adjust longitude spacing by cos(lat) so dots stay evenly spaced near poles
    const stepLon = Math.min(18, 2.75 / Math.max(0.22, Math.cos((lat * Math.PI) / 180)));
    for (let lon = -175; lon <= 178; lon += stepLon) {
      let hit = false;
      for (let p = 0; p < CONTINENT_POLYGONS.length; p++) {
        if (pointInPolygon(lon, lat, CONTINENT_POLYGONS[p])) {
          hit = true;
          break;
        }
      }
      if (hit) {
        const v = latLonToVec3(lat, lon, radius);
        positions.push(v.x, v.y, v.z);
      }
    }
  }
  return new Float32Array(positions);
}

export function buildGraticulePositions(radius = 2.005) {
  const pts = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    for (let lon = -180; lon < 180; lon += 8) {
      const a = latLonToVec3(lat, lon, radius);
      const b = latLonToVec3(lat, lon + 8, radius);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  for (let lon = -180; lon < 180; lon += 30) {
    for (let lat = -84; lat < 84; lat += 8) {
      const a = latLonToVec3(lat, lon, radius);
      const b = latLonToVec3(lat + 8, lon, radius);
      pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  return new Float32Array(pts);
}

/**
 * Generates crisp vector coastline line segments so continents look detailed even when zoomed in closely.
 */
export function buildCoastlinePositions(radius = 2.018) {
  const segs = [];
  for (const poly of CONTINENT_POLYGONS) {
    for (let i = 0; i < poly.length; i++) {
      const [lon1, lat1] = poly[i];
      const [lon2, lat2] = poly[(i + 1) % poly.length];
      const subSteps = Math.max(1, Math.ceil(Math.hypot(lon2 - lon1, lat2 - lat1) / 3.5));
      for (let s = 0; s < subSteps; s++) {
        const t1 = s / subSteps;
        const t2 = (s + 1) / subSteps;
        const a = latLonToVec3(lat1 + (lat2 - lat1) * t1, lon1 + (lon2 - lon1) * t1, radius);
        const b = latLonToVec3(lat1 + (lat2 - lat1) * t2, lon1 + (lon2 - lon1) * t2, radius);
        segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
  }
  return new Float32Array(segs);
}

// High-resolution South Asia / India tactical drill-down vector polylines (faded in on regional zoom)
const INDIA_SECTOR_POLYLINES = [
  // Northern / Himalayan / NE geopolitical frontier connecting into Gujarat & Bengal coasts
  [
    [68.4, 23.8], [71.0, 24.7], [70.2, 27.0], [72.5, 29.0], [74.5, 31.6], [74.2, 33.8],
    [76.0, 35.4], [79.2, 33.8], [78.9, 31.2], [81.0, 29.8], [84.2, 27.6], [88.1, 27.2],
    [88.6, 27.9], [91.5, 27.4], [95.0, 28.9], [97.3, 28.1], [95.2, 26.2], [94.4, 24.0],
    [93.0, 22.1], [92.1, 23.7], [90.2, 25.4], [88.9, 25.2], [88.8, 22.0],
  ],
  // Maharashtra sector schematic loop
  [
    [72.8, 20.1], [74.2, 21.2], [77.8, 21.4], [80.4, 21.1], [80.2, 18.8], [77.7, 18.0],
    [75.8, 17.2], [73.9, 15.9], [72.85, 19.08],
  ],
  // South / Deccan sector divider (Goa -> Hyderabad -> East Coast -> Bengaluru -> West Coast)
  [
    [73.8, 15.4], [76.8, 16.5], [78.49, 17.39], [81.1, 16.4],
  ],
  [
    [74.8, 12.9], [77.59, 12.97], [80.27, 13.08],
  ],
  [
    [77.59, 12.97], [77.1, 10.6], [76.2, 10.0],
  ],
  // Gujarat & Western Corridor divider
  [
    [71.0, 24.7], [74.1, 23.6], [74.2, 21.2],
  ],
  // Central / North-East Corridor divider (Rajasthan -> Delhi -> UP -> Bihar -> Bengal)
  [
    [74.1, 23.6], [75.8, 26.9], [77.21, 28.61], [80.9, 26.8], [85.1, 25.6], [88.2, 24.1],
  ],
];

const INDIA_CORRIDOR_LINKS = [
  [[72.88, 19.08], [73.86, 18.52]], // Mumbai <-> Pune
  [[72.88, 19.08], [72.57, 23.02]], // Mumbai <-> Ahmedabad
  [[72.57, 23.02], [77.21, 28.61]], // Ahmedabad <-> Delhi
  [[72.88, 19.08], [77.59, 12.97]], // Mumbai <-> Bengaluru
  [[72.88, 19.08], [78.49, 17.39]], // Mumbai <-> Hyderabad
  [[78.49, 17.39], [77.59, 12.97]], // Hyderabad <-> Bengaluru
  [[77.59, 12.97], [80.27, 13.08]], // Bengaluru <-> Chennai
  [[77.21, 28.61], [88.36, 22.57]], // Delhi <-> Kolkata
  [[78.49, 17.39], [88.36, 22.57]], // Hyderabad <-> Kolkata
];

export const INDIA_SECTOR_HUBS = [
  { code: "PNQ", city: "Pune", lat: 18.52, lon: 73.86 },
  { code: "DEL", city: "Delhi", lat: 28.61, lon: 77.21 },
  { code: "BLR", city: "Bengaluru", lat: 12.97, lon: 77.59 },
  { code: "HYD", city: "Hyderabad", lat: 17.39, lon: 78.49 },
  { code: "MAA", city: "Chennai", lat: 13.08, lon: 80.27 },
  { code: "AMD", city: "Ahmedabad", lat: 23.02, lon: 72.57 },
  { code: "CCU", city: "Kolkata", lat: 22.57, lon: 88.36 },
];

export function buildIndiaSectorPositions(radius = 2.021) {
  const segs = [];
  for (const line of INDIA_SECTOR_POLYLINES) {
    for (let i = 0; i < line.length - 1; i++) {
      const [lon1, lat1] = line[i];
      const [lon2, lat2] = line[i + 1];
      const subSteps = Math.max(1, Math.ceil(Math.hypot(lon2 - lon1, lat2 - lat1) / 1.5));
      for (let s = 0; s < subSteps; s++) {
        const t1 = s / subSteps;
        const t2 = (s + 1) / subSteps;
        const a = latLonToVec3(lat1 + (lat2 - lat1) * t1, lon1 + (lon2 - lon1) * t1, radius);
        const b = latLonToVec3(lat1 + (lat2 - lat1) * t2, lon1 + (lon2 - lon1) * t2, radius);
        segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
  }
  return new Float32Array(segs);
}

export function buildIndiaCorridorPositions(radius = 2.019) {
  const segs = [];
  for (const [from, to] of INDIA_CORRIDOR_LINKS) {
    const [lon1, lat1] = from;
    const [lon2, lat2] = to;
    const subSteps = 6;
    for (let s = 0; s < subSteps; s++) {
      const t1 = s / subSteps;
      const t2 = (s + 1) / subSteps;
      const a = latLonToVec3(lat1 + (lat2 - lat1) * t1, lon1 + (lon2 - lon1) * t1, radius);
      const b = latLonToVec3(lat1 + (lat2 - lat1) * t2, lon1 + (lon2 - lon1) * t2, radius);
      segs.push(a.x, a.y, a.z, b.x, b.y, b.z);
    }
  }
  return new Float32Array(segs);
}

export function buildIndiaHubPoints(radius = 2.023) {
  const pts = [];
  for (const hub of INDIA_SECTOR_HUBS) {
    const v = latLonToVec3(hub.lat, hub.lon, radius);
    pts.push(v.x, v.y, v.z);
  }
  return new Float32Array(pts);
}

/**
 * Prevents city overlaps and regional India clutter by:
 * 1) Aggregating historical signals into ~70km city/grid clusters (omitting duplicates right on HOME_NODE),
 * 2) Deterministically spiderfying live online visitors sharing a metro or sitting near HOME_NODE.
 */
export function clusterRelayData({
  peers = [],
  recentSignals = [],
  selfGeo = HOME_NODE,
  selfStatus = "browsing",
}) {
  // 1) Aggregate historical signals by 0.65° bucket (~70km metro radius)
  const clusterMap = new Map();
  let homeClusterPings = 0;
  let indiaPings = 0;

  for (const sig of recentSignals) {
    if (!Number.isFinite(sig?.lat) || !Number.isFinite(sig?.lon)) continue;
    const inIndia =
      sig.country === "IN" || (sig.lat >= 6 && sig.lat <= 37 && sig.lon >= 68 && sig.lon <= 97.5);
    if (inIndia) indiaPings += 1;

    if (
      Math.hypot(sig.lat - HOME_NODE.lat, sig.lon - HOME_NODE.lon) < 0.35 ||
      (sig.city?.toLowerCase() === "mumbai" && sig.country === "IN")
    ) {
      homeClusterPings += 1;
      continue;
    }

    const cityKey =
      sig.city && sig.city !== "Relay Node"
        ? `city:${sig.city.trim().toLowerCase()}:${sig.country || ""}`
        : `grid:${Math.round(sig.lat / 1.0)}:${Math.round(sig.lon / 1.0)}`;
    const existing = clusterMap.get(cityKey);
    if (existing) {
      existing.count += 1;
      existing.latSum += sig.lat;
      existing.lonSum += sig.lon;
    } else {
      clusterMap.set(cityKey, {
        id: `cluster-${cityKey}`,
        city: sig.city || "Relay Node",
        country: sig.country || "",
        latSum: sig.lat,
        lonSum: sig.lon,
        count: 1,
        kind: sig.kind || "ping",
      });
    }
  }

  const historyClusters = Array.from(clusterMap.values())
    .map((c) => ({
      id: c.id,
      city: c.city,
      country: c.country,
      lat: c.latSum / c.count,
      lon: c.lonSum / c.count,
      count: c.count,
      kind: c.kind,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 18);

  // 2) Spiderfy live online peers sharing a city or standing directly over HOME_NODE
  const rawLive =
    peers.length > 0
      ? peers
      : [{ key: "self", ...selfGeo, status: selfStatus || "browsing" }];

  const liveBuckets = new Map();
  for (const peer of rawLive) {
    if (!Number.isFinite(peer?.lat) || !Number.isFinite(peer?.lon)) continue;
    const atHome =
      Math.hypot(peer.lat - HOME_NODE.lat, peer.lon - HOME_NODE.lon) < 0.35 ||
      (peer.city?.toLowerCase() === "mumbai" && peer.country === "IN");
    const bKey = atHome
      ? "HOME"
      : peer.city && peer.city !== "Relay Node"
        ? `city:${peer.city.trim().toLowerCase()}:${peer.country || ""}`
        : `grid:${Math.round(peer.lat / 0.85)}:${Math.round(peer.lon / 0.85)}`;
    if (!liveBuckets.has(bKey)) liveBuckets.set(bKey, []);
    liveBuckets.get(bKey).push(peer);
  }

  const liveNodes = [];
  for (const [bKey, group] of liveBuckets.entries()) {
    const isHomeBucket = bKey === "HOME";
    const needSpiderfy = isHomeBucket || group.length > 1;
    const anchorLat = isHomeBucket
      ? HOME_NODE.lat
      : group.reduce((s, p) => s + p.lat, 0) / group.length;
    const anchorLon = isHomeBucket
      ? HOME_NODE.lon
      : group.reduce((s, p) => s + p.lon, 0) / group.length;

    group.forEach((peer, idx) => {
      if (!needSpiderfy) {
        liveNodes.push({
          ...peer,
          displayLat: peer.lat,
          displayLon: peer.lon,
          anchorLat: null,
          anchorLon: null,
          spiderfied: false,
        });
        return;
      }

      const ring = Math.floor(idx / 6);
      const baseRadius = isHomeBucket ? 0.34 : 0.24;
      const radiusDeg = baseRadius + ring * 0.16;
      const angle = idx * 2.39996 + (isHomeBucket ? 0.55 : 0.2);
      const cosLat = Math.max(0.35, Math.cos((anchorLat * Math.PI) / 180));
      const offsetLat = Math.sin(angle) * radiusDeg;
      const offsetLon = (Math.cos(angle) * radiusDeg) / cosLat;

      liveNodes.push({
        ...peer,
        displayLat: anchorLat + offsetLat,
        displayLon: anchorLon + offsetLon,
        anchorLat,
        anchorLon,
        spiderfied: true,
      });
    });
  }

  return {
    historyClusters,
    liveNodes,
    homeClusterPings,
    indiaPings,
    liveCount: Math.max(1, rawLive.length),
  };
}

export function vec3ToLatLon(vec) {
  const n = vec.clone().normalize();
  const lat = 90 - Math.acos(THREE.MathUtils.clamp(n.y, -1, 1)) * (180 / Math.PI);
  const theta = Math.atan2(n.z, -n.x);
  let lon = theta * (180 / Math.PI) - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;
  return { lat, lon };
}

export function getTimezoneFallbackGeo() {
  if (typeof window === "undefined") return { ...HOME_NODE };
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TIMEZONE_LOCATIONS[tz]) {
      return { ...TIMEZONE_LOCATIONS[tz], tz };
    }
    const offsetHrs = -(new Date().getTimezoneOffset() / 60);
    const continent =
      offsetHrs <= -3 ? "Americas" : offsetHrs <= 3.5 ? "Europe / Africa" : offsetHrs >= 9.5 ? "Oceania" : "Asia";
    return {
      city: tz?.split("/").pop()?.replace(/_/g, " ") || "Remote Node",
      country: "LIVE",
      continent,
      lat: offsetHrs <= -3 ? 38 : offsetHrs <= 3 ? 48 : 22,
      lon: Math.max(-170, Math.min(170, offsetHrs * 15)),
      tz: tz || "UTC",
    };
  } catch {
    return { ...HOME_NODE, tz: "Asia/Kolkata" };
  }
}

const GEO_CACHE_KEY = "portfolio_visitor_geo_v1";

export async function resolveVisitorGeo() {
  const fallback = getTimezoneFallbackGeo();
  if (typeof window === "undefined") return fallback;

  try {
    const cached = window.sessionStorage?.getItem(GEO_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && Number.isFinite(parsed.lat) && Number.isFinite(parsed.lon)) {
        return parsed;
      }
    }
  } catch {
    // Ignore storage issues
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2400);
    const res = await fetch("https://get.geojs.io/v1/ip/geo.json", {
      signal: controller.signal,
      credentials: "omit",
    });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const lat = Number(data?.latitude);
      const lon = Number(data?.longitude);
      if (Number.isFinite(lat) && Number.isFinite(lon)) {
        const resolved = {
          city: data.city || fallback.city,
          country: data.country_code || fallback.country,
          continent: data.region || fallback.continent,
          lat,
          lon,
          tz: data.timezone || fallback.tz,
        };
        try {
          window.sessionStorage?.setItem(GEO_CACHE_KEY, JSON.stringify(resolved));
        } catch {
          // Ignore storage issues
        }
        return resolved;
      }
    }
  } catch {
    // Silent fallback to deterministic timezone geo
  }

  return fallback;
}

const listeners = new Set();
let controllerPromise = null;

function notifyAll(snapshot) {
  listeners.forEach((cb) => {
    try {
      cb(snapshot);
    } catch {
      // Isolate listener errors
    }
  });
}

const relayState = {
  ready: false,
  connected: false,
  selfGeo: getTimezoneFallbackGeo(),
  selfStatus: "browsing",
  lockProgress: 0,
  frequencyLabel: "OPEN",
  peers: [],
  recentSignals: [],
  activeBeams: [],
  totalSignals: 0,
  continentsCount: 1,
  channel: null,
  statusTimer: null,
};

function pushBeam({ id, from, kind = "ping" }) {
  const beamId = id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const rawLat = Number.isFinite(from?.lat) ? from.lat : relayState.selfGeo.lat;
  const rawLon = Number.isFinite(from?.lon) ? from.lon : relayState.selfGeo.lon;
  const distanceKm = haversineKm(rawLat, rawLon, HOME_NODE.lat, HOME_NODE.lon);
  const isLocalBounce = distanceKm < 55;

  // Deterministic angle stagger so simultaneous local visitors fan cleanly around Mumbai
  let safeLat = rawLat;
  let safeLon = rawLon;
  if (Math.hypot(rawLat - HOME_NODE.lat, rawLon - HOME_NODE.lon) < 0.35) {
    let hash = 0;
    for (let i = 0; i < beamId.length; i++) {
      hash = (hash * 31 + beamId.charCodeAt(i)) | 0;
    }
    const angle = ((Math.abs(hash) % 360) * Math.PI) / 180;
    safeLat = HOME_NODE.lat + Math.sin(angle) * 0.36;
    safeLon = HOME_NODE.lon + Math.cos(angle) * 0.38;
  }

  const safeFrom = {
    city: from?.city || relayState.selfGeo.city,
    country: from?.country || relayState.selfGeo.country,
    continent: from?.continent || relayState.selfGeo.continent,
    lat: safeLat,
    lon: safeLon,
  };

  // For ultra-local same-city pings (<55 km), bounce upward via overhead LEO Recon SAT-04
  const satRelay = isLocalBounce
    ? {
        code: "SAT-04",
        lat: (safeLat + HOME_NODE.lat) * 0.5 + 1.8,
        lon: (safeLon + HOME_NODE.lon) * 0.5 - 3.2,
        altOffset: 0.56,
      }
    : null;

  const beam = {
    id: beamId,
    from: safeFrom,
    to: HOME_NODE,
    kind,
    distanceKm,
    isLocalBounce,
    satRelay,
    startedAt: performance.now(),
    createdAt: new Date().toISOString(),
  };

  relayState.activeBeams = [...relayState.activeBeams.slice(-6), beam];
  relayState.recentSignals = [
    {
      id: beamId,
      city: safeFrom.city,
      country: safeFrom.country,
      continent: safeFrom.continent,
      lat: rawLat,
      lon: rawLon,
      kind,
      created_at: beam.createdAt,
    },
    ...relayState.recentSignals.filter((s) => s.id !== beamId),
  ].slice(0, 40);
  relayState.totalSignals = Math.max(relayState.totalSignals + 1, relayState.recentSignals.length);

  emitSnapshot();

  setTimeout(() => {
    relayState.activeBeams = relayState.activeBeams.filter((b) => b.id !== beamId);
    emitSnapshot();
  }, 5200);

  return beam;
}

function getSnapshot() {
  return {
    ready: relayState.ready,
    connected: relayState.connected,
    selfGeo: relayState.selfGeo,
    selfStatus: relayState.selfStatus,
    lockProgress: relayState.lockProgress,
    frequencyLabel: relayState.frequencyLabel,
    peers: relayState.peers,
    recentSignals: relayState.recentSignals,
    activeBeams: relayState.activeBeams,
    totalSignals: relayState.totalSignals,
    continentsCount: relayState.continentsCount,
  };
}

function emitSnapshot() {
  notifyAll(getSnapshot());
}

async function initRelay() {
  const geo = await resolveVisitorGeo();
  relayState.selfGeo = geo;
  relayState.ready = true;
  emitSnapshot();

  if (!spiritsEnabled || typeof window === "undefined") return;

  try {
    const client = await authenticatedClient();
    const { data: sessionData } = await client.auth.getSession();
    const peerKey = sessionData?.session?.user?.id || `anon-${Math.random().toString(36).slice(2, 9)}`;

    // Load recent cross-continent persistent signals cleanly (non-blocking if migration not pushed yet)
    client
      .rpc("earth_relay", { action: "list", payload: {} })
      .then(({ data, error }) => {
        if (error || !data) return;
        const rows = Array.isArray(data.signals) ? data.signals : [];
        relayState.recentSignals = rows;
        relayState.totalSignals = Math.max(Number(data.total) || rows.length, rows.length);
        relayState.continentsCount = Math.max(Number(data.continents) || 1, 1);
        emitSnapshot();
      })
      .catch(() => {});

    const channel = client.channel("global-earth-relay", {
      config: {
        presence: { key: peerKey },
        broadcast: { self: false },
      },
    });

    channel
      .on("presence", { event: "sync" }, () => {
        const stateMap = channel.presenceState();
        const flatPeers = [];
        Object.entries(stateMap).forEach(([key, metas]) => {
          const latest = Array.isArray(metas) ? metas[metas.length - 1] : null;
          if (latest && Number.isFinite(latest.lat) && Number.isFinite(latest.lon)) {
            flatPeers.push({ key, ...latest });
          }
        });
        relayState.peers = flatPeers;
        const continents = new Set(flatPeers.map((p) => p.continent).filter(Boolean));
        if (continents.size > relayState.continentsCount) {
          relayState.continentsCount = continents.size;
        }
        emitSnapshot();
      })
      .on("broadcast", { event: "signal_launch" }, ({ payload }) => {
        if (!payload?.from) return;
        pushBeam({
          id: payload.id,
          from: payload.from,
          kind: payload.kind || "ping",
        });
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          relayState.connected = true;
          try {
            await channel.track({
              ...relayState.selfGeo,
              status: relayState.selfStatus,
              joinedAt: Date.now(),
            });
          } catch {
            // Ignore presence track failures
          }
          emitSnapshot();
        }
      });

    relayState.channel = channel;
  } catch {
    // Graceful local mode when Supabase Realtime is unavailable
  }
}

export function subscribeEarthRelay(cb) {
  listeners.add(cb);
  cb(getSnapshot());
  controllerPromise ??= initRelay();
  return () => {
    listeners.delete(cb);
  };
}

export function setEarthLockTelemetry(progress = 0, frequencyLabel = "OPEN") {
  const clamped = Math.max(0, Math.min(1, Number(progress) || 0));
  if (
    Math.abs(relayState.lockProgress - clamped) < 0.01 &&
    relayState.frequencyLabel === frequencyLabel
  ) {
    return;
  }
  relayState.lockProgress = clamped;
  relayState.frequencyLabel = frequencyLabel;
  emitSnapshot();
}

export async function setEarthVisitorStatus(status = "browsing") {
  relayState.selfStatus = status;
  if (relayState.statusTimer) {
    clearTimeout(relayState.statusTimer);
    relayState.statusTimer = null;
  }
  if (status === "composing") {
    relayState.statusTimer = setTimeout(() => {
      setEarthVisitorStatus("browsing");
    }, 3500);
  }
  if (relayState.channel && relayState.connected) {
    try {
      await relayState.channel.track({
        ...relayState.selfGeo,
        status,
        joinedAt: Date.now(),
      });
    } catch {
      // Ignore track errors
    }
  }
  emitSnapshot();
}

export async function launchGlobalEarthSignal(kind = "ping") {
  controllerPromise ??= initRelay();
  const geo = relayState.selfGeo;
  const beamId = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const beam = pushBeam({ id: beamId, from: geo, kind });

  if (relayState.channel && relayState.connected) {
    relayState.channel
      .send({
        type: "broadcast",
        event: "signal_launch",
        payload: {
          id: beamId,
          from: geo,
          kind,
        },
      })
      .catch(() => {});
  }

  if (spiritsEnabled) {
    authenticatedClient()
      .then((client) =>
        client.rpc("earth_relay", {
          action: "send",
          payload: {
            city: geo.city,
            country: geo.country,
            continent: geo.continent,
            lat: geo.lat,
            lon: geo.lon,
            kind,
          },
        })
      )
      .catch(() => {});
  }

  return beam;
}
