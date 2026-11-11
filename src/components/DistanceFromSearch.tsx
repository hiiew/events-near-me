"use client";
// FR-17 distance on the details page. Shown only when you arrived from a search
// (a shared link has no search point, so nothing is shown).
import type { Event } from "@/lib/event-schema";
import { formatDistance } from "@/lib/format";
import { haversineKm } from "@/lib/geo";
import { lastSearchPoint } from "@/lib/search-point";

export function DistanceFromSearch({ venue }: { venue: Event["venue"] }) {
  const point = lastSearchPoint();
  if (!point || venue.lat === undefined || venue.lon === undefined) return null;
  return <dd className="text-sm text-muted">{formatDistance(haversineKm(point, { lat: venue.lat, lon: venue.lon }))} from your search</dd>;
}
