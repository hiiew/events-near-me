// US-01, US-02: asking for location, falling back to a picked spot, changing the search point.
import { DEFAULT_ORDER, KL_CENTER, P } from "./fixtures/events";
import { chip, clickMapAt, clickMapCorner, expect, openResults, openWelcome, resultsHeading, rowTitles, setFilters, stubSearch, test, topBar } from "./helpers";

// Records every call to getCurrentPosition (and its options) before the app's own code runs.
const COUNT_GEO = () => {
  const w = window as unknown as { geoCalls: PositionOptions[] };
  w.geoCalls = [];
  const real = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
  navigator.geolocation.getCurrentPosition = (ok, err, opts) => {
    w.geoCalls.push(opts ?? {});
    real(ok, err, opts);
  };
};

// A browser answering like a person who tapped "Block", or a fix that never comes (fires at options.timeout).
const FAKE_GEO = (mode: string) => { // "denied" | "timeout"
  const w = window as unknown as { geoCalls: PositionOptions[] };
  w.geoCalls = [];
  const codes = { PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
  navigator.geolocation.getCurrentPosition = (_ok, err, opts) => {
    w.geoCalls.push(opts ?? {});
    const fail = () => err?.({ ...codes, code: mode === "denied" ? 1 : 3, message: mode } as GeolocationPositionError);
    if (mode === "denied") setTimeout(fail, 0);
    else setTimeout(fail, opts?.timeout ?? Infinity);
  };
};
const geoCalls = (page: import("@playwright/test").Page) => page.evaluate(() => (window as unknown as { geoCalls: PositionOptions[] }).geoCalls);

test("TC-01 FR-01 US-01 US-10: explains location use before asking, asks once with a 10 s timeout", async ({ page }) => {
  await page.addInitScript(COUNT_GEO);
  await openWelcome(page);
  await expect(page.getByText("We use your location only to find nearby events. It's rounded to about 100 m and never stored.")).toBeVisible();
  expect(await geoCalls(page)).toHaveLength(0); // nothing asked just by opening the app
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect.poll(() => geoCalls(page)).toHaveLength(1);
  expect((await geoCalls(page))[0].timeout).toBe(10_000);
});

test("TC-02 FR-01 FR-04 FR-06 US-01: location allowed lists events within 10 km, soonest first", async ({ page }) => {
  const stub = await openResults(page);
  await expect(topBar(page)).toHaveText("Your location · 10 km");
  await expect(resultsHeading(page)).toHaveText("6 events nearby");
  await expect(rowTitles(page)).toHaveText(DEFAULT_ORDER); // F-05/F-06 too far, F-08 ended
  expect(stub.bodies.at(-1)).toEqual(P); // the landmark, rounded to 3 dp
});

test("TC-07 FR-02 US-02: location denied shows the pick-a-spot screen without searching", async ({ page }) => {
  await page.addInitScript(FAKE_GEO, "denied");
  const stub = await openWelcome(page);
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Tap the map to choose an area" })).toBeVisible();
  await expect(page.getByText("Location is off, so pick where to search from.")).toBeVisible();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  for (const name of ["Search this map area", "Use my location"]) await expect(chip(page, name)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Klang Valley/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Kota Kinabalu/ })).toBeVisible();
  expect(stub.bodies).toHaveLength(2); // only the two area counts from the welcome screen
});

test("TC-08 FR-02 US-02: location taking over 10 s falls back to pick-a-spot on its own", async ({ page }) => {
  await page.addInitScript(FAKE_GEO, "timeout");
  await page.clock.install({ time: new Date("2026-12-17T10:00:00+08:00") }); // fake timers, so 10 s pass instantly
  await stubSearch(page); // not openWelcome: that fixes the clock with setFixedTime instead of fake timers
  await page.goto("/");
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Finding your location…" })).toBeVisible();
  await page.clock.runFor(9_000);
  await expect(page.getByRole("heading", { level: 1, name: "Finding your location…" })).toBeVisible();
  await page.clock.runFor(1_100);
  await expect(page.getByText("Finding your location took too long. Pick a spot instead.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Tap the map to choose an area" })).toBeVisible();
  expect((await geoCalls(page))[0].timeout).toBe(10_000);
});

test("TC-09 FR-02 FR-03 US-02: tapping the map searches from that spot", async ({ page }) => {
  const stub = await openWelcome(page);
  await page.getByRole("button", { name: "Pick a spot on the map" }).click();
  await expect(page.locator(".leaflet-container")).toBeVisible();
  await clickMapAt(page, P, KL_CENTER); // the map opens on the KL centre at zoom 12
  await expect(resultsHeading(page)).toHaveText("6 events nearby");
  expect(stub.bodies).toHaveLength(3); // exactly one search after the two area counts
  await expect(page.locator(".leaflet-marker-icon:not([title])")).toHaveCount(1); // the search-point marker
  await expect(topBar(page)).toHaveText("Pinned spot · 10 km");
  await expect(rowTitles(page)).toHaveText(DEFAULT_ORDER);
});

test("TC-10 FR-03 US-02: the search point can be changed at any time and filters are kept", async ({ page }) => {
  const stub = await openWelcome(page);
  const threeDp = (b: { lat: number; lon: number }) => [b.lat, b.lon].every((n) => Math.round(n * 1000) / 1000 === n);
  const musicOn = async () => {
    await page.getByRole("button", { name: "Filters", exact: true }).first().click();
    const dialog = page.getByRole("dialog", { name: "Filters" });
    await expect(chip(dialog, "Music")).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  };

  await page.getByRole("button", { name: "Pick a spot on the map" }).click();
  // 1. Pan the map, then search its centre.
  const box = (await page.locator(".leaflet-container").boundingBox())!;
  await page.mouse.move(box.x + 200, box.y + 200);
  await page.mouse.down();
  await page.mouse.move(box.x + 120, box.y + 150, { steps: 8 });
  await page.mouse.up();
  await page.getByRole("button", { name: "Search this map area" }).click();
  await expect(resultsHeading(page)).toBeVisible();
  expect(stub.bodies).toHaveLength(3);
  expect(threeDp(stub.bodies[2])).toBe(true);
  expect(stub.bodies[2]).not.toEqual({ lat: 3.139, lon: 101.687 }); // the pan moved it away from the start centre
  await expect(topBar(page)).toHaveText("Pinned spot · 10 km");

  // 2. Category Music.
  await setFilters(page, (d) => chip(d, "Music").click());

  // 3. Tap somewhere else on the map: one new search from the new point, Music still on.
  await clickMapCorner(page);
  await expect.poll(() => stub.bodies.length).toBe(4);
  expect(threeDp(stub.bodies[3])).toBe(true);
  expect(stub.bodies[3]).not.toEqual(stub.bodies[2]);
  await expect(resultsHeading(page)).toBeVisible();
  await expect(topBar(page)).toHaveText("Pinned spot · 10 km");
  await musicOn();

  // 4. Change → Cancel: same results, no request.
  const before = await rowTitles(page).allInnerTexts();
  await page.getByRole("button", { name: /Change search area$/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Tap the map to choose an area" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel, back to results" }).click();
  await expect(resultsHeading(page)).toBeVisible();
  await expect(rowTitles(page)).toHaveText(before);
  expect(stub.bodies).toHaveLength(4);
  await musicOn();

  // 5. Change → Use my location.
  await page.getByRole("button", { name: /Change search area$/ }).click();
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(topBar(page)).toHaveText("Your location · 10 km");
  expect(stub.bodies.at(-1)).toEqual(P);
  await musicOn();
  await expect(rowTitles(page)).toHaveText(["Jazz Night at Café Bukit", "Indie Gig Sunday"]);
});
