# Deployment Guide — Happening

| Field | Value |
|---|---|
| Phase | 6 — Deployment (started early, 2026-11-24, so Phase 5 ENV-2 checks can run before UAT 23–29 Dec) |
| Version | 0.1 — repo prepared; **not deployed yet** (the owner does the Vercel steps in §3) |
| Target URL | `https://happening-kl.vercel.app` (project name decided 2026-11-11, timeline M6) |
| Hosting | Vercel **Hobby** (free), auto-deploy from GitHub — ADR-08 |
| Requirements served | NFR-07 (HTTPS), NFR-15 (lint in CI), NFR-16 (RM0), NFR-06 / T-02 / R-04 (secrets), T-09, T-11 |

> **How to read this guide.** §1–2 explain what Vercel and CI do. §3 is the click-by-click setup
> (once). §4 is how to check it worked. §5–6 cover rollback and secrets. §7 is the GitHub settings.
> §8 lists the Phase 5 tests to run next. Anything marked **[verify]** is a fact about Vercel, GitHub
> or OpenStreetMap that could not be checked from the build environment (no internet access there):
> open the link given and confirm it before you rely on it.

---

## 1. What Vercel does for us

Vercel is the company that makes Next.js. When it is connected to the GitHub repo:

| You do | Vercel does by itself |
|---|---|
| Merge a pull request into `main` | Builds the app (`npm install` + `npm run build`) and puts it live on the **Production** URL `happening-kl.vercel.app` |
| Open or update a pull request | Builds a **Preview** deployment with its own temporary URL and posts the link on the PR |
| Nothing | Serves the site over **HTTPS** with a free certificate, and redirects `http://` to `https://` (NFR-07) **[verify: https://vercel.com/docs/encryption]** |

Each build is kept as a separate **deployment**. That is what makes rollback easy (§5): an older
deployment can be put back live in one click, without rebuilding.

Pages such as `/`, `/about` and `/saved` are built once and served from Vercel's cache. The search
route `/api/events/search` and the event details pages `/event/<id>` run as small server functions on
each request. The curated events file (`data/curated-events.json`) is **imported** by the code, so it is
packed into the build — editing it and merging to `main` is all it takes to publish new events.

## 2. What CI does for us (GitHub Actions)

`.github/workflows/ci.yml` runs on every pull request and every push to `main`, on a free GitHub
Linux machine (free and unlimited for public repositories **[verify: https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions]**):

| Step | Command | Fails when |
|---|---|---|
| Install | `npm ci` | `package-lock.json` does not match `package.json` |
| Lint | `npm run lint` | ESLint finds an error (NFR-15) |
| Unit tests | `npm test` | Any Vitest test fails |
| Build | `npm run build` | The app does not compile or TypeScript finds a type error |
| Browser tests | `npm run test:e2e` | Any Playwright test fails (screenshots + `results.json` are attached to the run, kept 7 days) |

No secrets are given to CI — the app needs none today.
`.github/dependabot.yml` asks GitHub's Dependabot to open a pull request every Monday when an npm package
or a GitHub Action has an update (T-11). Each Dependabot PR runs CI; merge it only when CI is green.

**Status:** both files are written and pass a YAML syntax check, but **CI has never run** — it runs for the
first time on the next pull request.

---

## 3. One-time setup on Vercel (owner, ~15 minutes)

You need: your GitHub account (`hiiew`) and a Vercel account. **No credit card.** If any screen asks
for a card or for "Pro", stop — that is risk R-05; do not enter one.

Screen and button names below match Vercel's dashboard as commonly documented; if a name differs,
look for the closest match **[verify: https://vercel.com/docs/git]**.

### 3.1 Create the account and import the repo
1. Go to **https://vercel.com/signup**. Choose **Hobby** ("for personal projects"), type your name,
   then **Continue with GitHub** and sign in with the `hiiew` account.
2. On the dashboard click **Add New…** → **Project**.
3. Under **Import Git Repository**, click **Install** / **Adjust GitHub App Permissions** if the repo is not listed.
   On GitHub's page choose **Only select repositories** → `events-near-me` → **Install**. (Vercel only gets this one repo.)
4. Back on Vercel, next to **hiiew/events-near-me** click **Import**.

### 3.2 Configure the project (the "Configure Project" screen)
5. **Project Name:** type `happening-kl`. This name becomes the address `happening-kl.vercel.app`.
   If Vercel says the name is taken or later gives a longer address (e.g. `happening-kl-xxxx.vercel.app`),
   that is fine — write the real URL down and tell Claude so the test docs are updated.
6. **Framework Preset:** should say **Next.js** by itself. Leave it.
7. **Root Directory:** leave `./`.
8. **Build and Output Settings:** leave every override **off** (Vercel runs `npm install` and `npm run build`).
9. **Environment Variables:** add exactly one:

   | Key | Value | Why |
   |---|---|---|
   | `ENABLED_SOURCES` | `curated` | Which event sources the search uses. The code also defaults to `curated` when it is missing, so this is a safety label rather than a must. |

   Do **not** add anything else — see §6.1 for the list of variables that must stay unset.
10. Click **Deploy**. The first build takes about 1–2 minutes. When you see the confetti screen, click
    **Continue to Dashboard**.

### 3.3 Settings to check after the first deploy (Project → **Settings**)
11. **Settings → Environment Variables:** `ENABLED_SOURCES` should show **Production, Preview, Development**
    (all three ticked). If only Production is ticked, edit it and tick Preview too.
12. **Settings → Git:** **Production Branch** = `main` **[verify the location: some versions show this under Settings → Environments → Production]**.
    Pull requests get Preview deployments automatically — nothing to switch on.
13. **Settings → Build and Deployment → Node.js Version:** choose **22.x** (same as README and CI).
    Next.js 16 needs Node 20.9 or newer, so any version Vercel offers today works; choosing 22.x keeps
    Vercel, CI and your laptop on the same version **[verify the options: https://vercel.com/docs/functions/runtimes/node-js/node-js-versions]**.
14. **Settings → Functions → Function Region:** choose **Singapore (sin1)** if offered. The default
    region is in the USA **[verify]**; every search from Malaysia would cross the Pacific twice, which eats
    into the 3-second budget of NFR-01 (TC-56). **[verify that Hobby can change the region:
    https://vercel.com/docs/functions/configuring-functions/region]**. Changing it needs a redeploy (§3.4).
15. **Analytics / Speed Insights:** leave **off**. The privacy page promises no tracking, and the CSP
    would block their scripts anyway.
16. **Settings → Deployment Protection:** leave the default. By default Preview URLs ask for a Vercel
    login and the Production URL is public **[verify: https://vercel.com/docs/deployment-protection]**.
    So **testers and UAT always use the Production URL**, never a Preview link.

### 3.4 How to redeploy without a code change
Settings changes (environment variables, region, Node version) only apply to the **next** build:
**Deployments** tab → the top (Current) deployment → **⋯** → **Redeploy** → **Redeploy**.

---

## 4. Check that it worked (smoke check, ~10 minutes)

Do this after the first deploy and after every production deploy that changes code (the short version
is in [`release-checklist.md`](release-checklist.md)). Replace the URL if yours is different.

**On Windows, type `curl.exe`, not `curl`**, in PowerShell (plain `curl` is a different PowerShell command).

| # | Check | How | Pass when |
|---|---|---|---|
| S-1 | HTTP goes to HTTPS (NFR-07, TC-64) | `curl.exe -sI http://happening-kl.vercel.app/` | Status `308` (or `301`) and `location: https://happening-kl.vercel.app/` |
| S-2 | Security headers (security-privacy §7) | `curl.exe -sI https://happening-kl.vercel.app/` | `200` and all of: `content-security-policy`, `referrer-policy: strict-origin-when-cross-origin`, `x-content-type-options: nosniff`, `permissions-policy: geolocation=(self)…`, `strict-transport-security` (added by Vercel **[verify]**) |
| S-3 | Padlock | Open the URL in Chrome on the laptop, click the icon left of the address | "Connection is secure", certificate valid |
| S-4 | Search API answers | `curl.exe -s -X POST https://happening-kl.vercel.app/api/events/search -H "content-type: application/json" -d "{\"lat\":3.139,\"lon\":101.687}"` (Kuala Lumpur city centre, the app's public default point) | JSON starting with `{"events":[` and `"sources":[{"id":"curated","status":"ok"` |
| S-5 | Wrong method refused | `curl.exe -s -o NUL -w "%{http_code}" https://happening-kl.vercel.app/api/events/search` | `405` |
| S-6 | Install files | Open `/manifest.webmanifest` and `/sw.js` in the browser | Manifest JSON with name "Happening — events near you"; `sw.js` shows JavaScript |
| S-7 | Home page on a phone | Open the URL on your Android phone (mobile data or Wi-Fi) | Welcome screen; no sideways scrolling |
| S-8 | Location over HTTPS (FR-01) | Tap **Use my location** → the browser asks → **Allow** | Results list and map pins appear |
| S-9 | Area shortcut | Reload, tap **Klang Valley** | Results appear within about 3 s |
| S-10 | Details page | Tap an event | Title, date, venue, **Directions** and **Add to calendar** buttons; map tiles load |
| S-11 | Shared link works | Copy the details URL, open it in a private/incognito tab | The same event opens directly |
| S-12 | About page | Open `/about` | Privacy text and **Clear saved data** button |
| S-13 | Browser console clean | Laptop Chrome → F12 → Console, reload `/` | No red "Content Security Policy" errors |

If S-1 – S-6 pass and S-7 – S-12 work on the phone, ENV-2 exists: tell Claude the URL and the date.

> **Secrets in the browser bundle (TC-63):** the app has no secrets today, and the 2026-11-24 build was
> searched for `EVENTBRITE`, `PREDICTHQ`, `TOKEN` and `ENABLED_SOURCES` with no real hit. Repeat that
> check (test-cases TC-63 step 3) the first time a secret is added (FR-26).

---

## 5. Rolling back (when the live site is broken)

Every deployment stays available, so going back takes one click and no rebuild:

1. Vercel → the `happening-kl` project → **Deployments** tab.
2. Find the last deployment that worked (it has the **Production** label and an older date; the commit
   message is shown under it).
3. Click **⋯** next to it → **Instant Rollback** (some screens say **Promote to Production** or **Rollback**)
   → confirm **[verify the button name: https://vercel.com/docs/instant-rollback]**.
4. Open the URL and run S-2, S-7 and S-9 from §4.
5. After a rollback Vercel may **stop putting new `main` builds live automatically** until you promote one
   by hand **[verify on the same page]**. Once the fix is merged and its deployment looks good, open that
   deployment → **⋯** → **Promote to Production**.
6. Fix the cause on a branch with a pull request as usual, and add a line to the dev log
   (later: `docs/07-maintenance/`).

**Rollback triggers** (any one is enough): the home page or search fails for everyone; a security header
is missing; anything personal (location, a secret) appears in a page, URL or log; the site asks visitors
for something it should not. Smaller bugs → fix forward with a normal pull request.

The other way back is **Git**: `git revert <commit>` on a branch → pull request → merge. Use this
when the bad change must also leave `main`.

---

## 6. Environment variables and secrets

### 6.1 What the code reads (checked in the code on 2026-11-24)

| Variable | Read where | Default if not set | Set in Vercel? |
|---|---|---|---|
| `ENABLED_SOURCES` | `src/lib/sources/registry.ts` (server only) | `curated` | **Yes**: `curated`, Production + Preview (+ Development) |
| `NODE_ENV` | `next.config.ts` (CSP on/off), `ServiceWorkerRegister.tsx` | Set by Next.js/Vercel to `production` on every build | **No** — never set it by hand |
| `EVENTBRITE_TOKEN` | Not read by any code (FR-26 deferred, CR-03) | — | **No** — add only when the Eventbrite adapter is built |
| `EVENTBRITE_ORGANIZER_IDS` | Not read yet | — | **No** |
| `SOURCE_CACHE_SECONDS` | Not read yet (D-08 cache not built) | — | **No** |
| Anything starting `NEXT_PUBLIC_` | — | — | **Never** for secrets: Next.js copies these into the browser bundle (security-privacy §6) |

**Careful:** `ENABLED_SOURCES` set to an **empty** value, or to only `eventbrite`, leaves the app with no
sources — every search shows no events. Either set it to `curated` or delete the variable.

### 6.2 Rules (security-privacy §6)
- Secret **values** live only in Vercel → Settings → Environment Variables and in your own `.env.local`.
  Never in Git, docs, screenshots, pull request text, chat, or messages to Claude.
- When adding a secret in Vercel, tick **Sensitive** if offered (the value can then not be read back) **[verify: https://vercel.com/docs/environment-variables/sensitive-environment-variables]**.

### 6.3 Rotating a secret (for later, when `EVENTBRITE_TOKEN` exists — or if one leaks)
1. Create a new token in the provider's dashboard (Eventbrite → Account Settings → Developer Links → API Keys).
2. Vercel → Settings → Environment Variables → the variable → **Edit** → paste the new value → **Save**.
3. Redeploy (§3.4) — running deployments keep the old value until rebuilt.
4. Check S-4 still returns events.
5. **Then** delete/revoke the old token at the provider.
6. If it leaked into Git: also follow GitHub's guide to remove it from history, and note it in the maintenance log.

---

## 7. GitHub settings (owner, ~10 minutes)

The repo `hiiew/events-near-me` is **public** (checked 2026-11-24 via the GitHub API).

| Setting | State on 2026-11-24 | What to do |
|---|---|---|
| Secret scanning (T-02, R-04) | **Enabled** | Nothing. Check: repo → **Settings → Advanced Security** (older name: **Code security and analysis**) → *Secret Protection / Secret scanning* is on |
| Push protection (T-02, R-04) | **Enabled** | Nothing — GitHub now blocks a push that contains a known token type |
| Dependabot alerts (T-11) | Could not be read from here | Same page → **Dependabot alerts** → **Enable** |
| Dependabot security updates | **Disabled** | Same page → **Dependabot security updates** → **Enable** (PRs that fix known vulnerabilities, besides the weekly version PRs from `dependabot.yml`) |
| Branch protection on `main` | **None** (no rule, no ruleset) | Steps below — **after** CI has run once |
| Two-factor authentication (T-09) | Cannot be seen from here | Steps below |

### 7.1 Two-factor authentication (T-09) — protects who can change `main` and the curated data
1. GitHub → your picture (top right) → **Settings** → **Password and authentication**.
2. Under **Two-factor authentication** → **Enable two-factor authentication**.
3. Choose **Set up using an app** (Google Authenticator, Microsoft Authenticator, …), scan the QR code, type the code.
4. **Download the recovery codes** and keep them somewhere safe and offline.
Guide: https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication

### 7.2 Require CI before merging (branch protection) — do this after the first PR has run CI
Protected branches are free for public repositories **[verify: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches]**.
1. Repo → **Settings** → **Branches** → **Add branch ruleset** (or **Add classic branch protection rule**).
2. Ruleset name `main`; **Enforcement status: Active**; **Target branches → Add target → Include default branch**.
3. Tick **Require a pull request before merging** (approvals: **0**, because Claude merges your PRs and you are the only person).
4. Tick **Require status checks to pass** → **Add checks** → type `lint, types, unit, build, e2e` (the CI job name; it only appears in the list after CI has run once) → select it.
5. Tick **Block force pushes**. **Create**.

---

## 8. After the site is live — Phase 5 cases that need ENV-2

Hand these to the `qa-engineer` agent with the live URL. **Note:** the Claude cloud environment cannot open
`*.vercel.app` (its internet access is blocked), so automated runs against ENV-2 (Lighthouse,
header checks) must run on the owner's laptop, or the owner pastes the output.

| Case | Requirement | What | Who / how |
|---|---|---|---|
| TC-64 | NFR-07 | HTTP→HTTPS redirect, HSTS, valid certificate | Owner: §4 S-1 – S-3; paste the `curl.exe -sI` output |
| TC-57 | NFR-02 | Lighthouse Performance ≥ 80 (mobile, home), 3 runs | Owner laptop: `npx lighthouse@13.6.0 https://happening-kl.vercel.app/ --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=./lh-1.json` (×3) |
| TC-61 | NFR-05 | Lighthouse Accessibility ≥ 90 on `/`, `/about`, `/saved`, `/event/<id>` | Same command per page |
| TC-56 | NFR-01 | First results ≤ 3 s on Fast 4G — final figure | Owner laptop: Chrome DevTools → Network "Fast 4G", CPU 4× → tap Klang Valley ×5 |
| TC-66 | NFR-13 | Device/browser smoke matrix D-2 – D-6 (includes TC-02 phone part, FR-01) | Owner + testers, Production URL |
| TC-68 | NFR-16 | Running cost RM0 | Owner: Vercel → **Usage** (and **Settings → Billing**: Hobby, no card) |
| TC-45 manual part | FR-37 | Paste a details link into WhatsApp/Telegram, check the preview card | Owner |
| TC-73 | NFR-04 | UAT 23–29 Dec | Owner + Testers A–C, Production URL |

Lighthouse on a **Preview** URL gives lower scores: Vercel adds its toolbar there (blocked by our CSP)
and asks for a login. Always measure the Production URL.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails on Vercel but CI is green | Different Node version | §3.3 step 13 → 22.x, redeploy |
| `npm ci` fails in CI | `package-lock.json` out of date | Run `npm install` locally, commit the lock file |
| Every search shows "no events" | `ENABLED_SOURCES` empty/wrong (§6.1), **or** all curated events have ended | Fix the variable + redeploy; or add new events (events-curator) and merge |
| New events merged but not on the site | The merge's deployment failed or is still building | Deployments tab → look for a red **Error** → open **Build Logs** |
| "Use my location" never asks | Opened over `http://` or inside an app's in-app browser | Use the `https://` URL in Chrome/Safari |
| Map is grey | OpenStreetMap tiles blocked by the network or rate-limited | Try another network; see OSM tile policy (R-02) |
| Red CSP errors in the console on a Preview URL only | Vercel toolbar on previews | Ignore, or Settings → **Vercel Toolbar** → off for Preview **[verify: https://vercel.com/docs/vercel-toolbar]** |
| Old page shown after a deploy | Service worker served a cached copy while offline/slow | Reload once; pages are network-first, so a normal online visit gets the new version |
| CI fails only on TC-56 (timing) | GitHub's machine was slow that run | Re-run the job once; if it keeps failing, tell Claude (a timing test must not be "fixed" by retrying forever) |

## 10. Facts still to verify (owner, before relying on them)

| # | Fact | Open | Why it matters |
|---|---|---|---|
| V-1 | Hobby is for **non-commercial, personal** use; a student project qualifies (ADR-08, R-02) | https://vercel.com/legal/terms and https://vercel.com/docs/plans/hobby | If the app is ever monetised, Hobby is not allowed |
| V-2 | Hobby limits (function invocations, bandwidth, build minutes) and what happens when exceeded (pause, not a bill) | https://vercel.com/docs/limits | NFR-16 RM0, R-05 |
| V-3 | HSTS header added automatically on `*.vercel.app` | https://vercel.com/docs/encryption | TC-64 expects it |
| V-4 | Node.js versions offered and the default | https://vercel.com/docs/functions/runtimes/node-js/node-js-versions | §3.3 step 13 |
| V-5 | Function region can be changed on Hobby; default region | https://vercel.com/docs/functions/configuring-functions/region | NFR-01 latency |
| V-6 | Instant Rollback button name and the "auto-assign stops after rollback" rule | https://vercel.com/docs/instant-rollback | §5 |
| V-7 | Preview deployments protected by default | https://vercel.com/docs/deployment-protection | Testers use Production |
| V-8 | **OpenStreetMap tile usage policy**: attribution visible, real browser `Referer`/User-Agent, no bulk download or offline tile caching, "heavy use" limits | https://operations.osmfoundation.org/policies/tiles/ | R-02, NFR-17 (TC-69). The app meets the obvious rules (attribution, no tile caching in `sw.js`) |
| V-9 | GitHub Actions free for public repos; protected branches free for public repos | links in §2 and §7.2 | NFR-16, §7.2 |
| V-10 | PDPA wording on the privacy page still matches the law | https://www.pdp.gov.my/ (Personal Data Protection Department) | FR-31, TC-38 |

## Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Developer / project owner | Project student | ☐ Approved | |
