// US-03: the map and the list show the same events (FR-07, FR-08, FR-09).
import { F } from "./fixtures/events";
import { chip, eventMarkers, expect, openResults, resultsHeading, row, rowTitles, setFilters, test, topBar } from "./helpers";

const marker = (page: import("@playwright/test").Page, title: string) => page.locator(`.leaflet-marker-icon[title="${title}"]`);

test("TC-11 FR-07 FR-08 US-03: one pin per located event, plus the search point; the list has the same events", async ({ page }) => {
  await openResults(page);
  await expect(eventMarkers(page)).toHaveCount(5);
  await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6); // + search point
  await expect(rowTitles(page)).toHaveCount(6);
  const pinned = await eventMarkers(page).evaluateAll((els) => els.map((e) => e.getAttribute("title")));
  expect(pinned.sort()).toEqual([F["01"], F["02"], F["03"], F["04"], F["09"]].map((e) => e.title).sort());
  const listed = await rowTitles(page).allInnerTexts();
  for (const t of pinned) expect(listed).toContain(t);
});

test("TC-12 FR-07 US-03: choosing a pin (mouse or keyboard) highlights its row; the row opens details", async ({ page }) => {
  await openResults(page);
  await marker(page, F["03"].title).click();
  await expect(marker(page, F["03"].title)).toContainText(F["03"].title); // selected pin shows its name
  await expect(row(page, F["03"])).toHaveClass(/bg-surface/); // highlighted
  await expect(row(page, F["03"])).toBeInViewport();

  // Keyboard: focus a pin and press Enter.
  await marker(page, F["09"].title).focus();
  await page.keyboard.press("Enter");
  await expect(row(page, F["09"])).toHaveClass(/bg-surface/);
  await expect(row(page, F["03"])).not.toHaveClass(/bg-surface/);

  await row(page, F["09"]).getByRole("link").first().click();
  await expect(page).toHaveURL(new RegExp(`/event/${encodeURIComponent(F["09"].id)}$`));
});

test("TC-13 FR-08 FR-14 US-03: a filter change updates pins and list together", async ({ page }) => {
  await openResults(page);
  await setFilters(page, (d) => chip(d, "Music").click());
  await expect(rowTitles(page)).toHaveText([F["01"].title, F["03"].title]);
  await expect(eventMarkers(page)).toHaveCount(2);
  await setFilters(page, (d) => chip(d, "50").click());
  await expect(rowTitles(page)).toHaveText([F["01"].title, F["03"].title]); // F-06 is Sports
  await expect(eventMarkers(page)).toHaveCount(2);
  await setFilters(page, (d) => chip(d, "All").click());
  await expect(rowTitles(page)).toHaveCount(8); // + F-05, F-06
  await expect(eventMarkers(page)).toHaveCount(7); // F-07 has no pin
  await expect(topBar(page)).toHaveText("Your location · 50 km");
  await expect(page.getByText(/^Within 50 km/)).toBeVisible();
});

test("TC-14 FR-09 US-03: an event without coordinates is listed as 'not on map' with no pin", async ({ page }) => {
  await openResults(page);
  await expect(row(page, F["07"])).toContainText("Studio Somewhere · not on map");
  await expect(row(page, F["07"])).not.toContainText(" km");
  await expect(marker(page, F["07"].title)).toHaveCount(0);
  await setFilters(page, (d) => chip(d, "2").click());
  await expect(resultsHeading(page)).toHaveText("2 events nearby");
  await expect(rowTitles(page)).toHaveText([F["01"].title, F["07"].title]);
});
