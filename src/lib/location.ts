// D-02 — FR-01, NFR-09. Browser-only: asks for the device's position and rounds it
// to ~100 m before anything else sees it. The precise position is never stored.
import { roundPoint, type LatLon } from "./geo";

export const LOCATION_TIMEOUT_MS = 10_000;

export type LocationError = "unsupported" | "denied" | "unavailable" | "timeout";

export function getDeviceLocation(): Promise<LatLon> {
  return new Promise((resolve, reject: (reason: LocationError) => void) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject("unsupported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(roundPoint({ lat: pos.coords.latitude, lon: pos.coords.longitude })),
      (err) => {
        if (err.code === err.PERMISSION_DENIED) reject("denied");
        else if (err.code === err.TIMEOUT) reject("timeout");
        else reject("unavailable");
      },
      { timeout: LOCATION_TIMEOUT_MS, maximumAge: 5 * 60 * 1000, enableHighAccuracy: false },
    );
  });
}
