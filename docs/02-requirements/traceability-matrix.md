# Requirements Traceability Matrix (RTM) — Events Near Me

| Field | Value |
|---|---|
| Phase | 2 — Requirements (living document — filled in during Phases 3–5) |
| Version | 1.1 |
| Product name | Written as "Events Near Me"; the product is now **Happening** (CR-01). Title kept as approved. |
| Date | 2026-11-11 (last updated 2026-11-24: DEF-05 accepted by the owner → FR-05 and FR-17 ✅; Lighthouse TC-57/TC-61 pass on ENV-1 but NFR-02/NFR-05 wait for ENV-2 and TC-62's manual part; earlier: first Phase 5 run — ✅ set only for rows whose every linked test case passed with no manual/phone/ENV-2/UAT part left, see `docs/05-testing/test-report.md` §4; before that, Phase 5 test case IDs linked from `docs/05-testing/test-cases.md`; earlier the same day: user stories US-12–US-18 linked, screen IDs corrected — CR-13) |

> **What is an RTM?** A table that links every requirement forward to the design element that
> handles it, the code that builds it and the test that proves it. It answers two questions an
> assessor will ask: *"Is every requirement built and tested?"* and *"Why does this piece of code
> exist?"* Empty cells show what's still to do.

**Status key:** ⏳ Not started · 🎨 Designed · 🛠 Built (unit-tested where noted) · ✅ Phase 5 test case passing · ⏸ Deferred

| Req ID | Pri | Summary | User story | Design element (Ph 3) | Code module (Ph 4) | Test case (Ph 5) | Status |
|---|---|---|---|---|---|---|---|
| FR-01 | M | The app shall explain why it needs location and then request the device's… | US-01, US-10 | D-02, S-1 | `src/lib/location.ts`, `src/app/page.tsx` | TC-01, TC-02 | 🛠 |
| FR-02 | M | If location is denied, unavailable or takes longer than 10 s, the app shall… | US-02 | D-02, D-05, S-3 | `src/app/page.tsx` (pick-a-spot state), `src/components/MapView.tsx` (tap to pin) | TC-07, TC-08, TC-09 | 🛠 |
| FR-03 | M | The user shall be able to change the search point at any time by using their… | US-02 | D-02, S-2/S-3 | `page.tsx` (tap map / Search this map area / Use my location; **Change** button in the top bar reopens these from the results, CR-14) | TC-09, TC-10, TC-55 | ✅ |
| FR-41 | C | Area shortcuts: tap "Klang Valley" or "Kota Kinabalu" to see its events, with the count on the button (CR-12) | US-19 | S-1 and S-3 pick-a-spot (buttons under "Or browse an area"), ui-ux.md §4 | `src/lib/areas.ts` (+ test), `AreaShortcuts.tsx`, `page.tsx` | TC-52, TC-53, TC-54, TC-55 | ✅ |
| FR-04 | M | The app shall show upcoming events within the selected radius of the search… | US-01 | D-03, D-06, D-07 | `src/lib/filters.ts`, `src/lib/geo.ts`, `src/app/api/events/search/route.ts` (+ tests) | TC-02, TC-06, TC-15 | ✅ |
| FR-05 | M | The app shall hide events that have already ended | US-01 | D-09, D-03 | `src/lib/sources/curated.ts` (+ test) | TC-05, TC-24 | ✅ |
| FR-06 | M | The app shall show results in a list, sorted by start date (soonest first)… | US-01 | D-01 S-2, D-03 (sort) | `src/lib/filters.ts` sort soonest/nearest (+ test), `EventRow.tsx` | TC-02, TC-03, TC-04 | ✅ |
| FR-07 | M | The app shall show results on a map with one marker per event; tapping a… | US-03 | D-05, S-3 | `MapView.tsx` pins; selected pin highlights its row | TC-11, TC-12 | ✅ |
| FR-08 | M | The user shall be able to switch between list and map view without losing… | US-03 | D-01, S-2 + S-3 on one Explore screen (DC-01) | Map and list shown together on Explore (Night Map); filters shared | TC-11, TC-13 | ✅ |
| FR-09 | M | Events without coordinates shall appear in the list (labelled "Location on… | US-03 | D-05, S-2 label | `filters.ts` keeps no-coordinate events in list (+ test); `EventRow` says "not on map" | TC-14 | ✅ |
| FR-10 | M | Distance filter: 2, 5, 10 (default), 25 or 50 km | US-04 | D-03, S-7 | `filters.ts` (+ test), `FilterSheet.tsx` | TC-15 | ✅ |
| FR-11 | M | Date filter: Today, This weekend, Next 7 days, Next 30 days (default) | US-04 | D-03, S-7 | `filters.ts` `whenWindow` in Malaysia time (+ tests), `FilterSheet.tsx` | TC-16 | ✅ |
| FR-12 | M | Category filter (multi-select): Music, Food & Markets, Arts & Culture,… | US-04 | D-03, S-7, categories table | `filters.ts` (+ test), `FilterSheet.tsx`, `categories.ts` | TC-17 | ✅ |
| FR-13 | M | Price filter: All (default), Free only, or Maximum price in RM | US-04 | D-03, S-7 | `filters.ts` (+ test), `FilterSheet.tsx` | TC-18, TC-23 | ✅ |
| FR-14 | M | Filters shall combine (AND) and update results without a full page reload | US-04 | D-03 (client-side, ADR-06) | `applyFilters` runs on the device, no reload (ADR-06) | TC-13, TC-19 | ✅ |
| FR-15 | M | The app shall show a clear empty state when no events match, suggesting a… | US-04 | D-01 S-2 empty state | `page.tsx` empty state with "Widen to N km" | TC-20 | ✅ |
| FR-16 | C | Custom date range picker | — | S-7 (deferred) | | — (deferred) | ⏸ |
| FR-34 | C | "Free this week" quick chip: one tap sets Free only + Next 7 days; tap again resets those two (CR-04) | US-04, US-12 | S-2 (chip under the list heading), ui-ux.md §4 | `filters.ts` `isFreeThisWeek`/`toggleFreeThisWeek` (+ test), `QuickChip.tsx`, `page.tsx` | TC-42 | ✅ |
| FR-35 | C | Search box: type words to narrow the list by title, venue, address or category (CR-05) | US-13 | S-2 (search field under the list heading), ui-ux.md §4 | `filters.ts` `matchesQuery` + `query` filter (+ test), `SearchBox.tsx`, `FilterSheet.tsx` (Reset keeps the search), `page.tsx` | TC-43 | ✅ |
| FR-36 | C | "Today" quick chip: one tap sets Date = Today; tap again resets only the date (CR-06) | US-14 | S-2 (chip row under the search box), ui-ux.md §4 | `filters.ts` `isToday`/`toggleToday` (+ test), `QuickChip.tsx` (shared with FR-34), `page.tsx` | TC-44 | ✅ |
| FR-17 | M | The event detail view shall show: title, start (and end if known) date/time… | US-05 | D-01 S-4, data-model Event | `src/app/event/[id]/page.tsx` (incl. image), `DistanceFromSearch.tsx`, `formatEventWhen` (+ test) | TC-21, TC-23, TC-24 | ✅ |
| FR-18 | M | The detail view shall have a button that opens the official event / ticket… | US-05 | D-01 S-4 | Detail page "View official page"; row link in `EventRow.tsx` | TC-22 | ✅ |
| FR-19 | M | The detail view shall have a Directions button that opens Google Maps or… | US-06 | D-11, S-4 | `src/lib/links.ts` Google Maps + Waze (+ test), detail page | TC-26 | 🛠 |
| FR-38 | C | "By public transport" button: Google Maps directions in transit mode (CR-08) | US-16 | S-4 (button under Directions) | `links.ts` `googleMapsTransitUrl` (+ test), `icons.tsx` `TransitIcon`, `event/[id]/page.tsx` | TC-27 | 🛠 |
| FR-20 | M | The user shall be able to bookmark and un-bookmark an event; bookmarks are… | US-07 | D-04, S-4/S-5 | `src/lib/bookmarks.ts` (+ test), `use-bookmarks.ts`, `EventActions.tsx`, `/saved` | TC-28, TC-29, TC-32 | ✅ |
| FR-21 | S | Bookmarked events that have ended shall be marked "Ended" on the Saved screen | US-07 | D-04, S-5 | `/saved` "Ended" label via `isEnded` (+ test) | TC-30 | ✅ |
| FR-22 | S | Share an event using the phone's share sheet, or copy its link where sharing… | US-08 | D-11, S-4 | `EventActions.tsx` share sheet / copy link, `shareData` (+ test) | TC-33, TC-34, TC-35 | 🛠 |
| FR-37 | C | Share previews: link preview shows event title, date/venue/price and image (CR-07) | US-15 | S-4 (page metadata only, no visible change) | `links.ts` `sharePreview` (+ test), `event/[id]/page.tsx` `generateMetadata` | TC-45 | 🛠 |
| FR-23 | C | Add an event to the phone's calendar (`.ics` download) | US-17 | D-11, S-4 (button on the details page; file made on the device) | `src/lib/ics.ts` (+ test), `EventActions.tsx` `CalendarButton`, `event/[id]/page.tsx` | TC-46, TC-48 | 🛠 |
| FR-39 | C | Calendar reminders: the .ics has a day-before and an hour-before alarm (CR-09) | US-17 | S-4 (same button as FR-23; no new UI) | `ics.ts` `alarms` (+ tests), `EventActions.tsx` (status message) | TC-47, TC-48 | 🛠 |
| FR-24 | M | The system shall get events from all enabled sources through adapters that… | US-09 | D-06, D-07, D-09 (ADR-05) | `src/lib/sources/{types,aggregator,registry}.ts` (+ test) | TC-06, TC-36 | ✅ |
| FR-25 | M | The system shall load events from a curated dataset file in the repo | US-09, US-11 | D-09 curated, D-10, Zod | `src/lib/sources/curated.ts`, `data/curated-events.json` (+ test) | TC-06, TC-41 | ✅ |
| FR-26 | S | The system shall load events from Eventbrite for a configured list of KL… | — | D-09 eventbrite | Deferred to backlog — CR-03 (no organiser IDs by cut-off) | — (deferred, CR-03) | ⏸ |
| FR-27 | C | The system shall load events from PredictHQ, only if a free plan is confirmed | — | D-09 predicthq (conditional) | | — (not built) | 🎨 |
| FR-28 | M | If one source fails or times out (5 s), the system shall still return… | US-09 | D-07 timeouts | `src/lib/sources/aggregator.ts` (+ test), notice in `page.tsx` | TC-36 | ✅ |
| FR-29 | S | The system shall remove obvious duplicates (same title, same start date,… | — | D-07 dedupe | | — (not built) | 🎨 |
| FR-30 | S | The system shall cache each source's responses on the server for a… | — | D-08 | | — (not built) | 🎨 |
| FR-31 | M | The app shall have a Privacy page explaining what location data is used,… | US-10 | S-6, security-privacy §5 | `src/app/about/page.tsx` (About & privacy) | TC-38 | 🛠 |
| FR-32 | M | The app shall show data-source attribution and OpenStreetMap attribution | US-05 | D-05, S-6 | OSM attribution on map + About; source name on detail page | TC-21, TC-25 | ✅ |
| FR-33 | C | The app shall be installable to the home screen (PWA manifest) | US-18 | D-12 | `src/app/manifest.ts` + `manifest.test.ts`, `public/icons/*`, `src/app/apple-icon.png`, `layout.tsx` (`appleWebApp`) | TC-51 | 🛠 |
| FR-40 | C | Offline mode: pages open offline; last search's events shown with a "saved on" notice when the server is unreachable (CR-10) | US-18 | D-04, D-12; S-2 (notice under the chips); S-6 (privacy text) | `public/sw.js`, `ServiceWorkerRegister.tsx`, `src/lib/offline-cache.ts` (+ test), `page.tsx`, `ClearSavedData.tsx`, `about/page.tsx`, `layout.tsx` | TC-31, TC-49, TC-50 | ✅ |
| NFR-01 | M | Performance: First results appear within 3 s of the search point being set,… | — | ADR-06, D-08 | | TC-56 | 🎨 |
| NFR-02 | S | Performance: Lighthouse Performance score ≥ 80 on mobile for the home page | — | ADR-06, D-08 | | TC-57 | 🎨 |
| NFR-03 | M | Usability / responsive: Fully usable from 360 px wide screens up to desktop;… | — | ui-ux wireframes (360 px) | Checked at 360 px and 390 px (no horizontal scroll) — Phase 5 to test 768/1280 | TC-58 | ✅ |
| NFR-04 | M | Usability: A new user can open an event's details within 3 taps after… | US-01–US-05 | ui-ux Flow B | | TC-59, TC-73 | 🎨 |
| NFR-05 | M | Accessibility: Meets WCAG 2.1 AA for core screens: contrast ≥ 4.5:1, all… | — | ui-ux §4, §6 | Focus ring, labels, aria-live, 44 px targets — full audit in Phase 5 | TC-60, TC-61, TC-62 | 🛠 partial |
| NFR-06 | M | Security: API keys exist only in server environment variables; never sent to… | — | ADR-01, security §6, T-02 | `.env.example`, `.gitignore`; tokens only in server code | TC-63 | ✅ |
| NFR-07 | M | Security: Served over HTTPS only | — | ADR-08, T-08 | | TC-64 | 🎨 |
| NFR-08 | M | Security: Server endpoints validate all inputs (lat/lon ranges, radius from… | — | D-06, ADR-09, T-05 | `route.ts`, `src/lib/event-schema.ts` (+ tests) | TC-65 | ✅ |
| NFR-09 | M | Privacy: The search point is rounded to 3 decimal places (~100 m) before it… | US-10 | D-02, T-01 | `src/lib/geo.ts`, `src/lib/location.ts`, `route.ts` (+ tests) | TC-39, TC-50, TC-53 | ✅ |
| NFR-10 | M | Privacy: The server does not store or log users' coordinates | US-10 | ADR-07, T-01 | `route.ts`, `aggregator.ts`, `curated.ts` log ids only (+ tests) | TC-40 | 🛠 |
| NFR-11 | S | Privacy: Bookmarks and settings are stored only in the browser… | US-07 | D-04, S-6 | `ClearSavedData.tsx`, `clearBookmarks` (+ test) | TC-29, TC-31, TC-32 | ✅ |
| NFR-12 | M | Availability / resilience: If all live sources fail, curated events are… | US-09 | D-07 | `src/lib/sources/aggregator.ts` (+ test) | TC-36 | ✅ |
| NFR-13 | M | Compatibility: Works on the latest two major versions of Chrome (Android)… | — | ADR-01 (modern browsers) | | TC-66 | 🎨 |
| NFR-14 | M | Maintainability: Adding a new source requires only a new adapter file and a… | — | ADR-05, adapter interface | `src/lib/sources/registry.ts`, `types.ts` | TC-37 | 🛠 |
| NFR-15 | S | Maintainability: Core logic (adapters, filtering, distance, dedupe) has ≥ 70… | — | architecture §8 (src/test) | | TC-67 | 🎨 |
| NFR-16 | M | Cost: Running cost is RM0 at expected student-project traffic | — | ADR-03, ADR-04, ADR-08 | | TC-68 | 🎨 |
| NFR-17 | M | Compliance: Each source's attribution, caching and display rules are… | — | architecture §5–6 | | TC-25, TC-69 | 🎨 |
| NFR-18 | M | Localisation: Dates/times shown in Malaysia time; prices formatted like `RM… | — | ui-ux §5 | `src/lib/format.ts` (+ test) | TC-03, TC-70 | ✅ |
| NFR-19 | S | Data freshness: Curated dataset reviewed at least weekly; ended events never… | — | curated-events-guide | | TC-05, TC-71 | 🎨 |

## Coverage summary

| Priority | Total | Designed | Built | Tested ✅ |
|---|---|---|---|---|
| Must | 39 (24 FR + 15 NFR) | 39 | 31 built + 2 partial (NFR-03, NFR-05); 6 NFRs shown in Phase 5/6 (NFR-01, 04, 07, 13, 16, 17) | **26** (2026-11-24 e2e run + DEF-01–06 fix re-run + DEF-05 accepted; open: FR-01, 02, 19, 31, NFR-01, 04, 05, 07, 10, 13, 14, 16, 17 — reasons in test-report §4) |
| Should | 9 (5 FR + 4 NFR) | 9 | 3 built (FR-21, FR-22, NFR-11); FR-26 deferred (CR-03); FR-29/FR-30 only needed with a 2nd source; NFR-02/15/19 in Phases 5–7 | **2** (FR-21, NFR-11) |
| Could | 12 | 11 (FR-23, FR-27 conditional, FR-33, FR-34, FR-35, FR-36, FR-37, FR-38, FR-39, FR-40, FR-41); FR-16 deferred | 10 built (FR-23, FR-33, FR-34, FR-35, FR-36, FR-37, FR-38, FR-39, FR-40, FR-41) | **5** (FR-34, FR-35, FR-36, FR-40, FR-41) |

**Project exit rule:** every **Must** row must reach ✅ before final sign-off.
