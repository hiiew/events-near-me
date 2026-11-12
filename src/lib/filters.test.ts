import { describe, expect, it } from "vitest";
import type { Event } from "./event-schema";
import { applyFilters, DEFAULT_FILTERS, isFreeThisWeek, toggleFreeThisWeek, whenWindow, widerRadius, type Filters } from "./filters";

const KLCC = { lat: 3.158, lon: 101.712 };
// Wednesday 11 Nov 2026, 12:00 Malaysia time
const NOW = new Date("2026-11-11T12:00:00+08:00");

function ev(id: string, start: string, extra: Partial<Event> = {}): Event {
  return {
    id,
    sourceId: "curated",
    title: id,
    description: "",
    start,
    venue: { name: "KLCC Park", lat: 3.1544, lon: 101.7146 },
    category: "other",
    price: null,
    url: "https://example.com/" + id,
    ...extra,
  };
}

const f = (over: Partial<Filters> = {}): Filters => ({ ...DEFAULT_FILTERS, ...over });
const ids = (xs: { id: string }[]) => xs.map((x) => x.id);

describe("FR-04 / FR-10 distance", () => {
  const near = ev("near", "2026-11-21T20:00:00+08:00");
  const far = ev("far", "2026-11-15T10:00:00+08:00", { venue: { name: "Sunway", lat: 3.0733, lon: 101.607 } });

  it("default 10 km keeps the near event and drops one ~15 km away", () => {
    expect(ids(applyFilters([near, far], KLCC, f(), NOW))).toEqual(["near"]);
  });

  it("25 km includes the far event", () => {
    expect(ids(applyFilters([near, far], KLCC, f({ radiusKm: 25 }), NOW))).toContain("far");
  });

  it("adds distanceKm", () => {
    expect(applyFilters([near], KLCC, f(), NOW)[0].distanceKm).toBeLessThan(1);
  });

  it("widerRadius steps up and stops at 50", () => {
    expect(widerRadius(10)).toBe(25);
    expect(widerRadius(50)).toBeNull();
  });
});

describe("FR-11 date windows (Malaysia time)", () => {
  it("today runs from now to midnight MYT", () => {
    const [from, to] = whenWindow("today", NOW);
    expect(from).toBe(NOW.getTime());
    expect(to).toBe(Date.parse("2026-11-12T00:00:00+08:00"));
  });

  it("weekend on a Wednesday is the coming Sat–Sun", () => {
    expect(whenWindow("weekend", NOW)).toEqual([
      Date.parse("2026-11-14T00:00:00+08:00"),
      Date.parse("2026-11-16T00:00:00+08:00"),
    ]);
  });

  it("weekend on a Sunday is the current weekend, from now", () => {
    const sunday = new Date("2026-11-15T09:00:00+08:00");
    expect(whenWindow("weekend", sunday)).toEqual([sunday.getTime(), Date.parse("2026-11-16T00:00:00+08:00")]);
  });

  it("weekend on Saturday 23:30 UTC (= Sunday 07:30 MYT) uses Malaysia's day", () => {
    const [, to] = whenWindow("weekend", new Date("2026-11-14T23:30:00Z"));
    expect(to).toBe(Date.parse("2026-11-16T00:00:00+08:00"));
  });

  it("filters by window and keeps ongoing events", () => {
    const events = [
      ev("sat", "2026-11-14T10:00:00+08:00"),
      ev("next-week", "2026-11-17T10:00:00+08:00"),
      ev("ongoing", "2026-11-10T10:00:00+08:00", { end: "2026-11-11T18:00:00+08:00" }),
    ];
    expect(ids(applyFilters(events, KLCC, f({ when: "weekend" }), NOW))).toEqual(["sat"]);
    expect(ids(applyFilters(events, KLCC, f({ when: "today" }), NOW))).toEqual(["ongoing"]);
    expect(ids(applyFilters(events, KLCC, f({ when: "7d" }), NOW))).toEqual(["ongoing", "sat", "next-week"]);
  });
});

describe("FR-12 categories", () => {
  const music = ev("music", "2026-11-20T20:00:00+08:00", { category: "music" });
  const food = ev("food", "2026-11-21T10:00:00+08:00", { category: "food" });
  const tech = ev("tech", "2026-11-22T19:00:00+08:00", { category: "tech" });

  it("empty selection = all", () => {
    expect(applyFilters([music, food, tech], KLCC, f(), NOW)).toHaveLength(3);
  });

  it("multi-select keeps only chosen categories", () => {
    expect(ids(applyFilters([music, food, tech], KLCC, f({ categories: ["music", "tech"] }), NOW))).toEqual(["music", "tech"]);
  });
});

describe("FR-13 price", () => {
  const free = ev("free", "2026-11-20T10:00:00+08:00", { price: { min: 0, currency: "MYR" } });
  const rm35 = ev("rm35", "2026-11-21T10:00:00+08:00", { price: { min: 35, currency: "MYR" } });
  const range = ev("range", "2026-11-22T10:00:00+08:00", { price: { min: 20, max: 80, currency: "MYR" } });
  const unlisted = ev("unlisted", "2026-11-23T10:00:00+08:00", { price: null });
  const all = [free, rm35, range, unlisted];

  it("any shows everything, including price not listed", () => {
    expect(applyFilters(all, KLCC, f(), NOW)).toHaveLength(4);
  });

  it("free only", () => {
    expect(ids(applyFilters(all, KLCC, f({ price: { kind: "free" } }), NOW))).toEqual(["free"]);
  });

  it("max RM 30 keeps events whose lowest price fits and hides unlisted", () => {
    expect(ids(applyFilters(all, KLCC, f({ price: { kind: "max", max: 30 } }), NOW))).toEqual(["free", "range"]);
  });
});

describe("FR-06 sorting and FR-09 no coordinates", () => {
  const later = ev("later-near", "2026-11-25T10:00:00+08:00");
  const sooner = ev("sooner-farther", "2026-11-14T10:00:00+08:00", { venue: { name: "Pasar Seni", lat: 3.1456, lon: 101.6955 } });
  const noCoords = ev("no-coords", "2026-11-13T10:00:00+08:00", { venue: { name: "Somewhere" } });

  it("soonest first by default", () => {
    expect(ids(applyFilters([later, sooner], KLCC, f(), NOW))).toEqual(["sooner-farther", "later-near"]);
  });

  it("nearest first, events without coordinates last", () => {
    expect(ids(applyFilters([later, sooner, noCoords], KLCC, f({ sort: "nearest" }), NOW))).toEqual([
      "later-near",
      "sooner-farther",
      "no-coords",
    ]);
  });

  it("keeps events without coordinates, with no distance", () => {
    const [e] = applyFilters([noCoords], KLCC, f(), NOW);
    expect(e.distanceKm).toBeUndefined();
  });

  it("does not change the input array", () => {
    const input = [later, sooner];
    applyFilters(input, KLCC, f(), NOW);
    expect(ids(input)).toEqual(["later-near", "sooner-farther"]);
  });
});

describe("FR-34 Free this week chip", () => {
  const FREE: Event["price"] = { min: 0, currency: "MYR" };

  it("is off by default and on only for Free only + Next 7 days", () => {
    expect(isFreeThisWeek(DEFAULT_FILTERS)).toBe(false);
    expect(isFreeThisWeek(f({ when: "7d", price: { kind: "free" } }))).toBe(true);
    expect(isFreeThisWeek(f({ when: "7d", price: { kind: "max", max: 20 } }))).toBe(false);
    expect(isFreeThisWeek(f({ when: "30d", price: { kind: "free" } }))).toBe(false);
    expect(isFreeThisWeek(f({ when: "weekend", price: { kind: "free" } }))).toBe(false);
  });

  it("turns on: sets Free only and Next 7 days", () => {
    expect(toggleFreeThisWeek(DEFAULT_FILTERS)).toEqual({ ...DEFAULT_FILTERS, when: "7d", price: { kind: "free" } });
  });

  it("turns off: puts only those two filters back to their defaults", () => {
    const custom = f({ radiusKm: 25, categories: ["music"], sort: "nearest", when: "7d", price: { kind: "free" } });
    expect(toggleFreeThisWeek(custom)).toEqual({ ...custom, when: "30d", price: { kind: "any" } });
  });

  it("keeps distance, categories and sort when turning on", () => {
    const custom = f({ radiusKm: 5, categories: ["food", "arts"], sort: "nearest", when: "today", price: { kind: "max", max: 30 } });
    const on = toggleFreeThisWeek(custom);
    expect([on.radiusKm, on.categories, on.sort]).toEqual([5, ["food", "arts"], "nearest"]);
  });

  it("two taps return to the starting filters", () => {
    expect(toggleFreeThisWeek(toggleFreeThisWeek(DEFAULT_FILTERS))).toEqual(DEFAULT_FILTERS);
  });

  it("with the chip on, applyFilters keeps only free events in the next 7 days", () => {
    const events = [
      ev("free-soon", "2026-11-14T20:00:00+08:00", { price: FREE }),
      ev("free-later", "2026-12-05T20:00:00+08:00", { price: FREE }),
      ev("paid-soon", "2026-11-14T20:00:00+08:00", { price: { min: 35, currency: "MYR" } }),
      ev("unknown-price-soon", "2026-11-14T20:00:00+08:00", { price: null }),
    ];
    expect(ids(applyFilters(events, KLCC, toggleFreeThisWeek(DEFAULT_FILTERS), NOW))).toEqual(["free-soon"]);
  });
});
