// US-04: distance, date, category and price filters, combined, and the empty state (FR-10 – FR-15).
import { DEFAULT_ORDER, F } from "./fixtures/events";
import { chip, expect, openResults, resultsHeading, rowTitles, setFilters, test, topBar } from "./helpers";

const titles = (...keys: (keyof typeof F)[]) => keys.map((k) => F[k].title);

test("TC-15 FR-10 FR-04: distance offers 2/5/10/25/50 km, 10 by default, and each narrows the list", async ({ page }) => {
  await openResults(page);
  await page.getByRole("button", { name: "Filters", exact: true }).first().click();
  const distance = page.getByRole("dialog").getByRole("group", { name: "Distance (km)" }).getByRole("button");
  await expect(distance).toHaveText(["2", "5", "10", "25", "50"]);
  await expect(distance.nth(2)).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("Escape");

  for (const [km, n] of [["2", 2], ["5", 3], ["10", 6], ["25", 7], ["50", 8]] as const) {
    expect(await setFilters(page, (d) => chip(d, km).click())).toBe(n); // live count on the button
    await expect(resultsHeading(page)).toHaveText(`${n} events nearby`);
  }
  await setFilters(page, (d) => chip(d, "5").click());
  await expect(rowTitles(page)).toHaveText(titles("01", "07", "02"));
});

test.describe("London browser", () => {
  test.use({ timezoneId: "Europe/London" }); // proves the windows use Malaysia days, not the browser's
  test("TC-16 FR-11 US-04: date windows follow Malaysia time", async ({ page }) => {
    await openResults(page);
    await page.getByRole("button", { name: "Filters", exact: true }).first().click();
    await expect(chip(page.getByRole("dialog"), "Next 30 days")).toHaveAttribute("aria-pressed", "true"); // default
    await page.keyboard.press("Escape");

    await setFilters(page, (d) => chip(d, "Today").click());
    await expect(rowTitles(page)).toHaveText(titles("01"));
    await setFilters(page, (d) => chip(d, "This weekend").click());
    await expect(rowTitles(page)).toHaveText(titles("07", "02", "04", "03"));
    await setFilters(page, (d) => chip(d, "Next 7 days").click());
    await expect(rowTitles(page)).toHaveText(DEFAULT_ORDER);
    await setFilters(page, (d) => chip(d, "Next 30 days").click());
    await expect(rowTitles(page)).toHaveText(DEFAULT_ORDER);
  });
});

test("TC-17 FR-12 US-04: category is multi-select over the 8 categories", async ({ page }) => {
  await openResults(page);
  await page.getByRole("button", { name: "Filters", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("group", { name: "Category" }).getByRole("button")).toHaveText([
    "All", "Music", "Food & Markets", "Arts & Culture", "Sports", "Workshops & Learning", "Tech & Meetups", "Nightlife", "Other",
  ]);
  await expect(chip(dialog, "All")).toHaveAttribute("aria-pressed", "true"); // none selected = all
  await chip(dialog, "Music").click();
  await expect(dialog.getByRole("button", { name: /^Show/ })).toHaveText("Show 2 events");
  await chip(dialog, "Food & Markets").click();
  await expect(chip(dialog, "Music")).toHaveAttribute("aria-pressed", "true"); // still on: multi-select
  await expect(dialog.getByRole("button", { name: /^Show/ })).toHaveText("Show 3 events");
  await dialog.getByRole("button", { name: /^Show/ }).click();
  await expect(rowTitles(page)).toHaveText(titles("01", "02", "03"));
});

test("TC-18 FR-13 US-04: price filter — free only, a maximum, and back to any", async ({ page }) => {
  await openResults(page);
  await setFilters(page, (d) => chip(d, "Free only").click());
  await expect(rowTitles(page)).toHaveText(titles("01"));
  await setFilters(page, (d) => d.getByLabel("Max RM").fill("50"));
  await expect(rowTitles(page)).toHaveText(titles("01", "07", "02", "09")); // F-03 from RM 60 and unpriced F-04 hidden
  await setFilters(page, (d) => chip(d, "Any").click());
  await expect(rowTitles(page)).toHaveText(DEFAULT_ORDER);
  await expect(page.locator(`[id="event-${F["04"].id}"]`)).toContainText("Price not listed");
});

test("TC-19 FR-14 US-04: filters combine (AND) on the device without reloading or searching again", async ({ page }) => {
  const stub = await openResults(page);
  await page.evaluate(() => ((window as unknown as { noReload: boolean }).noReload = true));
  const searches = stub.bodies.length;
  await setFilters(page, async (d) => {
    await chip(d, "This weekend").click();
    await chip(d, "Music").click();
  });
  await expect(rowTitles(page)).toHaveText(titles("03"));
  expect(await page.evaluate(() => (window as unknown as { noReload?: boolean }).noReload)).toBe(true);
  expect(stub.bodies.length).toBe(searches);
});

test("TC-20 FR-15 US-04: empty state suggests a wider radius until 50 km", async ({ page }) => {
  await openResults(page);
  await setFilters(page, async (d) => {
    await chip(d, "Today").click();
    await chip(d, "Sports").click();
  });
  await expect(resultsHeading(page)).toHaveText("0 events nearby");
  await expect(page.getByRole("heading", { name: "No events match" })).toBeVisible();
  await expect(page.getByText("Try a wider area, fewer filters or a different search.")).toBeVisible();
  await page.getByRole("button", { name: "Widen to 25 km" }).click();
  await expect(topBar(page)).toHaveText("Your location · 25 km");
  await page.getByRole("button", { name: "Filters", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  for (const kept of ["Today", "Sports"]) await expect(chip(dialog, kept)).toHaveAttribute("aria-pressed", "true");
  await chip(dialog, "50").click();
  await dialog.getByRole("button", { name: /^Show/ }).click();
  await expect(resultsHeading(page)).toHaveText("0 events nearby");
  await expect(page.getByRole("button", { name: /^Widen to/ })).toHaveCount(0);
});
