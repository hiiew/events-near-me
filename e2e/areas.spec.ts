// US-19: browse an area without sharing location (FR-41).
import { KK_CENTER, KK_EVENTS, KL_CENTER, NOW } from "./fixtures/events";
import { chip, clickMapCorner, expect, openWelcome, resultsHeading, rowTitles, stubSearch, test, topBar } from "./helpers";

const area = (page: import("@playwright/test").Page, name: string) => page.getByRole("button", { name: new RegExp(`^${name}`) });

test("TC-52 FR-41 US-19: area buttons show how many events each area has, on both screens", async ({ page }) => {
  await openWelcome(page);
  await expect(area(page, "Klang Valley")).toHaveText("Klang Valley8 events");
  await expect(area(page, "Kota Kinabalu")).toHaveText("Kota Kinabalu2 events");
  await page.getByRole("button", { name: "Pick a spot on the map" }).click();
  await expect(area(page, "Klang Valley")).toHaveText("Klang Valley8 events");
  await expect(area(page, "Kota Kinabalu")).toHaveText("Kota Kinabalu2 events");
});

test("TC-52 FR-41 US-19: an area with no events says 'No events yet'", async ({ page }) => {
  await openWelcome(page, { kkEvents: [] });
  await expect(area(page, "Kota Kinabalu")).toHaveText("Kota KinabaluNo events yet");
});

test("TC-53 FR-41 NFR-09 US-19: tapping an area lists as many events as its button said, at 50 km, without location", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { geoCalls: number };
    w.geoCalls = 0;
    const real = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
    navigator.geolocation.getCurrentPosition = (...args) => (w.geoCalls++, real(...args));
  });
  const stub = await openWelcome(page);
  await area(page, "Kota Kinabalu").click();
  await expect(topBar(page)).toHaveText("Kota Kinabalu · 50 km");
  await expect(rowTitles(page)).toHaveText(KK_EVENTS.map((e) => e.title)); // 2, as on the button
  expect(await page.evaluate(() => (window as unknown as { geoCalls: number }).geoCalls)).toBe(0);
  for (const b of stub.bodies) expect([KL_CENTER, KK_CENTER]).toContainEqual(b); // only public centres sent

  await page.getByRole("button", { name: "Filters", exact: true }).first().click();
  const d = page.getByRole("dialog");
  for (const on of ["50", "Next 30 days", "All", "Any", "Soonest"]) await expect(chip(d, on)).toHaveAttribute("aria-pressed", "true");
  await expect(d.getByLabel("Max RM")).toHaveValue("");
});

test("TC-54 FR-41 US-19: when the counts can't load, the area buttons still work", async ({ page }) => {
  await openWelcome(page, { failFirst: 2 });
  await expect(area(page, "Klang Valley")).toHaveText("Klang Valley");
  await expect(area(page, "Kota Kinabalu")).toHaveText("Kota Kinabalu");
  await expect(page.getByText(/undefined|error/i)).toHaveCount(0);
  await area(page, "Klang Valley").click();
  await expect(resultsHeading(page)).toHaveText("8 events nearby");
});

test("TC-55 FR-41 FR-03 US-19: after an area, tapping the map searches from a pinned spot", async ({ page }) => {
  await page.clock.setFixedTime(NOW);
  const stub = await stubSearch(page);
  await page.goto("/");
  await area(page, "Klang Valley").click();
  await expect(topBar(page)).toHaveText("Klang Valley · 50 km");
  const before = stub.bodies.length;
  await clickMapCorner(page);
  await expect(topBar(page)).toHaveText("Pinned spot · 50 km");
  expect(stub.bodies.length).toBe(before + 1);
  expect(stub.bodies.at(-1)).not.toEqual(KL_CENTER);
});
