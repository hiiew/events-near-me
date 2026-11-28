# Project Status Report — Happening — 2026-11-28

| Field | Value |
|---|---|
| Prepared by | Claude (sdlc-planner), from the live docs and git history on `main` after PR #37 |
| Current phase | **5 — Testing** (Phases 6 and 7 started early) |
| Next milestones | **M5 Testing complete — Tue 29 Dec 2026** · **M6 Deployed + docs — Tue 5 Jan 2027** |
| Sources | `README.md`, `timeline.md`, `risk-register.md`, `test-report.md` v0.7, `test-plan.md`, `uat-script.md` v1.1, `deployment-guide.md`, `maintenance-plan.md`, `backlog.md`, dev-log |

> **How to read this.** RAG = Red / Amber / Green. Green = on track; Amber = on track only if named actions
> happen soon; Red = a milestone will be missed without cutting scope.

## 1. Overall status: 🟠 AMBER

| Area | RAG | Why |
|---|---|---|
| Schedule | 🟠 | Phases 1–4 finished 11 Nov, about 6 weeks early, and nothing is late. But M5 (29 Dec) needs a data refresh, the production URL, real-device checks and UAT, and **every one of these waits on an owner action** over the holidays |
| Scope | 🟢 | All Must and Could features built; deferred items (FR-16, FR-26, FR-27, FR-29, FR-30) are agreed. No new feature since 13 Nov |
| Quality | 🟠 | 27 of 39 Must rows ✅; strong automated suite (75 browser tests on Chromium + WebKit in CI, 174 unit tests, Lighthouse on the local build: home page performance median 98, accessibility 100 on four pages and 96 on Explore). One **S2 defect open (DEF-10)**, which blocks the Phase 5 exit |
| Cost | 🟢 | RM0. No card added anywhere (R-05); Vercel usage not checked yet (TC-68) |
| Compliance / privacy | 🟠 | Privacy rules proven by tests (NFR-09, NFR-10 ✅). **Ticket2u terms unchecked for 39 of 46 events** (OT-1); OSM tile policy and Vercel terms unconfirmed (V-1, V-2, V-8) |

**Why not Green:** the remaining path to M5 is short but runs entirely through owner actions, and the
event data runs out on 19 Dec. **Why not Red:** there are 31 days left, each blocker is small, and none needs
scope cut yet.

## 2. Milestones

| Milestone | Baseline | Status |
|---|---|---|
| M1 – M4c (Planning → Implementation complete) | 17 Nov – 22 Dec | ✅ Done 11 Nov |
| Real events (≥ 20) | 6 Dec | ✅ Done 13 Nov (46 entries) |
| Phase 5 / 6 / 7 started | 23 Dec / 30 Dec / 30 Dec | ✅ Started 24 Nov / 24 Nov / 27 Nov (early) |
| **Next:** DEF-10 decided, production URL + smoke checks | by Fri 11 Dec (test-plan §7) | ⏳ Waiting on owner |
| **Next:** data refreshed for UAT | by Fri 18 Dec | ⏳ Waiting on owner's event pages |
| Owner real-device cases | Mon 21 – Tue 22 Dec | Not started |
| UAT (owner + Testers A–C) | Wed 23 – Tue 29 Dec (avoid 24–25) | Script ready; sessions not yet recorded as booked |
| **M5 Testing complete** | Tue 29 Dec | 🟠 **At risk** (not late) |
| **M6 Deployed + docs** | Tue 5 Jan 2027 | 🟠 Docs drafted; live URL and approvals pending |

Production URL: **unknown** — planned `happening-kl.vercel.app`; the Vercel project is connected and builds
preview deployments on pull requests (reported 2026-11-28; not yet recorded in the deployment guide, which
still says "not deployed yet").

## 3. Must requirements: 27 of 39 ✅

✅ now: FR-03 – FR-15, FR-17, FR-18, FR-20, FR-24, FR-25, FR-28, FR-32; NFR-03, NFR-06, NFR-08, NFR-09,
NFR-10, NFR-12, NFR-18 (test-report §4). The 12 still open, by what unblocks them:

| Blocked by | Rows | What has to happen |
|---|---|---|
| **Owner action** (5) | FR-31 · NFR-17 · FR-02 · FR-19 · NFR-13 | FR-31: owner reads the privacy wording (TC-38). NFR-17: OT-1 Ticket2u terms, OT-2 OSM tile policy, OT-3 link spot-check, then DEF-11 wording. FR-02 / FR-19: real-phone parts of TC-08 / TC-26. NFR-13: device matrix TC-66 — iOS row is a gap unless an iPhone is found or the gap is accepted |
| **ENV-2** — production URL (5) | FR-01 · NFR-01 · NFR-05 · NFR-07 · NFR-16 | FR-01: real location prompt over HTTPS. NFR-01: final TC-56 timing. NFR-05: TC-61 re-run + TC-62 manual part (screen reader, 200 % zoom). NFR-07: TC-64 HTTPS. NFR-16: TC-68 Vercel usage/billing |
| **UAT** (1) | NFR-04 | TC-73 with Testers A–C, 23–29 Dec |
| **DEF-10** (1) | NFR-14 | Owner chooses fix or change request; then TC-37 re-run |

Should rows: 2 of 9 ✅ (FR-21, NFR-11); FR-26, FR-29, FR-30 are listed gaps (not built).

## 4. Open defects

| ID | Severity | Summary | Status |
|---|---|---|---|
| DEF-10 | **S2 High** | A new source's events open "This event isn't available" — the details page only looks up curated events (NFR-14) | Open — owner to choose fix or CR. No effect on users today (only the curated source is on) |
| DEF-11 | S4 Low | About / details say events come from "organisers' official pages", but 39 of 46 links are Ticket2u listings | Open — reword after OT-1 |

Fixed: DEF-01 – DEF-04, DEF-06, DEF-07, DEF-09. Accepted by the owner: DEF-05, DEF-08 (Next.js limits; backlog BL-12, BL-13).

## 5. Top 5 risks (full list: `risk-register.md`, reviewed 2026-11-28)

| # | Risk | Score | Action now |
|---|---|---|---|
| R-13 | Curated data expires before UAT (latest event 19 Dec) | **16** 🔴 | Owner sends late-December pages; refresh by Fri 18 Dec |
| R-17 | No iPhone tester; iOS Safari only via WebKit emulation in CI | **15** 🔴 | Borrow an iPhone for TC-66 D-3, or accept the iOS gap now |
| R-14 | Ticket2u terms may not allow listing (39 of 46 events) | **12** 🔴 | Owner reads the terms before the data refresh (BL-01) |
| R-15 | DEF-10 blocks the Phase 5 exit (open S2) | **12** 🔴 | Owner decides fix vs CR; close by 11 Dec |
| R-16 | Owner-only items not done before M5 / M6 | **12** 🔴 | Use §6 below as the checklist; account items first |

Changes in this review: added R-13 – R-18; closed R-11; re-scored R-06 (10 → 5) and R-10 (9 → 6).

## 6. Decisions needed from the owner

| # | Decision | Recommended answer | Why | By |
|---|---|---|---|---|
| 1 | **DEF-10: fix or change request?** | **Fix** (developer slice + TC-37 re-run) | Keeps a Must requirement whole; the backlog's Eventbrite item (BL-02) would need the same fix anyway; the test report calls it a small slice. A CR narrowing a Must is weaker evidence for the assessor | Now; closed by 11 Dec |
| 2 | **OT-1: Ticket2u terms** — may we list facts + a link? Must Ticket2u be named? | Read the terms this week (~30 min, BL-01); e-mail Ticket2u if unclear | 85 % of the data depends on it, and the UAT refresh will probably use Ticket2u again | Before the data refresh |
| 3 | **Production URL** — confirm the address Vercel gave the production deployment | Do it now and tell Claude the URL | Unblocks 5 Must rows (ENV-2), the UAT QR code and the user manual | By 11 Dec |
| 4 | **Smoke checks S-1 – S-13** on the production URL (deployment guide §4) | Run them right after #3 and paste the `curl.exe` output | Proves HTTPS, headers and the live search; needed before any ENV-2 test | By 11 Dec |
| 5 | **Branch protection on `main`** (plus GitHub 2FA and Dependabot security updates, deployment guide §7) | Yes — all three (~10 min) | CI has run, so the required check can be selected; protects `main` and the curated data (R-04) | This week |
| 6 | **BL-16: OK to run `npm audit fix`** (7 moderate, dev-only findings; no major version change) | Yes | Clears every audit finding; lock-file diff is checked to touch dev packages only and CI must be green | This week |
| 7 | **Late-December event pages** for the refresh | Send them as early as possible; deadline **Fri 18 Dec** | With no events after 19 Dec the UAT can't run (R-13); earlier pages leave time for the data check D-1 – D-7 | ≤ 18 Dec |
| 8 | **OT-3: link spot-check** — open the 10 sample links (`kl-0011`, `kl-0016`, `kl-0021`, `kl-0026`, `kl-0031`, `kl-0036`, `kl-0041`, `kl-0046`, `kl-0051`, `sb-0005`) and confirm each shows the same event | Yes | Claude's environment can't open outside sites; needed for NFR-17 | With #2 |
| 9 | **OT-2 and V-1 / V-2**: confirm the OSM tile policy and Vercel Hobby terms | Yes, read the two pages linked in deployment guide §10 | Last open part of R-02 and NFR-17 | Before M5 |
| 10 | **iPhone (NFR-13 iOS row)**: borrow one for the TC-66 D-3 checks, or accept the gap? | Try to borrow one; if not, accept the gap in writing in the test report | The exit rule needs every Must ✅; deciding on 29 Dec is too late | Before UAT |

## 7. Notes for the reader

- Hours used so far are **not recorded** in the docs, so the 80-hour budget can't be compared with actual effort.
- Unknown today: the production URL; whether UAT testers are booked; whether 2FA is on.
