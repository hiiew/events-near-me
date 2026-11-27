// Phase 5 browser tests (test-plan.md §2, ENV-1). Runs the production build, because the service
// worker (FR-40) and the CSP header only exist in production.
import { defineConfig, devices } from "@playwright/test";
import { SERVER_CURATED_JSON } from "./e2e/fixtures/server-events";

const PORT = Number(process.env.E2E_PORT ?? 3100);
// E2E_SKIP_BUILD=1 reuses the last `npm run build` (faster when only tests changed).
const build = process.env.E2E_SKIP_BUILD ? "" : "npm run build && ";

// NFR-13: WebKit (Safari's engine) on an emulated iPhone runs in CI, or locally with E2E_WEBKIT=1 (needs
// `npx playwright install webkit`, which is not done in Claude's container). Partial evidence only: it is not
// real iOS Safari (test-plan §3.2 D-3a, RT-03).
const withWebkit = Boolean(process.env.CI || process.env.E2E_WEBKIT);
// Local only: point Playwright at an already-installed Chromium whose build doesn't match the pinned version
// (Claude's container: PW_CHROMIUM_PATH=/opt/pw-browsers/chromium_headless_shell, dependency-updates.md §3).
// Unset in CI, where `playwright install` fetches the matching browser.
const chromiumPath = process.env.PW_CHROMIUM_PATH;

export const SERVER_LOG = ".next/e2e-server.log"; // read by TC-40 in global-teardown.ts

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  workers: 4,
  retries: 0, // a flaky test is a bug to fix, not to retry
  reporter: [["list"], ["json", { outputFile: "test-results/results.json" }]],
  globalTeardown: "./e2e/global-teardown.ts",
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 390, height: 844 }, // PRE-A
    colorScheme: "dark", // PRE-A: Night Map is dark-first
    locale: "en-GB",
    geolocation: { latitude: 3.157912, longitude: 101.711623 }, // PRE-C: KLCC public test landmark
    permissions: ["geolocation"],
    serviceWorkers: "block", // RT-07: no cached pages between tests; offline.spec.ts allows them
    trace: "off", // traces would contain request bodies (test-plan §2.1 rule 8)
    screenshot: "only-on-failure",
    video: "off",
  },
  projects: [
    { name: "chromium", use: chromiumPath ? { launchOptions: { executablePath: chromiumPath } } : {} },
    // iPhone 15: WebKit, 393 × 659 Safari viewport, touch, mobile, iPhone user agent. Everything else (dark,
    // en-GB, KLCC location, blocked service workers, no traces) comes from `use` above. Browser-specific skips
    // are written in the specs as test.skip(browserName === "webkit", reason) and listed in test-plan §3.2.
    ...(withWebkit ? [{ name: "webkit-iphone", use: { ...devices["iPhone 15"] } }] : []),
  ],
  webServer: {
    // Server output goes to a file so TC-40 can check it never contains coordinates.
    command: `${build}npm start -- -p ${PORT} > ${SERVER_LOG} 2>&1`,
    // PRE-D (test-plan §2.3): the server serves fixed, always-upcoming test events instead of the real curated
    // file. Read at run time by src/lib/sources/curated.ts, so the same production build is tested.
    env: { E2E_CURATED_EVENTS: SERVER_CURATED_JSON },
    url: `http://localhost:${PORT}/about`,
    reuseExistingServer: false,
    timeout: 240_000,
  },
});
