# Maintenance Plan — Happening

| Field | Value |
|---|---|
| Phase | 7 — Maintenance (drafted 2026-11-27; applies from launch, M6 Tue 5 Jan 2027; some routines already run) |
| Version | 0.1 — draft for the owner's review |
| Live URL | `https://happening-kl.vercel.app` (planned; the owner confirms the final address after the Vercel import, deployment guide §3.2) |
| People | **Owner** (one student; decides, owns the accounts) · **Claude agents** (`maintenance-engineer`, `events-curator`, `developer`, `qa-engineer`, `requirements-engineer`) |
| Requirements served | NFR-19 (weekly data review), NFR-16 (RM0), NFR-15 (CI), NFR-06 / T-02 (secrets), T-11 (supply chain), FR-05, FR-25 |
| Related | [`backlog.md`](backlog.md) · [`dependency-updates.md`](dependency-updates.md) · [deployment guide](../06-deployment/deployment-guide.md) · [release checklist](../06-deployment/release-checklist.md) · [curated-events guide](../03-design/curated-events-guide.md) · [risk register](../01-planning/risk-register.md) |

> **What is a maintenance plan?** Software keeps needing work after launch: data goes out of date,
> packages get security fixes, services change their rules, and users find bugs. This plan says
> *what* is checked, *how often*, *who* does it and *how long* it takes, so a small app stays correct
> and free with about an hour a week. Small, regular updates beat big rare ones.

---

## 1. Types of maintenance

| Type | Meaning | Examples in this project |
|---|---|---|
| **Corrective** | Fix something that is wrong | A defect found by a user or by CI (like DEF-09, the OSM credit contrast); a curated event with the wrong date |
| **Adaptive** | Keep working when the world around the app changes | Next.js / Node LTS upgrades; OSM tile-policy or Vercel Hobby changes; a new year for the curated date window |
| **Perfective** | Make it better for users | Backlog items such as FR-16 custom date range, FR-26 Eventbrite, more areas ([`backlog.md`](backlog.md)) |
| **Preventive** | Stop problems before they happen | Weekly data upkeep (NFR-19), Dependabot PRs, `npm audit`, removing dead code, keeping the e2e tests independent of real data |

Any change that alters what the app **does** is a change request first (`docs/02-requirements/change-log.md`,
via `requirements-engineer`), then a normal developer PR. Corrective fixes that make the app match its
existing requirements do not need a CR.

---

## 2. Routine schedule

Times are estimates for one person with Claude doing the typing. "Owner" means the owner must act
(account access, decisions); an agent name means Claude does it and reports back.

### 2.1 Weekly (Monday — Dependabot also opens its PRs on Monday, Malaysia time)

| # | Task | Who | Time | Done when |
|---|---|---|---|---|
| W-1 | **Curated event upkeep** (NFR-19, FR-25): add new upcoming events from official pages, re-check events that may have changed (date, venue, cancelled), keep at least **20 upcoming** events in the Klang Valley. Follow the **date-window rule** (only this month to the end of this year, curated guide). Ended events are hidden automatically (FR-05); delete them in the monthly tidy (M-5). | Owner finds/exports pages → `events-curator` converts and adds; Claude merges after CI | 30 min | One commit to `data/curated-events.json` this week (TC-71 counts these); the post-merge smoke check S-4 returns events |
| W-2 | **Dependabot PRs**: triage by the policy in [`dependency-updates.md`](dependency-updates.md) §1 (patch/minor + green CI → merge one group at a time; majors always reviewed; never several majors at once). Log each decision in its §2. | `maintenance-engineer`; owner only for security fixes, breaking majors or anything needing an account | 10–20 min | No Dependabot PR older than a week without a decision |
| W-3 | **CI health**: last run on `main` is green; no test is newly skipped; a red run is investigated, not just re-run (deployment guide §9, last row). | `maintenance-engineer` | 5 min | `main` green; any failure has a defect or a dev-log line |

### 2.2 Monthly (first Monday of the month)

| # | Task | Who | Time | How |
|---|---|---|---|---|
| M-1 | **`npm outdated`** and **`npm audit`** on `main`. Production packages first: `npm audit --omit=dev`. A finding in a production package is reported to the owner the same day (§4.4). | `maintenance-engineer` | 15 min | Record anything not covered by Dependabot in `dependency-updates.md` §2 |
| M-2 | **TypeScript 7 / ESLint 10 revisit** (ignore rules in `.github/dependabot.yml`): `npm view typescript-eslint peerDependencies` (needs `typescript` ≥ 7 allowed) and `npm view eslint-plugin-react peerDependencies` (plus `eslint-plugin-jsx-a11y`, `eslint-plugin-import`; needs ESLint 10). If both sides support it, remove the ignore rule and take the major as **one** PR. | `maintenance-engineer` | 10 min | Backlog BL-14 / BL-15 updated with the date checked |
| M-3 | **Skills and plugin pins**: `npx skills update -p` in a branch, **read the diff** before committing (coding standards §6); ponytail stays pinned (`v5.3.3` in `.claude/settings.json`) until a new tag has been reviewed. | `maintenance-engineer` | 15 min | Diff reviewed or "no change" in the dev log |
| M-4 | **Vercel usage within the free plan** (NFR-16, R-05, TC-68): Vercel → **Usage** well inside Hobby limits; **Settings → Billing** still Hobby, no card. | **Owner** (Claude's environment cannot open Vercel) | 5 min | Note the figures in the dev log |
| M-5 | **Data tidy**: delete events that ended more than a month ago; never reuse their IDs (curated guide step 2); check duplicates (same title + same day). | `events-curator` | 10 min | Part of that week's W-1 commit |

### 2.3 Each university term (start of term, three times a year)

| # | Task | Who | Time |
|---|---|---|---|
| T-1 | **OSM tile usage policy** still met (V-8, R-02, NFR-17): attribution visible, no tile caching in `public/sw.js`, no bulk download. Re-read https://operations.osmfoundation.org/policies/tiles/ | Owner reads, `maintenance-engineer` compares with the code | 15 min |
| T-2 | **Vercel Hobby terms** still allow this project (V-1, V-2) and what happens on limits (pause, not a bill) | Owner | 10 min |
| T-3 | **Privacy page** wording still matches PDPA (V-10, FR-31) and still matches the code (no analytics, location rounded, device-only storage) | Owner + `maintenance-engineer` | 15 min |
| T-4 | **Risk register review** (§8) and **backlog re-rank** ([`backlog.md`](backlog.md)) | `maintenance-engineer`, owner approves | 20 min |
| T-5 | **Lighthouse spot check** on the Production URL (deployment guide §8 command, home page, 1 run): Performance ≥ 80, Accessibility ≥ 90 | Owner's laptop | 10 min |

### 2.4 Yearly (first week of January)

| # | Task | Who | Time |
|---|---|---|---|
| Y-1 | **Review the curated date-window rule** (curated guide: "review this rule at the start of each year") and update the "for now" months in the guide. The first review is due in January 2027, right after launch. | Owner decides, `events-curator` updates the guide | 10 min |
| Y-2 | **Node LTS check**: if the runtime moves to a newer LTS, change README, `ci.yml` and the Vercel setting together, then lift the `@types/node` ignore rule (dependency-updates §1). | `maintenance-engineer` + owner (Vercel setting) | 30 min |
| Y-3 | **Keep or retire?** Decide whether the project continues for another year (§9). | Owner | 10 min |

---

## 3. Incidents and bugs

### 3.1 How problems are reported
There is **no contact form** and no in-app feedback (by design: no server-side storage). Reports come through:

| Channel | Who uses it |
|---|---|
| **GitHub Issues** on the repository linked from the About page ("Project on GitHub") | Anyone with a GitHub account |
| The owner directly (classmates, UAT testers, lecturer; [user manual §12](../06-deployment/user-manual.md) lists what to include) — the owner writes it up as an issue | Everyone else |
| CI failures, Dependabot / secret-scanning alerts, Vercel build errors | Automatic (GitHub and Vercel e-mail the owner) |

Never ask a reporter for their location or screenshots that show it; "near TAR UMT" is enough.

### 3.2 Triage (the `maintenance-engineer` does this within a day of a report)
1. **Reproduce** on a production build (ENV-1) or the live URL; record steps, expected and actual.
2. **Find the root cause**, not just the symptom (DEF-09 is the lesson: the first explanation was wrong).
3. **Classify** with the test plan's severity scale ([test-plan §6.1](../05-testing/test-plan.md#61-severity-scale)):

| Severity | Meaning (short) | Response after launch |
|---|---|---|
| **S1 Critical** | A Must fails with no workaround, or a privacy/security breach | **Roll back first** (§3.4), then fix the same day or as soon as the owner can |
| **S2 High** | A Must fails with a workaround, a Should fails, or WCAG blocks a core flow | Fix within a week |
| **S3 Medium** | A Could fails, or confusing / inconsistent with the SRS | Owner decides: fix in the next monthly slot or add to the backlog |
| **S4 Low** | Cosmetic | Backlog |

4. **Decide the route**: does the fix make the app match an existing requirement? → bug fix. Does it change
   behaviour? → change request to `requirements-engineer` first.
5. **Write the fix request** for the `developer` agent: steps to reproduce, expected vs actual, requirement IDs,
   severity, suspected cause, and the test that would have caught it.

### 3.3 Fixing and verifying
- `developer` agent: **one branch + one PR per fix**, a test that fails before the fix and passes after,
  requirement IDs in the commit and code comment, dev-log line (coding standards, Definition of Done).
- **CI must be green**; `qa-engineer` re-runs the affected test case; Claude merges; then the release
  checklist's post-deploy checks.
- Record the defect in `docs/05-testing/test-report.md` §3 (DEF-xx) during testing, and in the incident log
  (§3.5) after launch.

### 3.4 Rollback
Follow [deployment guide §5](../06-deployment/deployment-guide.md#5-rolling-back-when-the-live-site-is-broken):
Vercel → Deployments → last good Production deployment → Instant Rollback → re-run S-2, S-7, S-9 → fix forward
on a branch → Promote to Production. Rollback triggers are listed there and in the release checklist.

### 3.5 Incident log
One row per incident after launch (an S1/S2 bug, a rollback, a leaked secret, a service outage). Newest last.

| Date | Severity | What users saw | Root cause | Action (rollback? PR #) | Test added | Closed |
|---|---|---|---|---|---|---|
| — | — | *(none yet)* | | | | |

---

## 4. Secrets and access

### 4.1 Today
The app needs **no secret in production**: only `ENABLED_SOURCES=curated` is set in Vercel (deployment guide §6.1).
`.env.local` is git-ignored and only `.env.example` (placeholders) is committed.

### 4.2 When a secret is added (first case: `EVENTBRITE_TOKEN` for FR-26, backlog BL-02)
1. Owner creates the token in the provider's dashboard (an account, so the owner decides).
2. Value goes only into Vercel → Environment Variables (tick **Sensitive** if offered) and the owner's `.env.local`;
   never in Git, docs, PRs, chat or messages to Claude; never with a `NEXT_PUBLIC_` prefix (security-privacy §6).
3. Read it on the server only; add the variable name to deployment guide §6.1 and `.env.example` (placeholder).
4. Re-run **TC-63** (search the browser bundle for the variable name and value) before the first production deploy.

### 4.3 Rotation
Follow [deployment guide §6.3](../06-deployment/deployment-guide.md#63-rotating-a-secret-for-later-when-eventbrite_token-exists--or-if-one-leaks):
new token → update Vercel → redeploy → check S-4 → **then** revoke the old one. Rotate **once a year** and
**immediately** if a secret may have leaked. A leak is an S1 incident (§3.5); if it reached Git, also remove it from history.

### 4.4 Account security

| Control | State | Action |
|---|---|---|
| Secret scanning + push protection | **On** (checked 2026-11-24, deployment guide §7) | Nothing; an alert is an S1 incident |
| GitHub two-factor authentication (T-09) | Owner to confirm | Owner: deployment guide §7.1; keep recovery codes offline |
| Dependabot alerts / security updates (T-11) | Alerts unknown; security updates **off** | Owner: enable both (deployment guide §7) |
| Branch protection on `main` | **None** | Owner: deployment guide §7.2 (CI has run, so the check name is now available) |
| Vercel account | No card (R-05) | Never add one; if asked, stop and tell Claude |

A vulnerable **production** dependency or any leaked key is reported to the owner the same day with the steps to fix.

---

## 5. Data governance

| Rule | Source |
|---|---|
| **Official sources only:** the curated JSON file (built from official venue, organiser and ticketing pages) and, later, the Eventbrite API by organiser. **No scraping** (charter C-3, SRS W-07). | CLAUDE.md, charter, SRS |
| Record only facts (name, date, time, place, price) in our own words; always link the official page; `imageUrl: null` unless the page clearly allows reuse. | Curated guide |
| Date window: this month to the end of this year; review each January (Y-1). | Curated guide |
| IDs `kl-` / `sb-`, never reused; every entry passes `CuratedEventSchema` (an invalid entry is skipped with `[curated] skipped invalid entry: <id>`). | Curated guide, CR-11 |
| At least one event must stay upcoming after any data change, or every search is empty. | Release checklist |
| **Open question — Ticket2u terms.** Most events (kl-0018 – kl-0051, sb-0001 – sb-0005) came from Ticket2u pages the owner exported; Ticket2u's terms of use **were not checked** (dev-log 2026-11-13; TC-69). Until answered, keep to facts + link only. Owner action: read the terms and, if unclear, e-mail Ticket2u for permission (backlog BL-01). If they refuse, remove those entries. | dev-log, TC-69 |
| No personal data is collected, so there is nothing to export or delete on the server. Device data (saved events, last search) is cleared by the user with **Clear saved data** (NFR-11). | security-privacy §4–5 |

---

## 6. Monitoring — what exists and what doesn't

| What | Exists? | Who looks |
|---|---|---|
| GitHub Actions CI (lint, unit, build, Chromium + WebKit e2e) on every PR and push to `main` | Yes | W-3 |
| Dependabot version PRs (weekly) | Yes | W-2 |
| Dependabot security alerts, secret-scanning alerts | Secret scanning yes; Dependabot alerts to be enabled (§4.4) | E-mail to the owner |
| Vercel **Deployments** (build status) and **Usage** | Yes (owner's dashboard only) | M-4, after each merge |
| Vercel function **logs** | Yes, but only what the code logs. The code never logs coordinates or request bodies (NFR-10); keep it that way — no new log line may contain a location, an IP or a body | On an incident only |
| **Analytics, error tracking, uptime pings** | **No — by design.** The privacy page promises no tracking and the CSP blocks third-party scripts. We will not know how many people use the app or see crashes users don't report. This is an accepted trade-off. | — |

Adding any monitoring service is a change request (privacy page, CSP and NFR-09/NFR-10 are affected).

---

## 7. Status when this plan was drafted (2026-11-27)

| Area | Status |
|---|---|
| Curated data | 46 entries, all valid against `CuratedEventSchema`, no duplicate IDs or title+day duplicates. 17 already ended; 9 more end by Sun 29 Nov; **the latest event is 19 Dec**, so there are **0 events for UAT (23–29 Dec)** — risk RT-01, owner sending late-December pages. Next IDs `kl-0052`, `sb-0006`. |
| Dependencies | `npm audit --omit=dev`: 0 vulnerabilities. Full `npm audit`: **7 moderate, dev-only** (`minimatch` ReDoS GHSA-g3hv-75wg-m249 via `typescript-eslint` ≤ 8.72.2; fix available without a major) — backlog BL-16. TypeScript 7, ESLint 10, `@types/node` 26 held back on purpose (dependency-updates §1). |
| Deployment | Vercel import still an owner action (deployment guide §3). |

---

## 8. Risks that stay open after launch

| Risk | Score | Why it stays open | What maintenance does |
|---|---|---|---|
| [R-02](../01-planning/risk-register.md) Source terms (OSM, Vercel, Ticketmaster/Eventbrite later) | 12 | V-1, V-2, V-8 unconfirmed; Ticket2u terms unchecked | T-1, T-2, BL-01 |
| R-04 API key leaked | 12 | Mitigated, but returns when FR-26 adds the first secret; 2FA still to confirm | §4 |
| R-05 Free tier changes / card requested | 8 | Depends on Vercel and GitHub | M-4, T-2 |
| R-07 Rate limits | 6 | Low while curated-only; rises with a live source | BL-04 (FR-30 cache) before BL-02 goes live |
| R-10 Scope creep | 9 | Occurred; future ideas keep arriving | Backlog + change requests, no direct building |
| R-12 Single developer unavailable | 9 | Exams, after graduation | Small routines, this plan, §9 |
| RT-01 (test plan) No upcoming data | — | All data ends 19 Dec | W-1 every week |

---

## 9. End of life and handover

**If the project stops** (after assessment, or when the owner can no longer do W-1):

1. Decide: **hand over** (another maintainer takes the repo and Vercel project) or **retire**.
2. To retire: Vercel → project → Settings → **Delete Project** (removes the live site and its logs); or at least
   empty the data so no stale events show. Remove any secret from Vercel and **revoke it at the provider**.
3. GitHub: add a note at the top of the README ("No longer maintained, last data update <date>"), turn off
   Dependabot, then **Archive** the repository (read-only, keeps the documentation as evidence).
4. Privacy: no server-side user data exists, so nothing to delete there. Users' saved events stay on their own
   devices until they use **Clear saved data** or clear site data.
5. To hand over: the new maintainer reads `README.md`, this plan, the curated guide and the deployment guide; the
   owner transfers the repository and the Vercel project, then the new owner enables 2FA and rotates any secret.

---

## Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Developer / project owner | Project student | ☐ Approved | |
