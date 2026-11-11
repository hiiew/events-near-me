# Data-Source Spike — Results

| Field | Value |
|---|---|
| Phase | 1 → 2 (run at start of Phase 2, see timeline M1 note) |
| Date | 2026-11-11 |
| Question | Which free official API returns ≥ 20 upcoming events within ~25 km of KL city centre? |
| Pass mark | ≥ 20 upcoming events |

> **What is a spike?** A short, time-boxed experiment that answers one risky question before you
> commit to a design. A "failed" spike is still a success: it found the problem in week 1
> instead of week 6.

## 1. Test 1 — Ticketmaster Discovery API

| Item | Value |
|---|---|
| Request | `GET /discovery/v2/events.json?latlong=3.1390,101.6869&radius=25&unit=km&size=50&sort=date,asc` (+ `countryCode=MY` variant) |
| Key | Free developer key (not recorded here) |
| Result | **`totalElements = 0`** — no events returned |
| Verdict | ❌ **Fails pass mark.** Ticketmaster has no usable KL coverage. |

**Consequence:** risk **R-01 has occurred.** Requirements cannot assume Ticketmaster as the data
source. A fallback must be chosen before the SRS is written (stop condition: data-source decision).

## 2. Fallback options

Facts marked **[verify]** are from general knowledge and must be checked on the provider's site.

| Option | Description | Cost | KL coverage | Fits constraints? |
|---|---|---|---|---|
| A. PredictHQ | Commercial event-intelligence API with radius search | Free trial / limited plan **[verify]** | Likely some (concerts, sports, conferences, holidays) **[verify]** | Legit API ✅; long-term RM0 uncertain ⚠️ |
| B. Eventbrite (by organiser) | Fetch events from a list of known KL organiser IDs (public location search was removed **[verify]**) | Free key | Depends on organisers chosen | Legit API ✅; needs a curated organiser list |
| C. SerpApi Google Events | Third-party API returning Google's event listings | Small free monthly quota **[verify]** | Likely good | ⚠️ Gets data by scraping Google — conflicts with the spirit of "no unauthorised scraping" (C-3) |
| D. Curated dataset | Developer manually enters real public KL events (title, venue, coordinates, date, price, **link to the official source**) into a JSON file | RM0 | As good as the effort put in | ✅ Legit (facts + link back); ⚠️ manual upkeep; changes "API events only" decision |
| E. Hybrid (recommended) | Provider-agnostic **adapter layer**; ship with D as a guaranteed baseline + B (and A if free) as live sources | RM0 | Guaranteed demo data + some live data | ✅ |

## 3. Recommendation

**Option E — hybrid with an adapter layer.**
- *Why:* the app must show real KL events on a list and a map (definition of done). Only a curated
  dataset can *guarantee* that at RM0; live APIs add freshness where they work.
- *Adapter layer:* every source is converted into one common `Event` shape, so adding or removing a
  source later (e.g. if Ticketmaster expands to Malaysia) doesn't change the rest of the app.
- *Trade-off:* the curated file needs manual updates (~30 min/week to keep upcoming events current)
  and is not "live". This is recorded as a maintenance task.
- Option C rejected because it relies on scraping (C-3).

## 4. Decision

| Decision | Chosen option | Decided by | Date |
|---|---|---|---|
| Event data source for MVP | _pending_ | Developer | |
