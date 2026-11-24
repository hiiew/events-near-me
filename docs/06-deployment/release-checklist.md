# Release Checklist — Happening

Short version of [`deployment-guide.md`](deployment-guide.md). A "release" = merging a pull request into
`main`; Vercel then puts it live on `https://happening-kl.vercel.app` by itself.

## Before merging (pre-deploy)
- [ ] CI is green on the pull request (lint, unit, build, e2e) — NFR-15
- [ ] The Vercel **Preview** link on the PR opens and shows the change (log in to Vercel if asked)
- [ ] No secret, `.env.local` or real coordinates in the diff; no new `NEXT_PUBLIC_` variable for a secret
- [ ] New environment variable needed? Added in Vercel → Settings → Environment Variables (Production + Preview) **before** merging
- [ ] Curated data change: at least one event is still upcoming (otherwise every search is empty)
- [ ] `dev-log.md` line added; requirement IDs in the commit message

## Deploy
- [ ] Merge (squash) into `main`
- [ ] Vercel → **Deployments**: the new deployment reaches **Ready** with the **Production** label (1–2 min)

## After deploying (post-deploy, ~5 min — full table in deployment guide §4)
- [ ] `curl.exe -sI https://happening-kl.vercel.app/` → `200` with `content-security-policy`, `strict-transport-security`, `referrer-policy`, `x-content-type-options`, `permissions-policy`
- [ ] Phone: home loads → **Klang Valley** → results within ~3 s → open an event → map tiles show
- [ ] Phone: **Use my location** → Allow → results
- [ ] Laptop Chrome console on `/`: no red CSP errors
- [ ] Monthly: Vercel → **Usage** well inside Hobby limits; no card added (NFR-16, R-05)

## Roll back immediately if (deployment guide §5)
- The home page or the search fails for everyone
- A security header is missing, or HTTPS is not enforced
- Location, a secret or a request body shows up in a page, URL or log
- Vercel asks for a payment method to keep the site up

How: Vercel → **Deployments** → last good Production deployment → **⋯** → **Instant Rollback** **[verify name]**
→ re-run the post-deploy checks → fix forward on a branch → **Promote to Production** when fixed.
