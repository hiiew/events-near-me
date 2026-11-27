# Dependency updates — Happening

| Field | Value |
|---|---|
| Phase | 7 — Maintenance (started early: Dependabot was switched on in PR #24, 2026-11-27) |
| Requirements served | NFR-15 (lint in CI), T-11 (supply chain, `security-privacy.md`) |
| Config | `.github/dependabot.yml` (npm + GitHub Actions, weekly on Monday, Malaysia time) |

## 1. Policy — how Claude handles a Dependabot PR

1. **Read the PR first:** which packages, from → to, patch / minor / major. Groups list every package in the commit message.
2. **CI must be green.** If it is red, find out *why* before deciding. A red run is not always the update's fault
   (the first ESLint 10 run failed on a flaky contrast check, DEF-09). Re-run CI once the real cause is fixed.
3. **Patch and minor, CI green, changelog has no warning for us → merge.** One group PR at a time, then let the
   Vercel production deploy finish and run the smoke check S-1, S-4, S-7 (`docs/06-deployment/deployment-guide.md` §4).
4. **Major → always a look,** even with green CI:
   - Do the tools around it support it? Check peer ranges with `npm view <plugin> peerDependencies`
     (npm only *warns* about a peer conflict, so CI can pass while a plugin is untested on the new version).
   - Does it match the runtime? Types such as `@types/node` follow the Node version we run (22), not the newest.
   - Read the release notes for breaking changes. If a code change is needed, it is a normal developer slice with tests.
   - If it cannot be used yet: close the PR and add an `ignore` rule with a comment saying **why** and **when to revisit**.
5. **Never several majors at once,** and never merge a PR that changes behaviour without a change request
   (`docs/02-requirements/change-log.md`).
6. **Stop and ask the owner** when an update needs money/an account, changes scope, or is a security fix
   (a Dependabot *security* alert is reported to the owner the same day).

### Why some versions are pinned exactly (no `^`)

| Package | Pin | Why |
|---|---|---|
| `next`, `eslint-config-next` | `16.4.6` | The framework decides routing, caching and headers; an unplanned change could break CSP or the service worker. They share a version number, so they are grouped in `dependabot.yml` (`nextjs`). |
| `react`, `react-dom` | `19.3.0` | Must be the same version as each other and supported by the pinned Next.js. |
| `@playwright/test` | `1.63.0` | Each Playwright version drives one exact browser build. CI installs the matching Chromium itself (`npx playwright install`); this cloud container has a **pre-installed** Chromium that must not be re-installed, so after a Playwright bump local runs need that browser path (see §3). |
| `@axe-core/playwright`, `tailwindcss`, `@tailwindcss/turbopack`, `@vitest/coverage-v8` | exact | Test results and CSS output should only change when we choose. |

### Ignore rules (in `.github/dependabot.yml`)

| Package | Ignored | Why | Revisit |
|---|---|---|---|
| `@types/node` | majors | The app runs on Node 22 (README, `ci.yml`, Vercel); newer types would allow APIs Node 22 lacks. | When the runtime moves to the next Node LTS. |
| `typescript` | majors | `typescript-eslint` (inside `eslint-config-next`) throws "does not support TS 7.0"; its peer range is `<6.1.0` (8.74.0, checked 2026-11-27). | Monthly: `npm view typescript-eslint peerDependencies`. |
| `eslint` | majors | ESLint 10 runs, but `eslint-plugin-react` 7.37.5, `-jsx-a11y` 6.10.2 and `-import` 2.32.0 (latest, used by `eslint-config-next` 16.4.6) only declare ESLint ≤ 9. npm marks ESLint 9 as unsupported; acceptable for a dev-only tool that never ships to users. | Monthly: `npm view eslint-plugin-react peerDependencies`, or when a new `eslint-config-next` lists ESLint 10. |

GitHub Actions updates are grouped into one PR (`github-actions` group).

## 2. Log

| Date | PR | Update | Decision | Reason |
|---|---|---|---|---|
| 2026-11-27 | #25 | actions/setup-node 5 → 7 | Merge | CI green; we use only `node-version` + `cache: npm`. |
| 2026-11-27 | #26 | actions/upload-artifact 5 → 7 | Merge | Removes the "Node.js 20 is deprecated" warning. Note: the step only runs when CI fails, so its own green run did not use it; the first red run will. |
| 2026-11-27 | #27 | actions/checkout 5 → 7 | Merge | CI green; plain checkout, no options. |
| 2026-11-27 | #28 | react/react-dom 19.3.0 → 19.3.1, @playwright/test 1.63.0 → 1.65.1, tailwindcss + @tailwindcss/turbopack 4.3.3 → 4.3.5, vitest + @vitest/coverage-v8 5.1.0 → 5.1.1 | Merge | CI green. Locally: lint clean, unit 161, build OK, e2e 69 passed + 1 skipped (with the pre-installed Chromium). Also removes the duplicate `playwright-core` (1.63 + 1.65) in the lock file. |
| 2026-11-27 | #29 | typescript 5.9.3 → 7.0.2 | Close, ignore majors | Lint crashes: "typescript-eslint does not support TS 7.0" (reproduced locally). |
| 2026-11-27 | #30 | @types/node 22 → 26 | Close, ignore majors | Must match Node 22 runtime. |
| 2026-11-27 | #31 | eslint 9.39.5 → 10.15.0 | Close, ignore majors | The red e2e run was **not** ESLint: it was TC-60's flaky OSM-credit contrast (DEF-09, also failed on PR #32; passes locally on this branch, 69 + 1 skipped). Lint itself works on ESLint 10, but three Next.js lint plugins don't support it yet. |

**Done 2026-11-27 (owner: "yes to all"):** #25, #26, #27 and #28 squash-merged into `main` in that order (all three actions now `@v7` in `ci.yml`); #29, #30 and #31 closed. The owner accepted staying on ESLint 9 until Next.js's lint plugins support ESLint 10 (dev-only tool; revisit monthly). The ignore rules above land with this doc's PR.

## 3. Local Playwright after a version bump (cloud container only)

The container's Chromium is the build for Playwright 1.63 (`/opt/pw-browsers/chromium_headless_shell`). Do **not** run
`playwright install`. After #28 the suite ran correctly with a scratch config that adds
`use.launchOptions.executablePath: "/opt/pw-browsers/chromium_headless_shell"`; CI is unaffected.
