# Test Cases — Happening

| Field | Value |
|---|---|
| Phase | 5 — Testing |
| Version | 0.2 — 2026-11-24: TC-24 step 2 known limitation (DEF-05 accepted); TC-57/TC-61 steps made exact after the first Lighthouse run. Results in [`test-report.md`](test-report.md) |
| Date | 2026-11-24 |
| Source | SRS v1.0 §5 user stories US-01 – US-19 (Given/When/Then) and §4 NFR-01 – NFR-19 |
| Plan | [`test-plan.md`](test-plan.md) — fixtures F-01 – F-09, environments ENV-1 – ENV-4, devices D-1 – D-6 |

> **How to read a test case.** Each case has an ID (TC-xx), the requirement(s) it proves,
> preconditions, numbered steps and the expected result. **Type**: *unit* (Vitest, pure logic),
> *e2e* (Playwright drives a real browser against the production build), *audit* (a tool or review
> checklist), *manual* (a person follows the steps, often on a real phone), *UAT* (classmates).
> **Playwright**: *Yes* = fully automatable in Playwright; *Partly* = part automated, part manual;
> *No* = Vitest only, a tool other than Playwright, or a person. Results are recorded in
> `test-report.md`, never here.

**Common preconditions (unless a case says otherwise)**
- **PRE-A:** ENV-1 running (`npm run build && npm run start`), fresh browser context, OSM tiles
  stubbed, viewport 390 × 844, dark theme.
- **PRE-B:** search responses replaced by the fixture (F-01 – F-09) and browser clock fixed at
  **Thu 17 Dec 2026 10:00 MYT** (test-plan §2.2).
- **PRE-C:** geolocation granted at the KLCC test landmark (P).
- **PRE-D:** the e2e server serves the server fixtures S-1 – S-4 (+ fillers) instead of the real
  curated file (test-plan §2.3: `E2E_CURATED_EVENTS`, always upcoming, dates relative to the run day).
  Details-page cases open a fixture by its id; they never skip for lack of data.

---

## 1. User-story cases

### US-01 — See events near me

#### TC-01 — Explain before asking for location
- **Req:** FR-01, US-01, US-10 · **Type:** e2e · **Playwright:** Yes (`e2e/location.spec.ts`)
- **Pre:** PRE-A; an init script counts calls to `navigator.geolocation.getCurrentPosition`.
- **Steps:** 1. Open `/`. 2. Read the welcome screen. 3. Tap **Use my location**.
- **Expected:** Before step 3 the sentence "We use your location only to find nearby events. It's
  rounded to about 100 m and never stored." is visible and the call count is **0**. After step 3 the
  count is **1**, called with `timeout: 10000`.

#### TC-02 — Location allowed: events within 10 km, soonest first
- **Req:** FR-01, FR-04, FR-06, US-01 · **Type:** e2e (+ real phone in TC-66) · **Playwright:** Yes (`e2e/location.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C.
- **Steps:** 1. Open `/`. 2. Tap **Use my location**.
- **Expected:** Top bar "Your location · 10 km". Heading "6 events nearby". Rows in this order:
  F-01, F-07, F-02, F-04, F-03, F-09. F-05 (22 km), F-06 (45 km) and F-08 (ended) are absent.

#### TC-03 — Each result row shows the six fields
- **Req:** FR-06, NFR-18, US-01 · **Type:** e2e · **Playwright:** Yes (`e2e/explore.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C; results shown.
- **Steps:** Inspect the rows of F-01, F-03 and F-04.
- **Expected:** Each row shows title, date and time in Malaysia time (F-01 "Thu 17 Dec" day block and
  "8:00 PM"), venue, distance to 1 decimal ("1.5 km"), category label ("Music"), price: F-01 `FREE`,
  F-03 `RM 60.00 – RM 90.00`, F-04 `Price not listed`.

#### TC-04 — Sort by distance
- **Req:** FR-06 · **Type:** e2e · **Playwright:** Yes (`e2e/explore.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C; results shown.
- **Steps:** 1. Open **Filters**. 2. Choose **Nearest**. 3. Tap **Show N events**.
- **Expected:** Order F-01 (1.5), F-02 (4), F-09 (6), F-03 (8), F-04 (9), then F-07 (no coordinates)
  last. Subtitle reads "nearest first".

#### TC-05 — Ended events are never shown
- **Req:** FR-05, NFR-19, US-01 · **Type:** unit + e2e · **Playwright:** Yes (`e2e/explore.spec.ts`; `curated.test.ts`, `filters.test.ts`)
- **Pre:** Unit: entries with an end time 1 min in the past and 1 min in the future, explicit `now`. e2e: PRE-A, PRE-B, PRE-C (fixture deliberately contains F-08).
- **Steps:** Unit: run `filterCurated` and `applyFilters`. e2e: show results; open Filters, set 50 km.
- **Expected:** The past-ended entry is dropped by the server adapter *and* by the client filter; an
  event still in progress is kept. F-08 never appears at any radius.

#### TC-06 — Server returns curated events within 50 km and 30 days through the adapter layer
- **Req:** FR-04, FR-24, FR-25 · **Type:** unit (integration of route + adapters) · **Playwright:** No (`route.test.ts`, `curated.test.ts`, `aggregator.test.ts`)
- **Pre:** Test entries at 10 km, 49 km, 51 km; starting tomorrow and in 31 days.
- **Steps:** POST a valid point to the route handler; call `filterCurated` directly.
- **Expected:** Only the 10 km and 49 km entries starting within 30 days are returned, each with
  `sourceId: "curated"` and id prefixed `curated:`; response has `sources` with the curated status.

### US-02 — Choose a spot when location is off

#### TC-07 — Location denied: pick-a-spot screen
- **Req:** FR-02, US-02 · **Type:** e2e · **Playwright:** Yes (`e2e/location.spec.ts`)
- **Pre:** PRE-A; geolocation stub answers `PERMISSION_DENIED`.
- **Steps:** 1. Open `/`. 2. Tap **Use my location**.
- **Expected:** Map of KL is shown with heading "Tap the map to choose an area" and the message
  "Location is off, so pick where to search from."; buttons **Search this map area**, **Use my
  location** and the area shortcuts are present; no search request has been sent.

#### TC-08 — Location takes longer than 10 s: pin option offered automatically
- **Req:** FR-02, US-02 · **Type:** e2e (+ manual note) · **Playwright:** Yes (`e2e/location.spec.ts`)
- **Pre:** PRE-A; geolocation stub that respects `options.timeout` (fires `TIMEOUT` after it), browser clock installed.
- **Steps:** 1. Tap **Use my location**. 2. Check "Finding your location…" is shown. 3. Advance the clock 10 s.
- **Expected:** Without any further tap the pick-a-spot screen appears with "Finding your location
  took too long. Pick a spot instead.". Stub records `timeout: 10000`.
- **Note (to verify on a real phone, ENV-4):** browsers start the 10 s timeout only *after* the
  permission prompt is answered, and while "Finding your location…" is shown there is no pick-a-spot
  button. Leave the real prompt unanswered for 20 s and record whether the user can still reach
  "Pick a spot". If not, log a defect against FR-02 ("takes longer than 10 s").

#### TC-09 — Tap the map to drop a pin and search there
- **Req:** FR-02, FR-03, US-02 · **Type:** e2e · **Playwright:** Yes (`e2e/location.spec.ts`)
- **Pre:** PRE-A, PRE-B; started with **Pick a spot on the map**.
- **Steps:** 1. Tap the map at the screen position of P.
- **Expected:** A search-point marker appears there; exactly one POST to `/api/events/search`; top
  bar "Pinned spot · 10 km"; the six default fixture events are listed.

#### TC-10 — Change the search point at any time
- **Req:** FR-03, US-02 · **Type:** e2e · **Playwright:** Yes (`e2e/location.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C; started with **Pick a spot on the map**.
- **Steps:** 1. Pan the map, tap **Search this map area**. 2. Set Category Music. 3. Tap the map at another spot. 4. Without reloading, tap **Change** in the top bar, then **Cancel, back to results**. 5. Tap **Change**, then **Use my location**.
- **Expected:** 1 and 3 each send one new search whose body is the new point (3 dp); top bar "Pinned
  spot"; Music is still applied after 3. 4: the choose-a-spot panel opens; Cancel shows the same
  results with Music still on and sends no request. 5: top bar says "Your location"; Music is still on.
- *History:* written as "predicted to fail" (Q-8): there was no way back to the location from the
  results. Fixed before execution by the **Change** button (CR-14); pre-checked in the browser
  2026-11-24 (360 px, dark + light, keyboard), still to be run as this case.

### US-03 — See events on a map

#### TC-11 — One pin per event with coordinates; list shows the same events
- **Req:** FR-07, FR-08, US-03 · **Type:** e2e · **Playwright:** Yes (`e2e/map.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C; results shown.
- **Steps:** Count event markers and the search-point marker on the map; count list rows.
- **Expected:** 5 event markers (F-01, F-02, F-03, F-04, F-09 — not F-07) + 1 search-point marker;
  6 list rows; every marked event is also in the list.

#### TC-12 — Selecting a pin highlights its row; the row opens the details
- **Req:** FR-07, US-03 · **Type:** e2e · **Playwright:** Yes (`e2e/map.spec.ts`)
- **Pre:** As TC-11.
- **Steps:** 1. Click the F-03 marker. 2. Repeat with keyboard: Tab to a marker, press Enter. 3. Activate the highlighted row's title.
- **Expected:** The marker is shown selected with the event's short name; the F-03 row is
  highlighted and scrolled into view; step 3 opens `/event/<F-03 id>` (fixture ids are mapped to
  the details page by PRE-D in TC-21; here only the URL is checked).

#### TC-13 — Changing a filter changes pins and list together
- **Req:** FR-08, FR-14, US-03 · **Type:** e2e · **Playwright:** Yes (`e2e/map.spec.ts`)
- **Pre:** As TC-11.
- **Steps:** 1. Filters → Category **Music** → apply. 2. Filters → Distance **50** → apply.
- **Expected:** After 1: rows F-01, F-03; markers F-01, F-03. After 2 (Music still on): same two (F-06
  is Sports). Then clear Music: 8 rows (adds F-05, F-06), 7 markers. Distance circle/label shows 50 km.

#### TC-14 — Event without coordinates: in the list as "not on map", no pin
- **Req:** FR-09, US-03 · **Type:** e2e · **Playwright:** Yes (`e2e/map.spec.ts`)
- **Pre:** As TC-11. Only possible with fixtures: the curated schema requires coordinates.
- **Steps:** Find F-07 in the list and on the map; set distance to 2 km.
- **Expected:** F-07 row says "<venue> · not on map" and has no distance; no marker for F-07. At 2 km
  the list shows F-01 and F-07 (an event with no location is not removed by the distance filter).

### US-04 — Filter results

#### TC-15 — Distance filter options and default
- **Req:** FR-10, FR-04 · **Type:** e2e + unit · **Playwright:** Yes (`e2e/filters.spec.ts`; `filters.test.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C.
- **Steps:** Open Filters; read the distance choices; apply 2, 5, 10, 25, 50 in turn.
- **Expected:** Exactly 2, 5, 10, 25, 50 km offered, 10 selected by default. Row counts: 2 km → 2,
  5 km → 3 (F-01, F-07, F-02), 10 → 6, 25 → 7 (+F-05), 50 → 8 (+F-06).

#### TC-16 — Date filter windows in Malaysia time
- **Req:** FR-11, US-04 · **Type:** unit + e2e · **Playwright:** Yes (`filters.test.ts`; `e2e/filters.spec.ts`)
- **Pre:** Unit: `whenWindow` with `now` at Thu 10:00 MYT, Sat 23:30 MYT, Sun 23:59 MYT and Thu 23:30 MYT (= 15:30 UTC). e2e: PRE-A, PRE-B, PRE-C; browser time zone set to `Europe/London` to prove MYT is used.
- **Steps:** Unit: compare windows. e2e: Filters → each date option → apply.
- **Expected:** Today = now → next MYT midnight; This weekend = Sat 00:00 – Mon 00:00 MYT (from "now"
  if already the weekend); 7 / 30 days from now; default Next 30 days. e2e counts: Today → F-01;
  This weekend → F-07, F-02, F-04, F-03; Next 7 days → 6; Next 30 days → 6.

#### TC-17 — Category filter is multi-select
- **Req:** FR-12, US-04 · **Type:** e2e · **Playwright:** Yes (`e2e/filters.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C.
- **Steps:** Filters: check the 8 category names; select Music; then also Food & Markets; apply.
- **Expected:** The 8 categories of FR-12 are listed, none selected = all. Music → F-01, F-03.
  Music + Food & Markets → F-01, F-02, F-03. The live count on the apply button matches the rows.

#### TC-18 — Price filter: Free only, maximum price, "Price not listed"
- **Req:** FR-13, US-04 · **Type:** e2e + unit · **Playwright:** Yes (`e2e/filters.spec.ts`; `filters.test.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C.
- **Steps:** Filters → Price **Free only** → apply; then **Max RM 50** → apply; then **All**.
- **Expected:** Free only → F-01 only. Max RM 50 → F-01, F-07, F-02, F-09 (F-03 from RM 60 and F-04
  with no price hidden). All → 6 rows incl. F-04 labelled "Price not listed".

#### TC-19 — Filters combine (AND) without a page reload
- **Req:** FR-14, US-04 · **Type:** e2e · **Playwright:** Yes (`e2e/filters.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C; a marker `window.__noReload = true` set after results load; request counter on `/api/events/search`.
- **Steps:** Filters → This weekend + Music → apply.
- **Expected:** Only F-03 (US-04 example). `window.__noReload` is still true (no navigation) and no
  new search request was sent (filtering runs on the device, ADR-06).

#### TC-20 — Empty state suggests a wider radius
- **Req:** FR-15, US-04 · **Type:** e2e · **Playwright:** Yes (`e2e/filters.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C.
- **Steps:** 1. Filters → Today + Sports → apply. 2. Tap **Widen to 25 km**. 3. Set 50 km with the same filters.
- **Expected:** Step 1: "0 events nearby", "No events match" and "Try a wider area, fewer filters or
  a different search.", button "Widen to 25 km". Step 2: radius becomes 25 km, other filters kept.
  At 50 km no Widen button is shown (largest radius).
- **SRS wording:** US-04 says "No events match your filters"; the app says "No events match" — see Q-3.

### US-05 — View event details

#### TC-21 — Details page shows every FR-17 field and the source name
- **Req:** FR-17, FR-32, NFR-18, US-05 · **Type:** e2e · **Playwright:** Yes (`e2e/detail.spec.ts`)
- **Pre:** PRE-A, PRE-D (run once for each server fixture E = S-1 every field + image, S-2 no price / no
  end / no address / no image, S-3 free, S-4 Sabah).
- **Steps:** Open `/event/<E.id>`.
- **Expected:** Title; day and time with "(Malaysia time)" matching E.start/E.end formatted in MYT;
  venue name and address; category label; price formatted as in NFR-18; description; "Source:
  Curated by Happening"; image with `alt` = title, loaded (not broken), **if** E has `imageUrl`
  (S-1), otherwise no image (closes Q-2 for FR-17). After arriving from a search, the
  distance from the search point is shown.

#### TC-22 — "View official page" opens the source page in a new tab
- **Req:** FR-18, US-05 · **Type:** e2e · **Playwright:** Yes (`e2e/detail.spec.ts`)
- **Pre:** PRE-A, PRE-D; outbound navigation intercepted (no real visit to the organiser site).
- **Steps:** Tap **View official page**; also check the external-link button on a list row.
- **Expected:** A new page opens at exactly E.url (https); the link has `target="_blank"` and
  `rel="noopener noreferrer"`.

#### TC-23 — Event with no price shows "Price not listed"
- **Req:** FR-17, FR-13, US-05 · **Type:** e2e · **Playwright:** Yes (`e2e/detail.spec.ts`)
- **Pre:** PRE-A, PRE-D (server fixture S-2, `price: null`).
- **Steps:** Open its details page.
- **Expected:** Price line reads "Price not listed".

#### TC-24 — Missing and ended events get a friendly page
- **Req:** FR-05, FR-17 · **Type:** e2e + unit · **Playwright:** Yes (`e2e/detail.spec.ts`; `event-schema.test.ts`)
- **Pre:** PRE-A.
- **Steps:** 1. Open `/event/curated:does-not-exist`. 2. Open `/event/%E0%A4%A` (malformed). 3. Unit: `isEnded` at end − 1 ms, end, end + 1 ms; event with no end uses start.
- **Expected:** 1: "This event isn't available" + **Find events near you** link to `/`. 2: no server
  error page (fallback title "Event — Happening" or a 400/404 page, not a 500). 3: ended only after
  the end time. (The "This event has ended" page is checked by e2e when the curated file has an
  ended entry on the run date.)
- **Known limitation:** step 2 gets Next.js 16's own plain-text HTTP 500 before any app code runs (DEF-05,
  accepted by the owner 2026-11-24). Its e2e test stays `test.fail()` so a Next.js fix shows up; steps 1 and 3 decide the case.

#### TC-25 — Data-source and OpenStreetMap attribution
- **Req:** FR-32, NFR-17 · **Type:** e2e · **Playwright:** Yes (`e2e/detail.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C.
- **Steps:** Look at the map corner on Explore, the About page and a details page.
- **Expected:** "© OpenStreetMap" attribution visible on the map and not covered by the list sheet
  at 360 px; About links to `https://www.openstreetmap.org/copyright`; details page shows the source name.

### US-06 and US-16 — Directions

#### TC-26 — Directions open Google Maps (or Waze) to the venue
- **Req:** FR-19, US-06 · **Type:** e2e + unit (+ phone) · **Playwright:** Yes (`e2e/detail.spec.ts`; `links.test.ts`)
- **Pre:** PRE-A, PRE-D.
- **Steps:** Read the href of **Directions (Google Maps)** and **Open in Waze instead**; on a phone, tap each.
- **Expected:** Google Maps directions URL with the venue's lat,lon as destination; Waze URL with the
  same point and navigate on; both `target="_blank"` + `rel="noopener noreferrer"`. Phone: the app
  (or web map) opens at the venue.

#### TC-27 — "By public transport" opens Google Maps in transit mode
- **Req:** FR-38, US-16 · **Type:** e2e + unit · **Playwright:** Yes (`e2e/detail.spec.ts`; `links.test.ts`)
- **Pre:** PRE-A, PRE-D.
- **Steps:** Read the href of **By public transport**.
- **Expected:** Same destination as TC-26 plus `travelmode=transit`; opens in a new tab.

### US-07 — Save events

#### TC-28 — Bookmark and un-bookmark; Saved screen
- **Req:** FR-20, US-07 · **Type:** e2e · **Playwright:** Yes (`e2e/saved.spec.ts`)
- **Pre:** PRE-A, PRE-D.
- **Steps:** 1. On E's details tap **Save event**. 2. Open the **Saved** tab. 3. Back on details, tap the button again. 4. Open Saved.
- **Expected:** 1: button `aria-pressed="true"`, label "Saved — remove from Saved". 2: E listed.
  3: `aria-pressed="false"`. 4: "Nothing saved yet".

#### TC-29 — Bookmarks survive closing the browser
- **Req:** FR-20, NFR-11, US-07 · **Type:** e2e · **Playwright:** Yes (`e2e/saved.spec.ts`)
- **Pre:** As TC-28, step 1 done.
- **Steps:** Save the context's storage state, close the browser, open a new browser with that state, open `/saved`.
- **Expected:** E still listed.

#### TC-30 — Ended saved events are labelled "Ended"
- **Req:** FR-21, US-07 · **Type:** e2e · **Playwright:** Yes (`e2e/saved.spec.ts`)
- **Pre:** PRE-A; `localStorage["happening.bookmarks.v1"]` seeded with one event ended yesterday and one starting tomorrow (fixture copies).
- **Steps:** Open `/saved`.
- **Expected:** Both listed; only the ended one shows the "Ended" tag.

#### TC-31 — "Clear saved data" removes bookmarks and the offline list
- **Req:** NFR-11, FR-40, US-07, US-18 · **Type:** e2e · **Playwright:** Yes (`e2e/saved.spec.ts`)
- **Pre:** PRE-A, PRE-B; one bookmark and one completed search (so both storage keys exist).
- **Steps:** Open About → **Clear saved data**; open Saved.
- **Expected:** Status text "No saved events on this phone."; `happening.bookmarks.v1` and
  `happening.lastsearch.v1` are gone from `localStorage`; Saved shows "Nothing saved yet".

#### TC-32 — Bookmarks never leave the device
- **Req:** FR-20, NFR-11 · **Type:** e2e · **Playwright:** Yes (`e2e/saved.spec.ts`)
- **Pre:** As TC-28; all requests recorded.
- **Steps:** Save and un-save E; reload Saved.
- **Expected:** No request (to our server or any other origin) carries bookmark data; bookmarks
  exist only under the `localStorage` key; no cookies are set.

### US-08 — Share an event

#### TC-33 — Share sheet receives title, date and link
- **Req:** FR-22, US-08 · **Type:** e2e · **Playwright:** Yes (`e2e/share.spec.ts`)
- **Pre:** PRE-A, PRE-D; `navigator.share` stubbed to record its argument.
- **Steps:** Tap **Share event**.
- **Expected:** Called once with `title` = E.title, `text` = "E.title — <date>", `url` = the
  details page URL. No "Link copied" message.

#### TC-34 — No share support: link copied
- **Req:** FR-22, US-08 · **Type:** e2e · **Playwright:** Yes (`e2e/share.spec.ts`)
- **Pre:** PRE-A, PRE-D; `navigator.share` removed; clipboard permission granted.
- **Steps:** Tap **Share event**; read the clipboard.
- **Expected:** "Link copied" shown (and announced via the `aria-live` status); clipboard holds the details URL.

#### TC-35 — Native share sheet on real phones
- **Req:** FR-22, US-08 · **Type:** manual · **Playwright:** No
- **Pre:** ENV-2 on D-2 (Android Chrome) and D-3 (iOS Safari).
- **Steps:** Open an event, tap Share, choose a chat app, send to yourself.
- **Expected:** The system share sheet opens; the message contains the title, date and link; the link opens the same event.

### US-09 — Reliable results

#### TC-36 — One source fails or hangs: other results still shown with a notice
- **Req:** FR-28, FR-24, NFR-12, US-09 · **Type:** unit + e2e · **Playwright:** Yes (`aggregator.test.ts`; `e2e/explore.spec.ts`)
- **Pre:** Unit: three fake adapters — OK, throws, never resolves; fake timers. e2e: PRE-A, PRE-C; fixture response with `sources: [curated ok, eventbrite ok:false]`.
- **Steps:** Unit: run `searchAllSources`, advance 5 s. e2e: show results.
- **Expected:** Unit: resolves after 5 s (not later) with the OK source's events and statuses
  `ok:false` for the other two; the log line names only the source id. e2e: curated events listed
  and "Some sources are unavailable right now." shown.

#### TC-37 — Adding a source needs only an adapter file and a registry entry
- **Req:** NFR-14 · **Type:** audit (design review) · **Playwright:** No
- **Pre:** Code on `main`.
- **Steps:** Walk through adding a dummy adapter on a scratch branch: create `src/lib/sources/dummy.ts` implementing `SourceAdapter`, add it to `ALL_ADAPTERS`, enable via `ENABLED_SOURCES`; run unit tests and build; `git diff --stat`.
- **Expected:** Only those two files (+ env) change; no file under `src/components/` or `src/app/` is
  touched; dummy events appear in search results. Scratch branch discarded.

### US-10 — Know my privacy

#### TC-38 — Privacy page content
- **Req:** FR-31, US-10 · **Type:** e2e + manual read · **Playwright:** Partly (`e2e/privacy.spec.ts`)
- **Pre:** PRE-A.
- **Steps:** Open **About** tab; compare with security-privacy.md §5 points 1–6.
- **Expected:** States that location (or a picked spot) is used only to find events, is rounded to
  about 100 m, is not stored or logged by the server; lists what stays on the phone (saved events,
  last search) and that location is never saved; names OSM and the curated source; has **Clear saved
  data** and a contact/repository link. Manual: wording is understandable (owner reads it).

#### TC-39 — Search point is rounded to 3 decimals before it leaves the device
- **Req:** NFR-09, US-10 · **Type:** e2e + unit · **Playwright:** Yes (`e2e/privacy.spec.ts`; `geo.test.ts`, `route.test.ts`)
- **Pre:** PRE-A; geolocation set to a landmark with 6 decimals; all requests recorded.
- **Steps:** 1. Use my location. 2. Tap the map at an arbitrary pixel. 3. Search this map area.
- **Expected:** Every `/api/events/search` body is exactly `{"lat":…,"lon":…}` with ≤ 3 decimals and
  no other fields; method POST (coordinates never in a URL); no other request (except OSM tiles,
  which are the map view itself) contains the coordinates. Unit: the server re-rounds too.

#### TC-40 — The server does not store or log coordinates
- **Req:** NFR-10, US-10 · **Type:** audit + unit · **Playwright:** Partly
- **Pre:** ENV-1 started with stdout/stderr written to a scratch file; e2e suites run against it.
- **Steps:** 1. Unit: spy on `console.*` while the route handles valid, invalid and oversize bodies; invalid curated entry. 2. After the whole e2e run, search the server log for the test landmark coordinates (all spellings: 3.158 / 3.1579…). 3. Code review: every `console.*` in `src/` (today: 2, in `curated.ts` and `aggregator.ts`); no file writes, no database.
- **Expected:** No log line contains a coordinate or a request body; error messages name the field
  only; no persistence on the server. Result reported as a count of matches (must be 0).

### US-11 — Maintain curated events

#### TC-41 — Valid entries appear; invalid entries are skipped with a warning
- **Req:** FR-25, US-11 · **Type:** unit · **Playwright:** No (`curated.test.ts`, `event-schema.test.ts`)
- **Pre:** Test entries: one valid; one without `url`; one with `http://` url; one with `javascript:` url; plus the real `data/curated-events.json`.
- **Steps:** Run `filterCurated`; validate every entry of the real file with `CuratedEventSchema`.
- **Expected:** Valid entry returned; the three invalid ones skipped, each with one `console.warn`
  containing only its id. All 46 real entries pass the schema (a failure here is a data defect).

### US-12 — Free this week

#### TC-42 — "Free this week" chip
- **Req:** FR-34, US-12 · **Type:** e2e + unit · **Playwright:** Yes (`e2e/chips.spec.ts`; `filters.test.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C.
- **Steps:** 1. Filters → distance 25 km. 2. Tap **Free this week**. 3. Tap it again. 4. In Filters set Free only + Next 7 days manually.
- **Expected:** 2: chip `aria-pressed="true"` with check mark; rows F-01, F-05. 3: price back to
  All, date back to Next 30 days, distance still 25 km; 7 rows. 4: chip shows pressed.

### US-13 — Find an event by name

#### TC-43 — Search box
- **Req:** FR-35, US-13 · **Type:** e2e + unit · **Playwright:** Yes (`e2e/search.spec.ts`; `filters.test.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C.
- **Steps:** 1. Type `jazz bukit`. 2. Clear; type `CAFE`. 3. Type `market`, then Filters → Free only. 4. Filters → **Reset**. 5. Empty the box.
- **Expected:** 1: F-01 only. 2: F-01 (case and accents ignored). 3: empty state suggesting a
  different search. 4: filters back to defaults, text `market` kept → F-02. 5: 6 rows. No search request is sent while typing.

### US-14 — What's on today

#### TC-44 — "Today" chip
- **Req:** FR-36, US-14 · **Type:** e2e + unit · **Playwright:** Yes (`e2e/chips.spec.ts`; `filters.test.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C; browser clock Thu 17 Dec 10:00 MYT; second run at 21:00 MYT with an extra fixture event that ended at 19:00 today.
- **Steps:** 1. Tap **Today**. 2. Tap **Today** again. 3. Set Category Music, tap **Today**, then **Today** again. 4. Tap **Today**, then **Free this week**.
- **Expected:** 1: only F-01; chip `aria-pressed="true"`. 2: date back to Next 30 days; 6 rows.
  3: Music stays selected throughout (only the date changes). 4 (US-14 third criterion, CR-14):
  **Free this week** pressed, **Today** not pressed (only one date chip can be on). Second run: the
  event that ended at 19:00 is not listed.

### US-15 — Good-looking shared links

#### TC-45 — Preview card metadata
- **Req:** FR-37, US-15 · **Type:** e2e + manual · **Playwright:** Partly (`e2e/share.spec.ts`; `links.test.ts`)
- **Pre:** PRE-A, PRE-D (run for S-1 with an image and S-2 without).
- **Steps:** 1. Fetch `/event/<E.id>` HTML with a chat-bot user agent; read `<title>`, `og:title`, `og:description`, `og:image`, `twitter:card`. 2. Same for a missing id. 3. Manual (ENV-2): paste the link in WhatsApp or Telegram.
- **Expected:** 1: title "E.title — Happening"; description "<date> · <venue> · <price>"; `og:image`
  only if E has an image (`summary_large_image` then, else `summary`). 2: "Event — Happening", no
  event description. 3: the chat shows the card. `og:image` equals E.imageUrl for S-1 (Q-2 closed).

### US-17 — Calendar reminders

#### TC-46 — "Add to calendar" downloads a correct .ics file
- **Req:** FR-23, US-17 · **Type:** e2e + unit · **Playwright:** Yes (`e2e/calendar.spec.ts`; `ics.test.ts`)
- **Pre:** PRE-A, PRE-D (run for S-1 with an end time and S-2 without).
- **Steps:** Tap **Add to calendar**; capture the download; parse it.
- **Expected:** File name ends `.ics`; `BEGIN:VCALENDAR`/`VEVENT`; `SUMMARY` = title; `DTSTART`/`DTEND`
  in UTC equal to E.start/E.end (start + 2 h if no end); `LOCATION` = venue; `URL` = E.url; lines
  folded ≤ 75 bytes; status message "Calendar file downloaded…". No network request is made.

#### TC-47 — Reminders: day before and hour before, only if still in the future
- **Req:** FR-39, US-17 · **Type:** unit · **Playwright:** No (`ics.test.ts`)
- **Pre:** `buildIcs(event, now)` with now = start − 3 days, start − 5 h, start − 30 min.
- **Steps:** Count `VALARM` blocks and their `TRIGGER`.
- **Expected:** 2 alarms (`-P1D`, `-PT1H`); 1 alarm (`-PT1H`); 0 alarms. A newline in the title cannot inject a `TRIGGER` line.

#### TC-48 — .ics and reminders in a real phone calendar
- **Req:** FR-23, FR-39, US-17 · **Type:** manual · **Playwright:** No
- **Pre:** ENV-2; D-2 (Google Calendar) and D-3 (Apple Calendar); an event more than a day away.
- **Steps:** Add to calendar → open the file → add it.
- **Expected:** Event at the correct Malaysia time with venue and link; two reminders (1 day, 1 hour) listed. Remove it afterwards.

### US-18 — Use the app with no signal

#### TC-49 — App pages open offline after a first visit
- **Req:** FR-40, US-18 · **Type:** e2e · **Playwright:** Yes (`e2e/offline.spec.ts`)
- **Pre:** PRE-A with service workers **allowed**; visit `/`, `/about`, `/saved` online and wait until the worker controls the page.
- **Steps:** `context.setOffline(true)`; reload `/`; open `/about`, `/saved`; open a never-visited `/event/<id>`.
- **Expected:** `/`, `/about`, `/saved` render with styles; the unvisited page lands on the cached home page (not a browser error page).

#### TC-50 — Last search shown offline with a dated notice; no search point stored
- **Req:** FR-40, NFR-09, US-18 · **Type:** e2e · **Playwright:** Yes (`e2e/offline.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C; one successful search; then search requests made to fail (offline).
- **Steps:** 1. Inspect `localStorage["happening.lastsearch.v1"]`. 2. Go offline; tap the map to search again. 3. Go online; tap **Try again**.
- **Expected:** 1: holds `savedAt` and the events only — no `lat`/`lon` of the search point anywhere
  in `localStorage`. 2: the saved events are listed with "Can't reach the server. Showing events
  saved on <date>…" and a **Try again** button. 3: fresh results; notice gone.

#### TC-51 — Installable to the home screen
- **Req:** FR-33, US-18 · **Type:** manual + e2e · **Playwright:** Partly (`e2e/pwa.spec.ts`; `manifest.test.ts`)
- **Pre:** e2e: PRE-A. Manual: ENV-2 on D-2 and D-3.
- **Steps:** e2e: fetch `/manifest.webmanifest`; fetch each icon; check `apple-touch-icon` link. Manual: Android Chrome → Install app; iOS Safari → Share → Add to Home Screen; open from the icon.
- **Expected:** e2e: name/short name "Happening", `display: standalone`, icons 192/512 + maskable
  return 200 with PNG type. Manual: icon on the home screen; opens without browser bars; works offline after a first visit.

### US-19 — Browse an area without sharing location

#### TC-52 — Area buttons with counts on the welcome and pick-a-spot screens
- **Req:** FR-41, US-19 · **Type:** e2e · **Playwright:** Yes (`e2e/areas.spec.ts`)
- **Pre:** PRE-A, PRE-B; KL centre request → main fixture (at 50 km: 8 events); KK centre request → KK fixture (2 events); a third run where KK returns 0 events.
- **Steps:** Open `/`; read the "Or browse an area" section; tap **Pick a spot on the map** and read it again.
- **Expected:** Both screens show "Klang Valley — 8 events" and "Kota Kinabalu — 2 events"; with 0 events "No events yet".

#### TC-53 — Tapping an area: list matches the count, 50 km, defaults, no own location
- **Req:** FR-41, NFR-09, US-19 · **Type:** e2e (+ unit `areas.test.ts`) · **Playwright:** Yes (`e2e/areas.spec.ts`)
- **Pre:** As TC-52; geolocation call counter.
- **Steps:** 1. Tap **Kota Kinabalu**. 2. Open Filters and read every setting.
- **Expected:** Top bar "Kota Kinabalu · 50 km"; row count = the number on the button (2); filters
  at defaults except 50 km; geolocation calls during step 1 = 0; the
  only search bodies sent are the public area centres. Unit: `areaFilters()` = defaults + 50 km and
  `countForArea` equals `applyFilters(...).length`. (Choosing an area *after* changing filters can
  only be reached in the browser by reloading, because the area buttons are hidden once results are
  shown — same cause as the TC-10 finding — so the "reset to defaults" part is proven by the unit test.)

#### TC-54 — Counts unavailable: buttons still work
- **Req:** FR-41, US-19 · **Type:** e2e · **Playwright:** Yes (`e2e/areas.spec.ts`)
- **Pre:** PRE-A; the first two search requests (the counts) answer HTTP 500, later ones the fixture.
- **Steps:** Open `/`; tap **Klang Valley**.
- **Expected:** Buttons show names without a number (no "undefined", no error); tapping searches and lists the KL fixture events.

#### TC-55 — After an area, tapping the map returns to "Pinned spot"
- **Req:** FR-41, FR-03, US-19 · **Type:** e2e · **Playwright:** Yes (`e2e/areas.spec.ts`)
- **Pre:** As TC-53, after tapping Klang Valley.
- **Steps:** Tap the map.
- **Expected:** Top bar "Pinned spot · 50 km"; a new search from the tapped point.

---

## 2. Non-functional cases

#### TC-56 — First results within 3 s on Fast 4G
- **Req:** NFR-01 · **Type:** e2e (performance) · **Playwright:** Yes (`e2e/perf.spec.ts`)
- **Pre:** ENV-1 (and ENV-2 for the final figure); real (unmocked) API; Chrome DevTools "Fast 4G"
  network preset and 4× CPU slowdown via CDP — record the exact values used; home page already loaded.
- **Steps:** Tap **Klang Valley** (sets the search point); time until the first result row is visible. Repeat 5 times with cold API cache.
- **Expected:** Every run ≤ 3.0 s; report median and maximum. Needs PRE-D (an empty result would time the empty state instead).

#### TC-57 — Lighthouse Performance ≥ 80 (mobile, home page)
- **Req:** NFR-02 · **Type:** audit · **Playwright:** No (Lighthouse CLI 13.6 via `npx`)
- **Pre:** ENV-1, then ENV-2.
- **Steps:** `CHROME_PATH=<Playwright Chromium> npx lighthouse@13.6.0 <url>/ --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --chrome-flags="--headless=new --no-sandbox" --output=json`, 3 runs, default (simulated) throttling. The welcome screen loads no map tiles, so a blocked network does not change this score.
- **Expected:** Median Performance score ≥ 80; JSON (screenshots stripped) or a summary saved in `evidence/lighthouse/`.

#### TC-58 — Usable from 360 px to desktop, no horizontal scrolling
- **Req:** NFR-03 · **Type:** e2e · **Playwright:** Yes (`e2e/responsive.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C; viewports 360 × 740, 768 × 1024, 1280 × 800; `colorScheme` dark and light.
- **Steps:** At each size and theme open S-1, S-2/S-3 with results, S-7 Filters, S-4 details, S-5 Saved, S-6 About.
- **Expected:** `document.documentElement.scrollWidth <= innerWidth` on every screen (36 checks);
  primary buttons visible and clickable; no text cut off in the top bar beyond the designed ellipsis. Screenshots saved for a manual glance.

#### TC-59 — Details within 3 taps after results appear
- **Req:** NFR-04 · **Type:** UAT + e2e · **Playwright:** Partly (`e2e/explore.spec.ts`)
- **Pre:** e2e: results shown. UAT: tester who has not used the app, ENV-2.
- **Steps:** e2e: count the user actions from the results list to `/event/…` (expected path: tap a row title = 1; via the map: pin → row title = 2). UAT: "Find an event that interests you and open its details" — observer counts taps after the list appears.
- **Expected:** e2e ≤ 3 actions. UAT: every tester (owner, Tester A, B, C) ≤ 3 taps.

#### TC-60 — Automated WCAG 2.1 AA scan (axe)
- **Req:** NFR-05 · **Type:** audit · **Playwright:** Yes (`e2e/a11y.spec.ts`)
- **Pre:** PRE-A, PRE-B, PRE-C; tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`; dark and light.
- **Steps:** Run axe on S-1, S-2/S-3 (results), S-3 pick-a-spot, S-7 open, S-4, S-5 (empty and with items), S-6, empty state.
- **Expected:** 0 violations of impact serious or critical; any moderate/minor recorded as defects (S3/S4). Known limitation: axe cannot judge everything (see TC-62).

#### TC-61 — Lighthouse Accessibility ≥ 90
- **Req:** NFR-05 · **Type:** audit · **Playwright:** No (Lighthouse CLI)
- **Pre:** ENV-1 then ENV-2; pages `/`, `/about`, `/saved`, `/event/<E.id>`, and Explore with results (S-2).
- **Steps:** `--only-categories=accessibility`, mobile, light and dark (`--chrome-flags="--headless=new --no-sandbox --force-dark-mode --blink-settings=preferredColorScheme=0"`). Explore needs a tap, so use the user flow `evidence/lighthouse/explore-flow.mjs` (navigate `/` → tap Klang Valley → snapshot).
- **Expected:** Each page ≥ 90. Map-pin `target-size` findings are covered by WCAG 2.5.8's equivalent exception (each pin is also a list row) and are not defects.

#### TC-62 — Manual accessibility checklist (ui-ux.md §6)
- **Req:** NFR-05 · **Type:** manual · **Playwright:** Partly (target sizes, keyboard reachability and reduced motion in `e2e/a11y.spec.ts`)
- **Pre:** ENV-1 on desktop Chrome; ENV-2 with TalkBack (D-2) and VoiceOver (D-3).
- **Steps:** 1. Keyboard only: welcome → pick a spot → select a pin (Enter) → open filters (Esc closes, focus returns) → details → save → share → back. 2. Measure every interactive element's box (automated: ≥ 44 × 44 px, inline text links excepted per WCAG 2.5.8). 3. 200 % zoom at 1280 px. 4. `prefers-reduced-motion: reduce` — sheet and pin do not animate. 5. Screen reader: headings (one `h1` per screen), landmarks, button names, result count and "Link copied" announced. 6. Contrast spot-check of the §4 tokens in both themes.
- **Expected:** Every item on the ui-ux §6 checklist ticked; failures logged as defects (S2 if they block a core flow).

#### TC-63 — API keys never in the repo or the browser
- **Req:** NFR-06 · **Type:** audit · **Playwright:** Partly
- **Pre:** Full git history; production build in `.next/`.
- **Steps:** 1. Scan `git log -p --all` for token patterns (Eventbrite/PredictHQ keys, `Bearer`, `sk_`, private keys) and for committed `.env*` other than `.env.example`. 2. `grep -r NEXT_PUBLIC_ src`. 3. Search `.next/static` for `EVENTBRITE`, `PREDICTHQ`, `TOKEN`. 4. Playwright: record all browser requests during a full flow; check no request header or body contains a key.
- **Expected:** No secrets found; no `NEXT_PUBLIC_` secret; `.env.example` has placeholders only.

#### TC-64 — Served over HTTPS only
- **Req:** NFR-07 · **Type:** manual · **Playwright:** Partly (`request` against ENV-2)
- **Pre:** ENV-2 exists (Phase 6).
- **Steps:** Request `http://<vercel-url>/`; request `https://…/` and read headers; open in a browser and check the padlock.
- **Expected:** HTTP redirects (301/308) to HTTPS; `Strict-Transport-Security` present; certificate valid.

#### TC-65 — Server input validation
- **Req:** NFR-08 · **Type:** unit + e2e (API) · **Playwright:** Yes (`route.test.ts`; `e2e/api.spec.ts`)
- **Pre:** ENV-1.
- **Steps:** POST to `/api/events/search`: lat 90.0001; lon −180.0001; lat as string; missing lon; extra field `radius`; not JSON; empty body; 2 KB body; also `GET`.
- **Expected:** 400 `invalid_request` naming the field (never echoing the values) for the first six
  cases, 400 for empty, 413 for 2 KB, 405 for GET; every response `Cache-Control: no-store`.
  Note: radius and dates are not server inputs (filtering runs on the device, ADR-06) — see Q-5.

#### TC-66 — Device and browser compatibility matrix
- **Req:** NFR-13 · **Type:** manual · **Playwright:** Partly (D-1 Chrome runs every e2e suite; since 2026-11-27 D-3a WebKit as an emulated iPhone 15 runs every e2e suite in CI, except TC-56 — test-plan §3.2)
- **Pre:** ENV-2; devices D-2 – D-6 from test-plan §3.2.
- **Steps (smoke, ~10 min per browser):** open the app; Use my location (allow); filters (one of each); open details; save; share; add to calendar; Saved; About → Clear saved data; rotate phone.
- **Expected:** Every step works on every row of the matrix; browser + version recorded; any row not available is reported as a gap.
- **Note (2026-11-27):** a green WebKit CI run is partial, automated evidence for D-3 (Safari's engine, iPhone viewport, touch, user agent). It does not replace the real-iPhone steps: Add to Home Screen, the real location prompt, the share sheet, opening the `.ics` in Calendar, iOS viewport/keyboard behaviour. TC-66 passes only when the D-3 row runs on a real iPhone or the owner accepts it as a gap.

#### TC-67 — Core logic coverage ≥ 70 % and lint passes
- **Req:** NFR-15 · **Type:** audit · **Playwright:** No
- **Pre:** `@vitest/coverage-v8` added.
- **Steps:** `npx vitest run --coverage --coverage.include='src/lib/**'`; `npm run lint`.
- **Expected:** Line coverage ≥ 70 % for `src/lib/sources/*`, `filters.ts`, `geo.ts` (dedupe not built,
  FR-29); lint passes with 0 errors. CI part checked after Phase 6 adds a workflow.

#### TC-68 — Running cost is RM0
- **Req:** NFR-16 · **Type:** manual · **Playwright:** No
- **Pre:** ENV-2; Vercel dashboard (owner).
- **Steps:** Check the Vercel plan (Hobby), usage page, no paid add-ons; `package.json` and `.env.example` reference no paid service.
- **Expected:** Plan is free; usage within Hobby limits; no billing method charged.

#### TC-69 — Source attribution, caching and display rules followed
- **Req:** NFR-17 · **Type:** audit · **Playwright:** No
- **Pre:** architecture.md §5–6 rules; OSM tile usage policy; curated guide.
- **Steps:** Check: OSM attribution visible (TC-25); tiles loaded from the standard OSM servers at
  normal user volume (no bulk prefetch, no offline tile caching — `sw.js` skips cross-origin); every
  curated entry links to its official page (`url` https, spot-check 10 links open the right event);
  no data copied from sources that forbid it (Ticket2u pages exported by the owner — confirm terms note).
- **Expected:** Every rule in architecture §5–6 met or a gap recorded.

#### TC-70 — Malaysia time and RM formatting
- **Req:** NFR-18 · **Type:** unit + e2e · **Playwright:** Yes (`format.test.ts`; `e2e/explore.spec.ts`)
- **Pre:** Unit: fixed ISO strings with `+08:00` and `Z`. e2e: PRE-A, PRE-B, browser `timezoneId: "America/New_York"`.
- **Steps:** Unit: `formatPrice`, `formatEventDate`, `formatEventWhen`. e2e: read F-01's row and details.
- **Expected:** `RM 25.00`; `RM 20.00 – RM 80.00`; non-MYR `USD 15.00`; free `FREE`; null "Price
  not listed". F-01 shows 8:00 PM Thu 17 Dec even though the browser is in New York.

#### TC-71 — Curated data reviewed weekly; ended events never shown
- **Req:** NFR-19 · **Type:** manual (process) · **Playwright:** No
- **Pre:** Git history of `data/curated-events.json`; maintenance checklist (Phase 7).
- **Steps:** List commits touching the file during Phase 5; count entries already ended on the review date; ended-event filtering is proven by TC-05.
- **Expected:** At least one review commit per week during the test period; the review keeps enough upcoming events (E-6).

#### TC-72 — Security headers and untrusted text rendered safely
- **Req:** security-privacy T-03, T-04, §7 (FR-18) · **Type:** e2e · **Playwright:** Yes (`e2e/security.spec.ts`)
- **Pre:** ENV-1 (production, so CSP is on); PRE-B (F-09 title contains HTML).
- **Steps:** 1. Read response headers of `/`, `/event/<id>`, `/api/events/search`. 2. Show results; watch for dialogs and console CSP errors.
- **Expected:** `Content-Security-Policy` (incl. `frame-ancestors 'none'`), `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` with `geolocation=(self)`.
  F-09's title appears as literal text (`<b>` visible, not bold); no dialog; no CSP violation in a normal flow.

#### TC-73 — UAT: core tasks by real users
- **Req:** NFR-04, US-01 – US-08 (acceptance) · **Type:** UAT · **Playwright:** No
- **Pre:** ENV-2; E-6 data; `uat-script.md`; owner + Tester A, B, C, each on their own phone.
- **Steps:** Tasks (≈ 20 min): find events near a spot; show only free events this week; find a music
  event this weekend; open one and get directions; save it and find it on Saved; share it to yourself;
  read what happens to your location. Then 3 rating questions, one feedback question and free comments.
- **Feedback question (not pass/fail; owner request 2026-11-27):** *"Saved events stay on this phone only.
  Would you want them on more than one device, e.g. your phone and laptop? Yes / No / Don't mind — why?"*
  It tests the decision not to build accounts (SRS W-01: no login; bookmarks device-only, NFR-11). Record
  each tester's answer and reason in `test-report.md` §UAT. If most testers say Yes with a real reason, raise
  a change request for Phase 7 and consider a lighter option than full accounts first (e.g. a "send my saved
  list to myself" link); otherwise W-01 stands.
- **Expected:** Each task completed without help by every tester; NFR-04 met (TC-59); issues raised become defects or backlog items.

---

## 3. Summary

### 3.1 By type (primary type of each case)

| Type | Count | Cases |
|---|---|---|
| e2e | 47 | TC-01–04, 07–15, 17–34, 38, 39, 42–46, 49, 50, 52–56, 58, 72 |
| unit | 8 | TC-05, 06, 16, 36, 41, 47, 65, 70 |
| audit | 8 | TC-37, 40, 57, 60, 61, 63, 67, 69 |
| manual | 8 | TC-35, 48, 51, 62, 64, 66, 68, 71 |
| UAT | 2 | TC-59, 73 |
| **Total** | **73** | |

Playwright: **Yes 51 · Partly 9** (TC-38, 40, 45, 51, 59, 62, 63, 64, 66) **· No 13** (Vitest-only, Lighthouse, review or people).

### 3.2 By requirement

| Requirement | Pri | Test cases |
|---|---|---|
| FR-01 | M | TC-01, TC-02 |
| FR-02 | M | TC-07, TC-08, TC-09 |
| FR-03 | M | TC-09, TC-10, TC-55 |
| FR-04 | M | TC-02, TC-06, TC-15 |
| FR-05 | M | TC-05, TC-24 |
| FR-06 | M | TC-02, TC-03, TC-04 |
| FR-07 | M | TC-11, TC-12 |
| FR-08 | M | TC-11, TC-13 |
| FR-09 | M | TC-14 |
| FR-10 | M | TC-15 |
| FR-11 | M | TC-16 |
| FR-12 | M | TC-17 |
| FR-13 | M | TC-18, TC-23 |
| FR-14 | M | TC-13, TC-19 |
| FR-15 | M | TC-20 |
| FR-16 | C | — deferred |
| FR-17 | M | TC-21, TC-23, TC-24 |
| FR-18 | M | TC-22 |
| FR-19 | M | TC-26 |
| FR-20 | M | TC-28, TC-29, TC-32 |
| FR-21 | S | TC-30 |
| FR-22 | S | TC-33, TC-34, TC-35 |
| FR-23 | C | TC-46, TC-48 |
| FR-24 | M | TC-06, TC-36 |
| FR-25 | M | TC-06, TC-41 |
| FR-26 | S | — deferred (CR-03) |
| FR-27 | C | — not built (conditional) |
| FR-28 | M | TC-36 |
| FR-29 | S | — not built (needs a 2nd source) |
| FR-30 | S | — not built (needs a 2nd source) |
| FR-31 | M | TC-38 |
| FR-32 | M | TC-21, TC-25 |
| FR-33 | C | TC-51 |
| FR-34 | C | TC-42 |
| FR-35 | C | TC-43 |
| FR-36 | C | TC-44 |
| FR-37 | C | TC-45 |
| FR-38 | C | TC-27 |
| FR-39 | C | TC-47, TC-48 |
| FR-40 | C | TC-31, TC-49, TC-50 |
| FR-41 | C | TC-52, TC-53, TC-54, TC-55 |
| NFR-01 | M | TC-56 |
| NFR-02 | S | TC-57 |
| NFR-03 | M | TC-58 |
| NFR-04 | M | TC-59, TC-73 |
| NFR-05 | M | TC-60, TC-61, TC-62 |
| NFR-06 | M | TC-63 |
| NFR-07 | M | TC-64 |
| NFR-08 | M | TC-65 |
| NFR-09 | M | TC-39, TC-50, TC-53 |
| NFR-10 | M | TC-40 |
| NFR-11 | S | TC-29, TC-31, TC-32 |
| NFR-12 | M | TC-36 |
| NFR-13 | M | TC-66 |
| NFR-14 | M | TC-37 |
| NFR-15 | S | TC-67 |
| NFR-16 | M | TC-68 |
| NFR-17 | M | TC-25, TC-69 |
| NFR-18 | M | TC-03, TC-70 |
| NFR-19 | S | TC-05, TC-71 |

Every Must requirement (24 FR + 15 NFR) has at least one case. Should: 6 of 9 have cases; FR-26,
FR-29 and FR-30 cannot be tested because they are not built. TC-72 covers security design threats
that have no own NFR row.

---

## 4. Questions raised while writing the cases (for the owner)

| # | Question | Where |
|---|---|---|
| Q-1 | ~~Kota Kinabalu in UAT scope?~~ **Answered 2026-11-24: no** — Klang Valley only (option A) | test-plan §1.3 |
| Q-2 | ~~No curated event has an image, so the FR-17 image and the FR-37 preview image can only be unit-tested.~~ **Closed 2026-11-27 for the automated tests:** server fixture S-1 has an image (TC-21 checks it loads, TC-45 checks `og:image` and the large card). A real organiser image on ENV-2 is still nice to have for UAT | TC-21, TC-45 |
| Q-3 | Wording differs between SRS and app: US-04 "No events match your filters" vs app "No events match"; FR-09 "Location on map not available" vs app "not on map" (US-03 already says "not on map"); FR-07 "summary card" vs the built pin-highlights-row (US-03 updated by CR-13, FR-07 text not). Accept the app wording (doc fix via the change log) or change the app? Tests assert the app wording until decided | TC-14, TC-20, TC-12 |
| Q-4 | **Max price:** an event priced RM 20 – RM 80 is shown under "Max RM 50" (the app compares the *lowest* price). US-04 says "events above RM 50 are hidden". Is "from RM 20" acceptable? **This weekend:** an event that started Friday and is still running on Saturday is shown, while US-04 says "starting this Saturday or Sunday". Accept the built behaviour? | TC-16, TC-18 |
| Q-5 | NFR-08 lists radius and dates as server inputs, but since ADR-06 the server only takes lat/lon and the device filters. TC-65 tests what exists; a CR could update the NFR wording | TC-65 |
| Q-6 | FR-02 "takes longer than 10 s": the browser timeout starts only after the permission prompt is answered, and the "Finding your location…" state has no way out. To verify on a real phone (TC-08) | TC-08 |
| Q-7 | **Answered 2026-11-24: fix the docs** (CR-14, US-14 now says only one chip can be on). Original question: US-14 says "Today" and "Free this week" can both be on together; in the code they cannot (both depend on the single date filter, so the second tap replaces the first). Which is intended? If the story is right this is a defect in FR-34/FR-36 (Could, S3); if the code is right US-14 needs a CR wording fix | TC-44 |
| Q-8 | **Fixed 2026-11-24** (CR-14: **Change** button in the top bar). Original finding: FR-03 (**Must**): once results are shown there is no **Use my location** button (and no area buttons); only tapping the map changes the point. If TC-10 confirms this, it is an S2 defect for the developer (likely a small change: show the button in the results state) | TC-10, TC-53 |
