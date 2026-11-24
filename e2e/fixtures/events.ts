// Fixture events F-01 – F-09 and the Kota Kinabalu pair (test-plan.md §2.2).
// The browser clock is fixed at NOW, and every date here is written relative to that day, so the
// tests never depend on the real curated file (whose events expire every week).
import type { Event, SearchResponse } from "@/lib/event-schema";

/** Thu 17 Dec 2026, 10:00 Malaysia time. "This weekend" is Sat 19 – Sun 20 Dec. */
export const NOW = new Date("2026-12-17T10:00:00+08:00");

/** Public test landmark (KLCC), 6 decimals like a real GPS fix. Never a real person's location. */
export const LANDMARK = { lat: 3.157912, lon: 101.711623 };
/** The search point the app sends for LANDMARK: rounded to 3 decimals (NFR-09). */
export const P = { lat: 3.158, lon: 101.712 };

/** Public area centres from src/lib/areas.ts (FR-41). */
export const KL_CENTER = { lat: 3.139, lon: 101.687 };
export const KK_CENTER = { lat: 5.979, lon: 116.075 };

/**
 * The point `km` away from `from` on compass bearing `deg` (great-circle formula, same Earth radius as
 * geo.ts). Bearings are never due N/S/E/W, so no fixture coordinate equals P's lat or lon (TC-50 checks that
 * P never reaches localStorage, so P's numbers must not appear in the events by accident).
 */
function at(km: number, deg: number, from = P) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [φ1, λ1, θ, δ] = [toRad(from.lat), toRad(from.lon), toRad(deg), km / R];
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  const r6 = (n: number) => Math.round(n * 1e6) / 1e6;
  return { lat: r6((φ2 * 180) / Math.PI), lon: r6((λ2 * 180) / Math.PI) };
}

/** "2026-12-17" + n days, at hh:mm Malaysia time, as an ISO string with +08:00. */
export function myt(dayOffset: number, hhmm: string): string {
  const d = new Date(Date.UTC(2026, 11, 17 + dayOffset));
  return `${d.toISOString().slice(0, 10)}T${hhmm}:00+08:00`;
}

type Price = Event["price"];
const free: Price = { min: 0, currency: "MYR" };
const rm = (min: number, max?: number): Price => ({ min, ...(max ? { max } : {}), currency: "MYR" });

function ev(key: string, e: Omit<Event, "id" | "sourceId" | "url" | "description"> & { description?: string }): Event {
  return {
    id: `curated:e2e-${key}`,
    sourceId: "curated",
    url: `https://organiser.example/events/${key}`,
    description: e.description ?? `Fixture ${key} for the Phase 5 browser tests.`,
    ...e,
  };
}

export const F = {
  "01": ev("f01", {
    title: "Jazz Night at Café Bukit",
    start: myt(0, "20:00"),
    end: myt(0, "23:00"),
    venue: { name: "Bukit Bintang Lounge", address: "Jalan Alor, Kuala Lumpur", ...at(1.5, 30) },
    category: "music",
    price: free,
  }),
  "02": ev("f02", {
    title: "Weekend Night Market",
    start: myt(2, "18:00"),
    end: myt(2, "23:00"),
    venue: { name: "Jalan TAR Car Park", address: "Jalan Tuanku Abdul Rahman", ...at(4, 120) },
    category: "food",
    price: rm(10),
  }),
  "03": ev("f03", {
    title: "Indie Gig Sunday",
    start: myt(3, "20:00"),
    end: myt(3, "23:00"),
    venue: { name: "The Bee Hall", address: "Publika, Solaris Dutamas", ...at(8, 330) },
    category: "music",
    price: rm(60, 90),
  }),
  "04": ev("f04", {
    title: "Tech Meetup",
    start: myt(3, "19:00"),
    end: myt(3, "21:00"),
    venue: { name: "Common Ground Ampang", address: "Ampang, Selangor", ...at(9, 60) },
    category: "tech",
    price: null,
  }),
  "05": ev("f05", {
    title: "Art Walk",
    start: myt(5, "10:00"),
    end: myt(5, "13:00"),
    venue: { name: "Rawang Old Town", ...at(22, 300) },
    category: "arts",
    price: free,
  }),
  "06": ev("f06", {
    title: "Trail Run",
    start: myt(20, "07:00"),
    end: myt(20, "11:00"),
    venue: { name: "Broga Hill Trailhead", ...at(45, 210) },
    category: "sports",
    price: rm(80),
  }),
  "07": ev("f07", {
    title: "Pop-up Workshop",
    start: myt(2, "14:00"),
    end: myt(2, "16:00"),
    venue: { name: "Studio Somewhere" }, // no coordinates (FR-09)
    category: "learning",
    price: rm(20),
  }),
  "08": ev("f08", {
    title: "Ended Bazaar",
    start: myt(-1, "10:00"),
    end: myt(-1, "18:00"),
    venue: { name: "Kampung Baru Field", ...at(3, 150) },
    category: "food",
    price: free,
  }),
  "09": ev("f09", {
    title: "<b>Bold</b> Comedy <script>",
    start: myt(4, "21:00"),
    end: myt(4, "23:00"),
    venue: { name: "Crackhouse Comedy Club", ...at(6, 250) },
    category: "nightlife",
    price: rm(45),
  }),
} satisfies Record<string, Event>;

export const MAIN_EVENTS: Event[] = Object.values(F);

/** Default view (10 km, Next 30 days, any price, soonest first) — test-plan §2.2. */
export const DEFAULT_ORDER = [F["01"], F["07"], F["02"], F["04"], F["03"], F["09"]].map((e) => e.title);

/** Second fixture, returned when the search point is the Kota Kinabalu centre (FR-41). */
export const KK_EVENTS: Event[] = [
  ev("kk1", {
    title: "Gaya Street Sunday Market",
    start: myt(3, "06:30"),
    end: myt(3, "12:00"),
    venue: { name: "Gaya Street", ...at(1, 45, KK_CENTER) },
    category: "food",
    price: free,
  }),
  ev("kk2", {
    title: "Borneo Jazz Jam",
    start: myt(6, "20:00"),
    end: myt(6, "23:00"),
    venue: { name: "Waterfront KK", ...at(2, 220, KK_CENTER) },
    category: "music",
    price: rm(30),
  }),
];

export function searchResponse(events: Event[], sources: SearchResponse["sources"] = [{ id: "curated", ok: true, count: events.length }]): SearchResponse {
  return { events, sources, generatedAt: NOW.toISOString() };
}
