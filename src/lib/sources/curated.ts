// FR-05, FR-24, FR-25 — the curated KL events file as an event source.
import curatedData from "../../../data/curated-events.json";
import { CuratedEventSchema, endTime, type Event } from "../event-schema";
import { haversineKm } from "../geo";
import type { SourceAdapter, SourceQuery } from "./types";

/**
 * Pure core of the curated adapter, so tests can pass their own entries.
 * Validates each entry, skips invalid ones, and keeps events that are
 * not ended, start before `query.to`, and are within `query.radiusKm`.
 */
export function filterCurated(entries: unknown[], query: SourceQuery): Event[] {
  const point = { lat: query.lat, lon: query.lon };
  const from = query.from.getTime();
  const to = query.to.getTime();
  const events: Event[] = [];

  for (const entry of entries) {
    const parsed = CuratedEventSchema.safeParse(entry);
    if (!parsed.success) {
      // Log the id only — never coordinates or the whole entry (NFR-10).
      const id = (entry as { id?: unknown })?.id;
      console.warn(`[curated] skipped invalid entry: ${typeof id === "string" ? id : "(no id)"}`);
      continue;
    }
    const e = parsed.data;
    if (endTime(e) <= from || Date.parse(e.start) >= to) continue;
    if (haversineKm(point, e.venue) > query.radiusKm) continue;
    events.push({ ...e, id: `curated:${e.id}`, sourceId: "curated" });
  }
  return events;
}

let testEntries: { raw: string; entries: unknown[] } | undefined;

/**
 * FR-05, FR-17 — the raw curated entries the server uses: the bundled data/curated-events.json.
 *
 * Test seam (test-plan.md §2.3, PRE-D): the Playwright web server sets E2E_CURATED_EVENTS to a JSON array of
 * always-upcoming test events, so the details page (a Server Component) can be tested without the real file,
 * whose events expire. Guards: ignored on Vercel (VERCEL is set there); when used, a warning naming it goes to
 * the server log; bad JSON throws instead of silently falling back to the real file. Unset: the real file,
 * exactly as before. No test data is in the bundle — it only arrives through the environment.
 */
export function curatedEntries(env: Record<string, string | undefined> = process.env): unknown[] {
  const raw = env.E2E_CURATED_EVENTS;
  if (!raw || env.VERCEL) return curatedData as unknown[];
  if (testEntries?.raw !== raw) {
    const entries: unknown = JSON.parse(raw);
    if (!Array.isArray(entries)) throw new Error("E2E_CURATED_EVENTS must be a JSON array");
    console.warn(`[curated] E2E_CURATED_EVENTS is set: serving ${entries.length} TEST events instead of data/curated-events.json`);
    testEntries = { raw, entries };
  }
  return testEntries.entries;
}

/** FR-17: one curated event by its app id ("curated:kl-0002"), or null if missing or invalid. */
export function getCuratedEvent(id: string, entries: unknown[] = curatedEntries()): Event | null {
  const raw = entries.find((e) => `curated:${(e as { id?: unknown })?.id}` === id);
  const parsed = CuratedEventSchema.safeParse(raw);
  return parsed.success ? { ...parsed.data, id, sourceId: "curated" } : null;
}

export const curatedAdapter: SourceAdapter = {
  id: "curated",
  isEnabled: () => true,
  getEvents: async (query) => filterCurated(curatedEntries(), query),
};
