// US-05, US-06, US-16: the event details page (FR-17 – FR-19, FR-32, FR-38).
// PRE-D: the details page reads the curated events on the server, so these tests use the server fixtures
// S-1 – S-4 (e2e/fixtures/server-events.ts, test-plan §2.3): always upcoming, whatever the real file and date.
import { F } from "./fixtures/events";
import { eventPath as path, S } from "./fixtures/server-events";
import { CATEGORY_LABEL, expect, mytLongDay, mytTime, openResults, plain, priceText, resultsHeading, row, test } from "./helpers";

// S-1 every field + image, S-2 no price / no end / no address / no image, S-3 free, S-4 Sabah.
for (const [variant, e] of Object.entries(S)) {
  test(`TC-21 FR-17 FR-32 NFR-18 US-05: details show every field, in Malaysia time, with the source (${variant})`, async ({ page }) => {
    await page.goto(path(e));
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(e.title);
    const main = page.getByRole("main");
    const time = e.end ? `${mytTime(e.start)} – ${mytTime(e.end)}` : mytTime(e.start);
    expect(plain(await main.innerText())).toContain(plain(`${mytLongDay(e.start)}`));
    expect(plain(await main.innerText())).toContain(plain(`${time} (Malaysia time)`));
    await expect(main).toContainText(e.venue.name);
    if (e.venue.address) await expect(main).toContainText(e.venue.address);
    await expect(main).toContainText(CATEGORY_LABEL[e.category]);
    await expect(main).toContainText(priceText(e.price));
    if (e.description) expect(plain(await main.innerText())).toContain(plain(e.description).slice(0, 60));
    await expect(main).toContainText("Source: Curated by Happening");
    if (e.imageUrl) {
      const img = page.getByRole("img", { name: e.title });
      await expect(img).toBeVisible();
      await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0), "image loaded (CSP allows it)").toBe(true);
    } else await expect(main.locator("img")).toHaveCount(0);
    // A shared link has no search point, so no distance.
    await expect(main).not.toContainText("from your search");
  });
}

test("TC-21 FR-17 US-05: after a search, details show the distance from the search point", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Klang Valley/ }).click(); // real search from the public KL centre
  await expect(resultsHeading(page)).toBeVisible();
  const first = page.locator("#sheet-body article h2 a").first();
  await expect(first).toBeVisible(); // the server fixtures always give Klang Valley upcoming events
  await first.click();
  await expect(page.getByText(/^\d+\.\d km from your search$/)).toBeVisible();
});

test("TC-22 FR-18 US-05: 'View official page' opens the source page in a new tab", async ({ page, context }) => {
  const e = S.full;
  await page.goto(path(e));
  const link = page.getByRole("link", { name: "View official page" });
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(new URL((await link.getAttribute("href"))!).protocol).toBe("https:");
  const [tab] = await Promise.all([context.waitForEvent("page"), link.click()]);
  await tab.waitForLoadState();
  expect(tab.url()).toBe(e.url); // the outside site itself is stubbed, see helpers.ts

  // The external-link button on a list row behaves the same way.
  const results = await context.newPage();
  await openResults(results);
  const rowLink = row(results, F["01"]).getByRole("link", { name: /^Official page for/ });
  await expect(rowLink).toHaveAttribute("href", F["01"].url);
  await expect(rowLink).toHaveAttribute("target", "_blank");
  await expect(rowLink).toHaveAttribute("rel", "noopener noreferrer");
});

test("TC-23 FR-17 FR-13 US-05: an event with no price says 'Price not listed'", async ({ page }) => {
  expect(S.noPrice.price).toBeNull();
  await page.goto(path(S.noPrice));
  await expect(page.getByRole("main")).toContainText("Price not listed");
  await expect(page.getByRole("main")).not.toContainText(/FREE|RM \d/);
});

test("TC-24 FR-05 FR-17: a missing event link gets the friendly not-available page", async ({ page }) => {
  await page.goto("/event/curated:does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This event isn't available");
  await expect(page.getByRole("link", { name: "Find events near you" })).toHaveAttribute("href", "/");
});

// Known failure, DEF-05: Next.js 16 fails while decoding a malformed route parameter and answers with its own
// plain-text 500 before any app code (page, generateMetadata or proxy) runs, so the app cannot catch it.
// test.fail() keeps the check: if a Next.js upgrade fixes it, this reports "unexpectedly passed" and we close DEF-05.
test("TC-24 FR-05 FR-17 (malformed link): a malformed event link is not a server error", async ({ page }) => {
  test.fail(true, "DEF-05: Next.js answers a malformed /event/%.. link with HTTP 500 before app code runs");
  const res = await page.goto("/event/%E0%A4%A");
  expect(res!.status()).toBeLessThan(500);
});

test("TC-25 FR-32 NFR-17: OpenStreetMap attribution is visible on the map and linked from About", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openResults(page);
  const attribution = page.locator(".leaflet-control-attribution");
  await expect(attribution).toContainText("OpenStreetMap");
  await expect(attribution).toBeInViewport();
  // DEF-09: the theme's solid background must win over leaflet.css's 80 % white box whatever order the CSS
  // loads in (the default test context is dark, so --bg is #0e0f13).
  await expect(attribution).toHaveCSS("background-color", "rgb(14, 15, 19)");
  // Not covered by the list sheet: the element on top at the attribution's centre is the attribution itself.
  const onTop = await attribution.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return el.contains(top) ? "attribution" : `${top?.tagName.toLowerCase()}#${top?.id}.${top?.className}`.slice(0, 80);
  });
  expect(onTop, "element on top of the attribution").toBe("attribution");

  await page.goto("/about");
  await expect(page.getByRole("link", { name: /OpenStreetMap contributors/ })).toHaveAttribute("href", "https://www.openstreetmap.org/copyright");
});

test("TC-26 TC-27 FR-19 FR-38 US-06 US-16: directions links open Google Maps (driving and transit) and Waze at the venue", async ({ page }) => {
  const e = S.full;
  await page.goto(path(e));
  const dest = `${e.venue.lat},${e.venue.lon}`;

  const links = {
    google: page.getByRole("link", { name: "Directions (Google Maps)" }),
    transit: page.getByRole("link", { name: "By public transport" }),
    waze: page.getByRole("link", { name: "Open in Waze instead" }),
  };
  for (const l of Object.values(links)) {
    await expect(l).toHaveAttribute("target", "_blank");
    await expect(l).toHaveAttribute("rel", "noopener noreferrer");
  }
  const google = new URL((await links.google.getAttribute("href"))!);
  expect(google.origin + google.pathname).toBe("https://www.google.com/maps/dir/");
  expect(google.searchParams.get("api")).toBe("1");
  expect(google.searchParams.get("destination")).toBe(dest);
  expect(google.searchParams.get("travelmode")).toBeNull();

  const transit = new URL((await links.transit.getAttribute("href"))!);
  expect(transit.searchParams.get("destination")).toBe(dest);
  expect(transit.searchParams.get("travelmode")).toBe("transit");

  const waze = new URL((await links.waze.getAttribute("href"))!);
  expect(waze.hostname).toBe("waze.com");
  expect(waze.searchParams.get("ll")).toBe(dest);
  expect(waze.searchParams.get("navigate")).toBe("yes");
});
