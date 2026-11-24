// NFR-08: the search endpoint validates every input (TC-65). It also sends the test landmark to the real
// server, so TC-40 (global-teardown.ts) can prove the server never logs it.
import { LANDMARK } from "./fixtures/events";
import { expect, test } from "./helpers";

const URL = "/api/events/search";

test("TC-65 NFR-08: invalid search requests are rejected without echoing the values", async ({ request }) => {
  const bad: [string, unknown, string][] = [
    ["lat too big", { lat: 90.0001, lon: 101.7 }, "lat"],
    ["lon too small", { lat: 3.1, lon: -180.0001 }, "lon"],
    ["lat as a string", { lat: "3.158", lon: 101.712 }, "lat"],
    ["missing lon", { lat: 3.158 }, "lon"],
    ["extra field", { lat: 3.158, lon: 101.712, radius: 5 }, "body"],
  ];
  for (const [why, data, field] of bad) {
    const res = await request.post(URL, { data });
    expect(res.status(), why).toBe(400);
    expect(res.headers()["cache-control"], why).toBe("no-store");
    const body = await res.json();
    expect(body.error, why).toBe("invalid_request");
    if (field !== "body") expect(body.message, why).toContain(field);
    const text = JSON.stringify(body);
    for (const v of ["90.0001", "-180.0001", "3.158", "101.712"]) expect(text, why).not.toContain(v);
  }

  const notJson = await request.post(URL, { data: "lat=3.1", headers: { "content-type": "text/plain" } });
  expect(notJson.status()).toBe(400);
  expect((await notJson.json()).error).toBe("invalid_request");
  expect(notJson.headers()["cache-control"]).toBe("no-store");

  const empty = await request.post(URL, { data: "", headers: { "content-type": "application/json" } });
  expect(empty.status()).toBe(400);
  expect(empty.headers()["cache-control"]).toBe("no-store");

  const big = await request.post(URL, { data: JSON.stringify({ lat: 3.1, lon: 101.7, pad: "x".repeat(2048) }), headers: { "content-type": "application/json" } });
  expect(big.status()).toBe(413);
  expect(big.headers()["cache-control"]).toBe("no-store");

  expect((await request.get(URL)).status()).toBe(405);
});

test("TC-65 NFR-08 NFR-09: a valid point (6 decimals) is accepted and answered with no-store", async ({ request }) => {
  const res = await request.post(URL, { data: LANDMARK }); // the server re-rounds it (unit-tested in route.test.ts)
  expect(res.status()).toBe(200);
  expect(res.headers()["cache-control"]).toBe("no-store");
  const body = await res.json();
  expect(Array.isArray(body.events)).toBe(true);
  expect(body.sources).toEqual(expect.arrayContaining([expect.objectContaining({ id: "curated", ok: true })]));
});
