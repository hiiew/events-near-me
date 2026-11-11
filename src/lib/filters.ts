// D-03 (Slice 1 part) — FR-04, FR-06: keep events near the search point, soonest first.
// Runs in the browser: the server returns 50 km / 30 days, the device narrows it (ADR-06).
import type { Event } from "./event-schema";
import { haversineKm, type LatLon } from "./geo";

export const DEFAULT_RADIUS_KM = 10;

export interface EventWithDistance extends Event {
  /** undefined when the venue has no coordinates (FR-09). */
  distanceKm?: number;
}

export function nearbyEvents(
  events: Event[],
  point: LatLon,
  radiusKm: number = DEFAULT_RADIUS_KM,
): EventWithDistance[] {
  const out: EventWithDistance[] = [];
  for (const e of events) {
    const { lat, lon } = e.venue;
    if (lat === undefined || lon === undefined) {
      out.push({ ...e }); // no location: keep it in the list (FR-09), distance unknown
      continue;
    }
    const distanceKm = haversineKm(point, { lat, lon });
    if (distanceKm <= radiusKm) out.push({ ...e, distanceKm });
  }
  return out.toSorted((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
