// US-18: installable to the home screen (FR-33). Installing itself is checked on real phones (TC-51 manual part).
import { expect, test } from "./helpers";

test("TC-51 FR-33 US-18 (e2e part): manifest, icons and the iOS home-screen icon are served", async ({ request, page }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.short_name).toBe("Happening");
  expect(manifest.name).toMatch(/^Happening\b/);
  expect(manifest.display).toBe("standalone");
  expect(manifest.start_url).toBe("/");
  const icons = manifest.icons as { src: string; sizes: string; purpose?: string }[];
  expect(icons.map((i) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
  expect(icons.some((i) => i.purpose === "maskable")).toBe(true);
  for (const icon of icons) {
    const res = await request.get(icon.src);
    expect(res.status(), icon.src).toBe(200);
    expect(res.headers()["content-type"]).toBe("image/png");
  }

  await page.goto("/");
  const appleIcon = page.locator('link[rel="apple-touch-icon"]');
  await expect(appleIcon).toHaveCount(1);
  expect((await request.get((await appleIcon.getAttribute("href"))!)).status()).toBe(200);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
});
