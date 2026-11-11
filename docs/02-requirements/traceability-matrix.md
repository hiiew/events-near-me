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

**Status key:** ⏳ Not started · 🎨 Designed · 🛠 Built · ✅ Tested & passing · ⏸ Deferred

| Req ID | Pri | Summary | User story | Design element (Ph 3) | Code module (Ph 4) | Test case (Ph 5) | Status |
|---|---|---|---|---|---|---|---|
| FR-01 | M | The app shall explain why it needs location and then request the device's… | US-01, US-10 | | | | ⏳ |
| FR-02 | M | If location is denied, unavailable or takes longer than 10 s, the app shall… | US-02 | | | | ⏳ |
| FR-03 | M | The user shall be able to change the search point at any time by using their… | US-02 | | | | ⏳ |
| FR-04 | M | The app shall show upcoming events within the selected radius of the search… | US-01 | | | | ⏳ |
| FR-05 | M | The app shall hide events that have already ended | US-01 | | | | ⏳ |
| FR-06 | M | The app shall show results in a list, sorted by start date (soonest first)… | US-01 | | | | ⏳ |
| FR-07 | M | The app shall show results on a map with one marker per event; tapping a… | US-03 | | | | ⏳ |
| FR-08 | M | The user shall be able to switch between list and map view without losing… | US-03 | | | | ⏳ |
| FR-09 | M | Events without coordinates shall appear in the list (labelled "Location on… | US-03 | | | | ⏳ |
| FR-10 | M | Distance filter: 2, 5, 10 (default), 25 or 50 km | US-04 | | | | ⏳ |
| FR-11 | M | Date filter: Today, This weekend, Next 7 days, Next 30 days (default) | US-04 | | | | ⏳ |
| FR-12 | M | Category filter (multi-select): Music, Food & Markets, Arts & Culture,… | US-04 | | | | ⏳ |
| FR-13 | M | Price filter: All (default), Free only, or Maximum price in RM | US-04 | | | | ⏳ |
| FR-14 | M | Filters shall combine (AND) and update results without a full page reload | US-04 | | | | ⏳ |
| FR-15 | M | The app shall show a clear empty state when no events match, suggesting a… | US-04 | | | | ⏳ |
| FR-16 | C | Custom date range picker | — | | | | ⏳ |
| FR-17 | M | The event detail view shall show: title, start (and end if known) date/time… | US-05 | | | | ⏳ |
| FR-18 | M | The detail view shall have a button that opens the official event / ticket… | US-05 | | | | ⏳ |
| FR-19 | M | The detail view shall have a Directions button that opens Google Maps or… | US-06 | | | | ⏳ |
| FR-20 | M | The user shall be able to bookmark and un-bookmark an event; bookmarks are… | US-07 | | | | ⏳ |
| FR-21 | S | Bookmarked events that have ended shall be marked "Ended" on the Saved screen | US-07 | | | | ⏳ |
| FR-22 | S | Share an event using the phone's share sheet, or copy its link where sharing… | US-08 | | | | ⏳ |
| FR-23 | C | Add an event to the phone's calendar (`.ics` download) | — | | | | ⏳ |
| FR-24 | M | The system shall get events from all enabled sources through adapters that… | US-09 | | | | ⏳ |
| FR-25 | M | The system shall load events from a curated dataset file in the repo | US-09, US-11 | | | | ⏳ |
| FR-26 | S | The system shall load events from Eventbrite for a configured list of KL… | — | | | | ⏳ |
| FR-27 | C | The system shall load events from PredictHQ, only if a free plan is confirmed | — | | | | ⏳ |
| FR-28 | M | If one source fails or times out (5 s), the system shall still return… | US-09 | | | | ⏳ |
| FR-29 | S | The system shall remove obvious duplicates (same title, same start date,… | — | | | | ⏳ |
| FR-30 | S | The system shall cache each source's responses on the server for a… | — | | | | ⏳ |
| FR-31 | M | The app shall have a Privacy page explaining what location data is used,… | US-10 | | | | ⏳ |
| FR-32 | M | The app shall show data-source attribution and OpenStreetMap attribution | US-05 | | | | ⏳ |
| FR-33 | C | The app shall be installable to the home screen (PWA manifest) | — | | | | ⏳ |
| NFR-01 | M | Performance: First results appear within 3 s of the search point being set,… | — | | | | ⏳ |
| NFR-02 | S | Performance: Lighthouse Performance score ≥ 80 on mobile for the home page | — | | | | ⏳ |
| NFR-03 | M | Usability / responsive: Fully usable from 360 px wide screens up to desktop;… | — | | | | ⏳ |
| NFR-04 | M | Usability: A new user can open an event's details within 3 taps after… | US-01–US-05 | | | | ⏳ |
| NFR-05 | M | Accessibility: Meets WCAG 2.1 AA for core screens: contrast ≥ 4.5:1, all… | — | | | | ⏳ |
| NFR-06 | M | Security: API keys exist only in server environment variables; never sent to… | — | | | | ⏳ |
| NFR-07 | M | Security: Served over HTTPS only | — | | | | ⏳ |
| NFR-08 | M | Security: Server endpoints validate all inputs (lat/lon ranges, radius from… | — | | | | ⏳ |
| NFR-09 | M | Privacy: The search point is rounded to 3 decimal places (~100 m) before it… | US-10 | | | | ⏳ |
| NFR-10 | M | Privacy: The server does not store or log users' coordinates | US-10 | | | | ⏳ |
| NFR-11 | S | Privacy: Bookmarks and settings are stored only in the browser… | US-07 | | | | ⏳ |
| NFR-12 | M | Availability / resilience: If all live sources fail, curated events are… | US-09 | | | | ⏳ |
| NFR-13 | M | Compatibility: Works on the latest two major versions of Chrome (Android)… | — | | | | ⏳ |
| NFR-14 | M | Maintainability: Adding a new source requires only a new adapter file and a… | — | | | | ⏳ |
| NFR-15 | S | Maintainability: Core logic (adapters, filtering, distance, dedupe) has ≥ 70… | — | | | | ⏳ |
| NFR-16 | M | Cost: Running cost is RM0 at expected student-project traffic | — | | | | ⏳ |
| NFR-17 | M | Compliance: Each source's attribution, caching and display rules are… | — | | | | ⏳ |
| NFR-18 | M | Localisation: Dates/times shown in Malaysia time; prices formatted like `RM… | — | | | | ⏳ |
| NFR-19 | S | Data freshness: Curated dataset reviewed at least weekly; ended events never… | — | | | | ⏳ |

## Coverage summary

| Priority | Total | Designed | Built | Tested ✅ |
|---|---|---|---|---|
| Must | 39 (24 FR + 15 NFR) | 0 | 0 | 0 |
| Should | 9 (5 FR + 4 NFR) | 0 | 0 | 0 |
| Could | 4 | 0 | 0 | 0 |

**Project exit rule:** every **Must** row must reach ✅ before final sign-off.
