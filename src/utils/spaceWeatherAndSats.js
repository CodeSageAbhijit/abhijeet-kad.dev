import * as THREE from "three";
import { latLonToVec3 } from "./earthRelay";

const NOAA_AURORA_URL = "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json";
const NOAA_SOLAR_WIND_URL = "https://services.swpc.noaa.gov/products/solar-wind/plasma-2-hour.json";
const NOAA_XRAY_FLARES_URL = "https://services.swpc.noaa.gov/json/goes/primary/xray-flares-latest.json";
const isDev = typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);
export const SDO_193_IMAGE_URL = isDev ? "/sdo/latest_512_0193.jpg" : "/api/sdo";
export const SDO_193_FALLBACK_URL = isDev ? "/sdo/latest_256_0193.jpg" : "/api/sdo";
const TLE_API_BASE = "https://tle.ivanstanojevic.me/api/tle";

export const ORBITAL_CATALOG = [
  {
    id: "tiangong",
    noradId: "48274",
    name: "Tiangong (CSS)",
    shortTag: "CSS",
    color: "#f472b6",
    inclinationDeg: 41.47,
    periodMin: 92.2,
    altitudeKm: 390,
    velocityKmh: 27640,
    phaseOffsetRad: 1.15,
    raanOffsetRad: 0.8,
  },
  {
    id: "hubble",
    noradId: "20580",
    name: "Hubble Telescope",
    shortTag: "HST",
    color: "#38bdf8",
    inclinationDeg: 28.47,
    periodMin: 95.4,
    altitudeKm: 535,
    velocityKmh: 27300,
    phaseOffsetRad: 2.9,
    raanOffsetRad: 2.25,
  },
  {
    id: "noaa20",
    noradId: "43013",
    name: "NOAA-20 Weather",
    shortTag: "NOAA-20",
    color: "#4ade80",
    inclinationDeg: 98.74,
    periodMin: 101.4,
    altitudeKm: 824,
    velocityKmh: 26780,
    phaseOffsetRad: 4.35,
    raanOffsetRad: 3.7,
  },
];

/**
 * Compute real-time subsolar latitude & longitude (where the Sun is directly overhead)
 * from UTC time so the 3D globe displays an accurate Day/Night Terminator.
 */
export function getSubsolarLatLon(date = new Date()) {
  const startOfYear = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0);
  const dayOfYear = (date.getTime() - startOfYear) / 86400000 + 1;
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Approximate solar declination in degrees (-23.44 to +23.44)
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);
  const declRad =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma);
  const lat = (declRad * 180) / Math.PI;

  // Subsolar longitude: 0° at 12:00 UTC, moving 15° westward per hour
  let lon = (12 - utcHours) * 15;
  while (lon > 180) lon -= 360;
  while (lon < -180) lon += 360;

  return { lat, lon };
}

export function getSubsolarDirection(date = new Date()) {
  const { lat, lon } = getSubsolarLatLon(date);
  return latLonToVec3(lat, lon, 1).normalize();
}

/**
 * Deterministic real-time Keplerian propagation for orbital satellites.
 * Accepts optional live mean motion / inclination parsed from TLE.
 */
export function sampleSatelliteState(sat, nowMs = Date.now()) {
  const nowSec = nowMs / 1000;
  const incRad = ((sat.liveInclinationDeg ?? sat.inclinationDeg) * Math.PI) / 180;
  const periodSec = (sat.livePeriodMin ?? sat.periodMin) * 60;
  const omega = (2 * Math.PI) / periodSec;
  const phase = (nowSec * omega + sat.phaseOffsetRad) % (Math.PI * 2);
  // Earth rotation rate ~ 7.292115e-5 rad/s westward relative to inertial plane
  const ascNode = (sat.raanOffsetRad - nowSec * 0.00007292115) % (Math.PI * 2);

  const latRad = Math.asin(Math.sin(incRad) * Math.sin(phase));
  const lonOffset = Math.atan2(Math.cos(incRad) * Math.sin(phase), Math.cos(phase));
  let lon = (((lonOffset + ascNode) * 180) / Math.PI) % 360;
  if (lon > 180) lon -= 360;
  if (lon < -180) lon += 360;

  const lat = (latRad * 180) / Math.PI;
  const altitudeKm = sat.altitudeKm;
  const orbitRadius = 1.98 + THREE.MathUtils.clamp(altitudeKm / 2600, 0.16, 0.42);
  const position = latLonToVec3(lat, lon, orbitRadius);

  return {
    id: sat.id,
    name: sat.name,
    shortTag: sat.shortTag,
    color: sat.color,
    lat,
    lon,
    altitudeKm,
    velocityKmh: sat.velocityKmh,
    inclinationDeg: sat.liveInclinationDeg ?? sat.inclinationDeg,
    orbitRadius,
    position,
    normal: position.clone().normalize(),
    liveTle: Boolean(sat.liveTle),
  };
}

export function buildSatelliteOrbitRing(sat, radius, segments = 96) {
  const incRad = ((sat.liveInclinationDeg ?? sat.inclinationDeg) * Math.PI) / 180;
  const nowSec = Date.now() / 1000;
  const ascNode = (sat.raanOffsetRad - nowSec * 0.00007292115) % (Math.PI * 2);
  const pts = [];
  for (let i = 0; i <= segments; i += 1) {
    const phase = (i / segments) * Math.PI * 2;
    const latRad = Math.asin(Math.sin(incRad) * Math.sin(phase));
    const lonOffset = Math.atan2(Math.cos(incRad) * Math.sin(phase), Math.cos(phase));
    let lon = (((lonOffset + ascNode) * 180) / Math.PI) % 360;
    if (lon > 180) lon -= 360;
    if (lon < -180) lon += 360;
    pts.push(latLonToVec3((latRad * 180) / Math.PI, lon, radius));
  }
  return pts;
}

/**
 * Fetch optional live TLE orbital inclination & period from public TLE API
 * (falls back silently to catalog values if offline/rate-limited).
 */
export async function fetchLiveOrbitalCatalog() {
  const updated = await Promise.all(
    ORBITAL_CATALOG.map(async (sat) => {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 3200);
        const res = await fetch(`${TLE_API_BASE}/${sat.noradId}`, {
          signal: controller.signal,
          credentials: "omit",
        });
        clearTimeout(timer);
        if (!res.ok) return sat;
        const data = await res.json();
        const line2 = data?.line2;
        if (!line2 || line2.length < 63) return sat;
        const inc = parseFloat(line2.slice(8, 16).trim());
        const revPerDay = parseFloat(line2.slice(52, 63).trim());
        if (!Number.isFinite(inc) || !Number.isFinite(revPerDay) || revPerDay <= 0) {
          return sat;
        }
        return {
          ...sat,
          liveInclinationDeg: inc,
          livePeriodMin: 1440 / revPerDay,
          liveTle: true,
        };
      } catch {
        return sat;
      }
    })
  );
  return updated;
}

/**
 * Build procedural fallback aurora oval around North & South geomagnetic latitudes (~67°N/S)
 */
export function buildFallbackAuroraBuffers(radius = 2.025) {
  const positions = [];
  const colors = [];
  const cGreen = new THREE.Color("#4ade80");
  const cCyan = new THREE.Color("#22d3ee");
  const cViolet = new THREE.Color("#a855f7");

  for (const hemi of [1, -1]) {
    for (let lon = -180; lon < 180; lon += 4) {
      for (let band = -1; band <= 1; band += 1) {
        const wave = Math.sin((lon * Math.PI) / 90) * 2.2;
        const lat = hemi * (67.5 + band * 2.3 + wave);
        const p = latLonToVec3(lat, lon, radius + (band === 0 ? 0.008 : 0));
        positions.push(p.x, p.y, p.z);
        const col = band === 0 ? cGreen : band > 0 ? cViolet : cCyan;
        colors.push(col.r, col.g, col.b);
      }
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    live: false,
    pointCount: positions.length / 3,
  };
}

/**
 * Fetch real-time NOAA SWPC OVATION Aurora forecast JSON and convert
 * active auroral oval cells into 3D point cloud buffers.
 */
export async function fetchLiveAuroraBuffers(radius = 2.025) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const res = await fetch(NOAA_AURORA_URL, {
      signal: controller.signal,
      credentials: "omit",
    });
    clearTimeout(timer);
    if (!res.ok) return buildFallbackAuroraBuffers(radius);

    const data = await res.json();
    const coords = data?.coordinates;
    if (!Array.isArray(coords) || coords.length === 0) {
      return buildFallbackAuroraBuffers(radius);
    }

    const positions = [];
    const colors = [];
    const cLow = new THREE.Color("#22d3ee");
    const cMid = new THREE.Color("#4ade80");
    const cHigh = new THREE.Color("#c084fc");
    const tmp = new THREE.Color();

    // Subsample step=2 for crisp ~60fps point count while keeping full oval fidelity
    for (let i = 0; i < coords.length; i += 2) {
      const row = coords[i];
      if (!Array.isArray(row) || row.length < 3) continue;
      const lonRaw = Number(row[0]); // 0..359
      const lat = Number(row[1]); // -90..90
      const intensity = Number(row[2]); // 0..100
      if (!Number.isFinite(intensity) || intensity < 12) continue;

      const lon = lonRaw > 180 ? lonRaw - 360 : lonRaw;
      const p = latLonToVec3(lat, lon, radius + Math.min(0.025, intensity * 0.00025));
      positions.push(p.x, p.y, p.z);

      const t = THREE.MathUtils.clamp((intensity - 12) / 55, 0, 1);
      if (t < 0.55) {
        tmp.copy(cLow).lerp(cMid, t / 0.55);
      } else {
        tmp.copy(cMid).lerp(cHigh, (t - 0.55) / 0.45);
      }
      colors.push(tmp.r, tmp.g, tmp.b);
    }

    if (positions.length < 90) {
      return buildFallbackAuroraBuffers(radius);
    }

    return {
      positions: new Float32Array(positions),
      colors: new Float32Array(colors),
      live: true,
      observationTime: data["Observation Time"] || null,
      pointCount: positions.length / 3,
    };
  } catch {
    return buildFallbackAuroraBuffers(radius);
  }
}

/**
 * Fetch real-time NOAA SWPC Solar Wind speed (km/s) and GOES X-ray Flare Class.
 */
export async function fetchLiveSolarTelemetry() {
  const result = {
    flareClass: "C1.2",
    solarWindKms: 410,
    sdoUrl: `${SDO_193_IMAGE_URL}?t=${Math.floor(Date.now() / 300000)}`,
    live: false,
  };

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3800);
    const [windRes, flareRes] = await Promise.allSettled([
      fetch(NOAA_SOLAR_WIND_URL, { signal: controller.signal, credentials: "omit" }),
      fetch(NOAA_XRAY_FLARES_URL, { signal: controller.signal, credentials: "omit" }),
    ]);
    clearTimeout(timer);

    if (windRes.status === "fulfilled" && windRes.value.ok) {
      const rows = await windRes.value.json();
      if (Array.isArray(rows) && rows.length > 1) {
        for (let i = rows.length - 1; i >= 1; i -= 1) {
          const speed = Number(rows[i]?.[2]);
          if (Number.isFinite(speed) && speed > 100 && speed < 3000) {
            result.solarWindKms = Math.round(speed);
            result.live = true;
            break;
          }
        }
      }
    }

    if (flareRes.status === "fulfilled" && flareRes.value.ok) {
      const flares = await flareRes.value.json();
      const latest = Array.isArray(flares) ? flares[0] : flares;
      const cls = latest?.current_class || latest?.max_class;
      if (typeof cls === "string" && cls.trim()) {
        result.flareClass = cls.trim().toUpperCase();
        result.live = true;
      }
    }
  } catch {
    // Keep deterministic fallback values if NOAA is unreachable
  }

  return result;
}
