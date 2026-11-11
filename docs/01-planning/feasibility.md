# Feasibility Study — Events Near Me

| Field | Value |
|---|---|
| Phase | 1 — Planning |
| Version | 1.0 (draft for approval) |
| Date | 2026-11-11 |

> **What is a feasibility study?** Before spending weeks building something, you check whether it
> *can* be built (technical), *afforded* (economic), *legally* done (legal) and finished *in time*
> (schedule). The common acronym is **TELOS**: Technical, Economic, Legal, Operational, Schedule.
> The output is a verdict: go, go with conditions, or no-go.

> ⚠️ **Note on facts about third-party services.** Free-tier limits, pricing and API features
> change often. Everything marked **[verify]** below is based on general knowledge and must be
> checked on the provider's official site before Phase 3. Record what you find in the
> "Verified?" column.

## 1. Technical feasibility

### 1.1 Recommended stack

Decision format: options considered → trade-offs → recommendation → why.

**Platform**

| Option | Trade-offs |
|---|---|
| Native app (Kotlin / Swift) | Best phone integration, but two codebases and steep learning curve; app-store release needs developer accounts (iOS is paid) |
| Cross-platform (Flutter / React Native) | One codebase, but new language/tooling for a beginner; still needs app-store steps to share |
| **Mobile-friendly web app (PWA)** | Runs in any phone browser, shareable by link, installable to home screen, uses the browser Geolocation API; slightly less "native" feel |

**Recommendation: PWA.** It meets "mobile-friendly", costs RM0, and lets you use JavaScript you
already know. Anyone can test it by opening a link.

**Framework, hosting and backend**

| Option | Trade-offs |
|---|---|
| React (Vite) frontend + separate Node/Express backend | Very common and teachable, but two things to deploy and connect |
| **Next.js (React) on Vercel** | One project: React pages + built-in server "API routes" that hide API keys; free Hobby tier; huge tutorial ecosystem. Vercel Hobby is for **non-commercial** use **[verify]** — fine for a student project |
| Python (Flask/FastAPI) + React | Good if you prefer Python, but two languages and two deployments |

**Recommendation: Next.js + TypeScript on Vercel.** The key reason is *security*: event API keys
must not be exposed in the browser (C-5). Next.js API routes run on the server, so the browser
calls *our* endpoint and our server calls the event API with the secret key. One repo, one deploy.
TypeScript adds type safety that catches beginner mistakes early (we can fall back to plain
JavaScript if it slows you down — to be decided in Phase 3).

**Maps**

| Option | Trade-offs |
|---|---|
| Google Maps JavaScript API | Familiar look, but requires a billing account with a credit card **[verify]** — conflicts with C-1 |
| Mapbox | Generous free tier, but requires an account and token **[verify]** |
| **Leaflet + OpenStreetMap tiles** | Free, no key, open source; must show OSM attribution and respect the OSM tile usage policy (light traffic only) **[verify]** |

**Recommendation: Leaflet + OpenStreetMap.** No card, no key, perfectly adequate for a student-scale
app. Directions can open Google Maps / Waze via a plain link (no API needed).

**Storage**

For the MVP we likely need **no database**: events come live from APIs, and bookmarks can be stored
on the user's own device (`localStorage`). This is simpler *and* better for privacy (nothing personal
leaves the phone). A short server-side cache of API responses (e.g. 10–30 min) reduces API calls.
Final choice in Phase 3.

### 1.2 Event data sources — the critical question

This is the project's biggest technical risk (see R-01). International event APIs may have
**limited coverage of Kuala Lumpur**. Candidates:

| Source | What we believe | Concern | Verified? |
|---|---|---|---|
| Ticketmaster Discovery API | Free developer key; location/radius search; daily and per-second rate limits **[verify]** | Ticketmaster's presence in Malaysia may be small → few KL events | ☐ |
| Eventbrite API | Free key | Eventbrite **removed its public event-search endpoint** some years ago; the API mainly returns events for organisations/venues you specify **[verify]** — may not support "events near me" | ☐ |
| PredictHQ | Strong global coverage incl. radius search | Commercial product; free trial / limited plan only **[verify]** — may conflict with C-1 long term | ☐ |
| Meetup API | Good for tech/community meetups in KL | API access may require a paid Meetup Pro subscription **[verify]** | ☐ |
| SerpApi (Google Events results) | Broad coverage incl. local KL listings | Paid service with a small free monthly quota **[verify]**; relies on a third party's terms | ☐ |

**Recommendation — run a data-source "spike" before Phase 2 is approved.** A *spike* is a short,
time-boxed experiment (≈2 hours) to answer one question. Here: *"Which free API returns enough real
events within ~25 km of KL city centre for the next 30 days?"*
1. Sign up for a free Ticketmaster developer key (and optionally Eventbrite). **← needs your action**
2. Make a test request centred on KL (e.g. lat 3.1390, lon 101.6869, radius 25 km).
3. Record the count and categories of events returned in `docs/01-planning/data-source-spike.md`.

**Decision rule:** if the best free source returns **≥ 20 upcoming events** in the area → go.
If fewer → choose a fallback before Phase 2 (combine sources, accept a low-cost source, or widen the
radius / add more cities for demonstration). This is a stop-and-ask point.

### 1.3 Technical verdict
**Feasible with conditions** — stack is well within reach for a beginner over 8 weeks; **data
coverage must be confirmed by the spike.**

## 2. Economic feasibility (budget RM0)

| Item | Planned tool | Cost |
|---|---|---|
| Code hosting & version control | GitHub (private repo) | RM0 |
| App hosting + server functions | Vercel Hobby | RM0 **[verify limits]** |
| Maps | Leaflet + OpenStreetMap | RM0 |
| Event data | Ticketmaster Discovery (+ others from spike) | RM0 within free quota **[verify]** |
| Domain | Free `*.vercel.app` subdomain | RM0 |
| CI | GitHub Actions (free minutes for private repos) | RM0 **[verify limits]** |
| Development tools | VS Code, Node.js, Git | RM0 |
| **Total** | | **RM0** |

**Cost risks:** any service that asks for a credit card "just for verification" can start billing
after a quota. Rule: **no card is added without explicit approval** (stop condition).

**Economic verdict:** **Feasible**, provided the free event API quota is enough (it should be,
with caching, for a student project's traffic).

## 3. Legal feasibility

| Area | Requirement | How we comply |
|---|---|---|
| Personal data — PDPA 2010 (Malaysia) | Notice & consent, limited purpose, data minimisation, security **[verify current PDPA text and 2024 amendments]** | Ask for location permission with a clear explanation; use location only to search; round coordinates before sending to the server; never store location server-side; privacy notice page |
| Event API terms of service | Attribution, rate limits, no caching beyond allowed time, display rules, non-commercial terms **[verify per provider]** | Read each ToS during the spike; record rules in the design; show attribution and link back to the official event page |
| Map tiles (OSM) | Attribution "© OpenStreetMap contributors"; tile usage policy for light use | Show attribution on the map; low traffic; switch provider if usage grows |
| Web scraping | Can breach ToS and copyright | **Not done** (out of scope) |
| Hosting terms | Vercel Hobby non-commercial **[verify]** | Project is non-commercial |
| Copyright of event content | Images/descriptions belong to providers/organisers | Display only via API per ToS; link to source |

**Legal verdict:** **Feasible**, with privacy-by-design and per-provider ToS review as conditions.

## 4. Operational feasibility

- **Will people use it?** The problem (scattered event info) is real for the target users. The app
  only answers one question well, which keeps it simple to use.
- **Can it be maintained?** One developer, no database, free hosting, automatic deploys from GitHub
  → low maintenance. Main ongoing tasks: API key rotation, dependency updates, watching for API changes.

**Operational verdict:** **Feasible.**

## 5. Schedule feasibility

~80 hours over 8 weeks (see `timeline.md`). Rough effort:

| Phase | Est. hours |
|---|---|
| 1 Planning (+ data spike) | 8 |
| 2 Requirements | 8 |
| 3 Design | 10 |
| 4 Implementation | 32 |
| 5 Testing | 10 |
| 6 Deployment | 6 |
| 7 Maintenance plan + buffer | 6 |
| **Total** | **80** |

The tightest part is Phase 4 for a first-time web developer. Mitigations: keep the MVP small
(MoSCoW in Phase 2), use well-documented tools, and build one vertical slice at a time.

**Schedule verdict:** **Feasible if MVP scope is kept tight.**

## 6. Overall verdict

| Dimension | Verdict |
|---|---|
| Technical | ✅ Feasible with conditions (data spike) |
| Economic | ✅ Feasible |
| Legal | ✅ Feasible with conditions (privacy-by-design, ToS review) |
| Operational | ✅ Feasible |
| Schedule | ✅ Feasible with tight MVP |

**Overall: GO, with conditions** — (1) complete the data-source spike and confirm KL coverage;
(2) verify every **[verify]** item on official sites; (3) keep the MVP small.
