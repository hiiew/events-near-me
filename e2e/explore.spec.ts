// US-01, US-09, NFR-04, NFR-18: what the results list shows on the Explore screen.
import { F } from "./fixtures/events";
import { chip, expect, openResults, plain, resultsHeading, row, rowTitles, setFilters, test } from "./helpers";

test("TC-03 FR-06 NFR-18 US-01: each row shows title, date/time, venue, distance, category and price", async ({ page }) => {
  await openResults(page);
  const f01 = row(page, F["01"]);
  await expect(f01.getByRole("link", { name: "Jazz Night at Café Bukit", exact: true })).toBeVisible();
  expect(plain(await f01.innerText())).toContain("17 Dec"); // day block (aria-hidden, visual only)
  await expect(f01).toContainText(/Thu 17 Dec · 8:00\sPM · Bukit Bintang Lounge · 1\.5 km/);
  await expect(f01).toContainText("Music");
  await expect(f01).toContainText("FREE");
  await expect(row(page, F["03"])).toContainText("RM 60.00 – RM 90.00");
  await expect(row(page, F["03"])).toContainText(/Sun 20 Dec · 8:00\sPM · The Bee Hall · 8\.0 km/);
  await expect(row(page, F["04"])).toContainText("Price not listed");
  await expect(row(page, F["04"])).toContainText("Tech & Meetups");
});

test("TC-04 FR-06: sort by distance puts nearest first and no-location events last", async ({ page }) => {
  await openResults(page);
  await setFilters(page, (d) => chip(d, "Nearest").click());
  await expect(rowTitles(page)).toHaveText([F["01"], F["02"], F["09"], F["03"], F["04"], F["07"]].map((e) => e.title));
  await expect(page.getByText(/nearest first/)).toBeVisible();
});

test("TC-05 FR-05 NFR-19 US-01: an ended event never shows, at any radius", async ({ page }) => {
  await openResults(page);
  await expect(page.getByText(F["08"].title)).toHaveCount(0);
  await setFilters(page, (d) => chip(d, "50").click());
  await expect(resultsHeading(page)).toHaveText("8 events nearby");
  await expect(page.getByText(F["08"].title)).toHaveCount(0);
  await expect(page.locator(`.leaflet-marker-icon[title="${F["08"].title}"]`)).toHaveCount(0);
});

test("TC-36 FR-28 FR-24 NFR-12 US-09: a failed source still shows the other results with a notice", async ({ page }) => {
  await openResults(page, {
    sources: [
      { id: "curated", ok: true, count: 9 },
      { id: "eventbrite", ok: false, count: 0 },
    ],
  });
  await expect(resultsHeading(page)).toHaveText("6 events nearby");
  await expect(page.getByText("Some sources are unavailable right now.")).toBeVisible();
});

test("TC-59 NFR-04 (e2e part): details open within 3 actions after results appear", async ({ page }) => {
  await openResults(page);
  // Path 1: tap a row title = 1 action.
  await row(page, F["01"]).getByRole("link", { name: F["01"].title, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/event/${encodeURIComponent(F["01"].id)}$`));
  await page.goBack();
  await expect(resultsHeading(page)).toBeVisible();
  // Path 2: pin, then the highlighted row's title = 2 actions.
  await page.locator(`.leaflet-marker-icon[title="${F["03"].title}"]`).click();
  await row(page, F["03"]).getByRole("link", { name: F["03"].title, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/event/${encodeURIComponent(F["03"].id)}$`));
});

test.describe("New York browser", () => {
  test.use({ timezoneId: "America/New_York" });
  test("TC-70 NFR-18 (e2e part): times stay in Malaysia time when the browser is elsewhere", async ({ page }) => {
    await openResults(page);
    await expect(row(page, F["01"])).toContainText(/Thu 17 Dec · 8:00\sPM/); // 7:00 AM in New York
    await expect(row(page, F["03"])).toContainText("RM 60.00 – RM 90.00");
  });
});
