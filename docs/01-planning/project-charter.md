# Project Charter — Events Near Me

| Field | Value |
|---|---|
| Project | Events Near Me |
| Phase | 1 — Planning |
| Version | 1.0 (draft for approval) |
| Date | 2026-11-11 |
| Owner / developer | Project student (sole developer) |
| Mentor / reviewer | AI assistant (senior engineer role) |

> **What is a project charter?** It is the first document in most projects. It answers *why* the
> project exists, *what* it will and won't do, and *who* is involved. Every later decision should be
> checkable against it. If someone asks "should we add feature X?", the scope section here is the
> first place to look.

## 1. Problem statement

University students and young adults in Kuala Lumpur find out about events through scattered
channels — Instagram stories, WhatsApp groups, ticketing sites and word of mouth. There is no single,
simple place to answer the question **"What's happening near me, soon, that I can afford?"**
As a result people miss events they would have enjoyed, and checking several sources takes time.

## 2. Vision

> A fast, mobile-friendly web app that shows events happening near the user in Kuala Lumpur on a
> list and a map, filterable by distance, date, category and price — using only legitimate data
> sources and respecting the user's privacy.

## 3. Goals and success criteria

| ID | Goal | How we will measure it |
|---|---|---|
| G-1 | Show real upcoming events near the user's location | At least one data source returns real KL events, shown on list and map |
| G-2 | Let users narrow results quickly | Filters for distance, date, category and price work together |
| G-3 | Work well on a phone | Usable on a 360 px-wide screen; loads in under 3 s on 4G (to be confirmed in NFRs) |
| G-4 | Respect privacy | Location used only after consent; precise location never stored on a server |
| G-5 | Cost nothing to run | Built and hosted entirely on free tiers (RM0) |
| G-6 | Follow the SDLC properly | All 7 phase folders contain approved deliverables with traceability |

## 4. Scope

### In scope (MVP candidates — finalised with MoSCoW in Phase 2)
- Detect the user's location (with permission) or let them choose an area manually.
- Fetch events from **official third-party event APIs** only.
- Show events as a **list** and on a **map**.
- Filter by distance, date range, category and price (free / paid / price range where available).
- Event detail view with a link to the official event or ticket page and a directions link.
- Save / bookmark events on the device.
- Mobile-friendly web app (Progressive Web App), deployed on a free hosting tier.

### Out of scope (for this project)
- User-submitted events, user accounts, moderation (*decided 2026-11-11 — API events only*).
- Native Android / iOS app-store releases.
- Selling tickets or handling payments.
- Scraping websites or social media (Instagram, Facebook, etc.).
- Push notifications, social features (friends, comments, ratings).
- Coverage outside the Klang Valley (the design should not *prevent* it, but it won't be tested).

## 5. Stakeholders

| Stakeholder | Role / interest |
|---|---|
| Developer (you) | Builds, documents, tests and deploys the app; main decision maker |
| End users | KL students / young adults looking for events |
| Lecturer / assessor | Evaluates SDLC artefacts and the working app (if used as an assignment) |
| Event API providers | Supply data; their terms of service and rate limits must be followed |
| Map / hosting providers | Supply free-tier infrastructure; their usage policies must be followed |

## 6. Assumptions

| ID | Assumption | Status |
|---|---|---|
| A-1 | Developer is comfortable with JavaScript or Python but new to mobile and cloud | `ASSUMPTION` (default accepted) |
| A-2 | Timeline is 8 weeks at ~10 hours/week (~80 hours total) | `ASSUMPTION` (default accepted) |
| A-3 | Purpose is a university assignment that also serves as a portfolio piece | `ASSUMPTION` (default accepted) |
| A-4 | At least one free official event API returns enough KL events to be useful | **Unverified — highest risk, see R-01** |
| A-5 | A mobile-friendly web app (PWA) satisfies the "mobile-friendly" goal | `ASSUMPTION` (recommended in feasibility study) |
| A-6 | Users have a modern smartphone browser with geolocation support | `ASSUMPTION` |

## 7. Constraints

| ID | Constraint |
|---|---|
| C-1 | **Budget RM0** — free tiers only; nothing that requires adding a credit card unless approved |
| C-2 | **Time** — ~80 hours across 8 weeks, one developer |
| C-3 | **Data** — official APIs only; follow each provider's ToS, attribution rules and rate limits |
| C-4 | **Privacy** — Malaysia PDPA 2010: consent before using location, collect the minimum, no precise location stored server-side |
| C-5 | **Security** — no API keys or secrets in the repository |
| C-6 | **Process** — documentation before code; each phase approved before the next starts |

## 8. Methodology

**Chosen: Waterfall with iterative feedback** (sometimes called "modified waterfall").

| Option | Pros | Cons |
|---|---|---|
| Pure Waterfall | Clear phases, easy to assess, matches the requested deliverables | Mistakes found late are expensive |
| Scrum / Agile | Fast feedback, working software early | Heavy on ceremonies for one person; harder to produce phase documents |
| **Waterfall + iterative feedback** | Phase gates and documents *plus* short build–test loops inside Phase 4 | Slightly more planning discipline needed |

**Why:** the course-style deliverables (charter, SRS, design docs, test plan) fit a phased model,
but a beginner benefits from building in small vertical slices and testing each one. So phases
1–3 run in sequence with approval gates, and Phase 4 runs as short weekly iterations, each ending
with a working, tested slice.

## 9. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Developer / project owner | Project student | ☑ Approved (data-source spike deferred to start of Phase 2) | 2026-11-11 |
