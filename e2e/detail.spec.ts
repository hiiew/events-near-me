// US-05, US-06, US-16: the event details page (FR-17 – FR-19, FR-32, FR-38).
// PRE-D: the details page reads the real curated file on the server, so these tests use a real upcoming
// event chosen at run time and the real clock, and check facts relative to that event.
import { F } from "./fixtures/events";
import { CATEGORY_LABEL, expect, mytLongDay, mytTime, openResults, plain, priceText, realEvent, resultsHeading, row, test } from "./helpers";

const path = (id: string) => `/event/${encodeURIComponent(id)}`;

test("TC-21 FR-17 FR-32 NFR-18 US-05: details show every field, in Malaysia time, with the source", async ({ page, request }) => {
  const e = (await realEvent(request))!;
  test.skip(!e, "no upcoming curated event (entry criterion E-6)");
  await page.goto(path(e.id));
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
  if (e.imageUrl) await expect(page.getByRole("img", { name: e.title })).toBeVisible();
  else await expect(main.locator("img")).toHaveCount(0);
  // A shared link has no search point, so no distance.
  await expect(main).not.toContainText("from your search");
});

test("TC-21 FR-17 US-05: after a search, details show the distance from the search point", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /^Klang Valley/ }).click(); // real search from the public KL centre
  await expect(resultsHeading(page)).toBeVisible();
  const first = page.locator("#sheet-body article h2 a").first();
  test.skip((await first.count()) === 0, "no upcoming events (E-6)");
  await first.click();
  await expect(page.getByText(/^\d+\.\d km from your search$/)).toBeVisible();
});

test("TC-22 FR-18 US-05: 'View official page' opens the source page in a new tab", async ({ page, context, request }) => {
  const e = (await realEvent(request))!;
  test.skip(!e, "no upcoming curated event (E-6)");
  await page.goto(path(e.id));
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

test("TC-23 FR-17 FR-13 US-05: an event with no price says 'Price not listed'", async ({ page, request }) => {
  const e = await realEvent(request, (x) => x.price === null);
  test.skip(!e, "no upcoming curated event without a price — recorded as a gap");
  await page.goto(path(e!.id));
  await expect(page.getByRole("main")).toContainText("Price not listed");
});

test("TC-24 FR-05 FR-17: missing and malformed event links get a friendly page, never a server error", async ({ page }) => {
  await page.goto("/event/curated:does-not-exist");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("This event isn't available");
  await expect(page.getByRole("link", { name: "Find events near you" })).toHaveAttribute("href", "/");

  const res = await page.goto("/event/%E0%A4%A");
  expect(res!.status()).toBeLessThan(500);
});

test("TC-25 FR-32 NFR-17: OpenStreetMap attribution is visible on the map and linked from About", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await openResults(page);
  const attribution = page.locator(".leaflet-control-attribution");
  await expect(attribution).toContainText("OpenStreetMap");
  await expect(attribution).toBeInViewport();
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

test("TC-26 TC-27 FR-19 FR-38 US-06 US-16: directions links open Google Maps (driving and transit) and Waze at the venue", async ({ page, request }) => {
  const e = (await realEvent(request, (x) => x.venue.lat !== undefined))!;
  test.skip(!e, "no upcoming curated event (E-6)");
  await page.goto(path(e.id));
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
