import { describe, expect, it } from "vitest";
import type { Event } from "./event-schema";
import { clearBookmarks, parseBookmarks, readRaw, toggleBookmark } from "./bookmarks";

const isSaved = (id: string, raw: string) => parseBookmarks(raw).some((b) => b.event.id === id);

function memoryStore() {
  const m = new Map<string, string>();
  return {
    getItem: (k: string) => m.get(k) ?? null,
    setItem: (k: string, v: string) => void m.set(k, v),
    removeItem: (k: string) => void m.delete(k),
  };
}

const ev: Event = {
  id: "curated:kl-0002",
  sourceId: "curated",
  title: "Indie Night",
  description: "",
  start: "2026-11-21T20:00:00+08:00",
  venue: { name: "KLCC Park", lat: 3.1544, lon: 101.7146 },
  category: "music",
  price: { min: 35, currency: "MYR" },
  url: "https://example.com/indie",
};

describe("FR-20 bookmarks", () => {
  it("save, then unsave", () => {
    const s = memoryStore();
    expect(toggleBookmark(ev, s)).toBe(true);
    expect(isSaved(ev.id, readRaw(s))).toBe(true);
    expect(toggleBookmark(ev, s)).toBe(false);
    expect(isSaved(ev.id, readRaw(s))).toBe(false);
  });

  it("keeps a snapshot of the event, newest first", () => {
    const s = memoryStore();
    toggleBookmark(ev, s, new Date("2026-11-11T10:00:00Z"));
    toggleBookmark({ ...ev, id: "curated:kl-0004", title: "Tech Meetup" }, s, new Date("2026-11-11T11:00:00Z"));
    const list = parseBookmarks(readRaw(s));
    expect(list.map((b) => b.event.title)).toEqual(["Tech Meetup", "Indie Night"]);
  });
});

describe("NFR-11 clear saved data", () => {
  it("removes everything", () => {
    const s = memoryStore();
    toggleBookmark(ev, s);
    clearBookmarks(s);
    expect(parseBookmarks(readRaw(s))).toEqual([]);
  });
});

describe("robustness (T-04)", () => {
  it("ignores corrupted storage", () => {
    expect(parseBookmarks("{not json")).toEqual([]);
  });

  it("rejects tampered entries with unsafe links", () => {
    const bad = JSON.stringify([{ savedAt: "x", event: { ...ev, url: "javascript:alert(1)" } }]);
    expect(parseBookmarks(bad)).toEqual([]);
  });

  it("works when storage is unavailable", () => {
    expect(readRaw(null)).toBe("[]");
    const throwing = { getItem: () => { throw new Error("blocked"); }, setItem: () => {}, removeItem: () => {} };
    expect(readRaw(throwing)).toBe("[]");
  });
});
