// NFR-03: usable from 360 px to desktop with no sideways scrolling, in dark and light (TC-58).
// 3 sizes × 2 themes × 6 screens = 36 checks. Screenshots are attached to the test results for a manual glance.
import type { Page, TestInfo } from "@playwright/test";
import { F, NOW } from "./fixtures/events";
import { expect, openResults, realEvent, test } from "./helpers";

const SIZES = [
  { width: 360, height: 740 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

async function check(page: Page, info: TestInfo, screen: string, primary: string) {
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  expect(scrollWidth, `${screen}: page is wider than the screen`).toBeLessThanOrEqual(innerWidth);
  const button = page.getByRole("button", { name: primary, exact: true }).or(page.getByRole("link", { name: primary, exact: true })).first();
  await expect(button, `${screen}: "${primary}" visible`).toBeVisible();
  await button.click({ trial: true }); // clickable: not covered by anything
  await info.attach(`${screen}.png`, { body: await page.screenshot(), contentType: "image/png" });
}

for (const size of SIZES) {
  for (const theme of ["dark", "light"] as const) {
    test.describe(`${size.width}px ${theme}`, () => {
      test.use({ viewport: size, colorScheme: theme });

      test(`TC-58 NFR-03: ${size.width}px ${theme} — six screens, no horizontal scroll`, async ({ page, request }, info) => {
        const e = await realEvent(request);
        await page.clock.setFixedTime(NOW);
        await page.goto("/");
        await check(page, info, "S-1 welcome", "Use my location");
        await openResults(page);
        await check(page, info, "S-2/S-3 results", "Today");
        // The top-bar label may end in "…" by design, but its "Change" part must stay on screen.
        await expect(page.getByRole("button", { name: /Change search area$/ }).getByText("Change")).toBeInViewport();
        await page.getByRole("button", { name: "Filters", exact: true }).first().click();
        await check(page, info, "S-7 filters", "Show 6 events");
        await page.keyboard.press("Escape");
        if (e) {
          await page.goto(`/event/${encodeURIComponent(e.id)}`);
          await check(page, info, "S-4 details", "Directions (Google Maps)");
        }
        await page.evaluate((ev) => localStorage.setItem("happening.bookmarks.v1", JSON.stringify([{ savedAt: new Date().toISOString(), event: ev }])), F["01"]);
        await page.goto("/saved");
        await check(page, info, "S-5 saved", `Remove ${F["01"].title} from Saved`);
        await page.goto("/about");
        await check(page, info, "S-6 about", "Clear saved data");
      });
    });
  }
}
