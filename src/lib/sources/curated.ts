// FR-05, FR-24, FR-25 — the curated KL events file as an event source.
import curatedData from "../../../data/curated-events.json";
import { CuratedEventSchema, type Event } from "../event-schema";
import { haversineKm } from "../geo";
import type { SourceAdapter, SourceQuery } from "./types";

/** An event is "ended" once its end (or its start, if no end is given) has passed. */
export function endTime(e: Pick<Event, "start" | "end">): number {
  return Date.parse(e.end ?? e.start);
}

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

/** FR-17: one curated event by its app id ("curated:kl-0002"), or null if missing or invalid. */
export function getCuratedEvent(id: string, entries: unknown[] = curatedData as unknown[]): Event | null {
  const raw = entries.find((e) => `curated:${(e as { id?: unknown })?.id}` === id);
  const parsed = CuratedEventSchema.safeParse(raw);
  return parsed.success ? { ...parsed.data, id, sourceId: "curated" } : null;
}

export const curatedAdapter: SourceAdapter = {
  id: "curated",
  isEnabled: () => true,
  getEvents: async (query) => filterCurated(curatedData as unknown[], query),
};
