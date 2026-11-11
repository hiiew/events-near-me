// FR-24, NFR-14 — every event source is an adapter with this shape (api-spec.md §3).
import type { Event, SourceId } from "../event-schema";

export interface SourceQuery {
  lat: number;
  lon: number;
  radiusKm: number;
  from: Date;
  to: Date;
}

export interface SourceAdapter {
  id: SourceId;
  isEnabled(): boolean;
  /** Throws on failure; the aggregator turns that into { ok: false }. */
  getEvents(query: SourceQuery): Promise<Event[]>;
}
