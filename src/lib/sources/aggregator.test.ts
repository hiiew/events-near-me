import { afterEach, describe, expect, it, vi } from "vitest";
import type { Event } from "../event-schema";
import { searchAllSources } from "./aggregator";
import { getEnabledAdapters } from "./registry";
import type { SourceAdapter, SourceQuery } from "./types";

const query: SourceQuery = {
  lat: 3.158,
  lon: 101.712,
  radiusKm: 50,
  from: new Date("2026-11-11T00:00:00+08:00"),
  to: new Date("2026-12-11T00:00:00+08:00"),
};

function ev(id: string, start: string): Event {
  return {
    id,
    sourceId: "curated",
    title: id,
    description: "",
    start,
    venue: { name: "V", lat: 3.15, lon: 101.71 },
    category: "other",
    price: null,
    url: "https://example.com/" + id,
  };
}

function adapter(id: SourceAdapter["id"], getEvents: SourceAdapter["getEvents"], enabled = true): SourceAdapter {
  return { id, isEnabled: () => enabled, getEvents };
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("FR-24 searchAllSources", () => {
  it("merges results from all sources, sorted by start", async () => {
    const a = adapter("curated", async () => [ev("a2", "2026-11-20T10:00:00+08:00")]);
    const b = adapter("eventbrite", async () => [ev("b1", "2026-11-15T10:00:00+08:00")]);
    const out = await searchAllSources([a, b], query);
    expect(out.events.map((e) => e.id)).toEqual(["b1", "a2"]);
    expect(out.sources).toEqual([
      { id: "curated", ok: true, count: 1 },
      { id: "eventbrite", ok: true, count: 1 },
    ]);
  });

  it("skips disabled sources", async () => {
    const off = adapter("eventbrite", async () => [ev("x", "2026-11-15T10:00:00+08:00")], false);
    const out = await searchAllSources([off], query);
    expect(out).toEqual({ events: [], sources: [] });
  });
});

describe("FR-28 / NFR-12 one source failing", () => {
  it("returns the other source's events and marks the failed one", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const good = adapter("curated", async () => [ev("ok", "2026-11-20T10:00:00+08:00")]);
    const bad = adapter("eventbrite", async () => {
      throw new Error("HTTP 500");
    });
    const out = await searchAllSources([good, bad], query);
    expect(out.events.map((e) => e.id)).toEqual(["ok"]);
    expect(out.sources).toContainEqual({ id: "eventbrite", ok: false, count: 0 });
  });

  it("times out a source that never answers", async () => {
    vi.useFakeTimers();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const good = adapter("curated", async () => [ev("ok", "2026-11-20T10:00:00+08:00")]);
    const hang = adapter("eventbrite", () => new Promise<Event[]>(() => {}));
    const pending = searchAllSources([good, hang], query, 5000);
    await vi.advanceTimersByTimeAsync(5000);
    const out = await pending;
    expect(out.events).toHaveLength(1);
    expect(out.sources).toContainEqual({ id: "eventbrite", ok: false, count: 0 });
    // The log names the source, never the coordinates (NFR-10).
    expect(String(warn.mock.calls[0][0])).not.toMatch(/3\.158|101\.712/);
  });
});

describe("NFR-14 getEnabledAdapters", () => {
  it("defaults to curated", () => {
    expect(getEnabledAdapters(undefined).map((a) => a.id)).toEqual(["curated"]);
  });

  it("ignores unknown names and spaces", () => {
    expect(getEnabledAdapters(" curated , nope ").map((a) => a.id)).toEqual(["curated"]);
  });

  it("can disable everything", () => {
    expect(getEnabledAdapters("eventbrite")).toEqual([]);
  });
});
