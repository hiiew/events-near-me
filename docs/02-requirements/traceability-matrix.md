# Requirements Traceability Matrix (RTM) — Events Near Me

| Field | Value |
|---|---|
| Phase | 2 — Requirements (living document — filled in during Phases 3–5) |
| Version | 1.0 |
| Date | 2026-11-11 |

> **What is an RTM?** A table that links every requirement forward to the design element that
> handles it, the code that builds it and the test that proves it. It answers two questions an
> assessor will ask: *"Is every requirement built and tested?"* and *"Why does this piece of code
> exist?"* Empty cells show what's still to do.

**Status key:** ⏳ Not started · 🎨 Designed · 🛠 Built (unit-tested where noted) · ✅ Phase 5 test case passing · ⏸ Deferred

| Req ID | Pri | Summary | User story | Design element (Ph 3) | Code module (Ph 4) | Test case (Ph 5) | Status |
|---|---|---|---|---|---|---|---|
| FR-01 | M | The app shall explain why it needs location and then request the device's… | US-01, US-10 | D-02, S-1 | `src/lib/location.ts`, `src/app/page.tsx` | | 🛠 |
| FR-02 | M | If location is denied, unavailable or takes longer than 10 s, the app shall… | US-02 | D-02, D-05, S-3 | `src/app/page.tsx` (pick-a-spot state), `src/components/MapView.tsx` (tap to pin) | | 🛠 |
| FR-03 | M | The user shall be able to change the search point at any time by using their… | US-02 | D-02, S-2/S-3 | `page.tsx` (tap map / Search this map area / Use my location) | | 🛠 |
| FR-04 | M | The app shall show upcoming events within the selected radius of the search… | US-01 | D-03, D-06, D-07 | `src/lib/filters.ts`, `src/lib/geo.ts`, `src/app/api/events/search/route.ts` (+ tests) | | 🛠 |
| FR-05 | M | The app shall hide events that have already ended | US-01 | D-09, D-03 | `src/lib/sources/curated.ts` (+ test) | | 🛠 |
| FR-06 | M | The app shall show results in a list, sorted by start date (soonest first)… | US-01 | D-01 S-2, D-03 (sort) | `src/lib/filters.ts` sort soonest/nearest (+ test), `EventRow.tsx` | | 🛠 |
| FR-07 | M | The app shall show results on a map with one marker per event; tapping a… | US-03 | D-05, S-3 | `MapView.tsx` pins; selected pin highlights its row | | 🛠 |
| FR-08 | M | The user shall be able to switch between list and map view without losing… | US-03 | D-01 (Explore toggle) | Map and list shown together on Explore (Night Map); filters shared | | 🛠 |
| FR-09 | M | Events without coordinates shall appear in the list (labelled "Location on… | US-03 | D-05, S-2 label | `filters.ts` keeps no-coordinate events in list (+ test); `EventRow` says "not on map" | | 🛠 |
| FR-10 | M | Distance filter: 2, 5, 10 (default), 25 or 50 km | US-04 | D-03, S-7 | `filters.ts` (+ test), `FilterSheet.tsx` | | 🛠 |
| FR-11 | M | Date filter: Today, This weekend, Next 7 days, Next 30 days (default) | US-04 | D-03, S-7 | `filters.ts` `whenWindow` in Malaysia time (+ tests), `FilterSheet.tsx` | | 🛠 |
| FR-12 | M | Category filter (multi-select): Music, Food & Markets, Arts & Culture,… | US-04 | D-03, S-7, categories table | `filters.ts` (+ test), `FilterSheet.tsx`, `categories.ts` | | 🛠 |
| FR-13 | M | Price filter: All (default), Free only, or Maximum price in RM | US-04 | D-03, S-7 | `filters.ts` (+ test), `FilterSheet.tsx` | | 🛠 |
| FR-14 | M | Filters shall combine (AND) and update results without a full page reload | US-04 | D-03 (client-side, ADR-06) | `applyFilters` runs on the device, no reload (ADR-06) | | 🛠 |
| FR-15 | M | The app shall show a clear empty state when no events match, suggesting a… | US-04 | D-01 S-2 empty state | `page.tsx` empty state with "Widen to N km" | | 🛠 |
| FR-16 | C | Custom date range picker | — | S-7 (deferred) | | | ⏸ |
| FR-34 | C | "Free this week" quick chip: one tap sets Free only + Next 7 days; tap again resets those two (CR-04) | US-04 | S-3 (chip under the list heading), ui-ux.md §4 | `filters.ts` `isFreeThisWeek`/`toggleFreeThisWeek` (+ test), `QuickChip.tsx`, `page.tsx` | | 🛠 |
| FR-35 | C | Search box: type words to narrow the list by title, venue, address or category (CR-05) | — | S-3 (search field under the list heading), ui-ux.md §4 | `filters.ts` `matchesQuery` + `query` filter (+ test), `SearchBox.tsx`, `FilterSheet.tsx` (Reset keeps the search), `page.tsx` | | 🛠 |
| FR-36 | C | "Today" quick chip: one tap sets Date = Today; tap again resets only the date (CR-06) | — | S-3 (chip row under the search box), ui-ux.md §4 | `filters.ts` `isToday`/`toggleToday` (+ test), `QuickChip.tsx` (shared with FR-34), `page.tsx` | | 🛠 |
| FR-17 | M | The event detail view shall show: title, start (and end if known) date/time… | US-05 | D-01 S-4, data-model Event | `src/app/event/[id]/page.tsx` (incl. image), `DistanceFromSearch.tsx`, `formatEventWhen` (+ test) | | 🛠 |
| FR-18 | M | The detail view shall have a button that opens the official event / ticket… | US-05 | D-01 S-4 | Detail page "View official page"; row link in `EventRow.tsx` | | 🛠 |
| FR-19 | M | The detail view shall have a Directions button that opens Google Maps or… | US-06 | D-11, S-4 | `src/lib/links.ts` Google Maps + Waze (+ test), detail page | | 🛠 |
| FR-38 | C | "By public transport" button: Google Maps directions in transit mode (CR-08) | — | S-4 (button under Directions) | `links.ts` `googleMapsTransitUrl` (+ test), `icons.tsx` `TransitIcon`, `event/[id]/page.tsx` | | 🛠 |
| FR-20 | M | The user shall be able to bookmark and un-bookmark an event; bookmarks are… | US-07 | D-04, S-4/S-5 | `src/lib/bookmarks.ts` (+ test), `use-bookmarks.ts`, `EventActions.tsx`, `/saved` | | 🛠 |
| FR-21 | S | Bookmarked events that have ended shall be marked "Ended" on the Saved screen | US-07 | D-04, S-5 | `/saved` "Ended" label via `isEnded` (+ test) | | 🛠 |
| FR-22 | S | Share an event using the phone's share sheet, or copy its link where sharing… | US-08 | D-11, S-4 | `EventActions.tsx` share sheet / copy link, `shareData` (+ test) | | 🛠 |
| FR-37 | C | Share previews: link preview shows event title, date/venue/price and image (CR-07) | — | S-4 (page metadata only, no visible change) | `links.ts` `sharePreview` (+ test), `event/[id]/page.tsx` `generateMetadata` | | 🛠 |
| FR-23 | C | Add an event to the phone's calendar (`.ics` download) | — | D-11, S-4 (button on the details page; file made on the device) | `src/lib/ics.ts` (+ test), `EventActions.tsx` `CalendarButton`, `event/[id]/page.tsx` | | 🛠 |
| FR-39 | C | Calendar reminders: the .ics has a day-before and an hour-before alarm (CR-09) | — | S-4 (same button as FR-23; no new UI) | `ics.ts` `alarms` (+ tests), `EventActions.tsx` (status message) | | 🛠 |
| FR-24 | M | The system shall get events from all enabled sources through adapters that… | US-09 | D-06, D-07, D-09 (ADR-05) | `src/lib/sources/{types,aggregator,registry}.ts` (+ test) | | 🛠 |
| FR-25 | M | The system shall load events from a curated dataset file in the repo | US-09, US-11 | D-09 curated, D-10, Zod | `src/lib/sources/curated.ts`, `data/curated-events.json` (+ test) | | 🛠 |
| FR-26 | S | The system shall load events from Eventbrite for a configured list of KL… | — | D-09 eventbrite | Deferred to backlog — CR-03 (no organiser IDs by cut-off) | | ⏸ |
| FR-27 | C | The system shall load events from PredictHQ, only if a free plan is confirmed | — | D-09 predicthq (conditional) | | | 🎨 |
| FR-28 | M | If one source fails or times out (5 s), the system shall still return… | US-09 | D-07 timeouts | `src/lib/sources/aggregator.ts` (+ test), notice in `page.tsx` | | 🛠 |
| FR-29 | S | The system shall remove obvious duplicates (same title, same start date,… | — | D-07 dedupe | | | 🎨 |
| FR-30 | S | The system shall cache each source's responses on the server for a… | — | D-08 | | | 🎨 |
| FR-31 | M | The app shall have a Privacy page explaining what location data is used,… | US-10 | S-6, security-privacy §5 | `src/app/about/page.tsx` (About & privacy) | | 🛠 |
| FR-32 | M | The app shall show data-source attribution and OpenStreetMap attribution | US-05 | D-05, S-6 | OSM attribution on map + About; source name on detail page | | 🛠 |
| FR-33 | C | The app shall be installable to the home screen (PWA manifest) | — | D-12 | `src/app/manifest.ts` + `manifest.test.ts`, `public/icons/*`, `src/app/apple-icon.png`, `layout.tsx` (`appleWebApp`) | | 🛠 |
| NFR-01 | M | Performance: First results appear within 3 s of the search point being set,… | — | ADR-06, D-08 | | | 🎨 |
| NFR-02 | S | Performance: Lighthouse Performance score ≥ 80 on mobile for the home page | — | ADR-06, D-08 | | | 🎨 |
| NFR-03 | M | Usability / responsive: Fully usable from 360 px wide screens up to desktop;… | — | ui-ux wireframes (360 px) | Checked at 360 px and 390 px (no horizontal scroll) — Phase 5 to test 768/1280 | | 🛠 partial |
| NFR-04 | M | Usability: A new user can open an event's details within 3 taps after… | US-01–US-05 | ui-ux Flow B | | | 🎨 |
| NFR-05 | M | Accessibility: Meets WCAG 2.1 AA for core screens: contrast ≥ 4.5:1, all… | — | ui-ux §4, §6 | Focus ring, labels, aria-live, 44 px targets — full audit in Phase 5 | | 🛠 partial |
| NFR-06 | M | Security: API keys exist only in server environment variables; never sent to… | — | ADR-01, security §6, T-02 | `.env.example`, `.gitignore`; tokens only in server code | | 🛠 |
| NFR-07 | M | Security: Served over HTTPS only | — | ADR-08, T-08 | | | 🎨 |
| NFR-08 | M | Security: Server endpoints validate all inputs (lat/lon ranges, radius from… | — | D-06, ADR-09, T-05 | `route.ts`, `src/lib/event-schema.ts` (+ tests) | | 🛠 |
| NFR-09 | M | Privacy: The search point is rounded to 3 decimal places (~100 m) before it… | US-10 | D-02, T-01 | `src/lib/geo.ts`, `src/lib/location.ts`, `route.ts` (+ tests) | | 🛠 |
| NFR-10 | M | Privacy: The server does not store or log users' coordinates | US-10 | ADR-07, T-01 | `route.ts`, `aggregator.ts`, `curated.ts` log ids only (+ tests) | | 🛠 |
| NFR-11 | S | Privacy: Bookmarks and settings are stored only in the browser… | US-07 | D-04, S-6 | `ClearSavedData.tsx`, `clearBookmarks` (+ test) | | 🛠 |
| NFR-12 | M | Availability / resilience: If all live sources fail, curated events are… | US-09 | D-07 | `src/lib/sources/aggregator.ts` (+ test) | | 🛠 |
| NFR-13 | M | Compatibility: Works on the latest two major versions of Chrome (Android)… | — | ADR-01 (modern browsers) | | | 🎨 |
| NFR-14 | M | Maintainability: Adding a new source requires only a new adapter file and a… | — | ADR-05, adapter interface | `src/lib/sources/registry.ts`, `types.ts` | | 🛠 |
| NFR-15 | S | Maintainability: Core logic (adapters, filtering, distance, dedupe) has ≥ 70… | — | architecture §8 (src/test) | | | 🎨 |
| NFR-16 | M | Cost: Running cost is RM0 at expected student-project traffic | — | ADR-03, ADR-04, ADR-08 | | | 🎨 |
| NFR-17 | M | Compliance: Each source's attribution, caching and display rules are… | — | architecture §5–6 | | | 🎨 |
| NFR-18 | M | Localisation: Dates/times shown in Malaysia time; prices formatted like `RM… | — | ui-ux §5 | `src/lib/format.ts` (+ test) | | 🛠 |
| NFR-19 | S | Data freshness: Curated dataset reviewed at least weekly; ended events never… | — | curated-events-guide | | | 🎨 |

## Coverage summary

| Priority | Total | Designed | Built | Tested ✅ |
|---|---|---|---|---|
| Must | 39 (24 FR + 15 NFR) | 39 | 31 built + 2 partial (NFR-03, NFR-05); 6 NFRs shown in Phase 5/6 (NFR-01, 04, 07, 13, 16, 17) | 0 (unit tests exist; Phase 5 test cases pending) |
| Should | 9 (5 FR + 4 NFR) | 9 | 3 built (FR-21, FR-22, NFR-11); FR-26 deferred (CR-03); FR-29/FR-30 only needed with a 2nd source; NFR-02/15/19 in Phases 5–7 | 0 |
| Could | 10 | 9 (FR-23, FR-27 conditional, FR-33, FR-34, FR-35, FR-36, FR-37, FR-38, FR-39); FR-16 deferred | 8 built (FR-23, FR-33, FR-34, FR-35, FR-36, FR-37, FR-38, FR-39) | 0 |

**Project exit rule:** every **Must** row must reach ✅ before final sign-off.
