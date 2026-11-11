import { describe, expect, it } from "vitest";
import {
  CuratedEventSchema,
  EventSchema,
  SearchRequestSchema,
} from "./event-schema";

const validEvent = {
  id: "curated:kl-0001",
  sourceId: "curated",
  title: "SAMPLE — Craft Market",
  description: "Example.",
  start: "2026-12-05T10:00:00+08:00",
  venue: { name: "Hall", lat: 3.15, lon: 101.7 },
  category: "food",
  price: { min: 0, currency: "MYR" },
  url: "https://example.com/event",
};

describe("FR-24 EventSchema", () => {
  it("accepts a valid event", () => {
    expect(EventSchema.safeParse(validEvent).success).toBe(true);
  });

  it("rejects an http:// url (T-04)", () => {
    const r = EventSchema.safeParse({ ...validEvent, url: "http://example.com" });
    expect(r.success).toBe(false);
  });

  it("rejects a javascript: url (T-04)", () => {
    const r = EventSchema.safeParse({ ...validEvent, url: "javascript:alert(1)" });
    expect(r.success).toBe(false);
  });

  it("accepts price null (Price not listed)", () => {
    expect(EventSchema.safeParse({ ...validEvent, price: null }).success).toBe(true);
  });

  it("rejects a start time without a timezone offset", () => {
    const r = EventSchema.safeParse({ ...validEvent, start: "2026-12-05T10:00:00" });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown category", () => {
    expect(EventSchema.safeParse({ ...validEvent, category: "gaming" }).success).toBe(false);
  });
});

describe("FR-25 CuratedEventSchema", () => {
  const { sourceId: _ignored, ...curated } = validEvent;

  it("accepts a curated event without sourceId", () => {
    expect(CuratedEventSchema.safeParse(curated).success).toBe(true);
  });

  it("requires venue coordinates", () => {
    const r = CuratedEventSchema.safeParse({ ...curated, venue: { name: "Hall" } });
    expect(r.success).toBe(false);
  });
});

describe("NFR-08 SearchRequestSchema", () => {
  it("accepts a valid point", () => {
    expect(SearchRequestSchema.safeParse({ lat: 3.158, lon: 101.712 }).success).toBe(true);
  });

  it("rejects lat out of range", () => {
    expect(SearchRequestSchema.safeParse({ lat: 91, lon: 101 }).success).toBe(false);
  });

  it("rejects extra fields", () => {
    expect(SearchRequestSchema.safeParse({ lat: 3, lon: 101, name: "x" }).success).toBe(false);
  });

  it("rejects strings instead of numbers", () => {
    expect(SearchRequestSchema.safeParse({ lat: "3", lon: "101" }).success).toBe(false);
  });
});
