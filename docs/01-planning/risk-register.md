# Risk Register — Events Near Me

| Field | Value |
|---|---|
| Phase | 1 — Planning (living document — last reviewed 2026-11-24, Phase 1–3 review) |
| Version | 1.0 |
| Product name | Written as "Events Near Me"; the product is now **Happening** (CR-01). Title kept as approved. |
| Date | 2026-11-11 |

> **What is a risk register?** A table of things that *might* go wrong, how likely and how bad
> each is, and what you'll do about it. You review it at every phase gate. Score = Likelihood ×
> Impact (each 1–5). Scores ≥ 12 are **high** and need active mitigation now.

**Scale:** Likelihood 1 = rare … 5 = almost certain. Impact 1 = negligible … 5 = project fails.

| ID | Risk | Category | L | I | Score | Mitigation | Contingency (if it happens) | Owner | Status |
|---|---|---|---|---|---|---|---|---|---|
| R-01 | Free event APIs return too few events in KL | Data / technical | 4 | 5 | **20 🔴** | Data-source spike in Phase 1; test several providers | Combine sources; widen radius; demo with another city as well; consider a low-cost source (needs approval) | Developer | **Closed** — occurred (Ticketmaster: 0 KL events); mitigated by decision E: curated dataset + adapter layer |
| R-02 | API terms forbid caching, require specific attribution, or are non-commercial only | Legal | 3 | 4 | **12 🔴** | Read and record each provider's ToS during the spike | Shorten/remove cache; adjust UI attribution; drop provider | Developer | Open — Eventbrite deferred (CR-03); OSM tile policy and Vercel terms still to verify in Phase 6 |
| R-03 | Beginner learning curve makes Phase 4 take longer than planned — **raised then lowered 2026-11-11: owner first chose to write all code; Claude now builds the slices** | Schedule | 4 | 4 | **16 🔴** | Small MVP; step-by-step slice guides with tests; Claude reviews each PR; early checkpoint after setup; ~3 weeks ahead of schedule as extra buffer; 6 h buffer | Move "Should" items to "Could"; use buffer week | Developer | **Closed** — Claude builds the slices; implementation finished ~6 weeks early |
| R-04 | API key leaked by committing it to GitHub | Security | 3 | 4 | **12 🔴** | `.env` in `.gitignore` from day 1; `.env.example` only; enable GitHub secret scanning; keys used only server-side | Revoke and rotate key immediately; purge from history | Developer | Mitigated — `.env*` ignored, only `.env.example` committed; full-history scan 2026-11-11 found no secrets; enable GitHub secret scanning in Phase 6 |
| R-05 | Free-tier limits change or a service asks for a credit card | Economic | 2 | 4 | 8 🟠 | Use services with no card required; check limits at signup | Swap to alternative free provider (documented in feasibility) | Developer | Open — no card used so far; re-check when deploying to Vercel |
| R-06 | Precise user location exposed or stored, breaching PDPA principles | Privacy / legal | 2 | 5 | 10 🟠 | Consent prompt; round coordinates; no server-side storage or logging of location; privacy notice | Remove offending code/logs; review data flow | Developer | Mitigated — rounding on device + server, POST body, no logging (unit tests NFR-09/10) |
| R-07 | Third-party API rate limit exceeded | Technical | 2 | 3 | 6 🟡 | Server-side cache; debounce filter changes | Show cached results with "last updated" notice | Developer | Low — only the curated file is used, so no external API calls; revisit if a live source is added |
| R-08 | Third-party API changes or goes down | Technical | 2 | 3 | 6 🟡 | Wrap each provider behind an adapter; graceful error messages | Disable that provider; rely on others | Developer | Mitigated — adapters + 5 s timeout + partial results (aggregator tests) |
| R-09 | User denies location permission or device has poor GPS | Usability | 4 | 2 | 8 🟠 | Manual area picker (e.g. KL neighbourhoods) as fallback | — (fallback is the design) | Developer | Mitigated — drop-a-pin and "Search this map area" (FR-02) |
| R-10 | Scope creep (adding accounts, submissions, notifications) | Schedule | 3 | 3 | 9 🟠 | MoSCoW in Phase 2; change log after Phase 2 approval | Defer to maintenance backlog | Developer | **Occurred** — redesign (DC-01), Instagram scraping request, Eventbrite, 7 Could features (CR-04–CR-10) and Sabah coverage (CR-11); all handled through change log / grill decisions |
| R-11 | Event data incomplete (no price, no coordinates, vague category) | Data quality | 4 | 2 | 8 🟠 | Handle missing fields in design ("Price not listed"); category mapping table | Hide events without coordinates from the map but keep them in the list | Developer | Mitigated — no-coordinate events stay in list (FR-09); "Price not listed" |
| R-12 | Single developer unavailable (exams, illness) | Schedule | 3 | 3 | 9 🟠 | 6 h buffer; keep work committed and documented so it's easy to resume | Reduce to Must-have only | Developer | Open — ~6 weeks of buffer remaining |

## Top risks to act on now (reviewed 2026-11-24)
1. **R-02 (12)** — verify the OSM tile usage policy and Vercel Hobby terms before deploying (Phase 6).
2. **R-04 (12)** — turn on GitHub secret scanning and push protection (Phase 6).
3. **R-10 (9)** — scope creep: 7 Could features added since 12 Nov; freeze features until Phase 5 is done.
4. **R-12 (9)** — keep the remaining buffer for testing and deployment.

*R-01 and R-03 (the original top two) are closed.*
