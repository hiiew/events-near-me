// FR-24, FR-25, NFR-08 — the shapes every part of the app agrees on.
// Zod schemas validate data at runtime; `z.infer` turns them into TypeScript types.
import { z } from "zod";

export const CATEGORY_IDS = [
  "music",
  "food",
  "arts",
  "sports",
  "learning",
  "tech",
  "nightlife",
  "other",
] as const;

export const CategoryIdSchema = z.enum(CATEGORY_IDS);
export type CategoryId = z.infer<typeof CategoryIdSchema>;

// Only https:// links are allowed, which also blocks javascript: URLs (threat T-04).
const HttpsUrl = z.url({ protocol: /^https$/ });
// ISO 8601 with a timezone offset, e.g. 2026-12-05T20:00:00+08:00 (NFR-18).
const IsoDateTime = z.iso.datetime({ offset: true });
const Latitude = z.number().min(-90).max(90);
const Longitude = z.number().min(-180).max(180);

const PriceSchema = z
  .strictObject({
    min: z.number().min(0), // 0 = free
    max: z.number().min(0).optional(),
    currency: z.string().length(3), // ISO 4217, e.g. MYR
  })
  .nullable(); // null = "Price not listed" (FR-13)

const VenueSchema = z.strictObject({
  name: z.string().min(1),
  address: z.string().optional(),
  lat: Latitude.optional(),
  lon: Longitude.optional(),
});

export const SourceIdSchema = z.enum(["curated", "eventbrite", "predicthq"]);
export type SourceId = z.infer<typeof SourceIdSchema>;

export const EventSchema = z.strictObject({
  id: z.string().min(1),
  sourceId: SourceIdSchema,
  title: z.string().min(1),
  description: z.string().max(2000),
  start: IsoDateTime,
  end: IsoDateTime.optional(),
  venue: VenueSchema,
  category: CategoryIdSchema,
  price: PriceSchema,
  url: HttpsUrl,
  imageUrl: HttpsUrl.nullable().optional(),
});
export type Event = z.infer<typeof EventSchema>;

/** FR-05: an event has ended once its end (or its start, if no end is given) has passed. */
export function endTime(e: Pick<Event, "start" | "end">): number {
  return Date.parse(e.end ?? e.start);
}

export const isEnded = (e: Pick<Event, "start" | "end">, now: number = Date.now()) => endTime(e) < now;

// Curated entries: no sourceId (always "curated"), and coordinates are required.
export const CuratedEventSchema = EventSchema.omit({ sourceId: true }).extend({
  venue: VenueSchema.extend({ lat: Latitude, lon: Longitude }),
});
export type CuratedEvent = z.infer<typeof CuratedEventSchema>;

// Body of POST /api/events/search (api-spec.md §1). Extra fields are rejected.
export const SearchRequestSchema = z.strictObject({
  lat: Latitude,
  lon: Longitude,
});
export type SearchRequest = z.infer<typeof SearchRequestSchema>;

export interface SourceStatus {
  id: SourceId;
  ok: boolean;
  count: number;
}

export interface SearchResponse {
  events: Event[];
  sources: SourceStatus[];
  generatedAt: string;
}
