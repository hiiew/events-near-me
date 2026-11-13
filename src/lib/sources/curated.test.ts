import { afterEach, describe, expect, it, vi } from "vitest";
import curatedData from "../../../data/curated-events.json";
import { CuratedEventSchema } from "../event-schema";
import { curatedAdapter, filterCurated, getCuratedEvent } from "./curated";
import type { SourceQuery } from "./types";

const base = {
  title: "SAMPLE — Test",
  description: "x",
  venue: { name: "KLCC Park", lat: 3.1544, lon: 101.7146 },
  category: "food",
  price: { min: 0, currency: "MYR" },
  url: "https://example.com/e",
};

const query: SourceQuery = {
  lat: 3.158,
  lon: 101.712,
  radiusKm: 50,
  from: new Date("2026-11-11T00:00:00+08:00"),
  to: new Date("2026-12-11T00:00:00+08:00"),
};

afterEach(() => vi.restoreAllMocks());

describe("FR-05 / FR-25 filterCurated", () => {
  it("keeps an upcoming event inside the radius and prefixes its id", () => {
    const out = filterCurated([{ ...base, id: "kl-1", start: "2026-11-20T10:00:00+08:00" }], query);
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("curated:kl-1");
    expect(out[0].sourceId).toBe("curated");
  });

  it("drops an event that already ended", () => {
    const past = { ...base, id: "kl-2", start: "2026-11-01T10:00:00+08:00", end: "2026-11-01T18:00:00+08:00" };
    expect(filterCurated([past], query)).toEqual([]);
  });

  it("keeps an event that started but has not ended yet", () => {
    const ongoing = { ...base, id: "kl-3", start: "2026-11-10T10:00:00+08:00", end: "2026-11-12T18:00:00+08:00" };
    expect(filterCurated([ongoing], query)).toHaveLength(1);
  });

  it("drops an event starting after the window", () => {
    const later = { ...base, id: "kl-4", start: "2027-01-17T20:00:00+08:00" };
    expect(filterCurated([later], query)).toEqual([]);
  });

  it("drops an event outside the radius", () => {
    const far = { ...base, id: "kl-5", start: "2026-11-20T10:00:00+08:00", venue: { name: "Sunway", lat: 3.0733, lon: 101.607 } };
    expect(filterCurated([far], { ...query, radiusKm: 10 })).toEqual([]);
  });

  it("skips an invalid entry without throwing, logging only its id", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const bad = { ...base, id: "kl-bad", start: "2026-11-20T10:00:00+08:00", url: "http://insecure.example" };
    const good = { ...base, id: "kl-good", start: "2026-11-20T10:00:00+08:00" };
    const out = filterCurated([bad, good], query);
    expect(out.map((e) => e.id)).toEqual(["curated:kl-good"]);
    expect(warn).toHaveBeenCalledWith("[curated] skipped invalid entry: kl-bad");
    expect(String(warn.mock.calls[0][0])).not.toMatch(/3\.15|101\./);
  });
});

describe("FR-25 data/curated-events.json", () => {
  it("every entry is valid", () => {
    for (const entry of curatedData as unknown[]) {
      const r = CuratedEventSchema.safeParse(entry);
      expect(r.success, JSON.stringify((entry as { id: string }).id)).toBe(true);
    }
  });

  it("ids are unique", () => {
    const ids = (curatedData as { id: string }[]).map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("adapter returns events from the file", async () => {
    const out = await curatedAdapter.getEvents(query);
    expect(out.length).toBeGreaterThan(0);
    expect(out.every((e) => e.sourceId === "curated")).toBe(true);
  });
});

describe("FR-17 getCuratedEvent", () => {
  it("finds an event by its app id", () => {
    const e = getCuratedEvent("curated:kl-9", [{ ...base, id: "kl-9", title: "Indie Night", start: "2026-11-20T10:00:00+08:00" }]);
    expect(e?.title).toContain("Indie Night");
    expect(e?.sourceId).toBe("curated");
  });

  it("returns null for an unknown id or another source's id", () => {
    expect(getCuratedEvent("curated:nope")).toBeNull();
    expect(getCuratedEvent("eventbrite:123")).toBeNull();
  });

  it("returns null for an invalid entry instead of throwing", () => {
    expect(getCuratedEvent("curated:bad", [{ id: "bad", url: "http://x" }])).toBeNull();
  });
});
