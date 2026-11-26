import * as THREE from "three";
import { latLonToVec3 } from "./earthRelay";

const ISS_NOW_URL = "https://api.wheretheiss.at/v1/satellites/25544";
const ISS_POSITIONS_URL = "https://api.wheretheiss.at/v1/satellites/25544/positions";

const POLL_INTERVAL_MS = 8000;
const ORBIT_REFRESH_MS = 240000;
const INCLINATION_RAD = (51.64 * Math.PI) / 180;
const MEAN_ANGULAR_RAD_PER_SEC = (2 * Math.PI) / (92.9 * 60);

const listeners = new Set();
let pollTimer = null;
let orbitTimer = null;
let started = false;

function buildFallbackFix(nowSec = Date.now() / 1000) {
  const phase = (nowSec * MEAN_ANGULAR_RAD_PER_SEC) % (Math.PI * 2);
  const ascNode = -(nowSec * 0.00007292115) % (Math.PI * 2);
  const latRad = Math.asin(Math.sin(INCLINATION_RAD) * Math.sin(phase));
  const lonOffset = Math.atan2(Math.cos(INCLINATION_RAD) * Math.sin(phase), Math.cos(phase));
  let lonDeg = (((lonOffset + ascNode) * 180) / Math.PI) % 360;
  if (lonDeg > 180) lonDeg -= 360;
  if (lonDeg < -180) lonDeg += 360;

  return {
    lat: (latRad * 180) / Math.PI,
    lon: lonDeg,
    altitude: 420,
    velocity: 27580,
    visibility: "daylight",
    footprint: 4440,
    timestamp: Math.round(nowSec),
    fetchedPerfMs: typeof performance !== "undefined" ? performance.now() : 0,
    live: false,
  };
}

function buildFallbackOrbit(nowSec = Date.now() / 1000) {
  const pts = [];
  for (let m = -25; m <= 65; m += 5) {
    pts.push(buildFallbackFix(nowSec + m * 60));
  }
  return pts;
}

const issState = {
  live: false,
  curr: buildFallbackFix(),
  nextRef: buildFallbackFix(Date.now() / 1000 + 60),
  orbitPoints: buildFallbackOrbit(),
  lastOrbitFetchMs: 0,
};

function notifyAll() {
  const snapshot = getIssSnapshot();
  listeners.forEach((cb) => {
    try {
      cb(snapshot);
    } catch {
      // Isolate listener errors
    }
  });
}

function getIssSnapshot() {
  return {
    live: issState.live,
    curr: issState.curr,
    nextRef: issState.nextRef,
    orbitPoints: issState.orbitPoints,
  };
}

function sanitizeTelemetryRow(row, perfNow) {
  const lat = Number(row?.latitude);
  const lon = Number(row?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    lat,
    lon,
    altitude: Number(row?.altitude) || 420,
    velocity: Number(row?.velocity) || 27580,
    visibility: row?.visibility || "daylight",
    footprint: Number(row?.footprint) || 4440,
    timestamp: Number(row?.timestamp) || Math.round(Date.now() / 1000),
    fetchedPerfMs: perfNow,
    live: true,
  };
}

async function fetchLiveIssTelemetry() {
  if (typeof window === "undefined") return;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(ISS_NOW_URL, {
      signal: controller.signal,
      credentials: "omit",
    });
    clearTimeout(timer);
    if (!res.ok) return;

    const data = await res.json();
    const fix = sanitizeTelemetryRow(data, performance.now());
    if (!fix) return;

    // Fetch 90-minute orbital trajectory centered around live telemetry epoch every 4 min
    const nowPerf = performance.now();
    if (
      issState.lastOrbitFetchMs === 0 ||
      nowPerf - issState.lastOrbitFetchMs > ORBIT_REFRESH_MS
    ) {
      issState.lastOrbitFetchMs = nowPerf;
      fetchOrbitTrack(fix.timestamp).catch(() => {});
    }

    // Pick a nearby future orbital sample (<22 min ahead) so shortest great-circle crossVectors never reverses
    const futureSample = issState.orbitPoints.find(
      (pt) => pt.live && pt.timestamp > fix.timestamp + 30 && pt.timestamp < fix.timestamp + 1320
    );
    if (futureSample) {
      issState.nextRef = futureSample;
    } else if (issState.curr.live && fix.timestamp > issState.curr.timestamp) {
      // Infer forward tangent from previous -> current if positions call hasn't landed yet
      const pPrev = latLonToVec3(issState.curr.lat, issState.curr.lon, 1).normalize();
      const pCurr = latLonToVec3(fix.lat, fix.lon, 1).normalize();
      const axis = new THREE.Vector3().crossVectors(pPrev, pCurr);
      if (axis.lengthSq() > 1e-10) {
        axis.normalize();
        const pAhead = pCurr.clone().applyAxisAngle(axis, MEAN_ANGULAR_RAD_PER_SEC * 180);
        const phi = Math.acos(THREE.MathUtils.clamp(pAhead.y, -1, 1));
        const theta = Math.atan2(pAhead.z, -pAhead.x);
        let aheadLon = (theta * 180) / Math.PI - 180;
        if (aheadLon < -180) aheadLon += 360;
        if (aheadLon > 180) aheadLon -= 360;
        issState.nextRef = {
          ...fix,
          lat: 90 - (phi * 180) / Math.PI,
          lon: aheadLon,
          timestamp: fix.timestamp + 180,
        };
      }
    } else {
      // Fallback approximate eastward tangent until positions arrives
      issState.nextRef = {
        ...fix,
        lon: fix.lon + 6,
        timestamp: fix.timestamp + 90,
      };
    }

    issState.curr = fix;
    issState.live = true;
    notifyAll();
  } catch {
    // Retain existing / deterministic orbital model if API unreachable
  }
}

async function fetchOrbitTrack(baseEpochSec) {
  // Batch 10 real SGP4 samples (-24m to +66m every 10m = full orbital loop)
  const timestamps = [];
  for (let offsetMin = -24; offsetMin <= 66; offsetMin += 10) {
    timestamps.push(Math.round(baseEpochSec + offsetMin * 60));
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);
  const res = await fetch(`${ISS_POSITIONS_URL}?timestamps=${timestamps.join(",")}`, {
    signal: controller.signal,
    credentials: "omit",
  });
  clearTimeout(timer);
  if (!res.ok) return;

  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length < 3) return;

  const perfNow = performance.now();
  const cleaned = rows
    .map((r) => sanitizeTelemetryRow(r, perfNow))
    .filter(Boolean)
    .sort((a, b) => a.timestamp - b.timestamp);

  if (cleaned.length >= 3) {
    issState.orbitPoints = cleaned;
    const futureSample = cleaned.find(
      (pt) =>
        pt.timestamp > issState.curr.timestamp + 30 &&
        pt.timestamp < issState.curr.timestamp + 1320
    );
    if (futureSample) {
      issState.nextRef = futureSample;
    }
    notifyAll();
  }
}

function startTracker() {
  if (started || typeof window === "undefined") return;
  started = true;
  fetchLiveIssTelemetry();
  pollTimer = setInterval(fetchLiveIssTelemetry, POLL_INTERVAL_MS);
  orbitTimer = setInterval(() => {
    if (!issState.live) {
      const nowSec = Date.now() / 1000;
      issState.curr = buildFallbackFix(nowSec);
      issState.nextRef = buildFallbackFix(nowSec + 60);
      issState.orbitPoints = buildFallbackOrbit(nowSec);
      notifyAll();
    }
  }, 5000);
}

function stopTrackerIfUnused() {
  if (listeners.size > 0) return;
  started = false;
  if (pollTimer) clearInterval(pollTimer);
  if (orbitTimer) clearInterval(orbitTimer);
  pollTimer = null;
  orbitTimer = null;
}

export function subscribeIssTelemetry(cb) {
  listeners.add(cb);
  cb(getIssSnapshot());
  startTracker();
  return () => {
    listeners.delete(cb);
    stopTrackerIfUnused();
  };
}

/**
 * Computes smoothly interpolated unit normal & LVLH forward tangent between 8s telemetry polls
 * so the 3D ISS glides seamlessly along its real orbital velocity vector at 60fps.
 */
export function sampleIssMotion(snapshot, perfNow) {
  const curr = snapshot?.curr || issState.curr;
  const next = snapshot?.nextRef || issState.nextRef;

  const pCurr = latLonToVec3(curr.lat, curr.lon, 1).normalize();
  const pNext = latLonToVec3(next.lat, next.lon, 1).normalize();

  const elapsedSec = THREE.MathUtils.clamp((perfNow - curr.fetchedPerfMs) / 1000, 0, 24);
  const dtRef = Math.max(1, next.timestamp - curr.timestamp);

  const axis = new THREE.Vector3().crossVectors(pCurr, pNext);
  let omega = MEAN_ANGULAR_RAD_PER_SEC;
  if (axis.lengthSq() > 1e-10) {
    axis.normalize();
    const angle = pCurr.angleTo(pNext);
    if (angle > 0.0005 && dtRef > 5) {
      omega = THREE.MathUtils.clamp(angle / dtRef, 0.0006, 0.0025);
    }
  } else {
    axis.set(0, 1, 0);
  }

  const normal = pCurr.clone().applyAxisAngle(axis, omega * elapsedSec).normalize();
  const forward = new THREE.Vector3().crossVectors(axis, normal).normalize();

  // Back-project current spherical direction into display lat/lon for real-time readout
  const lat = 90 - Math.acos(THREE.MathUtils.clamp(normal.y, -1, 1)) * (180 / Math.PI);
  const theta = Math.atan2(normal.z, -normal.x);
  let lon = (theta * 180) / Math.PI - 180;
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;

  return {
    normal,
    forward,
    lat,
    lon,
    altitude: curr.altitude,
    velocity: curr.velocity,
    visibility: curr.visibility,
    live: Boolean(snapshot?.live),
  };
}
