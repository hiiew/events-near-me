// NFR-01: first results within 3 s of the search point being set, on Fast 4G with a slower phone CPU (TC-56).
// Uses the real API on the e2e server, which serves the server fixtures (PRE-D: ≈ 23 Klang Valley events, about
// the size of the real file's upcoming list). Lab figure from this container; the final figure is taken on the
// Vercel URL with real data (ENV-2).
import { expect, resultsHeading, test } from "./helpers";

// Chrome DevTools "Fast 4G" preset: 9 Mbit/s down, 1.5 Mbit/s up (×0.9), 60 ms RTT × 2.75. CPU 4× slower.
const FAST_4G = { offline: false, latency: 165, downloadThroughput: (9_000_000 / 8) * 0.9, uploadThroughput: (1_500_000 / 8) * 0.9 };
const CPU_SLOWDOWN = 4;

test("TC-56 NFR-01: first result row within 3 s of tapping Klang Valley (5 runs, Fast 4G, 4× CPU)", async ({ page }, info) => {
  test.setTimeout(120_000);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", FAST_4G);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });

  const runs: number[] = [];
  for (let i = 0; i < 5; i++) {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /^Klang Valley \d+ events?$/ })).toBeVisible({ timeout: 20_000 }); // home page loaded
    const start = Date.now();
    await page.getByRole("button", { name: /^Klang Valley/ }).click();
    await expect(page.locator("#sheet-body article").first()).toBeVisible({ timeout: 10_000 });
    runs.push(Date.now() - start);
    await expect(resultsHeading(page)).toBeVisible();
  }
  const sorted = [...runs].sort((a, b) => a - b);
  const summary = `runs ${runs.join(", ")} ms · median ${sorted[2]} ms · max ${sorted[4]} ms (Fast 4G: 165 ms RTT, 8.1/1.35 Mbit/s; CPU ×${CPU_SLOWDOWN})`;
  info.annotations.push({ type: "TC-56", description: summary });
  console.log(`TC-56 ${summary}`);
  for (const ms of runs) expect(ms).toBeLessThanOrEqual(3000);
});
