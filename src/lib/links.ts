// D-11 — FR-19, FR-22: directions and share links. No API keys needed.
import type { Event } from "./event-schema";
import { formatEventDate } from "./format";

type Venue = Event["venue"];
const hasCoords = (v: Venue): v is Venue & { lat: number; lon: number } => v.lat !== undefined && v.lon !== undefined;

/** Google Maps directions to the venue (coordinates if known, else name + address). */
export function googleMapsDirectionsUrl(venue: Venue): string {
  const dest = hasCoords(venue) ? `${venue.lat},${venue.lon}` : [venue.name, venue.address].filter(Boolean).join(", ");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
}

/** Waze navigation to the venue. */
export function wazeUrl(venue: Venue): string {
  return hasCoords(venue)
    ? `https://waze.com/ul?ll=${venue.lat},${venue.lon}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(venue.name)}&navigate=yes`;
}

/** App path of an event's detail page. */
export const eventPath = (id: string) => `/event/${encodeURIComponent(id)}`;

/** What the share sheet sends: title, date, link (decided 2026-11-11). */
export function shareData(event: Pick<Event, "title" | "start">, url: string) {
  return { title: event.title, text: `${event.title} — ${formatEventDate(event.start)}`, url };
}
