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
| 4 | Implementation | [`docs/04-implementation`](docs/04-implementation) | 🚧 In progress — Slice 1 done |
| 5 | Testing | [`docs/05-testing`](docs/05-testing) | ⏳ Not started |
| 6 | Deployment | [`docs/06-deployment`](docs/06-deployment) | ⏳ Not started |
| 7 | Maintenance | [`docs/07-maintenance`](docs/07-maintenance) | ⏳ Not started |

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
Open http://localhost:3000 and tap **Use my location**. To fake a location on a laptop, use Chrome
DevTools → ⋮ → More tools → Sensors → Location (e.g. 3.158, 101.712 for KLCC).

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | Code checks (ESLint) |
| `npm run build` | Production build |

> Events shown now are **SAMPLE** placeholders in `data/curated-events.json`. Replace them with
> real KL events (see `docs/03-design/curated-events-guide.md`) before Phase 5 testing.
