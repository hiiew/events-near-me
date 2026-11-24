// US-18: using the app with no signal (FR-40).
import { P } from "./fixtures/events";
import { clickMapCorner, expect, openResults, resultsHeading, test } from "./helpers";

test.describe("with the service worker", () => {
  test.use({ serviceWorkers: "allow" }); // the only tests that let the offline app shell run

  test("TC-49 FR-40 US-18: visited pages open offline; an unvisited page lands on the cached home page", async ({ page, context }) => {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.controller !== null)).toBe(true);
    for (const path of ["/about", "/saved", "/"]) await page.goto(path); // visits now go through the worker and are cached

    await context.setOffline(true);
    const darkBg = "rgb(14, 15, 19)"; // --bg: proves the stylesheet came from the cache too
    await page.reload();
    await expect(page.getByRole("heading", { level: 1, name: /See what's on around you/ })).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(darkBg);
    await page.goto("/about");
    await expect(page.getByRole("heading", { level: 1, name: "About & privacy" })).toBeVisible();
    expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe(darkBg);
    await page.goto("/saved");
    await expect(page.getByRole("heading", { level: 1, name: "Saved" })).toBeVisible();
    await page.goto("/event/curated%3Anever-visited");
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1, name: /See what's on around you/ })).toBeVisible();
  });
});

test("TC-50 FR-40 NFR-09 US-18: the last search is shown offline with a dated notice; the search point is never stored", async ({ page }) => {
  const stub = await openResults(page);
  const stored = await page.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const last = JSON.parse(stored["happening.lastsearch.v1"]);
  expect(Object.keys(last).sort()).toEqual(["events", "savedAt"]);
  const everything = JSON.stringify(stored);
  for (const n of [P.lat, P.lon]) expect(everything).not.toMatch(new RegExp(`\\b${String(n).replace(".", "\\.")}(?!\\d)`));

  stub.offline = true; // searches now fail like a lost connection
  await clickMapCorner(page);
  await expect(page.getByText(/^Can't reach the server\. Showing events saved on Thu 17 Dec · 10:00\sAM; they may be out of date\.$/)).toBeVisible();
  await expect(resultsHeading(page)).toBeVisible();
  await expect(page.locator("#sheet-body article")).not.toHaveCount(0);

  stub.offline = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByText(/^Can't reach the server/)).toHaveCount(0);
  await expect(resultsHeading(page)).toBeVisible();
});
