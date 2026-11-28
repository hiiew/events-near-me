import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Event } from "@/lib/event-schema";
import type { SourceAdapter } from "@/lib/sources/types";
import { POST } from "./route";

// NFR-10 / NFR-14 (TC-40, TC-37): sources the tests below add next to the real registry's. Empty by default,
// so every other test runs against the real registry unchanged.
const extra = vi.hoisted(() => ({ adapters: [] as SourceAdapter[] }));
vi.mock("@/lib/sources/registry", async (importOriginal) => {
  const real = await importOriginal<typeof import("@/lib/sources/registry")>();
  return { getEnabledAdapters: (value?: string) => [...real.getEnabledAdapters(value), ...extra.adapters] };
});

// The route reads data/curated-events.json. The real file changes every week as events are added and
// end, so these tests use their own small fixture instead (same file path, so the adapter gets this).
vi.mock("../../../../../data/curated-events.json", () => {
  const base = {
    description: "fixture",
    category: "other",
    price: null,
    url: "https://example.com/e",
    imageUrl: null,
  };
  return {
    default: [
      { ...base, id: "kl-t1", title: "Near KLCC", start: "2026-11-20T20:00:00+08:00", venue: { name: "KLCC Park", lat: 3.1544, lon: 101.7146 } },
      { ...base, id: "kl-t2", title: "About 13 km away", start: "2026-11-15T10:00:00+08:00", venue: { name: "Sunway", lat: 3.0733, lon: 101.607 } },
      { ...base, id: "kl-t3", title: "Already ended", start: "2026-11-01T10:00:00+08:00", end: "2026-11-01T18:00:00+08:00", venue: { name: "KLCC Park", lat: 3.1544, lon: 101.7146 } },
      { ...base, id: "kl-t4", title: "Beyond 30 days", start: "2027-01-01T20:00:00+08:00", venue: { name: "KLCC Park", lat: 3.1544, lon: 101.7146 } },
      { ...base, id: "kl-t5", title: "Far away (Penang)", start: "2026-11-20T10:00:00+08:00", venue: { name: "George Town", lat: 5.4141, lon: 100.3288 } },
      // Invalid (no start): the curated adapter skips it and logs a warning on every search (TC-40, TC-41).
      { ...base, id: "kl-bad", title: "Invalid entry", venue: { name: "Nowhere", lat: 3.4321, lon: 101.8765 } },
    ],
  };
});

function post(body: string) {
  return POST(
    new Request("http://localhost/api/events/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    }),
  );
}

// NFR-10 (TC-40): every console call made while this file runs is captured (and kept off the test output), and
// after each test none may contain a search coordinate in any spelling: the 6-dp test point, its 3-dp rounding,
// the digits on their own, the points the other tests send, or the invalid entry's venue.
const CONSOLE_METHODS = ["log", "info", "warn", "error", "debug", "trace"] as const;
const PRECISE = { lat: 3.157931, lon: 101.712345 }; // fixture point, not a real user's
const COORDINATE_SPELLINGS = ["3.157931", "101.712345", "157931", "712345", "3.1579", "101.7123", "3.158", "101.712", "3.4321", "101.8765"];
let logged: string[] = [];

function show(arg: unknown): string {
  if (arg instanceof Error) return `${arg.message}\n${arg.stack ?? ""}`;
  if (typeof arg === "string") return arg;
  try {
    return JSON.stringify(arg) ?? String(arg);
  } catch {
    return String(arg);
  }
}

const leaks = (needles: string[]) => logged.filter((line) => needles.some((n) => line.includes(n)));

beforeEach(() => {
  // Freeze "now" so the fixture gives stable results.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-11T12:00:00+08:00"));
  vi.stubEnv("ENABLED_SOURCES", "curated");
  logged = [];
  for (const m of CONSOLE_METHODS) {
    vi.spyOn(console, m).mockImplementation((...args: unknown[]) => {
      logged.push(args.map(show).join(" "));
    });
  }
});

afterEach(() => {
  const found = leaks(COORDINATE_SPELLINGS); // checked before the spies are removed
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllEnvs();
  extra.adapters = [];
  expect(found, "a console line contains a coordinate (NFR-10)").toEqual([]);
});

describe("D-06 POST /api/events/search", () => {
  it("returns upcoming curated events within 50 km for the next 30 days", async () => {
    const res = await post(JSON.stringify({ lat: 3.158, lon: 101.712 }));
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const data = await res.json();
    const ids: string[] = data.events.map((e: { id: string }) => e.id);
    expect(ids).toContain("curated:kl-t1");
    expect(ids).toContain("curated:kl-t2"); // ~13 km: inside the 50 km server radius
    expect(ids).not.toContain("curated:kl-t3"); // ended (FR-05)
    expect(ids).not.toContain("curated:kl-t4"); // beyond 30 days
    expect(ids).not.toContain("curated:kl-t5"); // outside 50 km
    expect(data.sources).toEqual([{ id: "curated", ok: true, count: ids.length }]);
    expect(typeof data.generatedAt).toBe("string");
  });

  it("sorts events by start time", async () => {
    const data = await (await post(JSON.stringify({ lat: 3.158, lon: 101.712 }))).json();
    const starts = data.events.map((e: { start: string }) => Date.parse(e.start));
    expect(starts).toEqual([...starts].sort((a, b) => a - b));
  });
});

describe("NFR-08 input validation", () => {
  it("rejects lat out of range with 400 and does not echo the value", async () => {
    const res = await post(JSON.stringify({ lat: 999, lon: 1 }));
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toContain("invalid_request");
    expect(text).not.toContain("999");
  });

  it("rejects extra fields", async () => {
    expect((await post(JSON.stringify({ lat: 3, lon: 101, debug: true }))).status).toBe(400);
  });

  it("rejects non-JSON", async () => {
    expect((await post("lat=3&lon=101")).status).toBe(400);
  });

  it("rejects a body over 1 KB with 413", async () => {
    const big = JSON.stringify({ lat: 3, lon: 101, pad: "x".repeat(2000) });
    expect((await post(big)).status).toBe(413);
  });
});

function source(id: SourceAdapter["id"], getEvents: SourceAdapter["getEvents"]): SourceAdapter {
  return { id, isEnabled: () => true, getEvents };
}

const secondSourceEvent: Event = {
  id: "eventbrite:t-1",
  sourceId: "eventbrite",
  title: "From a second source",
  description: "fixture",
  start: "2026-11-12T19:00:00+08:00",
  venue: { name: "Second Hall", lat: 3.15, lon: 101.71 },
  category: "music",
  price: null,
  url: "https://example.com/second",
};

describe("NFR-10 (TC-40) the server never logs coordinates or request bodies", () => {
  it("valid 6-dp point with an invalid curated entry, a failing source and a hanging source: errors logged, coordinates not", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(new Date("2026-11-11T12:00:00+08:00"));
    extra.adapters = [
      source("eventbrite", async () => {
        throw new Error("HTTP 500");
      }),
      source("predicthq", () => new Promise<Event[]>(() => {})),
    ];
    const body = JSON.stringify(PRECISE);
    const pending = post(body);
    await vi.advanceTimersByTimeAsync(5000); // the hanging source hits its 5 s timeout
    const res = await pending;

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.sources).toEqual([
      { id: "curated", ok: true, count: 2 },
      { id: "eventbrite", ok: false, count: 0 },
      { id: "predicthq", ok: false, count: 0 },
    ]);
    // The logging paths really ran: one line per problem, each naming only a source or an entry id.
    expect(logged).toEqual(
      expect.arrayContaining([
        "[curated] skipped invalid entry: kl-bad",
        '[aggregator] source "eventbrite" failed: HTTP 500',
        '[aggregator] source "predicthq" failed: timed out after 5000 ms',
      ]),
    );
    expect(logged).toHaveLength(3);
    expect(leaks([body])).toEqual([]);
  });

  it.each([
    ["malformed JSON", `{"lat":${PRECISE.lat},"lon":${PRECISE.lon}`, 400],
    ["lat out of range", JSON.stringify({ lat: 93.157931, lon: PRECISE.lon }), 400],
    ["lat as a string", JSON.stringify({ lat: String(PRECISE.lat), lon: PRECISE.lon }), 400],
    ["extra field", JSON.stringify({ ...PRECISE, accuracy: 12.5 }), 400],
    ["over 1 KB", JSON.stringify({ ...PRECISE, pad: "x".repeat(2000) }), 413],
  ])("%s: rejected without logging or echoing the body", async (_name, body, status) => {
    const res = await post(body);
    expect(res.status).toBe(status);
    const text = await res.text();
    expect(COORDINATE_SPELLINGS.filter((n) => text.includes(n))).toEqual([]);
    expect(logged).toEqual([]); // rejected before any source runs, so nothing at all is logged
  });

  it("unexpected server error: plain 500, nothing about the request logged", async () => {
    extra.adapters = [
      {
        id: "eventbrite",
        isEnabled: () => {
          throw new Error("boom");
        },
        getEvents: async () => [],
      },
    ];
    const res = await post(JSON.stringify(PRECISE));
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "server_error" });
    expect(logged).toEqual([]);
  });

  it("E2E test-data seam: the warning names the event count only; bad data logs the parse error, not the query", async () => {
    const testEvent = { id: "e2e-x", title: "Seam event", description: "fixture", start: "2026-11-13T10:00:00+08:00", venue: { name: "Seam Hall", lat: 3.159, lon: 101.713 }, category: "other", price: null, url: "https://example.com/x" };
    vi.stubEnv("E2E_CURATED_EVENTS", JSON.stringify([testEvent]));
    const ok = await (await post(JSON.stringify(PRECISE))).json();
    expect(ok.events.map((e: { id: string }) => e.id)).toEqual(["curated:e2e-x"]);
    expect(logged).toEqual(["[curated] E2E_CURATED_EVENTS is set: serving 1 TEST events instead of data/curated-events.json"]);

    logged = [];
    vi.stubEnv("E2E_CURATED_EVENTS", "not json");
    const bad = await (await post(JSON.stringify(PRECISE))).json();
    expect(bad.sources).toEqual([{ id: "curated", ok: false, count: 0 }]);
    expect(logged).toHaveLength(1);
    expect(logged[0]).toMatch(/^\[aggregator\] source "curated" failed: /);
  });
});

describe("NFR-14 (TC-37) a second source needs no change to the route or the aggregator", () => {
  it("its events come back merged with curated ones, sorted by start, with their own source status", async () => {
    extra.adapters = [source("eventbrite", async () => [secondSourceEvent])];
    const res = await post(JSON.stringify({ lat: 3.158, lon: 101.712 }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.events.map((e: { id: string }) => e.id)).toEqual(["eventbrite:t-1", "curated:kl-t2", "curated:kl-t1"]);
    expect(data.sources).toEqual([
      { id: "curated", ok: true, count: 2 },
      { id: "eventbrite", ok: true, count: 1 },
    ]);
  });
});
