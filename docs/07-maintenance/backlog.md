# Backlog — Happening (future enhancements and technical debt)

| Field | Value |
|---|---|
| Phase | 7 — Maintenance (drafted 2026-11-27) |
| Owner of this list | `maintenance-engineer` keeps it; the owner sets priorities; re-ranked each term (maintenance plan T-4) |
| Related | [`maintenance-plan.md`](maintenance-plan.md) · [change log](../02-requirements/change-log.md) · [SRS](../02-requirements/srs.md) · [test report](../05-testing/test-report.md) · [`dependency-updates.md`](dependency-updates.md) |

> **What is a backlog?** The list of things we *might* do later, each with where it came from and what
> must happen before it is worth starting. Nothing here is approved scope: anything that changes what
> the app does goes through a **change request** (`requirements-engineer`, change log) before a developer
> builds it. Every item cites its source; no new requirements are invented here.

**Keys.** Priority is MoSCoW **for future work** (Must / Should / Could / Won't for now).
Size: **XS** < 1 h · **S** 1–3 h · **M** 3–8 h · **L** > 8 h (Claude's build + review time; owner time noted separately).
Type: **Enh** enhancement · **Debt** technical debt · **Def** accepted defect · **UX** usability note · **Owner** owner action.

## 1. Next up — ranked by value ÷ effort

| Rank | ID | Why now |
|---|---|---|
| 1 | BL-01 | Owner-only, ~30 min, and it decides whether most of the event data may stay (R-02) |
| 2 | BL-16 | Clears all 7 `npm audit` findings (dev-only) with no major version change |
| 3 | BL-26 | Docs that contradict each other mislead every agent that reads them first |
| 4 | BL-18 | Dead code from the sample-data era; its blocker (PRs #9–#14) is gone |
| 5 | BL-17 | One-line type cleanup in a test; likely no longer needed since PR #28 |

After UAT (23–29 Dec): re-rank BL-07 and BL-19 – BL-23 using the testers' answers.

## 2. Items

| ID | Title | Type | Source | Priority | Size | Trigger to start |
|---|---|---|---|---|---|---|
| BL-01 | **Ticket2u terms of use: check, and e-mail for permission if unclear** | Owner | dev-log 2026-11-13 ("Ticket2u's terms of use were not checked"); TC-69; R-02 | **Must** | XS (owner) | **Now**, before UAT and launch. If Ticket2u refuses, remove kl-0018 – kl-0051 and sb-0001 – sb-0005 and replace them from organisers' own pages |
| BL-02 | **FR-26 Eventbrite events by organiser** | Enh | SRS FR-26 (S); CR-03 (deferred); SRS A-8 (free API access verified 2026-11-11 in the spike); curated guide "Finding Eventbrite organiser IDs" | Should | M (+ owner: token, IDs) | **≥ 5 KL organiser IDs** collected (guide aims for ~10) **and** the owner creates the API token (an account: owner decides) **and** Eventbrite's terms re-read (R-02). Build with BL-04; first secret → maintenance plan §4.2, TC-63 |
| BL-03 | FR-29 remove duplicates across sources | Enh | SRS FR-29 (S); test-cases §3.2 ("not built — needs a 2nd source") | Should | S | Only when a **second source** is live (BL-02 or BL-05). With one curated file, duplicates are caught by the monthly data tidy (M-5) |
| BL-04 | FR-30 per-source server cache | Enh | SRS FR-30 (S); architecture D-08; `SOURCE_CACHE_SECONDS` in `.env.example` (unused); R-07; security-privacy T-06 | Should | S–M | Only with a **second (live) source**: build in the same change as BL-02 so the provider's rate limit is never hit |
| BL-05 | FR-27 PredictHQ source | Enh | SRS FR-27 (C); architecture §5 ("Built **only** if a free plan is confirmed") | Could | M | A free plan **without a card** is confirmed and its terms allow display + caching; after BL-02 |
| BL-06 | FR-16 custom date range picker | Enh | SRS FR-16 (C); test-cases §3.2 ("deferred") | Could | S–M | Users or UAT ask for dates beyond the presets (Today … Next 30 days). Note: with the date-window rule data only reaches the end of the year anyway |
| BL-07 | Saved events on more than one device | Enh | SRS W-01 (no accounts); dev-log 2026-11-27 (owner's login question); TC-73 feedback question | Won't for now | M (light option) / L (accounts) | TC-73: most testers say **Yes with a real reason** → change request. **Lighter options first** (e.g. a "send my saved list to myself" link, as TC-73 suggests); accounts would reopen W-01, privacy (NFR-09/10/11) and RM0 (NFR-16) |
| BL-08 | More cities / areas | Enh | CR-02 ("more cities are a post-launch backlog item"); CR-11 (Kota Kinabalu added) | Could | S per area (data) + XS (`src/lib/areas.ts` entry) | The owner wants an area **and** official pages give ≥ ~10 upcoming events there; `events-curator` needs a new ID prefix (curated guide). More than ~5 areas → BL-09 first |
| BL-09 | Single "counts" endpoint for area shortcuts | Debt | CR-12 ("if there are more than about 5 areas, switch to a single counts endpoint") | Could | S | Area list grows past ~5 (today 2: one extra search request per area on page open). Changes the API spec's one-endpoint rule → design note first |
| BL-10 | "Search this map area" with clustering (whole-region view) | Enh | CR-12 and the FR-41 PR #19 ("'Search this map area' with clustering and 'remember my area' are still later options") | Could | M | Owner request after UAT, or pins overlap badly as data grows. A clustering library is a new dependency → review it like any other (T-11) |
| BL-11 | "Remember my area" | Enh | CR-12, PR #19 (same sentence) | Could | S | UAT/users say picking the area every visit is tiresome. Needs a CR and a privacy check: store only the area's ID, never coordinates (security-privacy §4, location never in localStorage) |
| BL-12 | DEF-05 malformed event link returns a bare HTTP 500 | Def | test-report §3 DEF-05 (S4, accepted by the owner 2026-11-24: Next.js 16 limitation) | Could | XS | **Each Next.js upgrade** (`nextjs` Dependabot group): if TC-24's malformed-link test reports "unexpectedly passed", remove its `test.fail()` and close DEF-05 |
| BL-13 | DEF-08 details-page meta description streamed into `<body>` (SEO 90) | Def | test-report §3 DEF-08 (S4, accepted 2026-11-24) | Could | S | Each Next.js upgrade (re-run Lighthouse SEO on a details page), or a chat app that shows no preview. Option in the report: `htmlLimitedBots` — then re-measure TC-56/TC-57 |
| BL-14 | TypeScript 7 | Debt | dependency-updates §1 (ignore rule), PR #29 closed (lint crash) | Should | S | `npm view typescript-eslint peerDependencies` allows TypeScript 7 (checked monthly, M-2). One major at a time |
| BL-15 | ESLint 10 | Debt | dependency-updates §1 (ignore rule), PR #31 closed | Could | S | `eslint-plugin-react`, `-jsx-a11y` and `-import` declare ESLint 10, or a new `eslint-config-next` lists it (M-2). Dev-only tool, no user impact |
| BL-16 | Dev-only audit findings: `minimatch` ReDoS (GHSA-g3hv-75wg-m249) via `typescript-eslint` ≤ 8.72.2 | Debt | `npm audit` on `main`, 2026-11-27 (7 moderate, all dev; `npm audit --omit=dev`: 0) | **Must** | XS | **Now, after the owner's OK**: `npm audit fix` (no `--force`) on a branch, check the lock-file diff touches only dev packages, CI green. Also enable Dependabot security updates so these arrive as PRs (deployment guide §7) |
| BL-17 | Remove the `as unknown as` Page cast in `e2e/a11y.spec.ts` | Debt | Code comment (two `playwright-core` versions); dependency-updates §2 PR #28 removed the duplicate `playwright-core` | Could | XS | Now. Quick check 2026-11-27: `tsc --noEmit` without the cast showed no error in that file (only Next's generated `PageProps` types, missing because the worktree was not built); confirm with a full CI run |
| BL-18 | Remove the dormant "Sample data" banner and "Sample event" badge code | Debt | dev-log 2026-11-13 ("left in place to avoid conflicts with open PRs #9–#14 and can be removed after they merge"); `src/app/page.tsx`, `src/app/event/[id]/page.tsx` | Should | XS–S | **Now**: PRs #9–#14 are all merged (checked 2026-11-27). Check which unit tests still mention samples before deleting |
| BL-19 | "Today" after "Free this week" keeps Free only on | UX | dev-log 2026-11-27 (user-manual review); UAT script observation O-1 and owner decision OD-6 (PR #35, open) | Could | XS–S | UAT: OD-6 makes it an **S3** issue if even one tester is confused. Behaviour follows FR-36 / CR-14, so changing it needs a CR |
| BL-20 | Meaning of the area name in the top bar ("Klang Valley · 50 km" is 50 km around a centre, not the whole region) | UX | dev-log 2026-11-27 (UX notes passed to the owner); user manual "Changing where you search from" | Could | XS | Testers misread what an area covers |
| BL-21 | Accidental map tap starts a new search, with no undo | UX | dev-log 2026-11-27 (UX notes); user manual ("tapping anywhere on the map searches from that spot straight away") | Could | S | UAT or users report losing their search by tapping the map |
| BL-22 | **Clear saved data** has no confirm or undo | UX | dev-log 2026-11-27 (UX notes); user manual §9 ("there's no 'are you sure?' step") | Could | XS | A tester or user loses bookmarks by mistake |
| BL-23 | Keyboard focus falls to the page start after choosing an area or "Use my location" | UX | test-report §3, observation after DEF-08 | Could | S | The owner's TC-62 manual keyboard / screen-reader check finds it a problem → raise as an S3 defect (NFR-05) |
| BL-24 | Simple per-IP rate limit on `/api/events/search` | Enh | security-privacy T-06 ("add simple per-IP rate limit if abuse seen (backlog)") | Could | S | Vercel **Usage** shows unusual function invocations (M-4), or a live source with a quota is added |
| BL-25 | Re-check Ticketmaster as a source | Enh | SRS W-08 ("spike returned 0 KL events; revisit in maintenance"); data-source spike | Won't for now | XS (check) | Yearly, January: Ticketmaster's API lists Klang Valley events. Would be a new adapter (NFR-14) and a CR |
| BL-26 | Documentation drift found in the Phase 7 review | Debt | This review, 2026-11-27 (list below) | Should | XS–S | Now; one docs PR |

### BL-26 details — docs that disagree with the code or each other
1. `security-privacy.md` T-11 says "`npm audit` in CI"; `ci.yml` has no audit step. Either fix the text (audit is the
   monthly M-1 task) or add a non-blocking CI step (a process change: owner decides).
2. `security-privacy.md` T-02 and §6 still say secret scanning is "to be enabled in Phase 6" / "[verify … private repos]";
   it is on and the repo is public (deployment guide §7).
3. `deployment-guide.md` §2 says "CI has never run" (it has run on PRs #25–#34); §5 step 6 says "later:
   `docs/07-maintenance/`" — point it to the incident log (maintenance plan §3.5).
4. `risk-register.md` "Top risks" are dated 2026-11-24 and still say "freeze features until Phase 5 is done"; review at the
   next phase gate with this plan's §8.
5. ~~`test-plan.md` / `test-cases.md` link `uat-script.md`, which existed only on open PR #35.~~ Resolved: #35 merged 2026-11-28.
6. `dev-log.md`: the 2026-11-13 and 2026-11-12 feature/data rows lack the "Req IDs" / "Deviation" cells, and two
   2026-11-13 rows sit before 2026-11-12 rows.

## 3. Done / dropped
| ID | Title | Outcome | Date |
|---|---|---|---|
| — | *(none yet)* | | |
