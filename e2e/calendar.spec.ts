// US-17: "Add to calendar" downloads an .ics file made on the device (FR-23; reminders FR-39 are unit-tested).
import { readFile } from "node:fs/promises";
import { eventPath, S } from "./fixtures/server-events";
import { expect, test } from "./helpers";

const utc = (iso: string | number) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

// S-1 has an end time (DTEND = end), S-2 has none (DTEND = start + 2 h).
for (const e of [S.full, S.noPrice]) {
  test(`TC-46 FR-23 US-17: the .ics file has the right event, times in UTC and folded lines (${e.end ? "with" : "without"} end time)`, async ({ page }) => {
    await page.goto(eventPath(e));
    await page.waitForLoadState("networkidle");
    // Anything that could carry event data off the device: every request except the browser fetching the app's
    // own static code (same-origin GET of /_next/static/, which Next.js may load lazily on the first click —
    // WebKit did, failing CI on PR #35). Other methods, other hosts and /api/ still count.
    const origin = new URL(page.url()).origin;
    const sent: string[] = [];
    page.on("request", (r) => {
      const u = new URL(r.url());
      const ownCode = r.method() === "GET" && u.origin === origin && u.pathname.startsWith("/_next/static/");
      if (!ownCode) sent.push(`${r.method()} ${r.url()}`);
    });

    const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Add to calendar" }).click()]);
    expect(download.suggestedFilename()).toMatch(/\.ics$/);
    const raw = await readFile((await download.path())!, "utf8");
    await expect(page.getByText(/^Calendar file downloaded/)).toBeAttached();

    const physical = raw.split("\r\n").filter(Boolean);
    for (const l of physical) expect(Buffer.byteLength(l, "utf8")).toBeLessThanOrEqual(75);
    const lines = raw.replace(/\r\n /g, "").split("\r\n"); // unfold (RFC 5545 §3.1)
    const field = (name: string) => lines.find((l) => l.startsWith(`${name}:`))?.slice(name.length + 1);
    const unescape = (s = "") => s.replace(/\\n/g, "\n").replace(/\\([,;\\])/g, "$1");

    expect(lines).toEqual(expect.arrayContaining(["BEGIN:VCALENDAR", "BEGIN:VEVENT", "END:VEVENT", "END:VCALENDAR"]));
    expect(unescape(field("SUMMARY"))).toBe(e.title);
    expect(field("DTSTART")).toBe(utc(e.start));
    expect(field("DTEND")).toBe(e.end && Date.parse(e.end) > Date.parse(e.start) ? utc(e.end) : utc(Date.parse(e.start) + 2 * 3_600_000));
    expect(unescape(field("LOCATION")).startsWith(e.venue.name)).toBe(true);
    expect(field("URL")).toBe(e.url);
    expect(sent).toEqual([]); // made on the device: nothing sent anywhere
  });
}
