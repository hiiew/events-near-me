// D-03 — FR-41 (CR-12): named areas people can jump to without picking a spot or sharing their location.
// An area is a public centre point. Choosing it runs the normal search from that point at the widest
// distance the app offers (50 km), and the count shown on the button is worked out with the same
// `applyFilters` call, so the number always matches the list the visitor lands on. Nothing about the visitor
// is involved (NFR-09, NFR-10).
import type { Event } from "./event-schema";
import { applyFilters, DEFAULT_FILTERS, type Filters, type RadiusKm } from "./filters";
import type { LatLon } from "./geo";

export interface Area {
  id: string;
  name: string;
  /** Rounded to 3 decimal places like every search point (NFR-09). */
  center: LatLon;
}

/** Add a line here to add an area; the welcome screen and the pick-a-spot screen pick it up (NFR-14 spirit). */
export const AREAS: readonly Area[] = [
  { id: "klang-valley", name: "Klang Valley", center: { lat: 3.139, lon: 101.687 } }, // KL city centre; 50 km reaches most of Selangor
  { id: "kota-kinabalu", name: "Kota Kinabalu", center: { lat: 5.979, lon: 116.075 } }, // CR-11 coverage
];

/** The widest distance the app offers (FR-10); the server also returns events up to 50 km. */
export const AREA_RADIUS_KM: RadiusKm = 50;

/** Filters used when an area is chosen: every filter back to its default, distance 50 km. */
export const areaFilters = (): Filters => ({ ...DEFAULT_FILTERS, radiusKm: AREA_RADIUS_KM });

/** How many upcoming events the visitor will see after choosing this area. */
export function countForArea(events: Event[], area: Area, now: Date = new Date()): number {
  return applyFilters(events, area.center, areaFilters(), now).length;
}
