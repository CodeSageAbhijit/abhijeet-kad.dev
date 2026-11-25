import mixpanel from "mixpanel-browser";

const NOTRACK_KEY = "portfolio_notrack";
const VISITED_KEY = "portfolio_has_visited";
const RETRO_ENTRY_KEY = "portfolio_retro_entry_point";
const MAX_CLIENT_ERRORS = 5;
const MAX_SECTION_SECONDS = 300;
const MIN_SECTION_SECONDS = 2;

const state = {
  initialized: false,
  initScheduled: false,
  mixpanelReady: false,
  disabled: false,
  debug: false,
  queue: [],
  onceKeys: new Set(),
  sectionsViewedList: [],
  maxScrollPct: 0,
  visitedRetro: false,
  gamesPlayedCount: 0,
  eggsFoundCount: 0,
  outboundClicksCount: 0,
  clientErrorCount: 0,
  playCountByGame: {},
  activeGame: null, // { game, elapsedMs, startedVisibleAt }
  inRetro: false,
  retroElapsedMs: 0,
  retroVisibleAt: null,
  sessionElapsedMs: 0,
  sessionVisibleAt: typeof document !== "undefined" && !document.hidden ? performance.now() : null,
  activeSectionFlusher: null,
  exitFlushed: false,
  listenersAttached: false,
};

function safeStorageGet(storage, key) {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function safeStorageSet(storage, key, value) {
  try {
    storage?.setItem(key, value);
  } catch {
    // Ignore storage errors (private mode, quota, etc.)
  }
}

function safeStorageRemove(storage, key) {
  try {
    storage?.removeItem(key);
  } catch {
    // Ignore storage errors
  }
}

function isLocalhostHost() {
  if (typeof window === "undefined") return true;
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/i.test(window.location.hostname || "");
}

function checkNoTrackFlag() {
  if (typeof window === "undefined") return true;
  try {
    const params = new URLSearchParams(window.location.search);
    const param = params.get("notrack");
    if (param === "1") {
      safeStorageSet(window.localStorage, NOTRACK_KEY, "1");
      return true;
    }
    if (param === "0") {
      safeStorageRemove(window.localStorage, NOTRACK_KEY);
      return false;
    }
  } catch {
    // Ignore URL parse errors
  }
  return safeStorageGet(window.localStorage, NOTRACK_KEY) === "1";
}

function isDntEnabled() {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  return navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.msDoNotTrack === "1";
}

function getDeviceType() {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth || 1280;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function getReferrerSource(params) {
  const refParam = params.get("ref") || params.get("utm_source");
  if (refParam && refParam.trim()) {
    return refParam.trim().toLowerCase().slice(0, 64);
  }
  if (typeof document !== "undefined" && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./i, "");
      if (host && host !== window.location.hostname) {
        return host.toLowerCase().slice(0, 100);
      }
    } catch {
      // Ignore malformed referrer
    }
  }
  return "direct";
}

export function getSuperProperties() {
  if (typeof window === "undefined") return {};
  let params;
  try {
    params = new URLSearchParams(window.location.search);
  } catch {
    params = new URLSearchParams();
  }

  const returning = safeStorageGet(window.localStorage, VISITED_KEY) === "1";
  safeStorageSet(window.localStorage, VISITED_KEY, "1");

  const props = {
    referrer_source: getReferrerSource(params),
    device_type: getDeviceType(),
    viewport_width: window.innerWidth || 0,
    is_returning_visitor: returning,
  };

  const utmCampaign = params.get("utm_campaign")?.trim();
  const utmMedium = params.get("utm_medium")?.trim();
  if (utmCampaign) props.utm_campaign = utmCampaign.slice(0, 100);
  if (utmMedium) props.utm_medium = utmMedium.slice(0, 100);

  return props;
}

function debugLog(...args) {
  if (!state.debug) return;
  try {
    console.info("[Analytics]", ...args);
  } catch {
    // Ignore console errors
  }
}

function getActiveToken() {
  const prodToken = (import.meta.env.VITE_MIXPANEL_TOKEN || "").trim();
  const devToken = (import.meta.env.VITE_MIXPANEL_DEV_TOKEN || "").trim();
  const isDev = Boolean(import.meta.env.DEV) || isLocalhostHost();
  if (isDev) {
    return devToken || "";
  }
  return prodToken;
}

function performInit() {
  if (state.mixpanelReady || state.disabled) return;
  const token = getActiveToken();
  if (!token) {
    // No token (e.g. localhost without dev token, or placeholder env) -> keep local debug working
    drainQueueToConsoleOnly();
    return;
  }

  try {
    const rawHost = (import.meta.env.VITE_MIXPANEL_API_HOST || "").trim();
    const useFirstPartyProxy =
      !rawHost || rawHost === "https://api-eu.mixpanel.com" || rawHost.startsWith("/");
    const proxyPath = rawHost.startsWith("/") ? rawHost.replace(/\/+$/, "") : "/pulse";

    const config = {
      track_pageview: "url-with-path",
      persistence: "localStorage",
      autocapture: false,
      record_sessions_percent: 0,
      ignore_dnt: false,
      debug: false,
    };

    if (useFirstPartyProxy) {
      config.api_host = `${window.location.origin}${proxyPath}`;
      config.api_payload_format = "json";
      config.api_routes = {
        track: "ev/",
        engage: "engage/",
        groups: "groups/",
        record: "record/",
        flags: "flags/",
        settings: "settings/",
      };
    } else {
      config.api_host = rawHost;
    }

    mixpanel.init(token, config);
    mixpanel.register(getSuperProperties());
    state.mixpanelReady = true;

    const pending = state.queue.splice(0, state.queue.length);
    for (const item of pending) {
      if (item.type === "time") {
        mixpanel.time_event(item.event);
      } else if (item.type === "track") {
        mixpanel.track(item.event, item.props, item.options);
      }
    }
  } catch {
    // Silently fail if Mixpanel fails to initialize
  }
}

function drainQueueToConsoleOnly() {
  state.queue.splice(0, state.queue.length);
}

function flushActiveTimersBeforePause(now) {
  if (state.sessionVisibleAt !== null) {
    state.sessionElapsedMs += Math.max(0, now - state.sessionVisibleAt);
    state.sessionVisibleAt = null;
  }
  if (state.inRetro && state.retroVisibleAt !== null) {
    state.retroElapsedMs += Math.max(0, now - state.retroVisibleAt);
    state.retroVisibleAt = null;
  }
  if (state.activeGame && state.activeGame.startedVisibleAt !== null) {
    state.activeGame.elapsedMs += Math.max(0, now - state.activeGame.startedVisibleAt);
    state.activeGame.startedVisibleAt = null;
  }
}

function resumeActiveTimers(now) {
  if (state.sessionVisibleAt === null) {
    state.sessionVisibleAt = now;
  }
  if (state.inRetro && state.retroVisibleAt === null) {
    state.retroVisibleAt = now;
  }
  if (state.activeGame && state.activeGame.startedVisibleAt === null) {
    state.activeGame.startedVisibleAt = now;
  }
}

function getSessionSeconds() {
  const now = performance.now();
  const runningMs =
    state.sessionVisibleAt !== null ? Math.max(0, now - state.sessionVisibleAt) : 0;
  return Math.max(0, Math.round((state.sessionElapsedMs + runningMs) / 1000));
}

function flushSessionExit() {
  if (state.exitFlushed || state.disabled) return;
  state.exitFlushed = true;

  const now = performance.now();
  flushActiveTimersBeforePause(now);

  // 1. Flush any active portfolio section visibility time
  try {
    state.activeSectionFlusher?.({ transport: "sendBeacon" });
  } catch {
    // Ignore flusher errors
  }

  // 2. Abandon active game if closed mid-play
  if (state.activeGame) {
    finishGame(state.activeGame.game, "abandoned", undefined, { transport: "sendBeacon" });
  }

  // 3. Flush Retro section exit if user leaves directly from retro
  if (state.inRetro) {
    exitRetroSection({ transport: "sendBeacon" });
  }

  // 4. Send one compact Session Summary event
  track(
    "Session Summary",
    {
      sections_viewed_count: state.sectionsViewedList.length,
      sections_viewed_list: [...state.sectionsViewedList],
      max_scroll_pct: state.maxScrollPct,
      total_seconds: getSessionSeconds(),
      visited_retro: state.visitedRetro,
      games_played_count: state.gamesPlayedCount,
      eggs_found_count: state.eggsFoundCount,
      outbound_clicks_count: state.outboundClicksCount,
    },
    { transport: "sendBeacon" }
  );

  // Ensure any queued events flush synchronously if token is configured
  if (!state.mixpanelReady && getActiveToken()) {
    performInit();
  }
}

function attachGlobalListeners() {
  if (state.listenersAttached || typeof window === "undefined") return;
  state.listenersAttached = true;

  document.addEventListener("visibilitychange", () => {
    if (state.disabled) return;
    const now = performance.now();
    if (document.hidden) {
      flushActiveTimersBeforePause(now);
    } else {
      resumeActiveTimers(now);
    }
  });

  window.addEventListener("pagehide", () => {
    flushSessionExit();
  });

  window.addEventListener("pageshow", () => {
    if (state.exitFlushed) {
      state.exitFlushed = false;
      resumeActiveTimers(performance.now());
    }
  });

  window.addEventListener("error", (event) => {
    if (state.disabled || state.clientErrorCount >= MAX_CLIENT_ERRORS) return;
    state.clientErrorCount += 1;
    const rawMsg = event?.message || event?.error?.message || "Unknown window error";
    const src = event?.filename
      ? `${event.filename.split("/").pop()}:${event.lineno || 0}`
      : "window";
    track("Client Error", {
      message: String(rawMsg).slice(0, 200),
      source: String(src).slice(0, 120),
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (state.disabled || state.clientErrorCount >= MAX_CLIENT_ERRORS) return;
    state.clientErrorCount += 1;
    const reason = event?.reason;
    const rawMsg =
      typeof reason === "string"
        ? reason
        : reason?.message || "Unhandled promise rejection";
    track("Client Error", {
      message: String(rawMsg).slice(0, 200),
      source: "unhandledrejection",
    });
  });
}

export function isAnalyticsDisabled() {
  return state.disabled;
}

export function initAnalytics() {
  if (typeof window === "undefined" || state.initialized) return;
  state.initialized = true;

  const isDev = Boolean(import.meta.env.DEV) || isLocalhostHost();
  state.debug = isDev;

  if (checkNoTrackFlag() || isDntEnabled()) {
    state.disabled = true;
    debugLog("Tracking disabled (notrack or Do-Not-Track active)");
    return;
  }

  attachGlobalListeners();

  const superProps = getSuperProperties();
  debugLog("Initialized", {
    mode: getActiveToken() ? "mixpanel" : isDev ? "dev-console-only" : "no-token",
    superProps,
  });

  if (state.initScheduled) return;
  state.initScheduled = true;

  // Defer Mixpanel network/SDK bootstrap until after first paint to protect 3D hero FPS
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(() => performInit(), { timeout: 1500 });
  } else {
    window.setTimeout(() => performInit(), 0);
  }
}

export function track(event, props = {}, options) {
  if (state.disabled || !event) return;
  try {
    const cleanProps = props && typeof props === "object" ? { ...props } : {};
    debugLog(event, cleanProps, options || "");

    const token = getActiveToken();
    if (!token) return;

    if (state.mixpanelReady) {
      mixpanel.track(event, cleanProps, options);
    } else {
      state.queue.push({ type: "track", event, props: cleanProps, options });
    }
  } catch {
    // Ignore tracking errors
  }
}

export function timeEvent(event) {
  if (state.disabled || !event) return;
  try {
    debugLog(`timeEvent("${event}")`);
    const token = getActiveToken();
    if (!token) return;

    if (state.mixpanelReady) {
      mixpanel.time_event(event);
    } else {
      state.queue.push({ type: "time", event });
    }
  } catch {
    // Ignore timing errors
  }
}

export function trackOnce(event, props = {}, key, options) {
  if (state.disabled || !event) return false;
  const dedupeKey = key || `${event}:${JSON.stringify(props || {})}`;
  if (state.onceKeys.has(dedupeKey)) return false;
  state.onceKeys.add(dedupeKey);
  track(event, props, options);
  return true;
}

// --- Portfolio Domain Helpers ---

export function registerSectionFlusher(flusher) {
  state.activeSectionFlusher = flusher;
}

export function recordSectionViewed(section, orderIndex, scrollDepthPct) {
  if (state.disabled || !section) return;
  const sent = trackOnce(
    "Section Viewed",
    {
      section,
      order_index: orderIndex,
      scroll_depth_pct: scrollDepthPct,
    },
    `section_viewed:${section}`
  );
  if (sent && !state.sectionsViewedList.includes(section)) {
    state.sectionsViewedList.push(section);
  }
}

export function recordSectionTimeSpent(section, rawSeconds, options) {
  if (state.disabled || !section) return;
  const rounded = Math.round(rawSeconds);
  if (rounded < MIN_SECTION_SECONDS) return;
  const seconds = Math.min(MAX_SECTION_SECONDS, rounded);
  track("Section Time Spent", { section, seconds }, options);
}

export function recordScrollDepth(pct) {
  if (state.disabled) return;
  state.maxScrollPct = Math.max(state.maxScrollPct, pct);
  trackOnce("Scroll Depth", { pct }, `scroll_depth:${pct}`);
}

export function recordOutboundClick(destination, url, placement) {
  if (state.disabled) return;
  state.outboundClicksCount += 1;
  track(
    "Outbound Link Clicked",
    { destination, url, placement },
    { transport: "sendBeacon" }
  );
  if (destination === "email") {
    track("Contact Initiated", { method: "mailto" }, { transport: "sendBeacon" });
  }
}

export function markEasterEggFound(eggName, trigger) {
  if (state.disabled || !eggName) return;
  const sent = trackOnce(
    "Easter Egg Found",
    { egg_name: eggName, trigger },
    `easter_egg:${eggName}`
  );
  if (sent) {
    state.eggsFoundCount += 1;
  }
}

export function trackHiddenFeature(featureName, extra = {}) {
  if (state.disabled || !featureName) return;
  trackOnce(
    "Hidden Feature Used",
    { feature_name: featureName, ...extra },
    `hidden_feature:${featureName}`
  );
}

// --- Retro & Game Lifecycle Helpers ---

export function setPendingRetroEntryPoint(entryPoint) {
  if (typeof window === "undefined") return;
  safeStorageSet(window.sessionStorage, RETRO_ENTRY_KEY, entryPoint);
}

export function consumeRetroEntryPoint(fallback = "direct_url") {
  if (typeof window === "undefined") return fallback;
  const stored = safeStorageGet(window.sessionStorage, RETRO_ENTRY_KEY);
  safeStorageRemove(window.sessionStorage, RETRO_ENTRY_KEY);
  return stored || fallback;
}

export function enterRetroSection(entryPoint = "direct_url") {
  if (state.disabled || state.inRetro) return;
  state.inRetro = true;
  state.visitedRetro = true;
  state.retroElapsedMs = 0;
  state.retroVisibleAt = !document.hidden ? performance.now() : null;

  track("Retro Section Entered", { entry_point: entryPoint });
  timeEvent("Retro Section Exited");
}

export function exitRetroSection({ destinationSection, transport } = {}) {
  if (state.disabled || !state.inRetro) return;
  const now = performance.now();
  const runningMs =
    state.retroVisibleAt !== null ? Math.max(0, now - state.retroVisibleAt) : 0;
  const secondsInSection = Math.max(0, Math.round((state.retroElapsedMs + runningMs) / 1000));

  state.inRetro = false;
  state.retroElapsedMs = 0;
  state.retroVisibleAt = null;

  track(
    "Retro Section Exited",
    { seconds_in_section: secondsInSection },
    transport ? { transport } : undefined
  );

  if (destinationSection) {
    track(
      "Retro Mode Exited To Main",
      { destination_section: destinationSection },
      transport ? { transport } : undefined
    );
  }
}

export function startGame(game) {
  if (state.disabled || !game) return;

  // Close out an existing unfinished game cleanly if another launches
  if (state.activeGame) {
    finishGame(state.activeGame.game, "quit");
  }

  const nextCount = (state.playCountByGame[game] || 0) + 1;
  state.playCountByGame[game] = nextCount;

  track("Game Started", { game });
  if (nextCount > 1) {
    track("Game Replayed", {
      game,
      play_count_this_session: nextCount,
    });
  }

  timeEvent("Game Played");
  state.activeGame = {
    game,
    elapsedMs: 0,
    startedVisibleAt: typeof document !== "undefined" && !document.hidden ? performance.now() : null,
  };
}

export function finishGame(game, result = "quit", score, options) {
  if (state.disabled || !game) return;
  if (!state.activeGame || state.activeGame.game !== game) return;

  const now = performance.now();
  const runningMs =
    state.activeGame.startedVisibleAt !== null
      ? Math.max(0, now - state.activeGame.startedVisibleAt)
      : 0;
  const activeSeconds = Math.max(0, Math.round((state.activeGame.elapsedMs + runningMs) / 1000));

  state.activeGame = null;
  state.gamesPlayedCount += 1;

  const payload = {
    game,
    result,
    active_seconds: activeSeconds,
  };
  if (score !== undefined && score !== null) {
    payload.score = score;
  }

  track("Game Played", payload, options);
}
