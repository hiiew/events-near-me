// Server-side test events S-1 – S-4 (+ fillers) for the details page and the real API (test-plan.md §2.3, PRE-D).
// playwright.config.ts hands them to the e2e web server as E2E_CURATED_EVENTS, which src/lib/sources/curated.ts
// serves instead of data/curated-events.json. The server uses its real clock, so dates here are relative to the
// day the run starts (Malaysia time) and always lie 1 – 25 days ahead: the tests never depend on real data or dates.
import type { Event } from "@/lib/event-schema";

type Entry = Omit<Event, "sourceId" | "id"> & { id: string; venue: { name: string; address?: string; lat: number; lon: number } };

// One anchor day for the whole run: set once in the main Playwright process, inherited by the workers and the
// web server, so a run that crosses midnight still agrees with itself.
const DAY = (process.env.E2E_DAY ??= new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10));

/** Anchor day + n days, at hh:mm Malaysia time, as an ISO string with +08:00. */
function day(n: number, hhmm: string): string {
  const d = new Date(Date.parse(`${DAY}T00:00:00Z`) + n * 86_400_000);
  return `${d.toISOString().slice(0, 10)}T${hhmm}:00+08:00`;
}

// Coordinates are public places near the area centres and never contain the KLCC landmark's numbers (TC-40, TC-50).
const ENTRIES = {
  /** Every field: price range, end time, address, description and an image (FR-17 image, FR-37 preview image). */
  full: {
    id: "e2e-s1",
    title: "E2E Poster Night at Dataran",
    description: "Server fixture S-1 for the Phase 5 browser tests: every optional field is filled in.",
    start: day(2, "20:00"),
    end: day(2, "22:30"),
    venue: { name: "Dataran Merdeka", address: "Jalan Raja, Kuala Lumpur", lat: 3.1478, lon: 101.6935 },
    category: "arts",
    price: { min: 35, max: 60, currency: "MYR" },
    url: "https://organiser.example/e2e/s1",
    imageUrl: "https://images.organiser.example/e2e/s1-poster.png",
  },
  /** No price (TC-23, FR-13), no end time (calendar default length), no address, no image. */
  noPrice: {
    id: "e2e-s2",
    title: "E2E Open Mic, Price Unknown",
    description: "Server fixture S-2: no price, no end time, no address, no image.",
    start: day(3, "19:30"),
    venue: { name: "Lake Gardens Bandstand", lat: 3.1429, lon: 101.6846 },
    category: "music",
    price: null,
    url: "https://organiser.example/e2e/s2",
    imageUrl: null,
  },
  /** Free, with an end time. */
  free: {
    id: "e2e-s3",
    title: "E2E Free Morning Market",
    description: "Server fixture S-3: free entry, with an end time.",
    start: day(1, "08:00"),
    end: day(1, "12:00"),
    venue: { name: "Central Market Annexe", address: "Jalan Hang Kasturi, Kuala Lumpur", lat: 3.1456, lon: 101.6954 },
    category: "food",
    price: { min: 0, currency: "MYR" },
    url: "https://organiser.example/e2e/s3",
  },
  /** A Sabah event (FR-41 area, "sb-" ids). */
  sabah: {
    id: "sb-e2e-s4",
    title: "E2E Waterfront Sunset Gig",
    description: "Server fixture S-4: a Kota Kinabalu event.",
    start: day(4, "18:00"),
    end: day(4, "21:00"),
    venue: { name: "KK Waterfront", address: "Jalan Tun Fuad Stephens, Kota Kinabalu", lat: 5.9833, lon: 116.0712 },
    category: "music",
    price: { min: 20, currency: "MYR" },
    url: "https://organiser.example/e2e/s4",
  },
} satisfies Record<string, Entry>;

// Fillers keep the Klang Valley list about as long as the real file's (≈ 20 upcoming), so TC-56 (NFR-01) still
// times a realistic list rather than three rows.
const round4 = (n: number) => Math.round(n * 1e4) / 1e4;
const CATEGORIES = ["music", "food", "arts", "sports", "learning", "tech", "nightlife", "other"] as const;
const FILLERS: Entry[] = Array.from({ length: 20 }, (_, i) => ({
  id: `e2e-fill-${String(i + 1).padStart(2, "0")}`,
  title: `E2E Filler Event ${i + 1}`,
  description: "Server fixture filler.",
  start: day(5 + i, "19:00"),
  end: day(5 + i, "21:00"),
  venue: { name: `Filler Hall ${i + 1}`, lat: round4(3.12 + (i % 5) * 0.007), lon: round4(101.65 + (i % 4) * 0.011) },
  category: CATEGORIES[i % CATEGORIES.length],
  price: i % 3 === 0 ? null : { min: 10 + i, currency: "MYR" },
  url: `https://organiser.example/e2e/fill-${i + 1}`,
}));

/** The JSON array the web server serves as its curated file. */
export const SERVER_CURATED_JSON = JSON.stringify([...Object.values(ENTRIES), ...FILLERS]);

const asEvent = (e: Entry): Event => ({ ...e, id: `curated:${e.id}`, sourceId: "curated" });

/** The server fixtures as the app shows them (app id "curated:…"), for building expected values in tests. */
export const S = {
  full: asEvent(ENTRIES.full),
  noPrice: asEvent(ENTRIES.noPrice),
  free: asEvent(ENTRIES.free),
  sabah: asEvent(ENTRIES.sabah),
};

export const eventPath = (e: Pick<Event, "id">) => `/event/${encodeURIComponent(e.id)}`;
