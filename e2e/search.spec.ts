// US-13: find an event by name with the search box (FR-35).
import { DEFAULT_ORDER, F } from "./fixtures/events";
import { chip, expect, openResults, rowTitles, setFilters, test } from "./helpers";

test("TC-43 FR-35 US-13: search box matches words, ignores case and accents, survives Reset", async ({ page }) => {
  const stub = await openResults(page);
  const searches = stub.bodies.length;
  const box = page.getByRole("searchbox", { name: "Search events" });

  await box.fill("jazz bukit");
  await expect(rowTitles(page)).toHaveText([F["01"].title]);
  await box.fill("CAFE"); // matches "Café"
  await expect(rowTitles(page)).toHaveText([F["01"].title]);

  await box.fill("market");
  await expect(rowTitles(page)).toHaveText([F["02"].title]);
  await setFilters(page, (d) => chip(d, "Free only").click());
  await expect(page.getByRole("heading", { name: "No events match" })).toBeVisible();
  await expect(page.getByText("Try a wider area, fewer filters or a different search.")).toBeVisible();

  await setFilters(page, (d) => chip(d, "Reset").click());
  await expect(box).toHaveValue("market"); // Reset clears the filters, not the search
  await expect(rowTitles(page)).toHaveText([F["02"].title]);

  await box.fill("");
  await expect(rowTitles(page)).toHaveText(DEFAULT_ORDER);
  expect(stub.bodies.length).toBe(searches); // typing never sends a search
});
