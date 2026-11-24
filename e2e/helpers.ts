// Shared set-up for the browser tests (test-plan.md §2.1). Every test imports `test` and `expect` from here
// instead of from @playwright/test, so the "no outside hosts" rule can't be forgotten.
import { test as base, expect, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import type { Event } from "@/lib/event-schema";
import { KK_CENTER, KK_EVENTS, MAIN_EVENTS, NOW, searchResponse } from "./fixtures/events";

export { expect };

// A 1×1 transparent PNG. Leaflet stretches it to the tile size, so the map still lays out normally.
const BLANK_PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=", "base64");

export const test = base.extend({
  context: async ({ context }, provide) => {
    // (Playwright calls this callback `use`; renamed so the React-hooks lint rule does not mistake it for a hook.)
    // Rule 4: no map tiles are downloaded (OSM tile policy, and this container blocks them anyway).
    // Any other outside address — organiser pages, Google Maps, Waze — gets a stub page, so a test that
    // follows a link sees where it went without visiting the real site.
    await context.route(
      (url) => url.hostname !== "localhost",
      (route) =>
        route.request().url().includes("tile.openstreetmap.org")
          ? route.fulfill({ contentType: "image/png", body: BLANK_PNG })
          : route.fulfill({ contentType: "text/html", body: "<title>outside stub</title>" }),
    );
    await provide(context);
  },
});

export interface SearchStub {
  /** Every body POSTed to /api/events/search, in order (rounded points — never printed). */
  bodies: { lat: number; lon: number }[];
  /** true → the next searches fail like a lost connection (FR-40). */
  offline: boolean;
}

/**
 * Rule 2: answer POST /api/events/search in the browser with the fixtures. The Kota Kinabalu centre gets the
 * KK pair, every other point the main F-01 – F-09 set (the app filters by distance itself, ADR-06).
 */
export async function stubSearch(
  page: Page,
  opts: { events?: Event[]; kkEvents?: Event[]; sources?: Parameters<typeof searchResponse>[1]; failFirst?: number } = {},
): Promise<SearchStub> {
  const stub: SearchStub = { bodies: [], offline: false };
  await page.route("**/api/events/search", (route) => {
    const body = route.request().postDataJSON() as { lat: number; lon: number };
    stub.bodies.push(body);
    if (stub.offline) return route.abort("internetdisconnected");
    if (stub.bodies.length <= (opts.failFirst ?? 0)) return route.fulfill({ status: 500, json: { error: "internal" } });
    const kk = body.lat === KK_CENTER.lat && body.lon === KK_CENTER.lon;
    const events = kk ? (opts.kkEvents ?? KK_EVENTS) : (opts.events ?? MAIN_EVENTS);
    return route.fulfill({ json: searchResponse(events, opts.sources) });
  });
  return stub;
}

/** PRE-A + PRE-B: fixed clock, fixture search, welcome screen open and area counts loaded. */
export async function openWelcome(page: Page, opts: Parameters<typeof stubSearch>[1] & { now?: Date } = {}) {
  await page.clock.setFixedTime(opts.now ?? NOW);
  const stub = await stubSearch(page, opts);
  await page.goto("/");
  await expect.poll(() => stub.bodies.length).toBe(2); // the two area-count searches (FR-41)
  return stub;
}

/** PRE-A/B/C: results for the KLCC landmark via "Use my location". */
export async function openResults(page: Page, opts: Parameters<typeof openWelcome>[1] = {}) {
  const stub = await openWelcome(page, opts);
  await page.getByRole("button", { name: "Use my location" }).click();
  await expect(page.getByRole("heading", { level: 1, name: /events? nearby$/ })).toBeVisible();
  return stub;
}

export const rowTitles = (page: Page) => page.locator("#sheet-body article h2");
export const row = (page: Page, e: Pick<Event, "id">) => page.locator(`[id="event-${e.id}"]`);
export const eventMarkers = (page: Page) => page.locator(".leaflet-marker-icon[title]");
export const resultsHeading = (page: Page) => page.getByRole("heading", { level: 1, name: /events? nearby$/ });
/** "Your location · 10 km" etc. in the top bar. */
export const topBar = (page: Page) => page.locator("span.truncate").filter({ hasText: / · \d+ km$/ });

/** Open Filters, let `change` click inside the dialog, then apply. Returns the count the apply button showed. */
export async function setFilters(page: Page, change: (dialog: Locator) => Promise<void>): Promise<number> {
  await page.getByRole("button", { name: "Filters", exact: true }).first().click();
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await change(dialog);
  const apply = dialog.getByRole("button", { name: /^Show \d+ events?$/ });
  const count = Number((await apply.innerText()).match(/\d+/)![0]);
  await apply.click();
  await expect(dialog).toBeHidden();
  return count;
}

export const chip = (scope: Locator | Page, name: string) => scope.getByRole("button", { name, exact: true });

/** Web Mercator pixel offset between two points at a zoom level (how Leaflet places things). */
function project(p: { lat: number; lon: number }, zoom: number) {
  const size = 256 * 2 ** zoom;
  const sin = Math.sin((p.lat * Math.PI) / 180);
  return { x: ((p.lon + 180) / 360) * size, y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size };
}

/** Click the map where `target` is, while the map still shows its start view (centre, zoom 12). */
export async function clickMapAt(page: Page, target: { lat: number; lon: number }, center: { lat: number; lon: number }) {
  const box = (await page.locator(".leaflet-container").boundingBox())!;
  const [a, b] = [project(center, 12), project(target, 12)];
  await page.mouse.click(box.x + box.width / 2 + (b.x - a.x), box.y + box.height / 2 + (b.y - a.y));
}

/** Click an empty-looking spot on the map, away from the top bar and the pins in the middle. */
export async function clickMapCorner(page: Page, dx = 40, dy = 110) {
  const box = (await page.locator(".leaflet-container").boundingBox())!;
  await page.mouse.click(box.x + dx, box.y + dy);
}

/**
 * PRE-D: a real upcoming curated event, read from the unmocked API at run time (the details page reads the
 * real file on the server). Picks the first event matching `where`, or skips the test if there is none.
 */
export async function realEvent(request: APIRequestContext, where: (e: Event) => boolean = () => true): Promise<Event | undefined> {
  const res = await request.post("/api/events/search", { data: { lat: 3.139, lon: 101.687 } }); // public KL centre
  expect(res.ok()).toBe(true);
  const { events } = (await res.json()) as { events: Event[] };
  return events.find(where);
}

// Expected texts written independently of src/lib/format.ts, straight from NFR-18 (Malaysia time, RM).
const tz = "Asia/Kuala_Lumpur";
export const mytLongDay = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso)).replace(",", "");
export const mytShortDay = (iso: string) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, weekday: "short", day: "numeric", month: "short" }).format(new Date(iso));
export const mytTime = (iso: string) => new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));
/** Browsers put a narrow no-break space before "PM"; compare texts with plain spaces. */
export const plain = (s: string) => s.replace(/\s+/g, " ").trim();

export const CATEGORY_LABEL: Record<Event["category"], string> = {
  music: "Music",
  food: "Food & Markets",
  arts: "Arts & Culture",
  sports: "Sports",
  learning: "Workshops & Learning",
  tech: "Tech & Meetups",
  nightlife: "Nightlife",
  other: "Other",
};

export function priceText(p: Event["price"]): string {
  if (p === null) return "Price not listed";
  if (p.min === 0 && !p.max) return "FREE";
  const money = (n: number) => `${p.currency === "MYR" ? "RM" : p.currency} ${n.toFixed(2)}`;
  return p.max && p.max > p.min ? `${money(p.min)} – ${money(p.max)}` : money(p.min);
}
