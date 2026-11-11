import { describe, expect, it } from "vitest";
import type { Event } from "./event-schema";
import { DEFAULT_RADIUS_KM, nearbyEvents } from "./filters";

const KLCC = { lat: 3.158, lon: 101.712 };

function ev(id: string, start: string, venue: Event["venue"]): Event {
  return {
    id,
    sourceId: "curated",
    title: id,
    description: "",
    start,
    venue,
    category: "other",
    price: null,
    url: "https://example.com/" + id,
  };
}

const near = ev("near", "2026-11-21T20:00:00+08:00", { name: "KLCC Park", lat: 3.1544, lon: 101.7146 });
const nearEarlier = ev("nearEarlier", "2026-11-14T10:00:00+08:00", { name: "Pasar Seni", lat: 3.1456, lon: 101.6955 });
const far = ev("far", "2026-11-15T10:00:00+08:00", { name: "Sunway", lat: 3.0733, lon: 101.607 });
const noCoords = ev("noCoords", "2026-11-16T10:00:00+08:00", { name: "Somewhere" });

describe("FR-04 nearbyEvents", () => {
  it("default radius is 10 km", () => {
    expect(DEFAULT_RADIUS_KM).toBe(10);
  });

  it("keeps events within 10 km and drops one ~15 km away", () => {
    const ids = nearbyEvents([near, far], KLCC).map((e) => e.id);
    expect(ids).toEqual(["near"]);
  });

  it("includes the far event with a 25 km radius", () => {
    expect(nearbyEvents([near, far], KLCC, 25).map((e) => e.id)).toContain("far");
  });

  it("adds distanceKm", () => {
    const [e] = nearbyEvents([near], KLCC);
    expect(e.distanceKm).toBeGreaterThan(0);
    expect(e.distanceKm).toBeLessThan(1);
  });
});

describe("FR-06 sorting", () => {
  it("sorts soonest first", () => {
    expect(nearbyEvents([near, nearEarlier], KLCC).map((e) => e.id)).toEqual(["nearEarlier", "near"]);
  });

  it("does not change the input array", () => {
    const input = [near, nearEarlier];
    nearbyEvents(input, KLCC);
    expect(input.map((e) => e.id)).toEqual(["near", "nearEarlier"]);
  });
});

describe("FR-09 events without coordinates", () => {
  it("are kept, with no distance", () => {
    const out = nearbyEvents([noCoords], KLCC);
    expect(out).toHaveLength(1);
    expect(out[0].distanceKm).toBeUndefined();
  });
});
