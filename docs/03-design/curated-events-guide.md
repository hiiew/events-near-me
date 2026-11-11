# How to add curated events — Happening

The curated dataset is the app's guaranteed source of KL events (FR-25, decision E). Aim for
**at least 20 upcoming events** before Phase 5 testing.

## Where to find events (legitimately)
Look at **official** pages: venue websites, university event pages, organiser websites, official
social media posts by the organiser, tourism-board calendars. Record only **facts** (name, date,
time, place, price) in your own words, and always link back to the official page.
Don't copy long descriptions or use images unless the page clearly allows it — leave
`imageUrl` as `null` if unsure.

## Steps for each event
1. Copy one entry from [`curated-events-template.json`](curated-events-template.json).
2. Give it the next ID: `kl-0004`, `kl-0005`, …
3. Fill in `title`, a short `description`, `start` (and `end` if known) as
   `YYYY-MM-DDTHH:MM:SS+08:00`.
4. **Coordinates:** open openstreetmap.org, search the venue, right-click the spot →
   "Show address" — the lat/lon appear in the left panel. Round to 4 decimals.
5. `category`: one of `music, food, arts, sports, learning, tech, nightlife, other`.
6. `price`: free → `{ "min": 0, "currency": "MYR" }`; one price → `{ "min": 35, "currency": "MYR" }`;
   range → add `"max"`; unknown → `null`.
7. `url`: the official page (`https://` only).
8. Save. In Phase 4 the file lives at `data/curated-events.json`; a validation script will tell you
   if anything is wrong.

## Weekly upkeep (~30 min, NFR-19)
- Add new upcoming events; ended ones are hidden automatically (you can delete them monthly).
- Re-check events that might have changed (date, venue, cancelled).
