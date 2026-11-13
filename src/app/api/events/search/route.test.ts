import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

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

beforeEach(() => {
  // Freeze "now" so the fixture gives stable results.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-11-11T12:00:00+08:00"));
  vi.stubEnv("ENABLED_SOURCES", "curated");
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
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
