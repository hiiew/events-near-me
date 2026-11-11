// FR-04, NFR-09 — distance between two points and coordinate rounding.

export interface LatLon {
  lat: number;
  lon: number;
}

const EARTH_RADIUS_KM = 6371;
const toRadians = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in km (haversine formula). */
export function haversineKm(a: LatLon, b: LatLon): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLon = toRadians(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

/** Round a coordinate to 3 decimal places (~100 m) so precise location never leaves the device. */
export function roundCoord(n: number): number {
  return Math.round(n * 1000) / 1000;
}

export function roundPoint(p: LatLon): LatLon {
  return { lat: roundCoord(p.lat), lon: roundCoord(p.lon) };
}
