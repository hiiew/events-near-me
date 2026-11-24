// NFR-05: automated WCAG 2.1 AA scan with axe (TC-60) and the parts of the manual checklist a browser can
// measure: target size, keyboard reachability, focus ring, reduced motion (TC-62, ui-ux.md §6).
import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";
import { F, NOW } from "./fixtures/events";
import { chip, expect, openResults, openWelcome, realEvent, resultsHeading, setFilters, test } from "./helpers";

type Finding = { screen: string; id: string; impact: string; nodes: number; help: string; first: string };

async function scan(page: Page, screen: string, found: Finding[]) {
  // @axe-core/playwright brings its own newer playwright-core, so its Page type differs by version only; same object at run time.
  const { violations } = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]["page"] }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  for (const v of violations) found.push({ screen, id: v.id, impact: v.impact ?? "unknown", nodes: v.nodes.length, help: v.help, first: String(v.nodes[0]?.target) });
}

for (const theme of ["dark", "light"] as const) {
  test.describe(theme, () => {
    test.use({ colorScheme: theme });

    test(`TC-60 NFR-05: axe finds no serious or critical WCAG 2.1 AA violations (${theme})`, async ({ page, request }, info) => {
      const found: Finding[] = [];
      await openWelcome(page);
      await scan(page, "S-1 welcome", found);
      await page.getByRole("button", { name: "Pick a spot on the map" }).click();
      await expect(page.getByRole("heading", { name: "Tap the map to choose an area" })).toBeVisible();
      await scan(page, "S-3 pick a spot", found);

      await page.goto("about:blank");
      await openResults(page);
      await expect(page.locator(".leaflet-marker-icon")).toHaveCount(6); // scan only once the map has drawn its pins
      await scan(page, "S-2/S-3 results", found);
      await page.getByRole("button", { name: "Filters", exact: true }).first().click();
      await scan(page, "S-7 filters", found);
      await page.keyboard.press("Escape");
      await setFilters(page, async (d) => {
        await chip(d, "Today").click();
        await chip(d, "Sports").click();
      });
      await expect(resultsHeading(page)).toHaveText("0 events nearby");
      await scan(page, "S-2 empty state", found);

      const e = await realEvent(request);
      if (e) {
        await page.goto(`/event/${encodeURIComponent(e.id)}`);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(e.title); // the event part is streamed in after load
        await scan(page, "S-4 details", found);
      }
      await page.goto("/saved");
      await page.evaluate(() => localStorage.clear());
      await page.reload();
      await scan(page, "S-5 saved (empty)", found);
      await page.evaluate((ev) => localStorage.setItem("happening.bookmarks.v1", JSON.stringify([{ savedAt: new Date().toISOString(), event: ev }])), F["01"]);
      await page.reload();
      await scan(page, "S-5 saved (1 item)", found);
      await page.goto("/about");
      await scan(page, "S-6 about", found);

      // Moderate/minor findings are recorded (they become S3/S4 defects), serious/critical fail the test.
      await info.attach("axe-findings.json", { body: JSON.stringify(found, null, 2), contentType: "application/json" });
      for (const f of found) info.annotations.push({ type: `axe ${f.impact}`, description: `${f.screen}: ${f.id} (${f.nodes}) — ${f.help}` });
      expect(found.filter((f) => f.impact === "serious" || f.impact === "critical")).toEqual([]);
    });
  });
}

test("TC-62 NFR-05 (automated part): every control is at least 44 × 44 px", async ({ page, request }) => {
  // Inline text links (inside a sentence) are excepted, as in WCAG 2.5.8. Map pins are excepted because every
  // pinned event is also a full-size row in the list (ui-ux.md §6: "map is never the only way").
  const small = async (screen: string) =>
    (await page.evaluate(() => {
      const out: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>("button, a[href], input, select, [role=button], [tabindex='0']")) {
        const r = el.getBoundingClientRect();
        const style = getComputedStyle(el);
        if (r.width === 0 || style.visibility === "hidden" || el.closest("[aria-hidden=true], .sr-only, dialog:not([open])")) continue;
        if (el.matches(".leaflet-marker-icon, .leaflet-container") || (el.tagName === "A" && style.display === "inline")) continue;
        if (r.width < 43.5 || r.height < 43.5) out.push(`${el.tagName.toLowerCase()} "${(el.getAttribute("aria-label") ?? el.textContent ?? "").trim().slice(0, 40)}" ${Math.round(r.width)}×${Math.round(r.height)}`);
      }
      return out;
    })).map((s) => `${screen}: ${s}`);

  const tooSmall: string[] = [];
  await openWelcome(page);
  tooSmall.push(...(await small("S-1")));
  await page.goto("about:blank");
  await openResults(page);
  tooSmall.push(...(await small("S-2")));
  await page.getByRole("button", { name: "Filters", exact: true }).first().click();
  tooSmall.push(...(await small("S-7")));
  const e = await realEvent(request);
  if (e) {
    await page.goto(`/event/${encodeURIComponent(e.id)}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(e.title);
    tooSmall.push(...(await small("S-4")));
  }
  for (const path of ["/saved", "/about"]) {
    await page.goto(path);
    tooSmall.push(...(await small(path)));
  }
  expect(tooSmall).toEqual([]);
});

test("TC-62 NFR-05 (automated part): the core flow works by keyboard alone, with a visible focus ring", async ({ page, request }) => {
  test.skip(!(await realEvent(request)), "needs a real upcoming event to reach the details page (E-6)");
  // Generous limit: with real data the list can hold dozens of rows (two links each) before the tab cycles round.
  const tabTo = async (match: (el: { tag: string; label: string; cls: string }) => boolean, max = 250) => {
    for (let i = 0; i < max; i++) {
      await page.keyboard.press("Tab");
      const el = await page.evaluate(() => {
        const a = document.activeElement as HTMLElement;
        return { tag: a.tagName.toLowerCase(), label: (a.getAttribute("aria-label") ?? a.getAttribute("title") ?? a.textContent ?? "").trim(), cls: String(a.className) };
      });
      if (match(el)) return;
    }
    throw new Error("could not reach the control with Tab");
  };
  const ringVisible = () => page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle !== "none");

  await page.goto("/");
  await tabTo((el) => el.label.startsWith("Klang Valley")); // real search from the public area centre
  expect(await ringVisible()).toBe(true);
  await page.keyboard.press("Enter");
  await expect(resultsHeading(page)).toBeVisible();

  await tabTo((el) => el.cls.includes("leaflet-marker-icon") && el.label !== "");
  await page.keyboard.press("Enter");
  await expect(page.locator("#sheet-body article.bg-surface")).toHaveCount(1); // the pin's row is highlighted

  await tabTo((el) => el.label === "Filters" && el.tag === "button");
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Filters" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))).toBe("Filters"); // focus returns

  await tabTo((el) => el.tag === "a" && (el.cls.includes("hover:underline")));
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/event\//);
  await expect(page.getByRole("button", { name: "Save event" })).toBeVisible();
  await tabTo((el) => el.label === "Save event");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Saved — remove from Saved" })).toBeVisible();
  await tabTo((el) => el.label === "Back to Explore");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/$/);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("TC-62 NFR-05 (automated part): the list sheet does not animate when reduced motion is on", async ({ page }) => {
    await page.clock.setFixedTime(NOW);
    await openResults(page);
    const sheet = page.locator("section[aria-labelledby=sheet-title]");
    const seconds = Number((await sheet.evaluate((el) => getComputedStyle(el).transitionDuration)).replace("s", ""));
    expect(seconds).toBeLessThan(0.01);
  });
});
