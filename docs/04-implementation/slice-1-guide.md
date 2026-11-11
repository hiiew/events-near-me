# Slice 1 Guide — Location → nearby events list

| Field | Value |
|---|---|
| Branch | `slice-1-location-list` |
| Target | M4a — Tue 2026-12-08 (you're ahead of schedule) |
| Estimated effort | ~10–12 h |
| You write the code; Claude reviews the pull request and merges it | |

**Slice goal:** open the app → tap "Use my location" → see a list of upcoming SAMPLE events within
10 km, soonest first, each showing title, date/time, venue, distance, category and price.

**Requirements covered:** FR-01, FR-04, FR-05, FR-06, FR-24, FR-25, FR-28 (server side), NFR-06,
NFR-08, NFR-09, NFR-10, NFR-18. *(FR-02 pin-drop needs the map → Slice 2.)*

> **How to use this guide:** do the steps in order. Each task says *what* to build, gives *hints*,
> and lists *tests* — you write the code. If you're stuck for more than ~20 minutes, ask me
> ("stuck on T3, here's my code/error…"). If you use the Claude extension in Antigravity, ask it to
> **explain** or **give a hint**, not to write the whole file — otherwise you lose the learning.

---

## Step 0 — Install tools (once, ~20 min)

1. **Node.js 22 LTS** — download from nodejs.org (the "LTS" button), install with defaults.
2. **Git** — from git-scm.com, install with defaults.
3. Open **Antigravity**, then its terminal (*View → Terminal*). Check:
   ```bash
   node -v
   ```
   ```bash
   git --version
   ```
   You should see `v22.x` (or newer) and a git version.
4. Tell Git who you are (use your GitHub name/email):
   ```bash
   git config --global user.name "Your Name"
   ```
   ```bash
   git config --global user.email "you@example.com"
   ```
5. **Clone the repo:** in Antigravity use *Clone Git Repository* → sign in to GitHub →
   pick `hiiew/events-near-me` → choose a folder. Open that folder.

## Step 1 — Branch (~2 min)

```bash
git switch -c slice-1-location-list
```

## Step 2 — Scaffold the Next.js app (~15 min)

`create-next-app` won't run while `README.md`, `PROMPT.md` and `skills-lock.json` exist, so move them aside first (the `.claude/` folder can stay).
These commands work in PowerShell (Windows) and in macOS/Linux terminals — run them one at a time.

```bash
mkdir ../keep
```
```bash
mv README.md ../keep/
```
```bash
mv PROMPT.md ../keep/
```
```bash
mv skills-lock.json ../keep/
```
```bash
npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```
```bash
mv -Force ../keep/README.md .
```
*(macOS/Linux: `mv -f ../keep/README.md .`)* — then do the same for `PROMPT.md` and `skills-lock.json`, and delete the empty `../keep` folder.

Then:
1. **Fix `.gitignore`:** open it, find the line `.env*` and add a new line **under** it: `!.env.example`
   (otherwise our safe example file would never be committed).
2. In `package.json`, change `"name"` to `"happening"` and add a test script:
   `"test": "vitest run"` inside `"scripts"`.
3. Install the extra packages:
   ```bash
   npm install zod
   ```
   ```bash
   npm install -D vitest @types/node@22
   ```
   *(`@types/node@22` is needed because Vitest 5 doesn't accept the template's version 20.)*
4. Run it:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 — you should see the Next.js starter page. Stop with `Ctrl+C`.
5. Commit:
   ```bash
   git add -A
   ```
   ```bash
   git commit -m "chore: scaffold Next.js app with TypeScript, Tailwind, ESLint, Vitest, Zod"
   ```

**✅ Checkpoint 1 — push now and tell me "checkpoint 1 pushed"** so I can confirm the setup before
you build on it:
```bash
git push -u origin slice-1-location-list
```

## Step 3 — Environment files (~5 min) · NFR-06

1. Create `.env.example` (committed) with the content from `docs/03-design/security-privacy.md` §6
   (placeholders only).
2. Create `.env.local` (**never** committed) and set `ENABLED_SOURCES=curated` for now.
   Eventbrite comes in Slice 3.
3. Check Git ignores the real one: `git status` should list `.env.example` but **not** `.env.local`.

---

## Step 4 — Build tasks

Work in this order — each task builds on the previous one. Write tests **with** the code.

### T1 · `src/lib/event-schema.ts` — the data shapes · FR-24, FR-25, NFR-08
Build Zod schemas (and export their TypeScript types with `z.infer`):
- `CategoryIdSchema` — the 8 category IDs from `data-model.md` §3.
- `EventSchema` — exactly the `Event` interface in `data-model.md` §2. `url` must start with `https://`.
- `CuratedEventSchema` — like `EventSchema` but **without** `sourceId`, and `venue.lat`/`lon` **required**.
- `SearchRequestSchema` — `{ lat, lon }` with the ranges in `api-spec.md` §1; use `.strict()` so extra fields fail.

*Hint:* `z.object({...}).strict()`, `z.number().min(-90).max(90)`, `z.enum([...])`,
`z.string().url().startsWith("https://")`, `.nullable()`, `.optional()`.

*Tests (`event-schema.test.ts`):* valid event passes · `http://` url fails · curated event without
`lat` fails · search request with an extra field fails · `lat: 91` fails.

### T2 · `data/curated-events.json` — SAMPLE data · FR-25
Copy `docs/03-design/curated-events-template.json` to `data/curated-events.json` and make **at least
6** events, all with titles starting **`SAMPLE —`**. Include: one in the past (to test FR-05), one
>10 km from KLCC but <50 km (e.g. Sunway area), one free, one with `price: null`, two different
categories. Use dates relative to *now* (late Nov / Dec 2026).

> These are placeholders. Real events replace them before Phase 5 (your action item).

### T3 · `src/lib/geo.ts` — distance and rounding · FR-04, NFR-09
- `haversineKm(a, b)` → distance in km between two `{ lat, lon }` points (Earth radius 6371 km).
- `roundCoord(n)` → rounds to 3 decimal places.

*Hint:* search "haversine formula". Use `Math.sin`, `Math.cos`, `Math.asin`, `Math.sqrt`; convert
degrees to radians (`deg * Math.PI / 180`).

*Tests (`geo.test.ts`):*
- KLCC (3.1579, 101.7116) → KL Sentral (3.1340, 101.6862) ≈ **3.87 km** (`toBeCloseTo(3.87, 1)`)
- KLCC → Sunway Pyramid (3.0733, 101.6070) ≈ **14.95 km**
- same point → 0
- `roundCoord(3.13956)` → `3.14`; `roundCoord(101.68689)` → `101.687`

### T4 · `src/lib/sources/types.ts` + `curated.ts` — curated adapter · FR-05, FR-24, FR-25
- `types.ts`: the `SourceAdapter` interface from `api-spec.md` §3.
- `curated.ts`: an adapter with `id: "curated"` whose `getEvents(query)`:
  1. imports `data/curated-events.json`;
  2. validates **each** entry with `CuratedEventSchema.safeParse` — skip invalid ones and
     `console.warn` the **id only** (never coordinates);
  3. adds `sourceId: "curated"` and prefixes `id` with `curated:`;
  4. keeps events whose end (or start if no end) is **after `query.from`**, whose start is **before `query.to`**,
     and whose venue is within `query.radiusKm` (use `haversineKm`).

*Tip:* make the core a pure function `filterCurated(entries: unknown[], query)` so tests can pass in
their own data without reading the file.

*Tests:* drops past event · drops event outside radius · keeps event inside · skips invalid entry
without throwing · ids are `curated:…`.

### T5 · `src/lib/sources/aggregator.ts` · FR-24, FR-28, NFR-12
`searchAllSources(adapters, query)`:
- runs every enabled adapter **in parallel** with a **5 s timeout** each;
- returns `{ events, sources: [{ id, ok, count }] }`, events merged and sorted by `start` ascending;
- one adapter failing must **not** fail the whole search.

*Hint:* `Promise.allSettled`, and `Promise.race` with a `setTimeout` promise for the timeout.

*Tests (use fake adapters, no network):* two OK adapters → merged & sorted · one throws → other's
events returned and `{ ok: false }` for the failing one · one never resolves → times out
(use `vi.useFakeTimers()` or a short timeout parameter).

### T6 · `src/app/api/events/search/route.ts` — API endpoint · D-06, NFR-08, NFR-10
Export `async function POST(request)` that:
1. rejects bodies over 1 KB → 413;
2. parses JSON; on failure → 400;
3. validates with `SearchRequestSchema` → 400 with a short message (never echo coordinates);
4. **re-rounds** lat/lon with `roundCoord`;
5. calls `searchAllSources` with radius **50 km**, from **now**, to **now + 30 days**;
6. responds with `{ events, sources, generatedAt }` and header `Cache-Control: no-store`.

Only `POST` is exported, so Next.js answers other methods with 405 automatically.
**No `console.log` of the body.**

*Manual test (while `npm run dev` runs, in a second terminal):*
```bash
curl -X POST http://localhost:3000/api/events/search -H "Content-Type: application/json" -d "{\"lat\":3.158,\"lon\":101.712}"
```
Expect JSON with your SAMPLE events (not the past one). Try `{"lat":999,"lon":1}` → 400.

### T7 · `src/lib/format.ts` — display formatting · NFR-18
- `formatEventDate(iso)` → e.g. `Sat 5 Dec · 10:00 AM` in **Malaysia time** (add the year if not this year).
- `formatPrice(price)` → `FREE` (min 0), `RM 35.00`, `RM 20.00 – RM 80.00`, `USD 15.00`, or `Price not listed` (null).
- `formatDistance(km)` → `2.4 km`.

*Hint:* use two formatters, both with `timeZone: "Asia/Kuala_Lumpur"` (checked in Node 22):
`"en-GB"` with `{ weekday: "short", day: "numeric", month: "short" }` → `Sun 6 Dec`, and
`"en-US"` with `{ hour: "numeric", minute: "2-digit", hour12: true }` → `7:30 AM`. (`"en-MY"` gives
`Sun, 6 Dec` and `7:30 am` — fine too, just pick one and make the tests match.) Prices: `n.toFixed(2)`.

*Tests:* one per case above, including an event at `2026-12-05T23:30:00Z` which is **Sun 6 Dec 7:30 AM** in Malaysia.

### T8 · Welcome + Explore list UI · FR-01, FR-04, FR-06, FR-15, NFR-09
- `src/lib/location.ts`: `getDeviceLocation()` wraps `navigator.geolocation.getCurrentPosition`
  with `{ timeout: 10000 }` and returns **rounded** coordinates (or an error).
- `src/app/page.tsx` (a **client component** — needs `"use client"` because it uses browser APIs and state):
  - **Before** asking: show the S-1 welcome text from `ui-ux.md` and a **"📍 Use my location"** button.
  - On click: get location → `POST /api/events/search` → keep the results in state.
  - Compute `distanceKm` for each event in the browser, **keep ≤ 10 km**, sort by start date.
  - Show: loading state · list of `EventCard`s · count ("6 events") · empty state
    ("No events within 10 km") · notice "Some sources are unavailable" if any `sources[].ok` is false.
  - If location fails/denied: show "We couldn't get your location. Map picker coming in the next update."
    *(placeholder until Slice 2)*.
- `src/components/EventCard.tsx`: category emoji + label, title, date (T7), venue + distance, price badge.
  Use Tailwind; follow the colour tokens and 16 px rounded cards in `ui-ux.md` §4 — keep it simple,
  polish comes later.

*Manual test:* on your laptop the browser will ask for location; in Chrome DevTools you can fake a
location: *⋮ → More tools → Sensors → Location* → set 3.158, 101.712.

---

## Step 5 — Finish the slice

1. All of these pass:
   ```bash
   npm run lint
   ```
   ```bash
   npm test
   ```
   ```bash
   npm run build
   ```
2. Add a line to `docs/04-implementation/dev-log.md`.
3. Commit (one commit per task is ideal, e.g. `feat(FR-04,NFR-09): geo helpers with tests`) and push:
   ```bash
   git push
   ```
4. Tell me **"slice 1 ready for review"**. I'll open the pull request, review it against the
   requirements and coding standards, and either request changes or merge it.

## Slice 1 Definition of Done
- [ ] Location → list of SAMPLE events within 10 km, soonest first
- [ ] Past and >10 km events not shown
- [ ] Each card: title, date/time (MYT), venue, distance, category, price
- [ ] API rejects bad input with 400; coordinates never logged
- [ ] `.env.local` not committed; `.env.example` committed
- [ ] Unit tests for T1, T3, T4, T5, T7 pass; lint & build pass
- [ ] dev-log updated
