import { describe, expect, it } from "vitest";
import curatedData from "../../data/curated-events.json";
import { AREA_RADIUS_KM, AREAS, areaFilters, countForArea } from "./areas";
import { type Event } from "./event-schema";
import { applyFilters, DEFAULT_FILTERS, RADIUS_OPTIONS } from "./filters";
import { haversineKm, roundPoint } from "./geo";

// Friday 13 Nov 2026, 12:00 Malaysia time
const NOW = new Date("2026-11-13T12:00:00+08:00");
const KL = AREAS.find((a) => a.id === "klang-valley")!;
const KK = AREAS.find((a) => a.id === "kota-kinabalu")!;

function ev(id: string, start: string, at: { lat: number; lon: number }, extra: Partial<Event> = {}): Event {
  return {
    id,
    sourceId: "curated",
    title: id,
    description: "",
    start,
    venue: { name: "Venue", ...at },
    category: "other",
    price: null,
    url: "https://example.com/" + id,
    ...extra,
  };
}
const nearKl = { lat: 3.1544, lon: 101.7146 }; // KLCC, ~3 km from the KL centre
const sunway = { lat: 3.0733, lon: 101.607 }; // ~13 km from the KL centre
const penang = { lat: 5.4141, lon: 100.3288 };
const nearKk = { lat: 5.9976, lon: 116.0845 }; // SICC, ~3 km from the KK centre

describe("FR-41 area list", () => {
  it("has unique ids and names", () => {
    expect(new Set(AREAS.map((a) => a.id)).size).toBe(AREAS.length);
    expect(new Set(AREAS.map((a) => a.name)).size).toBe(AREAS.length);
  });

  it("centres are valid points already rounded to 3 decimals (NFR-09)", () => {
    for (const a of AREAS) {
      expect(a.center).toEqual(roundPoint(a.center));
      expect(Math.abs(a.center.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(a.center.lon)).toBeLessThanOrEqual(180);
    }
  });

  it("the area distance is one of the distances the filter offers, and the widest", () => {
    expect(RADIUS_OPTIONS).toContain(AREA_RADIUS_KM);
    expect(AREA_RADIUS_KM).toBe(Math.max(...RADIUS_OPTIONS));
  });

  it("choosing an area resets every filter to its default except distance", () => {
    expect(areaFilters()).toEqual({ ...DEFAULT_FILTERS, radiusKm: 50 });
  });
});

describe("FR-41 countForArea", () => {
  it("counts upcoming events within 50 km of the area centre", () => {
    const events = [ev("a", "2026-11-20T20:00:00+08:00", nearKl), ev("b", "2026-11-21T20:00:00+08:00", sunway)];
    expect(countForArea(events, KL, NOW)).toBe(2);
  });

  it("leaves out ended events, events beyond 30 days and events outside 50 km", () => {
    const events = [
      ev("ok", "2026-11-20T20:00:00+08:00", nearKl),
      ev("ended", "2026-11-01T10:00:00+08:00", nearKl, { end: "2026-11-01T18:00:00+08:00" }),
      ev("later", "2027-01-20T20:00:00+08:00", nearKl),
      ev("far", "2026-11-20T20:00:00+08:00", penang),
    ];
    expect(countForArea(events, KL, NOW)).toBe(1);
  });

  it("each area only counts its own events", () => {
    const events = [ev("kl", "2026-11-20T20:00:00+08:00", nearKl), ev("kk", "2026-11-20T20:00:00+08:00", nearKk)];
    expect(countForArea(events, KL, NOW)).toBe(1);
    expect(countForArea(events, KK, NOW)).toBe(1);
  });

  it("includes events with no price, and ones without coordinates are not counted", () => {
    const noCoords = { ...ev("n", "2026-11-20T20:00:00+08:00", nearKl), venue: { name: "Somewhere" } } as Event;
    expect(countForArea([ev("p", "2026-11-20T20:00:00+08:00", nearKl, { price: null }), noCoords], KL, NOW)).toBe(2);
  });

  it("is exactly the number of rows the list shows after the area is chosen", () => {
    const events = [ev("a", "2026-11-20T20:00:00+08:00", nearKl), ev("b", "2026-11-21T20:00:00+08:00", sunway), ev("c", "2026-11-22T20:00:00+08:00", penang)];
    expect(countForArea(events, KL, NOW)).toBe(applyFilters(events, KL.center, areaFilters(), NOW).length);
  });
});

describe("FR-41 against the real data file", () => {
  it("every area has events near its centre, so the button never promises an empty list", () => {
    for (const a of AREAS) {
      const near = (curatedData as unknown as { venue: { lat: number; lon: number } }[]).filter((e) => haversineKm(a.center, e.venue) <= AREA_RADIUS_KM);
      expect(near.length, a.name).toBeGreaterThan(0);
    }
  });
});
