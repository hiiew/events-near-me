// US-07: bookmarks and the Saved screen (FR-20, FR-21, NFR-11).
import type { Page } from "@playwright/test";
import type { Event } from "@/lib/event-schema";
import { F, myt, NOW } from "./fixtures/events";
import { expect, openResults, realEvent, test } from "./helpers";

const BOOKMARKS = "happening.bookmarks.v1";
const LAST_SEARCH = "happening.lastsearch.v1";

async function seedBookmarks(page: Page, events: Event[]) {
  await page.goto("/about"); // any page of ours, so localStorage belongs to the right origin
  await page.evaluate(
    ([key, list]) => localStorage.setItem(key, JSON.stringify(list)),
    [BOOKMARKS, events.map((event) => ({ savedAt: NOW.toISOString(), event }))] as const,
  );
}

test("TC-28 FR-20 US-07: save and un-save an event; the Saved screen follows", async ({ page, request }) => {
  const e = (await realEvent(request))!;
  test.skip(!e, "no upcoming curated event (E-6)");
  await page.goto(`/event/${encodeURIComponent(e.id)}`);
  await page.getByRole("button", { name: "Save event" }).click();
  const saved = page.getByRole("button", { name: "Saved — remove from Saved" });
  await expect(saved).toHaveAttribute("aria-pressed", "true");

  await page.goto("/saved"); // the details page has no tab bar; Back leads to the welcome screen, which has none either

  await expect(page.getByRole("link", { name: e.title, exact: true })).toBeVisible();

  await page.getByRole("link", { name: e.title, exact: true }).click();
  await saved.click();
  await expect(page.getByRole("button", { name: "Save event" })).toHaveAttribute("aria-pressed", "false");
  await page.goto("/saved");
  await expect(page.getByRole("heading", { name: "Nothing saved yet" })).toBeVisible();
});

test("TC-29 FR-20 NFR-11 US-07: bookmarks survive closing the browser", async ({ page, browser, request }) => {
  const e = (await realEvent(request))!;
  test.skip(!e, "no upcoming curated event (E-6)");
  await page.goto(`/event/${encodeURIComponent(e.id)}`);
  await page.getByRole("button", { name: "Save event" }).click();
  await expect(page.getByRole("button", { name: "Saved — remove from Saved" })).toBeVisible();
  const state = await page.context().storageState();
  await page.context().close();

  const reopened = await browser.newContext({ storageState: state, serviceWorkers: "block" });
  const again = await reopened.newPage();
  await again.goto("/saved");
  await expect(again.getByRole("link", { name: e.title, exact: true })).toBeVisible();
  await reopened.close();
});

test("TC-30 FR-21 US-07: an ended saved event is labelled 'Ended'", async ({ page }) => {
  const tomorrow = { ...F["02"], id: "curated:e2e-tomorrow", title: "Tomorrow Talk", start: myt(1, "19:00"), end: myt(1, "21:00") };
  await page.clock.setFixedTime(NOW);
  await seedBookmarks(page, [F["08"], tomorrow]);
  await page.goto("/saved");
  const item = (title: string) => page.getByRole("listitem").filter({ hasText: title });
  await expect(item(F["08"].title)).toContainText("Ended");
  await expect(item(tomorrow.title)).toBeVisible();
  await expect(item(tomorrow.title)).not.toContainText("Ended");
});

test("TC-31 NFR-11 FR-40 US-07 US-18: 'Clear saved data' removes bookmarks and the offline list", async ({ page }) => {
  await seedBookmarks(page, [F["01"]]);
  await openResults(page); // a completed search writes the offline list
  expect(await page.evaluate((k) => localStorage.getItem(k), LAST_SEARCH)).not.toBeNull();

  await page.getByRole("link", { name: "About" }).click();
  await expect(page.getByText("1 saved event on this phone.")).toBeVisible();
  await page.getByRole("button", { name: "Clear saved data" }).click();
  await expect(page.getByText("No saved events on this phone.")).toBeVisible();
  expect(await page.evaluate(([a, b]) => [localStorage.getItem(a), localStorage.getItem(b)], [BOOKMARKS, LAST_SEARCH])).toEqual([null, null]);
  await page.getByRole("link", { name: "Saved" }).click();
  await expect(page.getByRole("heading", { name: "Nothing saved yet" })).toBeVisible();
});

test("TC-32 FR-20 NFR-11: bookmarks never leave the device", async ({ page, context, request }) => {
  const e = (await realEvent(request))!;
  test.skip(!e, "no upcoming curated event (E-6)");
  const sent: string[] = [];
  page.on("request", (r) => sent.push(`${r.url()} ${r.postData() ?? ""}`));
  await page.goto(`/event/${encodeURIComponent(e.id)}`);
  await page.getByRole("button", { name: "Save event" }).click();
  await page.goto("/saved");
  await expect(page.getByRole("link", { name: e.title, exact: true })).toBeVisible();
  await page.getByRole("button", { name: `Remove ${e.title} from Saved` }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Nothing saved yet" })).toBeVisible();

  // The id appears in the page address we opened, but never in any other request or body.
  const leaks = sent.filter((s) => !s.includes(`/event/${encodeURIComponent(e.id)}`) && (s.includes(e.id) || s.includes(encodeURIComponent(e.id)) || s.includes("bookmarks")));
  expect(leaks).toEqual([]);
  expect(await context.cookies()).toEqual([]);
});
