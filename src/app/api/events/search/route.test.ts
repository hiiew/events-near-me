import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "./route";

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
  // Freeze "now" so the SAMPLE data gives stable results.
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
    expect(ids).toContain("curated:kl-0001");
    expect(ids).toContain("curated:kl-0006"); // ~15 km: inside the 50 km server radius
    expect(ids).not.toContain("curated:kl-0009"); // ended (FR-05)
    expect(ids).not.toContain("curated:kl-0010"); // beyond 30 days
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
