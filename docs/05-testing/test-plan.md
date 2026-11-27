# Test Plan — Happening

| Field | Value |
|---|---|
| Phase | 5 — Testing |
| Version | 0.1 — draft for owner review |
| Date | 2026-11-24 |
| Standard | Structure based on IEEE 829 / ISO/IEC/IEEE 29119-3 (test plan) |
| Inputs | SRS v1.0 (+ CR-01–CR-13), traceability matrix v1.1, ui-ux.md §6, security-privacy.md, dev-log |
| Related | [`test-cases.md`](test-cases.md) (TC-01 – TC-73) · `uat-script.md` and `test-report.md` follow in the next step |

> **What is a test plan?** It says *what* will be tested, *how*, *where*, *by whom* and *when*,
> and what "finished" means. The test cases then say exactly which steps prove each requirement.
> A requirement only counts as done (✅ in the traceability matrix) when a test case that would fail
> if the requirement broke has actually been run and passed.

---

## 1. Scope

### 1.1 In scope
- Every **Must** and **Should** requirement in SRS v1.0 that has been built, plus every built
  **Could** requirement (FR-23, FR-33–FR-41), because they ship in the same app.
- All 19 NFRs; NFR-07 (HTTPS) and NFR-16 (RM0) are checked on the Vercel deployment.
- The security threats in `security-privacy.md` §3 that have a code mitigation (T-01, T-02, T-03,
  T-04, T-05, T-07) and the headers in §7.
- Screens S-1 to S-7 in dark and light theme.

### 1.2 Out of scope (and why)

| Item | Reason |
|---|---|
| FR-16 Custom date range | Deferred (Could, not built) |
| FR-26 Eventbrite | Deferred to backlog — CR-03 |
| FR-27 PredictHQ, FR-29 dedupe, FR-30 server cache | Not built; only needed once a second (live) source exists. FR-29 and FR-30 are **Should**, so the test report lists them as gaps, not as passes |
| Load / stress testing | Student-project traffic; Vercel platform limits apply (T-06) |
| Penetration testing | No accounts or admin UI (T-09); headers, input validation and XSS are tested instead |
| Third-party apps themselves (Google Maps, Waze, calendar apps, chat apps) | We test the link or file we hand over, and on a real phone that the app accepts it |

### 1.3 Scope question — decided
**Is Kota Kinabalu (Sabah) in UAT scope?** CR-11 added 5 Sabah events and left this to the owner;
FR-41 now shows a Kota Kinabalu button on the first screen, so testers *will* see it.
- *Option A — Klang Valley only (current plan).* Automated tests still cover the Kota Kinabalu button
  with fixture data (TC-52 – TC-55). UAT testers are told to use Klang Valley.
- *Option B — include Sabah.* Add one UAT task "browse Kota Kinabalu". Needs Sabah events dated in
  the UAT window (there are none today, see risk RT-01).

**Decided by the owner 2026-11-24: option A, Klang Valley only.**

---

## 2. Approach and test levels

| Level | What it proves | Tool | Who | Where the tests live |
|---|---|---|---|---|
| **Unit** | Pure logic: filters, date windows in Malaysia time, distance, rounding, formatting, adapters, aggregator time-outs, input validation, `.ics`, bookmarks, offline cache | Vitest 5.1 | Claude | `src/**/*.test.ts` (156 tests today) |
| **Integration** | The route handler with the real adapters and schemas; a failing/hanging source | Vitest (route + aggregator tests) and Playwright `request` against the running server | Claude | `src/app/api/events/search/route.test.ts`, `e2e/api.spec.ts` |
| **System / browser (e2e)** | User-visible behaviour of each user story on the production build | Playwright 1.63 (Chromium), `--trace off` | Claude | `e2e/*.spec.ts` (to be written in the next step) |
| **Accessibility audit** | WCAG 2.1 AA checks a tool can find, on every screen, dark and light | axe-core 4.14 inside Playwright; Lighthouse Accessibility | Claude | `e2e/a11y.spec.ts`; Lighthouse JSON in `docs/05-testing/evidence/` |
| **Performance audit** | NFR-01 (≤ 3 s to first results on Fast 4G) and NFR-02 (Lighthouse mobile ≥ 80) | Playwright + Chrome DevTools Protocol throttling; Lighthouse CLI | Claude | `e2e/perf.spec.ts`; Lighthouse JSON |
| **Manual / real device** | What a headless browser cannot prove: real permission prompt, share sheet, calendar import, PWA install, screen reader, Safari | A phone, a laptop | **Owner** | Steps in `test-cases.md`; results in `test-report.md` |
| **UAT** | Real users can do the core tasks (NFR-04) and find the app useful | `uat-script.md` | Owner runs; Tester A, B, C | `test-report.md` §UAT |
| **Review / audit** | Requirements a test can't execute: NFR-14 design, NFR-16 cost, NFR-17 compliance, NFR-06 secret scan | Checklists, `git log -p` scan | Claude + owner | `test-report.md` |

### 2.1 Rules for every automated test
1. **A test must fail when the requirement breaks.** Assert the behaviour the user sees (rows,
   labels, counts, request bodies), not implementation details.
2. **No dependence on real event dates.** The curated file holds real events that expire. Browser
   tests that check filters, chips, map or list replace the search response with a **fixture**
   (`page.route("/api/events/search")`) whose dates are relative to a **fixed browser clock**
   (`page.clock.setFixedTime`). Unit tests already pass `now` as a parameter.
3. Only the event **details page** reads the real curated file on the server. Detail tests pick
   *any* upcoming event at run time from the unmocked API and assert facts relative to it; they
   need at least one upcoming event in the file (entry criterion E-6).
4. **Map tiles are not downloaded in tests:** requests to `*.tile.openstreetmap.org` are answered
   with a blank 256 px PNG. This respects the OSM tile usage policy and keeps tests stable. The
   attribution text is still checked.
5. **Geolocation** is either granted with `context.setGeolocation` (a public landmark: KLCC) or
   stubbed with `addInitScript` to return *denied* / *timeout*. No real person's location is used.
6. Fresh browser context per test (empty `localStorage`, no service worker) unless the test is about
   persistence or offline.
7. **Privacy in evidence:** test output, screenshots and the report never contain coordinates
   other than the public test landmarks; server logs captured during the run are searched for those
   landmark coordinates (TC-40) and the matching lines, if any, are reported by count, not copied.
8. Run with `--trace off` (traces would contain request bodies).

### 2.2 Fixture data (browser tests)
Fixed browser clock **Thu 17 Dec 2026, 10:00 Malaysia time**, so "This weekend" = Sat 19 – Sun 20 Dec.
Search point P = KLCC test landmark. The fixture file `e2e/fixtures/events.ts` builds these events
(dates relative to the fixed clock; coordinates placed at the stated distance from P):

| ID | Title | Category | When | Distance from P | Price |
|---|---|---|---|---|---|
| F-01 | Jazz Night at Café Bukit | Music | Today 20:00–23:00 | 1.5 km | Free |
| F-02 | Weekend Night Market | Food & Markets | Sat 18:00–23:00 | 4 km | RM 10 |
| F-03 | Indie Gig Sunday | Music | Sun 20:00–23:00 | 8 km | RM 60 – RM 90 |
| F-04 | Tech Meetup | Tech & Meetups | +3 days 19:00 | 9 km | Not listed (`null`) |
| F-05 | Art Walk | Arts & Culture | +5 days 10:00 | 22 km | Free |
| F-06 | Trail Run | Sports | +20 days 07:00 | 45 km | RM 80 |
| F-07 | Pop-up Workshop | Workshops & Learning | +2 days 14:00 | **no coordinates** | RM 20 |
| F-08 | Ended Bazaar | Food & Markets | Yesterday (ended) | 3 km | Free |
| F-09 | `<b>Bold</b>` Comedy `<script>` | Nightlife | +4 days 21:00 | 6 km | RM 45 |

Default view (10 km, Next 30 days, all, any price) must list **F-01, F-07, F-02, F-04, F-03, F-09**
(soonest first: Thu 20:00, Sat 14:00, Sat 18:00, Sun 19:00, Sun 20:00, Mon 21:00) — six events.
F-05 and F-06 are outside 10 km; F-08 has ended. Expected subsets for each filter are written in the test cases.
A second fixture for Kota Kinabalu (two events near the KK centre) is returned when the request body
is the KK area centre (FR-41 tests).

---

## 3. Environments

| ID | Environment | Used for | Notes |
|---|---|---|---|
| ENV-1 | **Local production build** in this container: `npm run build && npm run start` on `http://localhost:3000` | All automated e2e, a11y, perf and security-header tests | Production mode is required: the service worker (FR-40) and the CSP header are production-only. Lighthouse here is a lab score only |
| ENV-2 | **Vercel URL** (`happening-kl.vercel.app`, early deploy decided 2026-11-11 — **owner to confirm it exists**) | NFR-07 HTTPS, NFR-02 final score, real-phone tests, chat-app previews (FR-37), UAT | Phones only share location over HTTPS, so real-device location tests need this URL |
| ENV-3 | Owner's laptop (Windows) | Desktop Chrome, Edge, Firefox (NFR-13); keyboard and zoom checks | |
| ENV-4 | Real phones | Android Chrome, iOS Safari: permission prompt, share sheet, calendar, PWA install, screen reader | Owner's phone + whatever Testers A–C bring |

### 3.1 Tools and versions (checked in this container, 2026-11-24)

| Tool | Status | Plan |
|---|---|---|
| Vitest 5.1.0 | Installed. **`npm test` works here with the default pool: 13 files, 156 tests pass in ~0.7 s.** The dev-log's "default pool crashes" was on the owner's machine | Use `npm test`; on the owner's machine fall back to `npx vitest run --pool=vmThreads` and record which was used |
| Playwright 1.63.0 | Test runner `@playwright/test@1.63.0` is a devDependency (added 2026-11-24). **In Claude's container** Chromium is pre-installed, so `playwright install` is not run there. **In CI** (GitHub Actions, `.github/workflows/ci.yml`) the workflow runs `npx playwright install --with-deps chromium`, which is the normal set-up on a fresh runner | Only Chromium is automated (here and in CI); Firefox and WebKit (Safari engine) are covered manually (TC-66) |
| axe-core 4.14.0 | Present only as a dependency of `eslint-plugin-jsx-a11y` | Add `axe-core` (or `@axe-core/playwright`) as an explicit devDependency so the audit does not break when ESLint updates |
| Lighthouse CLI | Not installed; `lighthouse@13.6.0` is reachable on the npm registry from here | Run `npx lighthouse@13.6.0` against ENV-1 and ENV-2 with the local Chrome. Runs entirely on this machine — no Lighthouse service |
| `@vitest/coverage-v8` | Not installed | Add (matching Vitest 5.1) for NFR-15 |
| CI | `.github/workflows/ci.yml` added in Phase 6 (2026-11-24): lint, unit tests, build and the Playwright suite on every PR and push to `main` | NFR-15's "linting passes in CI" is proven by the first green CI run on a PR |

**Done 2026-11-24 (owner OK):** added as exact-version devDependencies `@playwright/test@1.63.0` (matches the installed browser; smoke test passed, no `playwright install`), `@axe-core/playwright@4.14.0` (brings `axe-core` 4.14 explicitly) and `@vitest/coverage-v8@5.1.0` (first run: 97.6 % lines, 92.7 % branches on the unit-tested files). Lighthouse stays `npx` only. Plain `npm test` works in this container.

### 3.2 Device and browser matrix (NFR-13)
NFR-13 asks for the **latest two major versions** of Chrome (Android) and Safari (iOS) plus desktop
Chrome/Edge/Firefox. Record the exact version shown in each browser's "About" page at test time.

| # | Platform | Browser | Versions to cover | How | Who | Viewport / notes |
|---|---|---|---|---|---|---|
| D-1 | Linux container | Chrome (headless) | Installed version | All Playwright suites | Claude | 360, 768, 1280 px; dark + light |
| D-2 | Android phone | Chrome | Latest **and** previous major | TC-66 smoke + real-device cases | Owner / a tester with Android | Previous major: a second phone or a tester whose Chrome is one version behind; if none is available, report it as a gap |
| D-3 | iPhone | Safari | Latest and previous iOS major | TC-66 smoke + real-device cases | A tester with an iPhone (owner to confirm someone has one) | iOS-only checks: Add to Home Screen, `.ics` in Calendar, share sheet |
| D-4 | Windows laptop | Chrome | Latest | TC-66 smoke | Owner | 1280 px and 200 % zoom |
| D-5 | Windows laptop | Edge | Latest | TC-66 smoke | Owner | |
| D-6 | Windows laptop | Firefox | Latest | TC-66 smoke | Owner | No PWA install in Firefox desktop (expected) |

---

## 4. Entry criteria (start executing tests)

| # | Criterion | Status 2026-11-24 |
|---|---|---|
| E-1 | Phase 4 merged to `main`; this plan approved by the owner | Merged ✅ · plan awaiting review |
| E-2 | `npm run lint`, `npm test` and `npm run build` pass on the commit under test | Tests ✅ (156), build ✅ (per handover) |
| E-3 | Test cases written and linked in the traceability matrix | ✅ (this step) |
| E-4 | Test tooling added (§3.1) | ✅ 2026-11-24 (`playwright.config.ts`, `npm run test:e2e`) |
| E-5 | ENV-1 starts and serves `/`, `/about`, `/saved`, `/event/<id>` | ✅ 2026-11-24 (Playwright `webServer`) |
| E-6 | **Curated data has upcoming events on the test date**: ≥ 1 for automated detail-page tests; for UAT (23–29 Dec) ≥ 10 Klang Valley events dated in or after the UAT window, incl. ≥ 1 free, ≥ 1 "price not listed", ≥ 3 categories, ≥ 1 within 10 km of a typical tester's campus/home area, and ideally ≥ 1 with an image (FR-17/FR-37) | ❌ **Not met for UAT** — see RT-01 |
| E-7 | Vercel URL live (for real-phone and HTTPS cases) | ❓ owner to confirm |

## 5. Exit criteria (Phase 5 done — milestone M5)

1. **Every Must row in the traceability matrix is ✅** (exit rule from the matrix and timeline M5).
   A row turns ✅ only when all its linked test cases have been run and passed.
2. Every built **Should** row is ✅; FR-26, FR-29, FR-30 are listed as gaps with their reason.
3. No open **Critical** or **High** defects. Each open Medium/Low defect has an owner decision
   (fix now / backlog) recorded in the test report.
4. UAT done: owner + Tester A, B, C completed the UAT tasks; every tester opened an event's
   details within 3 taps (NFR-04); feedback recorded.
5. `test-report.md` written: what ran, pass/fail per case, defects, coverage count from the matrix.
6. Unit-test line coverage of core logic ≥ 70 % (NFR-15).

### Suspension and resumption
Stop executing and report if: the build fails; a Critical defect blocks a whole flow (e.g. no
results ever load); or the test data has expired (E-6). Resume after the fix is merged and the
smoke subset (TC-02, TC-09, TC-21, TC-28) passes again.

---

## 6. Defects

### 6.1 Severity scale

| Severity | Meaning | Example | Must be fixed before M5? |
|---|---|---|---|
| **S1 Critical** | A Must requirement fails with no workaround, **or** privacy/security breach | Coordinates logged or stored; secret in the browser bundle; no results ever load | Yes |
| **S2 High** | A Must requirement fails but has a workaround, a Should requirement fails, or a WCAG A/AA failure blocks a core flow | Filters ignore category; a button unreachable by keyboard | Yes |
| **S3 Medium** | A Could feature fails, or a Must/Should works but is confusing or inconsistent with the SRS text | Offline notice missing; label wording differs from the SRS | Owner decides |
| **S4 Low** | Cosmetic, no effect on use | 1 px misalignment, typo | Backlog allowed |

### 6.2 How defects are recorded
- Each defect gets an ID **DEF-xx** in the *Defects* table of `test-report.md`: ID, date found,
  test case, requirement IDs, severity, environment/device, steps to reproduce, expected, actual,
  status (**Open → In fix → Fixed → Verified**, or *Won't fix* with the owner's reason), fix PR.
- Fixes go to the `developer` agent with the reproduction steps; one branch/PR per fix, commit
  `fix(FR-xx): …` naming the DEF ID. QA does not fix silently.
- After a fix: re-run the failing case, then the full unit suite and the e2e suite (regression).
- A defect that would change scope or the deadline is raised with the owner before anyone fixes it.
- Evidence (screenshots, Lighthouse JSON) goes in `docs/05-testing/evidence/`, named by TC ID.
  Screenshots of the map use the test landmark only.

---

## 7. Schedule (against timeline M5 — Tue 2026-12-29)

Phase 4 finished early, so automated testing can start well before the original Phase 5 week.

| When | Activity | Output | Who |
|---|---|---|---|
| Tue 24 Nov | Test plan, test cases, matrix links (this step) | `test-plan.md`, `test-cases.md` | Claude |
| After owner review (target by Fri 4 Dec) | Add test tooling; write `e2e/` suites; run unit + e2e + axe + Lighthouse on ENV-1; first test report draft; defects to developer | `e2e/`, `test-report.md` v0.1, `uat-script.md` | Claude |
| By Fri 11 Dec | Defect fixes merged and re-tested; Vercel URL confirmed (ENV-2) | Report v0.2 | Developer agent, owner |
| **By Fri 18 Dec** | **Curated data refreshed for the UAT window (E-6)** | Updated `curated-events.json` | events-curator agent + owner |
| Mon 21 – Tue 22 Dec | Owner's real-device cases (D-2 – D-6): TC-35, TC-48, TC-51, TC-62 screen reader, TC-64, TC-66 | Results in report | Owner |
| **Wed 23 – Tue 29 Dec** | **UAT window:** owner + Tester A, B, C (~20 min each). Avoid 24–25 Dec. Final regression of the automated suites on ENV-2 | UAT results | Owner, Testers A–C, Claude |
| **Tue 29 Dec (M5)** | Test report final; matrix ✅ for passed rows; exit check | `test-report.md` v1.0 | Claude, owner approves |

---

## 8. Risks to testing

| ID | Risk | Likelihood / impact | Mitigation |
|---|---|---|---|
| **RT-01** | **Test data expires before UAT.** The latest curated event ends **Sat 19 Dec 2026, 19:00**. Upcoming events: 20 on 1 Dec, 3 on 15 Dec, **0 on 23 Dec** (Klang Valley and Kota Kinabalu). During the UAT window every tester would see "No events match" and every details link would say "This event has ended" | **Certain / High** | Refresh `curated-events.json` with events dated 23 Dec – Jan by 18 Dec (E-6). Automated filter tests use fixtures and are not affected |
| RT-02 | No Vercel URL → phones can't use real location (HTTPS only) and chat previews can't be checked | Medium / Medium | Testers use "Pick a spot" or an area button; FR-01 on a real phone waits for ENV-2 |
| RT-03 | Only Chromium is available for automation | Certain / Medium | Firefox and Safari covered manually (TC-66); Safari-specific features (Add to Home Screen, Calendar) on a real iPhone |
| RT-04 | Nobody in the UAT group has an iPhone, or a previous-major browser | Medium / Medium | Ask before booking sessions; otherwise report NFR-13 iOS rows as a gap |
| RT-05 | Classmates unavailable over the holidays | Medium / Medium | Book sessions now; allow remote sessions via screen share; three testers minimum, owner counts as a fourth |
| RT-06 | Time-dependent flakiness (MYT midnight, weekends) | Medium / Low | Fixed browser clock + fixtures; unit tests cover boundaries with explicit `now` |
| RT-07 | Service worker carries cached pages between tests | Medium / Low | Fresh context per test; service workers blocked except in offline tests |
| RT-08 | Lighthouse lab score in a container differs from real phones | High / Low | Median of 3 runs; final NFR-02 figure taken on ENV-2 |
| RT-09 | Tester privacy | Low / High | Testers are anonymous (Tester A–C); no recordings of faces or locations; the app stores nothing about them; consent line read at the start of each session |

---

## 9. What needs a real phone (owner)

| Case | What | Why it can't be automated here |
|---|---|---|
| TC-02 (phone part, via TC-66) | Real permission prompt, "Use my location" over HTTPS | Headless browsers fake the prompt; needs ENV-2 |
| TC-08 (phone part) | Leave the permission prompt unanswered for > 10 s | Browser timing of a real prompt (see note in TC-08) |
| TC-35 | Native share sheet (Android, iOS) | `navigator.share` only stubbed in tests |
| TC-45 (chat part) | Link preview in WhatsApp / Telegram | Needs the public URL and a chat app |
| TC-48 | `.ics` opens in Google Calendar / Apple Calendar with two reminders | Calendar apps |
| TC-51 | Install to home screen (Android Chrome, iOS Safari), opens standalone | Install prompts |
| TC-62 (screen-reader part) | TalkBack and VoiceOver walkthrough | Screen readers |
| TC-26, TC-27 (app part) | Directions open the Google Maps / Waze app at the venue | Native apps |
| TC-66 | NFR-13 device/browser matrix | Real browsers and versions |

## 10. Decisions needed from the owner
1. ~~Kota Kinabalu in UAT scope?~~ **Answered: A, Klang Valley only.**
2. ~~OK to add devDependencies?~~ **Answered: yes** (added 2026-11-24, see §3.1). Original question: OK to add four devDependencies: `@playwright/test`, `axe-core` (or `@axe-core/playwright`), `@vitest/coverage-v8`; Lighthouse via `npx` only (§3.1)?
3. Does the Vercel URL exist yet (ENV-2)? If not, can the Phase 6 deploy happen before 18 Dec?
4. ~~Who refreshes the curated events?~~ **Answered:** the owner sends late-December event pages, the events-curator agent adds them; target 18 Dec (RT-01).
5. Does any tester have an iPhone and/or an older Chrome (NFR-13)?
6. The interpretation questions listed at the end of `test-cases.md` (max price on price ranges,
   "This weekend" for events already running, wording differences).

## 11. Deliverables of Phase 5
`test-plan.md` (this) · `test-cases.md` · `e2e/` Playwright suites · `uat-script.md` ·
`test-report.md` · updated traceability matrix (Test column + ✅ for passed rows only) ·
`evidence/` (Lighthouse JSON, screenshots).
