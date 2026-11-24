// US-12, US-14: the "Free this week" and "Today" quick chips (FR-34, FR-36).
import { DEFAULT_ORDER, F, MAIN_EVENTS, myt } from "./fixtures/events";
import { chip, expect, openResults, rowTitles, setFilters, test, topBar } from "./helpers";

test("TC-42 FR-34 US-12: 'Free this week' sets Free only + Next 7 days and resets only those two", async ({ page }) => {
  await openResults(page);
  await setFilters(page, (d) => chip(d, "25").click());
  const free = chip(page, "Free this week");
  await free.click();
  await expect(free).toHaveAttribute("aria-pressed", "true");
  await expect(free.locator("svg")).toHaveCount(1); // check mark, so "on" is not shown by colour alone
  await expect(rowTitles(page)).toHaveText([F["01"].title, F["05"].title]);

  await free.click();
  await expect(free).toHaveAttribute("aria-pressed", "false");
  await expect(rowTitles(page)).toHaveCount(7);
  await expect(topBar(page)).toHaveText("Your location · 25 km"); // distance untouched
  await page.getByRole("button", { name: "Filters", exact: true }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(chip(dialog, "Any")).toHaveAttribute("aria-pressed", "true");
  await expect(chip(dialog, "Next 30 days")).toHaveAttribute("aria-pressed", "true");

  // Setting the same two filters by hand shows the chip as on.
  await chip(dialog, "Free only").click();
  await chip(dialog, "Next 7 days").click();
  await dialog.getByRole("button", { name: /^Show/ }).click();
  await expect(free).toHaveAttribute("aria-pressed", "true");
});

test("TC-44 FR-36 US-14: 'Today' changes only the date, and only one date chip is on at a time", async ({ page }) => {
  await openResults(page);
  const today = chip(page, "Today");
  const free = chip(page, "Free this week");
  await today.click();
  await expect(today).toHaveAttribute("aria-pressed", "true");
  await expect(rowTitles(page)).toHaveText([F["01"].title]);
  await today.click();
  await expect(today).toHaveAttribute("aria-pressed", "false");
  await expect(rowTitles(page)).toHaveText(DEFAULT_ORDER);

  await setFilters(page, (d) => chip(d, "Music").click());
  await today.click();
  await expect(rowTitles(page)).toHaveText([F["01"].title]); // Music + today
  await today.click();
  await expect(rowTitles(page)).toHaveText([F["01"].title, F["03"].title]); // Music still on
  await setFilters(page, (d) => chip(d, "All").click());

  await today.click();
  await free.click();
  await expect(free).toHaveAttribute("aria-pressed", "true");
  await expect(today).toHaveAttribute("aria-pressed", "false");
});

test("TC-44 FR-36 US-14 (21:00 run): an event that ended earlier today is not listed under Today", async ({ page }) => {
  const endedAt19 = { ...F["01"], id: "curated:e2e-yoga", title: "Sunset Yoga", category: "sports" as const, start: myt(0, "17:00"), end: myt(0, "19:00") };
  await openResults(page, { now: new Date(myt(0, "21:00")), events: [...MAIN_EVENTS, endedAt19] });
  await chip(page, "Today").click();
  await expect(rowTitles(page)).toHaveText([F["01"].title]); // F-01 (20:00–23:00) is still on
});
