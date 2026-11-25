# Portfolio Mixpanel Analytics Guide

Privacy-friendly, explicit Mixpanel telemetry for `abhijit-kad.dev` designed to stay well within the Mixpanel **Free plan (1M events/month)** (~15–40 meaningful events per session, zero autocapture, zero session replay, zero PII).

---

## 1. Environment Configuration

Add your Mixpanel project token in `.env` (or `.env.local`, ignored by Git):

```bash
VITE_MIXPANEL_TOKEN=your_mixpanel_project_token

# Leave blank for US residency (default).
# Set if your Mixpanel project uses EU or India residency:
# VITE_MIXPANEL_API_HOST=https://api-eu.mixpanel.com
# VITE_MIXPANEL_API_HOST=https://api-in.mixpanel.com
VITE_MIXPANEL_API_HOST=
```

Optional for local testing against a separate dev project:
```bash
VITE_MIXPANEL_DEV_TOKEN=your_optional_dev_token
```

### Guardrails Built In
- **Central Wrapper**: All components call [`src/utils/analytics.js`](src/utils/analytics.js) (`initAnalytics`, `track`, `timeEvent`, `trackOnce`) and never import `mixpanel-browser` directly.
- **Lazy Bootstrap**: `mixpanel.init()` is deferred until `requestIdleCallback` / post-paint so initial 3D Hero FPS is unaffected.
- **Localhost / Dev Safety**: On `localhost` / `127.0.0.1`, events log to DevTools Console with `[Analytics]` and are **not** sent to production Mixpanel (unless `VITE_MIXPANEL_DEV_TOKEN` is set).
- **Opt-out (`?notrack=1`)**: Visiting `https://abhijit-kad.dev/?notrack=1` once writes `portfolio_notrack = "1"` in `localStorage` and permanently disables tracking in that browser (`?notrack=0` re-enables it).
- **Do Not Track**: `ignore_dnt: false` + browser DNT check honors Do Not Track automatically.
- **Zero PII**: Never captures form names, emails, message text, guestbook bodies, IP-derived fields, or fingerprints.

---

## 2. Super Properties & Recruiter Tracking

Registered once on load via `mixpanel.register()`:

| Property | Values / Example | Purpose |
| :--- | :--- | :--- |
| `referrer_source` | `"resume"`, `"linkedin"`, `"github"`, `"google.com"`, `"direct"` | Derived from `?ref=`, else `?utm_source=`, else `document.referrer` hostname |
| `utm_campaign` | string (if present in URL) | Track specific outreach campaigns |
| `utm_medium` | string (if present in URL) | Track link placement (`pdf`, `social`, etc.) |
| `device_type` | `"mobile"` \| `"tablet"` \| `"desktop"` | Responsive layout breakdown |
| `viewport_width` | number (px) | Exact viewport width on load |
| `is_returning_visitor` | boolean | Stored locally via `portfolio_has_visited` |

**Recommended recruiter links**:
- Resume PDF: `https://abhijit-kad.dev/?ref=resume&utm_medium=pdf`
- LinkedIn Featured: `https://abhijit-kad.dev/?ref=linkedin`
- GitHub Bio: `https://abhijit-kad.dev/?ref=github`

---

## 3. Event Catalog

### A. Main Portfolio Sections & Engagement

| Event Name | Properties | Trigger & Notes |
| :--- | :--- | :--- |
| `Section Viewed` | `section`, `order_index`, `scroll_depth_pct` | Fires **once per section per load** after remaining >= ~45% visible (or filling viewport) for `1s`. |
| `Section Time Spent` | `section`, `seconds` | Fires when a section leaves view or on `pagehide` (`sendBeacon`). Paused when tab is hidden; skips `< 2s`, caps at `300s`. |
| `Scroll Depth` | `pct` (`25 \| 50 \| 75 \| 100`) | Fires **once per threshold per load** via throttled scroll listener. |
| `Nav Clicked` | `item`, `from_section` | Top navbar click (desktop & mobile menu). |
| `Theme Toggled` | `theme` (`"light_prank"`) | Clicking the sun button (`LightModePrank`). |

### B. Projects & Outbound Links

| Event Name | Properties | Trigger & Notes |
| :--- | :--- | :--- |
| `Project Opened` | `project_name` | Selecting a project in desktop `Works`, tapping a mobile project card (once per card), or opening a folder in Retro XP Explorer. |
| `Project Link Clicked` | `project_name`, `link_type` (`"github" \| "live" \| "download"`), `url` | Clicking Source, Live demo, `.exe`, or `.apk` buttons/links (`transport: 'sendBeacon'`). |
| `Outbound Link Clicked` | `destination` (`"github" \| "linkedin" \| "leetcode" \| "email" \| ...`), `url`, `placement` | Single delegated listener on `<a>` links (`sendBeacon`) + HeroMobile LeetCode button. |
| `Contact Initiated` | `method` (`"mailto" \| "contact_form"`) | Fired on `mailto:` click or successful EmailJS contact form submission (no form values logged). |

### C. Retro OS, Games & Easter Eggs

| Event Name | Properties | Trigger & Notes |
| :--- | :--- | :--- |
| `Retro Section Entered` | `entry_point` (`"easter_egg" \| "direct_url"`) | Entering `/retro/` (via the 3D PC power button in `#search` or direct URL). |
| `Retro Section Exited` | `seconds_in_section` | Exiting `/retro/` back to main site or closing tab (`timeEvent` + paused hidden time + `sendBeacon`). |
| `Retro Mode Exited To Main` | `destination_section` (`"search"`) | Clicking `"Back to portfolio"` from Retro taskbar or CRT off screen. |
| `Game Started` | `game` (`"mario" \| "sonic" \| "pokemon" \| "gta" \| "zelda" \| "pacman" \| "vicecity" \| "minesweeper" \| "memory" \| "circuit" \| "packet"`) | Starting an emulator ROM, launching Vice City WASM, starting Minesweeper, or opening a puzzle game. Calls `timeEvent("Game Played")`. |
| `Game Played` | `game`, `result` (`"won" \| "lost" \| "quit" \| "abandoned"`), `active_seconds`, `score?`, `$duration` | Fires on win/loss, closing/ejecting game (`"quit"`), or closing tab mid-game (`"abandoned"` via `pagehide` + `sendBeacon`). |
| `Game Replayed` | `game`, `play_count_this_session` | Fires automatically alongside `Game Started` on repeat plays of the same game in one session. |
| `Easter Egg Found` | `egg_name`, `trigger` | **Once per egg per session**: `onlyfans_fan`, `light_mode_prank`, `wandering_spirit`. |
| `Hidden Feature Used` | `feature_name`, ... | **Once per feature per session**: `search_pc_3d_keyboard`, `spirit_note_released`, `crt_display_knob`, `crt_scanlines_toggle`, `crt_zoom_toggle`, `crt_fullscreen_toggle`, `retro_music_player`, `ie7_portfolio_browser`, `vicecity_crt_shader`, `vicecity_controls_sheet`, `emulator_custom_rom`, `emulator_crt_shader`, `emulator_controls_sheet`. |

### D. Session Summary & Light Errors

| Event Name | Properties | Trigger & Notes |
| :--- | :--- | :--- |
| `Session Summary` | `sections_viewed_count`, `sections_viewed_list`, `max_scroll_pct`, `total_seconds`, `visited_retro`, `games_played_count`, `eggs_found_count`, `outbound_clicks_count` | One summary event per visit sent on `pagehide` with `{ transport: "sendBeacon" }`. |
| `Client Error` | `message` (<=200 chars), `source` | Unhandled `error` / `unhandledrejection`, rate-limited to `5` per session. |

---

## 4. Manual Mixpanel Live View Test Checklist

1. **Dev Console Dry-Run (Localhost)**
   - Start `npm run dev` and open `http://localhost:5173/?ref=resume&utm_medium=pdf`.
   - Open DevTools -> Console and filter by `[Analytics]`.
   - Confirm `Initialized` logs `superProps.referrer_source === "resume"` and `device_type === "desktop"`, and **no network requests** are sent to `api-js.mixpanel.com`.
2. **Production Live View Check (Staging/Prod with `VITE_MIXPANEL_TOKEN`)**
   - Open Mixpanel -> **Data Management -> Live View** (or **Events**).
   - Load `https://abhijit-kad.dev/?ref=test_qa`.
   - Verify `$mp_web_page_view` + `Section Viewed` (`hero` at `order_index: 1`) appear.
   - Scroll down past `#about`, `#work`, `#skills`, `#projects`, `#contact`: confirm `Scroll Depth` (`25`, `50`, `75`, `100`), ordered `Section Viewed`, and `Section Time Spent` events.
   - Click a project in **Projects**, then click its Source/Live button: confirm `Project Opened` + `Project Link Clicked`.
   - Click footer `// github` / `// linkedin`: confirm `Outbound Link Clicked` arrives even on navigation (`sendBeacon`).
   - Trigger `Toggle Light Mode`, `"view my onlyfans"`, and open a wandering spirit: confirm `Easter Egg Found` fires once per egg.
   - Boot the 3D PC -> `/retro/`: confirm `Retro Section Entered` (`entry_point: "easter_egg"`).
   - **Simulate Tab Close Mid-Game**:
     - Launch **Super Mario Bros.** or **GTA: Vice City** (`Game Started` + `timeEvent("Game Played")` fire).
     - Play for 5–10 seconds, then close the browser tab (or navigate to `https://example.com`).
     - In Mixpanel **Live View**, confirm `Game Played` (`result: "abandoned"`), `Retro Section Exited`, and `Session Summary` (`visited_retro: true`, `games_played_count: 1`) all arrived via `sendBeacon`.
3. **Opt-Out Verification**
   - Visit `?notrack=1`, refresh without query params, and confirm `[Analytics] Tracking disabled` in dev / zero Mixpanel network requests in prod. Visit `?notrack=0` to re-enable.

---

## 5. Recommended Mixpanel Reports & "Portfolio Overview" Dashboard

Create one Dashboard named **`Portfolio Overview`** with these 6 cards:

1. **Insights — Unique Visitors & Traffic Source**
   - Event: `Session Summary` (Unique users, Daily/Weekly line chart)
   - Breakdown by: `referrer_source` (separates `resume`, `linkedin`, `github`, `direct`).
2. **Funnel — Recruiter Conversion Funnel**
   - Step 1: `Section Viewed` where `section == "hero"`
   - Step 2: `Section Viewed` where `section == "projects"`
   - Step 3: `Project Opened`
   - Step 4: `Outbound Link Clicked` OR `Contact Initiated`
   - Filter/Breakdown by: `referrer_source`.
3. **Insights — Section Attention & Drop-Off**
   - Event A: `Section Viewed` (Unique count) broken down by `section`
   - Event B: `Section Time Spent` (Aggregate -> Average of `seconds`) broken down by `section`.
4. **Insights — Most Clicked Projects & Outbound Channels**
   - Chart A: `Project Link Clicked` broken down by `project_name` & `link_type`
   - Chart B: `Outbound Link Clicked` broken down by `destination` & `placement`.
5. **Flows — Visitor Exploration Paths**
   - Anchor event: `Session Start` or `Section Viewed` (`section == "hero"`) -> look at steps forward (`Project Opened`, `Retro Section Entered`, `Outbound Link Clicked`, `Contact Initiated`).
6. **Insights — Retro Arcade & Easter Eggs**
   - Metric A: `Game Played` broken down by `game` and `result` (`won` / `lost` / `quit` / `abandoned`), with Average `$duration`
   - Metric B: `Easter Egg Found` broken down by `egg_name`.
