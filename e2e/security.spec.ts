// security-privacy.md T-03, T-04, §7 headers (TC-72) and NFR-06 browser part (TC-63 step 4).
import { F } from "./fixtures/events";
import { expect, openResults, realEvent, row, test } from "./helpers";

test("TC-72 T-03 T-04 FR-18: security headers on pages and the API", async ({ request }) => {
  const e = await realEvent(request);
  const responses = [
    await request.get("/"),
    await request.get(e ? `/event/${encodeURIComponent(e.id)}` : "/about"),
    await request.post("/api/events/search", { data: { lat: 3.139, lon: 101.687 } }),
  ];
  for (const res of responses) {
    const h = res.headers();
    expect(h["content-security-policy"], res.url()).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"], res.url()).toBe("nosniff");
    expect(h["referrer-policy"], res.url()).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"], res.url()).toContain("geolocation=(self)");
  }
});

test("TC-72 T-03: HTML in an event title is shown as text, never run; no CSP violations in a normal flow", async ({ page }) => {
  const problems: string[] = [];
  page.on("dialog", (d) => (problems.push(`dialog: ${d.message()}`), d.dismiss()));
  page.on("console", (m) => m.type() === "error" && problems.push(`console: ${m.text()}`));
  await openResults(page);
  const f09 = row(page, F["09"]);
  await expect(f09.getByRole("heading")).toHaveText(F["09"].title); // "<b>Bold</b> Comedy <script>" as literal text
  await expect(f09.locator("b, script")).toHaveCount(0);
  // The selected pin builds HTML from the title (MapView.tsx escapes it).
  const pin = page.locator(`.leaflet-marker-icon[title="${F["09"].title}"]`);
  await pin.click();
  await expect(pin).toContainText(F["09"].title);
  await expect(pin.locator("b, script")).toHaveCount(0);
  expect(problems).toEqual([]);
});

test("TC-63 NFR-06 (browser part): no request in a full flow carries a key or token", async ({ page, request }) => {
  const seen: string[] = [];
  page.on("request", (r) => seen.push(JSON.stringify({ url: r.url(), headers: r.headers(), body: r.postData() })));
  await openResults(page);
  await page.getByRole("button", { name: "Filters", exact: true }).first().click();
  await page.keyboard.press("Escape");
  const e = await realEvent(request);
  if (e) await page.goto(`/event/${encodeURIComponent(e.id)}`);
  await page.goto("/saved");
  await page.goto("/about");
  expect(seen.length).toBeGreaterThan(5);
  for (const s of seen) expect(s).not.toMatch(/authorization|bearer|api[_-]?key|token|secret|eventbrite|predicthq|sk_/i);
});
