// US-10: what the app says and does with location (FR-31, NFR-09).
import { LANDMARK, P } from "./fixtures/events";
import { clickMapCorner, expect, openResults, resultsHeading, test } from "./helpers";

test("TC-38 FR-31 US-10 (automated part): the About page explains location, storage and sources", async ({ page }) => {
  await page.goto("/about");
  const main = page.getByRole("main");
  await expect(main).toContainText("only to find events near it");
  await expect(main).toContainText("rounded to about 100 m");
  await expect(main).toContainText("does not store or log");
  await expect(main).toContainText("Your saved events, and the events from your last search");
  await expect(main).toContainText("Your location is never saved");
  await expect(main.getByRole("link", { name: /OpenStreetMap/ })).toBeVisible();
  await expect(main).toContainText("Events are curated by Happening");
  await expect(main.getByRole("button", { name: "Clear saved data" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Project on GitHub" })).toHaveAttribute("href", /^https:\/\/github\.com\//);
});

test("TC-39 NFR-09 US-10: every search point leaves the device rounded to 3 decimals, in a POST body only", async ({ page }) => {
  const requests: { url: string; method: string; body: string | null }[] = [];
  page.on("request", (r) => requests.push({ url: r.url(), method: r.method(), body: r.postData() }));
  const stub = await openResults(page); // 1. Use my location (landmark has 6 decimals)
  await clickMapCorner(page); // 2. tap the map at an arbitrary pixel
  await expect.poll(() => stub.bodies.length).toBe(4);
  await page.getByRole("button", { name: /Change search area$/ }).click(); // 3. Search this map area
  await page.getByRole("button", { name: "Search this map area" }).click();
  await expect.poll(() => stub.bodies.length).toBe(5);
  await expect(resultsHeading(page)).toBeVisible();

  const searches = requests.filter((r) => r.url.endsWith("/api/events/search"));
  expect(searches).toHaveLength(5);
  for (const s of searches) {
    expect(s.method).toBe("POST");
    const body = JSON.parse(s.body!);
    expect(Object.keys(body).sort()).toEqual(["lat", "lon"]);
    for (const n of [body.lat, body.lon]) expect(Math.round(n * 1000) / 1000).toBe(n);
  }
  expect(stub.bodies[2]).toEqual(P);
  // No request (other than the search bodies above) carries the point, rounded or precise, in its address or body.
  const spellings = [P.lat, P.lon, LANDMARK.lat, LANDMARK.lon].map(String);
  const others = requests.filter((r) => !r.url.endsWith("/api/events/search") && !r.url.includes("tile.openstreetmap.org"));
  for (const r of others) for (const s of spellings) expect(`${r.url} ${r.body ?? ""}`).not.toContain(s);
});
