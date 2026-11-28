# Happening

*(repository: `events-near-me`)*

Happening is an app that shows events near your location — filter by distance, date, category and price.

This project is built following the **Software Development Life Cycle (SDLC)**: documentation and
requirements first, code later.

## How to use this repo

1. Open [`PROMPT.md`](PROMPT.md), fill in the `[[ placeholders ]]`, and paste it into your AI assistant.
2. Save each deliverable it produces into the matching folder under `docs/`.
3. Approve each phase before moving to the next.

## SDLC phases

| # | Phase | Folder | Status |
|---|---|---|---|
| 1 | Planning | [`docs/01-planning`](docs/01-planning) | ✅ Approved 2026-11-11 |
| 2 | Requirements | [`docs/02-requirements`](docs/02-requirements) | ✅ Approved 2026-11-11 |
| 3 | Design | [`docs/03-design`](docs/03-design) | ✅ Approved 2026-11-11 |
| 4 | Implementation | [`docs/04-implementation`](docs/04-implementation) | ✅ Done — FR-01 – FR-41 built except FR-16, FR-26, FR-27, FR-29, FR-30 (deferred / need a second source, CR-03) |
| 5 | Testing | [`docs/05-testing`](docs/05-testing) | ⏳ In progress (as of 2026-11-28) — 75 automated browser tests run in CI on Chromium + WebKit (emulated iPhone); Lighthouse passed on the local production build; **27 of 39 Must requirements ✅**; [UAT script](docs/05-testing/uat-script.md) ready for 23–29 Dec; open defects DEF-10 (S2, awaiting owner decision) and DEF-11 (S4) — see [test report](docs/05-testing/test-report.md) |
| 6 | Deployment | [`docs/06-deployment`](docs/06-deployment) | ⏳ In progress (as of 2026-11-28) — CI, Dependabot, [deployment guide](docs/06-deployment/deployment-guide.md), release checklist and [user manual](docs/06-deployment/user-manual.md) done; Vercel project connected (preview deploys on PRs); **production URL and smoke checks pending (owner)** |
| 7 | Maintenance | [`docs/07-maintenance`](docs/07-maintenance) | ⏳ In progress (as of 2026-11-28) — maintenance plan, backlog and dependency-update log drafted |

Latest project status: [`docs/01-planning/status-report-2026-11-28.md`](docs/01-planning/status-report-2026-11-28.md).

## Run it on your computer

You need **Node.js 22 LTS** (or newer) and **Git**.

```bash
git clone https://github.com/hiiew/events-near-me.git
```
```bash
cd events-near-me
```
```bash
npm install
```
Copy `.env.example` to `.env.local` (the defaults work for now), then:
```bash
npm run dev
```
Open http://localhost:3000 and tap **Use my location** — or **Pick a spot on the map** and tap anywhere (e.g. TAR UMT in Setapak). To fake a location on a laptop, use Chrome
DevTools → ⋮ → More tools → Sensors → Location (e.g. 3.158, 101.712 for KLCC).

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | Code checks (ESLint) |
| `npm run build` | Production build |

> `data/curated-events.json` now holds real Klang Valley events (ids `kl-`) and a few Kota Kinabalu events (ids `sb-`), each linking to its ticket or official page.
> Coordinates are approximate until checked on a map. Add more with `docs/03-design/curated-events-guide.md`.

### Try it on your phone (same Wi-Fi)

Development mode blocks other devices, so run the production build:
```bash
npm run build
```
```bash
npm run start -- -H 0.0.0.0
```
Then open `http://<your PC's local IP>:3000` on the phone (find the IP with `ipconfig`).
Phones only share location over `https`, so use **Pick a spot on the map** — or use the live Vercel link once the production URL is confirmed (Phase 6).
