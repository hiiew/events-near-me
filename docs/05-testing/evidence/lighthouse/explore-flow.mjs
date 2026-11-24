// TC-57/TC-61 helper (NFR-02, NFR-05): Lighthouse user flow for the Explore screen (S-2) with results.
// The Explore screen needs a tap first, so a plain URL audit can't reach it. Flow: navigate to "/" (mobile),
// timespan "tap Klang Valley until result rows show", then a snapshot of Explore with results.
// Lighthouse stays npx-only (owner decision), so this loads the copy npx downloaded:
//   npx -y lighthouse@13.6.0 --version        # fills the npx cache once
//   LH_MODULES=<npx cache>/node_modules CHROME_PATH=<chromium> [DARK=1] node explore-flow.mjs out.json
// Needs the production server on http://localhost:3456 (BASE_URL to change).
import fs from "node:fs";

const mods = process.env.LH_MODULES.replace(/\/?$/, "/");
const base = process.env.BASE_URL ?? "http://localhost:3456";
const { startFlow } = await import(mods + "lighthouse/core/index.js");
const puppeteer = (await import(mods + "puppeteer-core/lib/puppeteer/puppeteer-core.js")).default;

const dark = process.env.DARK ? ["--force-dark-mode", "--blink-settings=preferredColorScheme=0"] : [];
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, headless: true, args: ["--no-sandbox", ...dark] });
const page = await browser.newPage();
const flow = await startFlow(page, { name: "Explore via Klang Valley" });
await flow.navigate(base + "/");
await flow.startTimespan({ name: "Tap Klang Valley until results" });
await page.locator("button::-p-text(Klang Valley)").click();
await page.waitForSelector('main ul li a[href^="/event/"]', { timeout: 20000 });
await new Promise((r) => setTimeout(r, 2000));
await flow.endTimespan();
await flow.snapshot({ name: "Explore with results" });
fs.writeFileSync(process.argv[2], JSON.stringify(await flow.createFlowResult()));
console.log("result rows:", await page.$$eval('main ul li a[href^="/event/"]', (a) => a.length));
await browser.close();
