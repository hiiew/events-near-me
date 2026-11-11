// FR-17: the last search point, so the details page can show distance after you come from Explore.
// Memory only — gone on reload, never stored or sent anywhere (NFR-09, NFR-10).
import type { LatLon } from "./geo";

let last: LatLon | null = null;
export const rememberSearchPoint = (p: LatLon) => {
  last = p;
};
export const lastSearchPoint = () => last;
