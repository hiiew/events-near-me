import { describe, expect, it } from "vitest";
import type { Event } from "./event-schema";
import { clearLastSearch, loadLastSearch, saveLastSearch } from "./offline-cache";

function fakeStore(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    data,
  };
}

const event: Event = {
  id: "curated:kl-0001",
  sourceId: "curated",
  title: "Indie Night",
  description: "",
  start: "2026-11-21T20:00:00+08:00",
  venue: { name: "KLCC Park", lat: 3.1544, lon: 101.7146 },
  category: "music",
  price: null,
  url: "https://example.com/indie",
};
const now = new Date("2026-11-12T09:00:00Z");

describe("FR-40 last-search cache", () => {
  it("is empty before anything is saved", () => {
    expect(loadLastSearch(fakeStore())).toBeNull();
  });

  it("saves and loads the events and the save time", () => {
    const store = fakeStore();
    saveLastSearch([event], store, now);
    expect(loadLastSearch(store)).toEqual({ savedAt: "2026-11-12T09:00:00.000Z", events: [event] });
  });

  it("never writes a location: no coordinates of the visitor are stored (NFR-09, NFR-10)", () => {
    const store = fakeStore();
    saveLastSearch([event], store, now);
    const stored = JSON.parse(store.data.get("happening.lastsearch.v1") ?? "{}");
    expect(Object.keys(stored).sort()).toEqual(["events", "savedAt"]);
  });

  it("a newer save replaces the older one", () => {
    const store = fakeStore();
    saveLastSearch([event], store, now);
    saveLastSearch([], store, now);
    expect(loadLastSearch(store)?.events).toEqual([]);
  });

  it("clear removes it", () => {
    const store = fakeStore();
    saveLastSearch([event], store, now);
    clearLastSearch(store);
    expect(loadLastSearch(store)).toBeNull();
  });

  it("ignores broken JSON, wrong shapes and events that fail validation", () => {
    expect(loadLastSearch(fakeStore({ "happening.lastsearch.v1": "{oops" }))).toBeNull();
    expect(loadLastSearch(fakeStore({ "happening.lastsearch.v1": JSON.stringify({ savedAt: "x" }) }))).toBeNull();
    const bad = JSON.stringify({ savedAt: now.toISOString(), events: [{ ...event, url: "javascript:alert(1)" }] });
    expect(loadLastSearch(fakeStore({ "happening.lastsearch.v1": bad }))).toBeNull();
  });

  it("does not throw when storage is blocked", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
      removeItem: () => {
        throw new Error("blocked");
      },
    };
    expect(() => saveLastSearch([event], blocked, now)).not.toThrow();
    expect(loadLastSearch(blocked)).toBeNull();
    expect(() => clearLastSearch(blocked)).not.toThrow();
  });

  it("does nothing without a store (server render)", () => {
    expect(loadLastSearch(null)).toBeNull();
    expect(() => saveLastSearch([event], null, now)).not.toThrow();
  });
});
