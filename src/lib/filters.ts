// D-03 — FR-04, FR-06, FR-09, FR-10–FR-14, FR-35. Runs in the browser: the server returns
// 50 km / 30 days and the device narrows it instantly (ADR-06).
import { CATEGORY_LABELS } from "./categories";
import type { CategoryId, Event } from "./event-schema";
import { haversineKm, type LatLon } from "./geo";

export const RADIUS_OPTIONS = [2, 5, 10, 25, 50] as const;
export type RadiusKm = (typeof RADIUS_OPTIONS)[number];
export const DEFAULT_RADIUS_KM: RadiusKm = 10;

export type When = "today" | "weekend" | "7d" | "30d";
export type PriceFilter = { kind: "any" } | { kind: "free" } | { kind: "max"; max: number };
export type SortBy = "soonest" | "nearest";

export interface Filters {
  radiusKm: RadiusKm;
  when: When;
  categories: CategoryId[]; // empty = all
  price: PriceFilter;
  sort: SortBy;
  /** FR-35 (CR-05): words typed in the search box; "" = no search. */
  query: string;
}

export const DEFAULT_FILTERS: Filters = {
  radiusKm: DEFAULT_RADIUS_KM,
  when: "30d",
  categories: [],
  price: { kind: "any" },
  sort: "soonest",
  query: "",
};

// FR-34 (CR-04) "Free this week" chip: only a shortcut for two existing filters (FR-11 date, FR-13 price);
// the filtering itself is still done by applyFilters below.
export const isFreeThisWeek = (f: Pick<Filters, "when" | "price">): boolean => f.when === "7d" && f.price.kind === "free";

/**
 * Chip tap. Off → Free only + Next 7 days. On → those two go back to their defaults.
 * Distance, categories and sort are never touched.
 */
export function toggleFreeThisWeek(f: Filters): Filters {
  return isFreeThisWeek(f)
    ? { ...f, when: DEFAULT_FILTERS.when, price: DEFAULT_FILTERS.price }
    : { ...f, when: "7d", price: { kind: "free" } };
}

// FR-35 (CR-05) search box. Lower-case and strip accents ("Café" matches "cafe"), then every typed word
// must appear somewhere in the title, venue name, venue address or category label (AND, like the other filters).
const fold = (text: string) => text.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

export function matchesQuery(event: Event, query: string): boolean {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return true;
  const haystack = fold([event.title, event.venue.name, event.venue.address, CATEGORY_LABELS[event.category]].filter(Boolean).join(" "));
  return words.every((w) => haystack.includes(w));
}

export interface EventWithDistance extends Event {
  /** undefined when the venue has no coordinates (FR-09). */
  distanceKm?: number;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
// shortcut: Malaysia is UTC+8 all year (no daylight saving), so a fixed offset is exact; use a tz library if other countries are added.
const MYT_OFFSET = 8 * HOUR;

/** [start, end) of the date window in epoch ms, using Malaysia calendar days. */
export function whenWindow(when: When, now: Date): [number, number] {
  const t = now.getTime();
  const startOfTodayMyt = Math.floor((t + MYT_OFFSET) / DAY) * DAY - MYT_OFFSET;
  if (when === "today") return [t, startOfTodayMyt + DAY];
  if (when === "weekend") {
    const dow = new Date(startOfTodayMyt + MYT_OFFSET).getUTCDay(); // 0 Sun … 6 Sat, in MYT
    const saturday = dow === 0 ? startOfTodayMyt - DAY : startOfTodayMyt + ((6 - dow) % 7) * DAY;
    return [Math.max(t, saturday), saturday + 2 * DAY];
  }
  return [t, t + (when === "7d" ? 7 : 30) * DAY];
}

function matchesPrice(price: Event["price"], filter: PriceFilter): boolean {
  if (filter.kind === "any") return true;
  if (price === null) return false; // "Price not listed" only shows under Any (FR-13)
  if (filter.kind === "free") return price.min === 0 && !price.max;
  return price.min <= filter.max;
}

export function applyFilters(
  events: Event[],
  point: LatLon,
  filters: Filters,
  now: Date = new Date(),
): EventWithDistance[] {
  const [from, to] = whenWindow(filters.when, now);
  const cats = new Set(filters.categories);
  const out: EventWithDistance[] = [];

  for (const e of events) {
    const start = Date.parse(e.start);
    const end = Date.parse(e.end ?? e.start);
    if (end < from || start >= to) continue;
    if (cats.size > 0 && !cats.has(e.category)) continue;
    if (!matchesPrice(e.price, filters.price)) continue;
    if (!matchesQuery(e, filters.query)) continue;

    const { lat, lon } = e.venue;
    if (lat === undefined || lon === undefined) {
      out.push({ ...e }); // no location: list only, distance unknown (FR-09)
      continue;
    }
    const distanceKm = haversineKm(point, { lat, lon });
    if (distanceKm <= filters.radiusKm) out.push({ ...e, distanceKm });
  }

  const byStart = (a: Event, b: Event) => Date.parse(a.start) - Date.parse(b.start);
  return filters.sort === "nearest"
    ? out.toSorted((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity) || byStart(a, b))
    : out.toSorted(byStart);
}

/** Next bigger radius for the empty state's "Widen search" button, or null at 50 km. */
export function widerRadius(r: RadiusKm): RadiusKm | null {
  const i = RADIUS_OPTIONS.indexOf(r);
  return i < RADIUS_OPTIONS.length - 1 ? RADIUS_OPTIONS[i + 1] : null;
}
