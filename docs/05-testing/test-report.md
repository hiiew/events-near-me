# Test Report — Happening

| Field | Value |
|---|---|
| Phase | 5 — Testing |
| Version | 0.6 — WebKit (emulated iPhone 15) added to CI; results pending the first CI run (§1.5). Before: 0.5 — details-page tests run on fixed server fixtures instead of real data (§1.4); 0.4 — DEF-07 fix and the owner's acceptance of DEF-08 (§1.3); 0.3 — Lighthouse on ENV-1 and DEF-05 accepted; 0.2 — re-run after DEF-01 – DEF-06; 0.1 — first run. UAT, ENV-2 and real-device results follow |
| Run date | 2026-11-24 |
| Commit under test | branch `claude/kind-gates-6ijzwm` = `main` after PR #21, plus the test files of this step (no app code changed). Lighthouse (§1.2): `main` after PR #22, no app code changed |
| Standard | Structure based on IEEE 829 / ISO/IEC/IEEE 29119-3 (test completion report) |
| Plan / cases | [`test-plan.md`](test-plan.md) · [`test-cases.md`](test-cases.md) |

> **What is a test report?** It records what was actually run, what passed and failed, and which
> defects were found. A case is only "Pass" here if it was run and passed in this session; nothing is
> marked passed from reading the code.

---

## 1. What ran

| Item | Detail |
|---|---|
| Environment | **ENV-1**: local production build (`next build` + `next start`, port 3100) in the Linux container, started by Playwright's `webServer` |
| Browser | Playwright 1.63.0 bundled Chromium (headless), the only browser here (RT-03) |
| Default context | 390 × 844, dark, `en-GB`, geolocation granted at the KLCC test landmark, service workers blocked (except TC-49), `--trace off`, screenshots only on failure |
| Test data | Fixtures F-01 – F-09 + Kota Kinabalu pair (`e2e/fixtures/events.ts`), browser clock fixed at **Thu 17 Dec 2026 10:00 MYT** (21:00 for the second TC-44 run). Details-page cases (PRE-D): until v0.4 a real upcoming curated event read from the unmocked API at run time; **since v0.5 the server fixtures S-1 – S-4 (+ 20 fillers)**, test-plan §2.3 |
| Outside hosts | None contacted: OSM tiles answered with a blank PNG, every other outside address (organiser pages, Google Maps, Waze) with a stub page (`e2e/helpers.ts`) |
| Command | `npm run test:e2e` (= `playwright test`; set `E2E_SKIP_BUILD=1` to reuse the last build) |
| Duration | **≈ 31 s** for a full run including the production build; ≈ 24 s against an existing build (4 workers) |
| Stability | Full suite run **3 times** (once from a fresh build, twice on the same build): identical results each time, 0 flaky, 0 retries (retries are off on purpose) |
| Also run | `npm test` (Vitest: 13 files, **156 passed**); `npm run lint` (0 problems); `npx tsc --noEmit` (0 errors); unit coverage of `src/lib/**`; static secret scan (TC-63); server-log scan (TC-40) |

**Playwright totals:** 69 tests in 18 files — **64 passed, 5 failed, 0 skipped.** The 5 failures are 4 test
cases (TC-60 fails in dark and light) and are all app defects (§3); no failure was a test bug at the end.

### 1.1 Re-run after the defect fixes (2026-11-24)

The owner asked for all six defects to be fixed. Changes (one PR with the suites): `globals.css` lifts Leaflet's
bottom controls 26 px above the list sheet and gives the credit theme colours (DEF-01); `MapView.tsx` adds
`keyboard={false}` to the decorative search-point marker (DEF-02); the details page `<dl>` keeps each `dt`/`dd`
group directly in one `div`, laid out with grid placement (DEF-03, looks the same); the "Filters" text button gets
`min-w-11` (DEF-04); `generateMetadata` awaits `connection()` before `isEnded` (DEF-06).

**DEF-05 could not be fixed in the app.** Next.js 16 fails while decoding the malformed `[id]` parameter and
answers with its own plain-text 500 before any app code runs: neither the page, `generateMetadata` nor a
`proxy.ts` (tried, then removed) is reached. Other malformed paths (`/%E0%A4%A`, `/about/%E0%A4%A`) already give
a normal 404. TC-24 is split: the missing-event part passes; the malformed-link part is marked
`test.fail()` with DEF-05 in its title, so a Next.js upgrade that fixes it shows up as "unexpectedly passed".

**Re-run result:** `npm run test:e2e` **70 passed** (69 + the split TC-24; the DEF-05 test counts as an expected
failure), 0 failed, ≈ 28 s. `npm test` 156 passed, `npm run lint` 0 problems (generated `coverage/`,
`playwright-report/` and `test-results/` folders are now in ESLint's ignore list), server log 0 `Date.now()`
lines. Visual check at 360 px, dark and light: credit readable above the sheet; details page unchanged.

### 1.2 Lighthouse run and DEF-05 decision (2026-11-24)

**DEF-05 accepted by the owner on 2026-11-24** as a known Next.js limitation (§3). The TC-24 malformed-link
test stays `test.fail()`, so a Next.js upgrade that fixes it shows up as "unexpectedly passed".

**Lighthouse 13.6.0** (`npx` only, not in `package.json`), Playwright's Chromium 1243
(`/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`, `--headless=new --no-sandbox`), against `npm run build` +
`npm start -p 3456` (ENV-1). Mobile form factor, default throttling (simulated: 150 ms RTT, 1.6 Mbit/s, 4× CPU),
all four categories, **3 runs per page** (median reported, RT-08). Light theme by default; one extra
Accessibility run per screen in dark (`--force-dark-mode`, checked to make `prefers-color-scheme: dark` match).
The Explore screen needs a tap first, so it was measured with a **Lighthouse user flow**
(`evidence/lighthouse/explore-flow.mjs`): navigate to `/` → timespan "tap Klang Valley until the 26 result rows
show" → snapshot of Explore with results; 3 runs light + 1 dark. Details page: `/event/curated:kl-0014` (real
upcoming event, Fri 27 Nov). Results and findings: §2.4; evidence: [`evidence/lighthouse/`](evidence/lighthouse/)
(`summary.json` = every run's scores, metrics and failed audits; the median home and details reports and one
Explore flow, with screenshots stripped to keep them small).

### 1.3 DEF-07 fixed, DEF-08 accepted (2026-11-24)

**DEF-07:** `src/lib/event-schema.ts` now calls `z.config({ jitless: true })`, so Zod 4 no longer tries `new Function`
(which our CSP blocks) to decide whether it can compile faster parsers. A unit test checks the setting stays on.
Proof with the same tool that found it: Lighthouse 13.6.0 Best Practices on `/` and `/about` was **96 without the fix
and 100 with it** (same build steps, same machine). A page-level `securitypolicyviolation` listener and the DevTools
Audits issue stream did not show the report in either version, so Lighthouse is the check of record.
After the change: `npm test` 157 passed, `npm run test:e2e` 70 passed, lint clean.

**DEF-08:** accepted by the owner. Next.js 16 streams `generateMetadata` output to normal browsers, so the
details page's description arrives in `<body>` (Lighthouse SEO 90). Bots on Next's list still get it in `<head>`, so
share previews work (TC-45). Forcing blocking metadata for everyone (`htmlLimitedBots`) would slow that page.

Test bugs found and fixed while writing the suites (the app was right): link names needed `exact: true`
(the row's external-link button's name also contains the title); the details page and the welcome screen
have no tab bar, so TC-28 opens `/saved` directly; an area button's accessible name has a space
("Klang Valley 26 events"); the keyboard walk needed more Tab presses with 26 real events; axe and the
target-size check now wait for the map pins / the streamed event content before measuring (the first
scans ran too early and gave different results from run to run).

### 1.4 v0.5 — details-page tests on fixed server fixtures (2026-11-27)

**Why:** the details page is a Server Component that reads the bundled curated file, so its tests used a real
upcoming event and called `test.skip()` when none matched. Real events expire: on 27 Nov TC-23 already skipped
(the last "price not listed" event had ended) and after 19 Dec almost every details test would have skipped while
CI stayed green. Four more tests (TC-58, TC-60, TC-62 target size, TC-72/TC-63) silently left out the details page
through `if (e)`.

**What changed:** the e2e web server now serves fixed, always-upcoming server fixtures through
`E2E_CURATED_EVENTS` (test-plan §2.3), read by a small guarded seam `curatedEntries()` in
`src/lib/sources/curated.ts` (ignored on Vercel, logged when used, throws on a broken value; 4 new unit tests).
Same production build, so CI still builds once. All 18 `realEvent()` look-ups, the 14 data-dependent
`test.skip()` calls and the 5 `if (e)` branches are gone; the only expected failure left is DEF-05's `test.fail()`.
TC-21 now runs once per fixture (every field + image, no price / no end / no image, free, Sabah); TC-45 and TC-46
run with and without image / end time. Outside image requests are answered with a 1 × 1 PNG (`e2e/helpers.ts`).

**Runs on fixtures:** TC-21 (×4 + after-search distance), TC-22, TC-23, TC-26/27, TC-28, TC-29, TC-32, TC-33,
TC-34, TC-45 (×2), TC-46 (×2), TC-56, TC-58 (S-4 step), TC-60 (S-4 scan), TC-62 (target size S-4, keyboard walk),
TC-63, TC-72.

| Run (2026-11-27, ENV-1) | Passed | Skipped | Failed |
|---|---|---|---|
| Before (v0.4 suite), real data | 69 (incl. DEF-05 expected failure) | **1** (TC-23) | 0 |
| Before (v0.4 suite), copy of the data with every event moved 400 days into the past (not committed) | 56 | **14** | 0 |
| After, `E2E_SKIP_BUILD=1 npm run test:e2e` and full `npm run test:e2e`, real data | **75** (incl. DEF-05) | **0** | 0 |
| After, same expired copy of the data | **75** | **0** | 0 |
| After, seam switched off (`E2E_CURATED_EVENTS` empty; temporary, not committed) — detail + calendar specs | 4 | 0 | **9** (fail loudly, no skips) |

New total: 75 tests (TC-21 +3, TC-45 +1, TC-46 +1). `npm test` 165 passed (14 files), lint clean, TC-40 server log
0 coordinate lines. TC-56 on fixtures: median 420 ms, max 614 ms. The build output has no fixture data (only the
variable's name in two server chunks; nothing in `.next/static`).

**Not covered by e2e any more:** the real curated file itself. Vitest still checks every entry is valid and ids are
unique; whether it has upcoming events (E-6) is checked by the data refresh, the ENV-2 smoke check and UAT (RT-01).

### 1.5 v0.6 — WebKit added to CI (2026-11-27)

**WebKit added to CI; results pending the first CI run.** No iPhone is available for UAT (RT-04), so CI now runs the
whole e2e suite a second time on WebKit as an emulated iPhone 15 (project `webkit-iphone`, test-plan §3.2 D-3a):
75 tests listed, 1 skipped on WebKit by name (TC-56, needs Chrome DevTools throttling), 74 expected to run. WebKit
cannot be installed in Claude's container, so **no WebKit result exists yet**; nothing here is marked passed for it.
Locally the Chromium run is unchanged: 75 passed, 0 skipped (incl. DEF-05 `test.fail()`). NFR-13 stays open: a green
WebKit run is partial evidence; the real-iPhone part of TC-66 is still needed or must be accepted as a gap.

---

## 2. Results per test case

**Result key:** Pass · **Fail** · Pass (auto part) = the automated part passed, a manual/phone/ENV-2 part is still open · Not run.

### 2.1 Automated in Playwright (Playwright: Yes = 51, Partly = 7 of 9)

| TC | Requirements | Spec file | Result | Evidence / notes |
|---|---|---|---|---|
| TC-01 | FR-01, US-01, US-10 | location | Pass | Notice visible, 0 `getCurrentPosition` calls before the tap, 1 after, `timeout: 10000` |
| TC-02 | FR-01, FR-04, FR-06, US-01 | location | Pass | "Your location · 10 km", "6 events nearby", order F-01, F-07, F-02, F-04, F-03, F-09; body = P. Real permission prompt on a phone: TC-66 |
| TC-03 | FR-06, NFR-18 | explore | Pass | F-01 "Thu 17 Dec · 8:00 PM · Bukit Bintang Lounge · 1.5 km", Music, FREE; F-03 "RM 60.00 – RM 90.00"; F-04 "Price not listed" |
| TC-04 | FR-06 | explore | Pass | Nearest: F-01, F-02, F-09, F-03, F-04, F-07 last; "nearest first" |
| TC-05 | FR-05, NFR-19 | explore (+ unit) | Pass | F-08 absent at 10 and 50 km (list and pins); unit: `filterCurated` drops ended, keeps in-progress |
| TC-07 | FR-02, US-02 | location | Pass | Denied → "Tap the map to choose an area", "Location is off…", buttons + areas; no search sent |
| TC-08 | FR-02, US-02 | location | Pass (auto part) | Fake timers: still "Finding…" at 9 s, pick-a-spot with "took too long" at 10 s, no tap. Real-prompt note (Q-6) still to check on a phone |
| TC-09 | FR-02, FR-03, US-02 | location | Pass | Tap at P → exactly 1 search, search-point marker, "Pinned spot · 10 km", the six events |
| TC-10 | FR-03, US-02 | location | Pass | Pan + Search this map area, map tap, Change → Cancel (no request, Music kept), Change → Use my location ("Your location", Music kept); all bodies 3 dp |
| TC-11 | FR-07, FR-08, US-03 | map | Pass | 5 event pins + 1 search point; 6 rows; every pinned event listed |
| TC-12 | FR-07, US-03 | map | Pass | Click and Enter on a pin highlight its row (in view); selected pin shows the name; row opens `/event/<id>` |
| TC-13 | FR-08, FR-14, US-03 | map | Pass | Music → 2 rows/2 pins; 50 km → same; All → 8 rows/7 pins; "· 50 km" |
| TC-14 | FR-09, US-03 | map | Pass | F-07 "Studio Somewhere · not on map", no km, no pin; at 2 km: F-01, F-07 |
| TC-15 | FR-10, FR-04 | filters | Pass | Choices 2/5/10/25/50, 10 pressed; counts 2, 3, 6, 7, 8 (button count = list) |
| TC-16 | FR-11, US-04 | filters (+ unit) | Pass | Browser in Europe/London: Today → F-01; weekend → F-07, F-02, F-04, F-03; 7 and 30 days → 6 |
| TC-17 | FR-12, US-04 | filters | Pass | 8 categories + All; Music → 2; + Food & Markets → 3 (button "Show 3 events") |
| TC-18 | FR-13, US-04 | filters (+ unit) | Pass | Free → F-01; Max RM 50 → F-01, F-07, F-02, F-09; Any → 6 incl. "Price not listed" |
| TC-19 | FR-14, US-04 | filters | Pass | Weekend + Music → F-03 only; no reload (window marker kept); no new search request |
| TC-20 | FR-15, US-04 | filters | Pass | "0 events nearby", "No events match", hint text, Widen to 25 km keeps Today + Sports; no Widen at 50 km |
| TC-21 | FR-17, FR-32, NFR-18, US-05 | detail | Pass | v0.5, server fixtures S-1 – S-4: title, long day, time "(Malaysia time)" with and without end, venue + address, category, price (range, free, not listed, RM 20), description, "Source: Curated by Happening", **image shown and loaded for S-1** (Q-2 closed), none for the others; after a search "x.x km from your search" |
| TC-22 | FR-18, US-05 | detail | Pass | New tab at exactly `E.url` (https); `target=_blank`, `rel="noopener noreferrer"` on the button and the row link |
| TC-23 | FR-17, FR-13, US-05 | detail | Pass | v0.5: server fixture S-2 (`price: null`) shows "Price not listed" and no price amount. (On 27 Nov the v0.4 version skipped: no real upcoming event without a price was left) |
| TC-24 | FR-05, FR-17 | detail (+ unit) | **Partly** (missing link: Pass; malformed link: known failure DEF-05) | Missing id → "This event isn't available" + link to `/` ✓. Malformed `/event/%E0%A4%A` → **HTTP 500** "Internal Server Error" → **DEF-05**. Unit `isEnded` ✓ |
| TC-25 | FR-32, NFR-17 | detail | **Pass** (re-run, DEF-01 fixed; first run: Fail) | OSM attribution is **covered by the list sheet** at 360 px → **DEF-01** ([screenshot](evidence/TC-25-attribution-hidden-360px.png)). About links to the OSM copyright page ✓ |
| TC-26 | FR-19, US-06 | detail (+ unit) | Pass (auto part) | Google Maps `dir/?api=1&destination=lat,lon`, Waze `ll=lat,lon&navigate=yes`, both new tab + noopener. Opening the apps on a phone: open |
| TC-27 | FR-38, US-16 | detail (+ unit) | Pass (auto part) | Same destination + `travelmode=transit`, new tab. App part on a phone: open |
| TC-28 | FR-20, US-07 | saved | Pass | `aria-pressed` true/false, label "Saved — remove from Saved", listed on Saved, then "Nothing saved yet" |
| TC-29 | FR-20, NFR-11 | saved | Pass | Storage state → browser closed → new browser: still listed |
| TC-30 | FR-21, US-07 | saved | Pass | Ended bookmark tagged "Ended", tomorrow's not |
| TC-31 | NFR-11, FR-40 | saved | Pass | "1 saved event…" → Clear → "No saved events on this phone."; both keys removed; Saved empty |
| TC-32 | FR-20, NFR-11 | saved | Pass | No request URL or body carries the bookmark or its id (except opening the page itself); no cookies |
| TC-33 | FR-22, US-08 | share | Pass | `navigator.share` called once with title, "title — Sat 5 Dec · 8:00 PM" style text, page URL; no "Link copied" |
| TC-34 | FR-22, US-08 | share | Pass | No share API: "Link copied" in an `aria-live` status; clipboard = page URL |
| TC-36 | FR-28, FR-24, NFR-12 | explore (+ unit) | Pass | Fixture with Eventbrite `ok:false`: 6 events + "Some sources are unavailable right now."; unit: failing and hanging sources |
| TC-38 | FR-31, US-10 | privacy | Pass (auto part) | All §5 points present, OSM link, Clear saved data, GitHub link. Owner's wording read: open |
| TC-39 | NFR-09, US-10 | privacy (+ unit) | Pass | 5 searches (counts, location, map tap, map area): all POST, body exactly `{lat, lon}`, ≤ 3 dp; landmark sent as P; no other request carries any spelling of the point |
| TC-40 | NFR-10 | global teardown | Pass (auto part) | After every full run the server log held **0** lines with a landmark coordinate, `90.0001` or a `lat`/`lon` key (335 lines in the build run). Code review: 2 `console.warn` in `src/` (curated id, source id + error message), no file writes, no database. **Gap:** the unit step "spy on `console.*` while the route handles valid/invalid/oversize bodies" does not exist in `route.test.ts` yet |
| TC-42 | FR-34, US-12 | chips | Pass | At 25 km: chip pressed with check mark → F-01, F-05; again → 7 rows, Any + Next 30 days, still 25 km; set by hand → chip pressed |
| TC-43 | FR-35, US-13 | search | Pass | "jazz bukit" / "CAFE" → F-01; "market" + Free → empty state; Reset keeps "market" → F-02; empty → 6; no search requests |
| TC-44 | FR-36, US-14 | chips | Pass | Today → F-01; again → 6; Music kept throughout; Today then Free this week → only Free pressed; 21:00 run: event ended at 19:00 not listed |
| TC-45 | FR-37, US-15 | share | Pass (auto part) | Bot user agent: `<title>`/`og:title` "E.title — Happening", description "date · venue · price", v0.5: S-1 `twitter:card` summary_large_image with `og:image` = its image URL, S-2 summary with no `og:image`; missing id → "Event — Happening", no `og:description`. Chat-app check on ENV-2: open |
| TC-46 | FR-23, US-17 | calendar (+ unit) | Pass | v0.5: run for S-1 (end time) and S-2 (no end: DTEND = start + 2 h). `.ics` download: VCALENDAR/VEVENT, SUMMARY, DTSTART/DTEND in UTC = event times, LOCATION, URL, every line ≤ 75 bytes, status message, no network request |
| TC-49 | FR-40, US-18 | offline | Pass | Service worker on: offline reload of `/`, `/about`, `/saved` render with the dark stylesheet; unvisited `/event/…` lands on `/` |
| TC-50 | FR-40, NFR-09, US-18 | offline | Pass | `lastsearch` = `{savedAt, events}` only, P not in localStorage; offline map tap → "Can't reach the server. Showing events saved on Thu 17 Dec · 10:00 AM…" + Try again; online → notice gone |
| TC-51 | FR-33, US-18 | pwa (+ unit) | Pass (auto part) | Manifest `short_name` "Happening", `name` "Happening — events near you", standalone, start `/`, icons 192/512/maskable 200 `image/png`; apple-touch-icon 200. Installing on phones: open |
| TC-52 | FR-41, US-19 | areas | Pass | Both screens: "Klang Valley 8 events", "Kota Kinabalu 2 events"; empty KK → "No events yet" |
| TC-53 | FR-41, NFR-09, US-19 | areas (+ unit) | Pass | "Kota Kinabalu · 50 km", 2 rows = button; 0 geolocation calls; only area centres sent; filters default + 50 km |
| TC-54 | FR-41, US-19 | areas | Pass | Counts answered 500 → plain names, no "undefined"; Klang Valley still lists 8 |
| TC-55 | FR-41, FR-03, US-19 | areas | Pass | After Klang Valley, map tap → "Pinned spot · 50 km", one new search from the tapped point |
| TC-56 | NFR-01 | perf | Pass (ENV-1) | v0.5: real API serving the server fixtures (23 Klang Valley events): median 420 ms, max 614 ms. v0.4: real API and data, Fast 4G (165 ms RTT, 8.1 / 1.35 Mbit/s = DevTools preset) + 4× CPU: runs 461, 557, 382, 462, 488 ms; **median 462 ms, max 557 ms** (≤ 3000). Final figure on ENV-2 still to take |
| TC-58 | NFR-03 | responsive | Pass | 360/768/1280 px × dark/light × S-1, S-2/3, S-7, S-4, S-5, S-6 = 36 checks: no sideways scroll, main button visible and clickable, "Change" in view; screenshots attached to the run for a manual glance |
| TC-59 | NFR-04 | explore | Pass (auto part) | Row title → details = 1 action; pin → row title = 2 actions. UAT part: open |
| TC-60 | NFR-05 | a11y | **Pass** (re-run, DEF-02/03 fixed; first run: Fail) | 9 screens × dark/light. 0 colour-contrast findings. Serious: unnamed focusable search-point pin (**DEF-02**), invalid `<dl>` on details (**DEF-03**). No moderate/minor. [findings JSON](evidence/TC-60-axe-findings.json) |
| TC-62 | NFR-05 | a11y | **Pass** (auto part, re-run, DEF-04 fixed; first run: Fail) | Keyboard-only walk (area → pin + Enter → Filters, Esc returns focus → row → Save → Back) with visible focus ring ✓; reduced motion stops the sheet animation ✓; **target size: "Filters" text button 42 × 44 px** (**DEF-04**). Screen reader, 200 % zoom, contrast spot-check: open (owner) |
| TC-63 | NFR-06 | security + shell | Pass | Browser: no request header/body in a full flow matches key/token/bearer/secret patterns. Static: full `git log -p --all` has only the placeholder `EVENTBRITE_TOKEN=replace-me`; the only committed `.env*` is `.env.example`; no `NEXT_PUBLIC_` in `src/`; `.next/static` matches only Next's own `…TAG_TOKEN_HEADER` constant |
| TC-65 | NFR-08 | api (+ unit) | Pass | lat 90.0001, lon −180.0001, lat as string, missing lon, extra `radius`, not JSON → 400 `invalid_request` naming the field, values never echoed; empty → 400; 2 KB → 413; GET → 405; all `no-store`; valid 6-dp point → 200 |
| TC-70 | NFR-18 | explore (+ unit) | Pass | Browser in New York: F-01 still "Thu 17 Dec · 8:00 PM"; prices in RM |
| TC-72 | T-03, T-04, §7, FR-18 | security | Pass | `/`, `/event/<id>`, API: CSP with `frame-ancestors 'none'`, nosniff, referrer policy, `geolocation=(self)`. F-09 title shown literally in the row and the selected pin (no `<b>`/`<script>` elements), no dialog, no console/CSP errors |

### 2.2 Other cases touched in this run (not Playwright)

| TC | Requirements | Result | Notes |
|---|---|---|---|
| TC-06 | FR-04, FR-24, FR-25 | Pass | Unit (`route.test.ts`, `curated.test.ts`, `aggregator.test.ts`) in `npm test` |
| TC-41 | FR-25 | Pass | Unit: invalid entries skipped with an id-only warning; every real entry passes the schema |
| TC-47 | FR-39 | Pass | Unit (`ics.test.ts`): 2 / 1 / 0 alarms; line breaks in the title can't add lines |
| TC-67 | NFR-15 | Pass (local part) | Lines covered: **90.7 %** of `src/lib/**`; 100 % for `filters.ts`, `geo.ts` and every file in `src/lib/sources/`; lint 0 errors. "Lint passes in CI" waits for the Phase 6 workflow |

### 2.3 Not run in this step, and why

| TC | Why |
|---|---|
| TC-64 | Needs the Vercel URL (ENV-2) |
| TC-66 | Device/browser matrix needs real phones and other browsers; row D-1 (headless Chromium) = this whole run |
| TC-35, TC-48, TC-73 and the manual parts of TC-08, TC-26, TC-27, TC-38, TC-45, TC-51, TC-59, TC-62 | Need a real phone, a calendar/chat app, a screen reader or UAT testers (owner; test-plan §9) |
| TC-37, TC-68, TC-69, TC-71 | Review/process audits planned with the owner (design walk-through, Vercel dashboard, source-terms check, curated-data history) |

### 2.4 Lighthouse (TC-57, TC-61) — ENV-1, mobile

| TC | Requirements | Result | Evidence / notes |
|---|---|---|---|
| TC-57 | NFR-02 | **Pass (ENV-1)** | Home page Performance runs **92, 98, 98 → median 98** (≥ 80). Final figure on ENV-2 still to take (test-plan RT-08, TC-57 Pre) |
| TC-61 | NFR-05 | **Pass (ENV-1)** | Accessibility `/`, `/about`, `/saved`, `/event/<id>` = **100** in light and dark; Explore with results (flow snapshot) = **96** light and dark (only `target-size` on crowded map pins — not a defect, see below). ENV-2 run still to take (TC-61 Pre) |

**Scores per page** (P = Performance, A = Accessibility, BP = Best Practices, SEO; median of 3 runs, light; A also run in dark):

| Page | P (3 runs) | A | BP | SEO | Key metrics (median run) |
|---|---|---|---|---|---|
| `/` welcome (S-1) | **98** (92, 98, 98) | 100 (dark 100) | 96 | 100 | FCP/LCP 0.77 s, TBT 165 ms, CLS 0 |
| Explore with results (S-2), user flow | navigation of `/` 98 (98, 98, 96); timespan "tap → results" **81** (81, 83, 80) | snapshot **96** (dark 96) | timespan 89 · snapshot 100 | snapshot 100 | timespan: TBT ≈ 220 ms, INP 148 ms, CLS 0.162 (see below) |
| `/event/curated:kl-0014` (S-4) | **98** (93, 98, 98) | 100 (dark 100) | 96 | **90** | LCP 0.76 s (2.8 s on the first, cold run), TBT 161 ms |
| `/saved` (S-5) | **98** (98, 99, 96) | 100 (dark 100) | 96 | 100 | LCP 0.76 s, TBT 99–214 ms |
| `/about` (S-6) | **99** (100, 99, 99) | 100 (dark 100) | 96 | 100 | LCP 0.76 s, TBT 70–139 ms |

A snapshot has no Performance score (Lighthouse shows "0"/not applicable for it). Lighthouse 13 also reports an
"Agentic browsing" category (100 everywhere); it is not part of any requirement.

**Failed audit items and what they are:**

| Audit | Where | Cause | Counted as |
|---|---|---|---|
| `inspector-issues` (BP −4) | every page | Chrome logs a CSP issue: `script-src` blocks an `eval`-type call at `/_next/static/chunks/3k1xh3mk2iqet.js` col 12129 — Zod 4's feature probe `try { Function("") }` (it falls back to normal mode, nothing breaks). Zod runs in the browser for bookmarks and the offline cache | **DEF-07** (S4) |
| `meta-description` (SEO −10) | details page only | Next.js 16 streams `generateMetadata` output for normal browsers: `<meta name="description">` (and `<title>`) arrive inside `<body>`, so Lighthouse finds no description in `<head>`. Bots on Next's limited-HTML list still get it in `<head>` (TC-45 passes) | **DEF-08** (S4) |
| `errors-in-console` (BP, timespan 89) | Explore flow only | 20+ `net::ERR_TUNNEL_CONNECTION_FAILED` for `tile.openstreetmap.org` — this container blocks outside hosts | **Environment only**, not a defect |
| `target-size` (A 96) | Explore snapshot | 19 map pins 24 × 24 px overlap each other around central KL at the 50 km zoom (WCAG 2.2 2.5.8 check) | **Not a defect**: 2.5.8's "equivalent" exception — every pin's event is also a full-size row in the list (ui-ux §6 "map is never the only way"; same rule as the TC-62 target-size check). Note for UAT: with real data the central-KL pins are hard to tap one by one |
| `cumulative-layout-shift` 0.162 | Explore timespan | The welcome panel turns into the 62 px top bar 72 ms after the tap. Chrome's Layout Instability API marks this shift `hadRecentInput: true` (checked in a separate Playwright run), so real-user CLS excludes it; Lighthouse's timespan counts it | **Not a defect** (expected change in response to the tap) |
| `total-blocking-time`, first-run LCP | all | TBT 70–350 ms (scores 0.73–0.99); one cold details-page run with LCP 2.8 s | Within the ≥ 80 target; no action |

**How much the blocked hosts change the scores:** `/`, `/about`, `/saved` and the details page request **nothing**
outside localhost on load (Lighthouse network list: 16–17 requests, all local), so their scores are **not**
affected by the block. Only Explore loads OSM tiles: in the container they fail at once, so the timespan's
Performance (81) **leaves out the tile download and decode** that a real phone does — reality may be a little
worse — and its Best Practices (89) is **lowered** by the tile errors; with tiles loading it would most likely be 96 like
the other pages (only DEF-07 left). Other environment effects: localhost has no real network distance, TLS or CDN
(simulated throttling models some of it), and `is-on-https` passes only because Chrome treats localhost as secure.
That is why the plan keeps the final NFR-02 figure and the TC-61 re-run on ENV-2. A Lighthouse score is not WCAG
conformance: the manual part of TC-62 is still open.

---

## 3. Defects

All found 2026-11-24 on ENV-1 (headless Chromium, production build). Status **Open** — QA did not change
any app code; each goes to the `developer` agent with these steps (test-plan §6.2). Each failing test fails
again if the defect comes back, so the fix PR can be checked with `npm run test:e2e`.

| ID | Severity | TC | Req | Summary | Status |
|---|---|---|---|---|---|
| **DEF-01** | **S2 High** | TC-25 | FR-32 (M), NFR-17 (M) | OpenStreetMap attribution hidden behind the list sheet on Explore | **Fixed** (re-test pass) |
| **DEF-02** | S3 Medium | TC-60 | NFR-05 (M) | Search-point pin is a focusable "button" with no name | **Fixed** (re-test pass) |
| **DEF-03** | S3 Medium | TC-60 | NFR-05 (M), FR-17 | Details page `<dl>` has invalid structure | **Fixed** (re-test pass) |
| **DEF-04** | S4 Low | TC-62 | NFR-05 (M) | "Filters" text button is 42 × 44 px (target ≥ 44 × 44) | **Fixed** (re-test pass) |
| **DEF-05** | S4 Low | TC-24 | FR-17 (M), FR-05 (M) | Malformed event link returns a bare HTTP 500 | **Accepted by owner 2026-11-24 — Next.js limitation** (§1.1; TC-24 malformed-link test stays `test.fail()`) |
| **DEF-06** | S4 Low | TC-40 (log review) | FR-37 (C) | Server logs a Next.js "unstable value `Date.now()`" error on every details request | **Fixed** (0 such log lines on re-run) |
| **DEF-07** | S4 Low | TC-61 (Lighthouse BP) | security-privacy §7 CSP (TC-72), T-03 | Zod's `Function("")` probe trips the CSP on every page (Chrome "issue", Best Practices 96) | **Fixed 2026-11-24** — `z.config({ jitless: true })` in `event-schema.ts`; Lighthouse Best Practices 96 → **100** on `/` and `/about` (same Lighthouse 13.6.0, with vs without the fix) |
| **DEF-08** | S4 Low | TC-61 (Lighthouse SEO) | FR-37 (C) | Details page `<meta name="description">` is streamed into `<body>` for normal browsers (SEO 90) | **Accepted by owner 2026-11-24** — Next.js 16 streams metadata to normal browsers; bots still get it in `<head>` (TC-45 passes). Not fixed: `htmlLimitedBots` for everyone would slow the details page |
| **DEF-09** | S3 Medium | TC-60 (CI, PR #32) | NFR-05 (M), FR-32 | OSM credit text contrast failed axe `color-contrast` (serious, 3 nodes, S-3 pick a spot, dark) on the CI runner only; the DEF-01 fix gave it a see-through background, so the contrast depended on what the map had drawn behind it. Not reproduced locally (12/12 passes); artifact not downloadable from Claude's container | **Fixed 2026-11-27, root cause corrected same day.** First fix (solid background) was not enough: the first WebKit CI run (PR #34) still failed, and the new axe `failureSummary` showed the measured background `#d0d1d2` = leaflet.css's `rgba(255,255,255,0.8)` box. Real cause: leaflet.css's `.leaflet-container .leaflet-control-attribution` has the same specificity as the app's doubled class, and leaflet.css loads later with the map, so Leaflet's box won whenever it loaded last (proved locally: Chromium computed `rgba(255, 255, 255, 0.8)` with the old CSS). Fix: three-class selectors in `globals.css` (beat Leaflet regardless of load order). TC-25 now asserts the computed background is `rgb(14, 15, 19)` (fails on the old CSS, passes on the fix). |

**DEF-01 — OSM attribution hidden behind the list sheet (S2).**
Steps: open `/` at 360 × 740 → Use my location → results show. Look at the bottom-right corner of the map.
Expected (FR-32, OSM licence via NFR-17): "© OpenStreetMap contributors" visible on the map.
Actual: the attribution control is drawn but covered; the element on top at its centre is the sheet's
drag-handle button. The map box is `calc(46dvh + 26px)` tall and the sheet starts at `46dvh`
(`src/app/page.tsx`), so the bottom 26 px of the map — where Leaflet puts the attribution — is always
under the sheet; by the same rule this happens at every width (only 360 px was measured).
Workaround: the About page links the OSM copyright page. Why S2: a Must requirement fails with a workaround.
Evidence: [screenshot](evidence/TC-25-attribution-hidden-360px.png).
Likely fix (developer to decide): lift Leaflet's bottom controls by the 26 px overlap, or place the attribution top-right.

**DEF-02 — Unnamed focusable search-point pin (S3).**
Steps: get results (any way) → press Tab until focus enters the map, or run axe.
Expected: every focusable control has a name (WCAG 4.1.2); a non-interactive marker is not focusable.
Actual: axe `aria-command-name` (serious) on the search-point marker, in S-2/S-3 results and the empty
state, dark and light: Leaflet's default `keyboard: true` gives it `role="button"` and `tabindex="0"`
even though it is `interactive={false}` and has no title. A keyboard/screen-reader user meets an
unnamed "button" that does nothing. Not S2: it does not block a flow. Likely fix: `keyboard={false}` on that `<Marker>` in `MapView.tsx`.

**DEF-03 — Invalid definition list on the details page (S3).**
Steps: open any upcoming `/event/<id>` → run axe.
Expected: `<dl>` children are `<dt>`/`<dd>` groups or `<div>` wrappers of them (WCAG 1.3.1).
Actual: axe `definition-list` (1 node) and `dlitem` (8 nodes), serious, both themes: each row is
`<div class="grid">` → icon + inner `<div>` → `<dt>`/`<dd>`, so the `dt`/`dd` are two levels deep.
Screen readers may not announce the When/Where/Price pairs. Likely fix: make the inner `<div>` the group (or drop `<dl>` semantics).

**DEF-04 — "Filters" text button below 44 px wide (S4).**
Steps: get results; measure the "Filters" text button next to the "N events nearby" heading.
Expected: tap targets ≥ 44 × 44 px (ui-ux.md §6). Actual: 42 × 44 px (`min-h-11` but no minimum width).
Not a WCAG 2.1 AA failure (target size is AAA in 2.1; 24 px in 2.2 AA), and the top-bar filter button (46 × 46) does the same thing. Likely fix: `min-w-11` or a little horizontal padding.

**DEF-05 — Malformed event link gives a bare 500 (S4).**
Steps: open `/event/%E0%A4%A` (broken percent-encoding).
Expected (TC-24): a 400/404 or the friendly "not available" page, not a server error.
Actual: HTTP 500 with the plain text body "Internal Server Error"; no page, no way back; no stack trace in
the server log. `/event/%25` and well-formed ids work. Only reachable by hand-editing a link, so S4.
The comment in `event/[id]/page.tsx` assumes Next.js rejects malformed `%` itself — it does, but with a 500;
`decodeURIComponent` in `EventPage` is not inside a `try` (as it is in `generateMetadata`). Developer to confirm where the 500 comes from.

**DEF-05 decision:** accepted by the owner on 2026-11-24 as a known limitation of Next.js 16; no app change.
FR-05 and FR-17 no longer wait for it (§4).

**DEF-06 — Next.js error logged on every details request (S4).**
Steps: start the production server, open any `/event/<id>`, read the server output.
Expected: no error output for a normal page view. Actual: `Error: Route "/event/[id]": Next.js encountered
the unstable value Date.now() while prerendering`, stack in `generateMetadata` (25 times in one run).
`generateMetadata` calls `isEnded()` (→ `Date.now()`) before any dynamic data access; `EventDetail` awaits
`connection()` but `generateMetadata` does not. No visible effect: the preview metadata is correct (TC-45
passes). Risk: the noise hides real errors in the Vercel logs. Likely fix: `await connection()` at the top of `generateMetadata`.

**DEF-07 — Zod's eval probe trips the CSP on every page (S4).**
Steps: `npm run build && npm start`; open any page (`/`, `/about`, `/saved`, `/event/<id>`) in Chrome with
DevTools → Issues (or run Lighthouse Best Practices).
Expected: no Content Security Policy issue on a normal page view (the CSP of §7 is meant to block `eval`, and
nothing in the app should try it). Actual: one "Content security policy" issue per page,
`violatedDirective: script-src`, `kEvalViolation`, source `/_next/static/chunks/3k1xh3mk2iqet.js` col 12129 =
Zod 4's `try { Function(""), !0 } catch { !1 }` JIT check. Nothing breaks (Zod falls back) and no console error is
shown; Lighthouse `inspector-issues` fails → Best Practices 96 on every page. Why S4: no effect on use; it adds
noise that could hide real CSP problems (and CSP reports, if added later). Evidence:
[`summary.json`](evidence/lighthouse/summary.json) (`inspector-issues` in every run). Likely fix (developer to decide):
`z.config({ jitless: true })` once in the shared client code before any schema runs; do **not** add `'unsafe-eval'`.

**DEF-08 — Details page meta description not in `<head>` (S4).**
Steps: open `/event/curated:kl-0014` with a normal mobile Chrome user agent; run Lighthouse SEO, or
`curl -A "Mozilla/5.0 (Linux; Android 11) Chrome/140 Mobile" <url>` and look for `<meta name="description"`.
Expected: the description from `generateMetadata` (FR-37) in `<head>`, so every client reads it.
Actual: `</head>` ends at byte ≈ 1 160; the `<meta name="description">` (and the `<title>`) appear at byte
≈ 17 500, inside `<body>` — Next.js 16 streams metadata to non-bot user agents. Lighthouse `meta-description`
fails → SEO 90 on this page only. Bots on Next's limited-HTML list (TC-45 used one) get it in `<head>`, so share
previews work; only clients not on that list that read `<head>` only would miss it. No SRS requirement fails.
Evidence: [`event-details-mobile-median.json`](evidence/lighthouse/event-details-mobile-median.json). Options
(developer/owner): accept; or set Next's `htmlLimitedBots` so more agents get blocking metadata (costs streaming
time on the details page — measure TC-57/56 again after).

**Observation (not a defect, for TC-62's manual part):** after choosing an area or "Use my location" with the
keyboard, the pressed button disappears and focus falls back to the page start, so a keyboard user Tabs
through the map pins again. The owner's keyboard/screen-reader check should judge whether this is acceptable.

---

## 4. Coverage (from the traceability matrix after this run)

A row is ✅ only if **every** linked test case was run and passed **and** no manual, real-device, ENV-2 or
UAT part is still open. TC-02's phone part belongs to FR-01 (the real permission prompt, via TC-66), so it
blocks FR-01 but not FR-04/FR-06.

| Priority | Rows | ✅ now | Rows ✅ |
|---|---|---|---|
| **Must** | 39 (24 FR + 15 NFR) | **26** | FR-03 – FR-15, FR-17, FR-18, FR-20, FR-24, FR-25, FR-28, FR-32; NFR-03, NFR-06, NFR-08, NFR-09, NFR-12, NFR-18 |
| **Should** | 9 (5 FR + 4 NFR) | **2** | FR-21, NFR-11 |
| **Could** (built) | 11 (FR-16 deferred) | **5** | FR-34, FR-35, FR-36, FR-40, FR-41 |
| **Must + Should** | **48** | **28** | |

**v0.3 changes:** FR-05 (TC-05 ✓, TC-24 missing-link part ✓) and FR-17 (TC-21 ✓, TC-23 ✓, TC-24 missing-link part ✓)
had only DEF-05 open and no manual part; with DEF-05 accepted by the owner they are ✅. NFR-02 and NFR-05 stay open
(below) although TC-57 and TC-61 pass on ENV-1.

Must rows **not** ✅ and what they wait for:

| Row | Waiting for |
|---|---|
| FR-01 | TC-02 phone part (real permission prompt over HTTPS, TC-66 / ENV-2) |
| FR-02 | TC-08 real-phone note (Q-6) |
| FR-19 | TC-26 app part on a phone |
| FR-31 | TC-38 owner's read of the wording |
| NFR-17 | TC-69 audit (DEF-01 fixed, FR-32 now ✅) |
| NFR-01 | TC-56 final figure on ENV-2 (passes on ENV-1) |
| NFR-04 | TC-73 UAT (TC-59 e2e part passes) |
| NFR-05 | TC-62 manual part (screen reader, 200 % zoom, contrast spot-check); TC-61 re-run on ENV-2 (TC-60, TC-62 auto part and TC-61 on ENV-1 pass) |
| NFR-07 | TC-64 on ENV-2 |
| NFR-10 | TC-40 unit step (console spy in `route.test.ts`) missing |
| NFR-13 | TC-66 device matrix |
| NFR-14 | TC-37 design walk-through |
| NFR-16 | TC-68 Vercel dashboard |

Should rows not ✅: FR-22 (TC-35 phone share sheet), NFR-02 (TC-57 passes on ENV-1 with median 98; final figure on ENV-2, RT-08), NFR-15 (CI part of TC-67),
NFR-19 (TC-71 process check); **FR-26, FR-29, FR-30 are gaps — not built** (CR-03; need a second source).

---

## 5. Phase 5 exit check (test-plan §5) — **not met yet**

| # | Criterion | Status |
|---|---|---|
| 1 | Every Must row ✅ | ❌ 26 / 39 |
| 2 | Every built Should row ✅; FR-26/29/30 listed as gaps | ❌ 2 of 6 built; gaps listed ✅ |
| 3 | No open Critical/High defects | ✅ No open defects: DEF-01 – DEF-04, DEF-06, DEF-07 fixed; DEF-05 and DEF-08 (S4) accepted by owner |
| 4 | UAT done (owner + Testers A–C), NFR-04 met | ❌ not started (23–29 Dec; needs refreshed data, RT-01) |
| 5 | `test-report.md` written | 🟡 this v0.3 (UAT, ENV-2 and real-device results to add) |
| 6 | Core logic line coverage ≥ 70 % | ✅ 90.7 % |

**Next:** add the TC-40 console-spy unit test; ENV-2
(Vercel URL) for TC-57/TC-61 final runs, TC-56, TC-64; owner's real-device cases, TC-62 manual part and UAT (test-plan §7).
