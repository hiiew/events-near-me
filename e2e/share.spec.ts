// US-08, US-15: sharing an event and the preview card chat apps show (FR-22, FR-37).
import { expect, mytShortDay, mytTime, plain, realEvent, test } from "./helpers";

test("TC-33 FR-22 US-08: the share sheet gets the title, date and link", async ({ page, request }) => {
  const e = (await realEvent(request))!;
  test.skip(!e, "no upcoming curated event (E-6)");
  await page.addInitScript(() => {
    const w = window as unknown as { shared: ShareData[] };
    w.shared = [];
    Object.defineProperty(navigator, "share", { configurable: true, value: async (d: ShareData) => void w.shared.push(d) });
  });
  await page.goto(`/event/${encodeURIComponent(e.id)}`);
  await page.getByRole("button", { name: "Share event" }).click();
  const shared = await page.evaluate(() => (window as unknown as { shared: ShareData[] }).shared);
  expect(shared).toHaveLength(1);
  expect(shared[0].title).toBe(e.title);
  expect(plain(shared[0].text!)).toBe(plain(`${e.title} — ${mytShortDay(e.start)} · ${mytTime(e.start)}`));
  expect(shared[0].url).toBe(page.url());
  await expect(page.getByText("Link copied")).toHaveCount(0);
});

test("TC-34 FR-22 US-08: without a share sheet the link is copied and announced", async ({ page, context, request }) => {
  const e = (await realEvent(request))!;
  test.skip(!e, "no upcoming curated event (E-6)");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => {
    delete (Navigator.prototype as Partial<Navigator>).share;
    delete (navigator as Partial<Navigator>).share;
  });
  await page.goto(`/event/${encodeURIComponent(e.id)}`);
  await page.getByRole("button", { name: "Share event" }).click();
  const status = page.getByRole("status").filter({ hasText: "Link copied" });
  await expect(status).toBeVisible();
  await expect(status).toHaveAttribute("aria-live", "polite");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(page.url());
});

test("TC-45 FR-37 US-15 (e2e part): chat-app bots get a preview card for an event link", async ({ request }) => {
  const e = (await realEvent(request))!;
  test.skip(!e, "no upcoming curated event (E-6)");
  const bot = { "User-Agent": "WhatsApp/2.24.1 A" };
  const head = async (url: string) => {
    const html = await (await request.get(url, { headers: bot })).text();
    return html.slice(0, html.indexOf("</head>")); // bots read only <head>
  };
  const decode = (s: string) => s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
  const meta = (h: string, key: string) => {
    const m = h.match(new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`));
    return m ? decode(m[1]) : null;
  };

  const h = await head(`/event/${encodeURIComponent(e.id)}`);
  expect(decode(h.match(/<title>([^<]*)<\/title>/)![1])).toBe(`${e.title} — Happening`);
  expect(meta(h, "og:title")).toBe(`${e.title} — Happening`);
  const description = meta(h, "og:description")!;
  expect(plain(description)).toContain(plain(`${mytShortDay(e.start)} · ${mytTime(e.start)} · ${e.venue.name} · `));
  expect(meta(h, "twitter:card")).toBe(e.imageUrl ? "summary_large_image" : "summary");
  expect(meta(h, "og:image") !== null).toBe(Boolean(e.imageUrl));

  const missing = await head("/event/curated:does-not-exist");
  expect(decode(missing.match(/<title>([^<]*)<\/title>/)![1])).toBe("Event — Happening");
  expect(meta(missing, "og:description")).toBeNull();
});
