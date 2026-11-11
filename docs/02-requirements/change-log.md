# Requirements Change Log

> **What is a change log?** Once requirements are approved, they are a *baseline*. Any change after
> that is recorded here first — what changed, why, and what it affects — so scope doesn't drift
> silently and the traceability matrix stays correct. In industry this is called **change control**.

| CR ID | Date | Change | Reason | Requirements affected | Design / test impact | Decision |
|---|---|---|---|---|---|---|
| CR-01 | 2026-11-11 | Product name changes from "Events Near Me" to **Happening**. Repo name stays `events-near-me`. | Owner wants a friendlier name that isn't tied to one city. | None (no FR/NFR mentions the name). | UI title, PWA manifest name, page titles, docs headings from Phase 3 on. | ✅ Approved by owner |
| CR-02 | 2026-11-11 | Clarification: the app works for **any** search point; the MVP's curated data and testing cover the **Klang Valley** only. More cities are a post-launch backlog item. | Owner said the app "should not be only KL". `ASSUMPTION` — owner did not choose between "name only" and "coverage too"; recommended option applied. | None changed. Confirms SRS §1.2 scope and charter "design should not prevent other areas". | Design must not hard-code KL except as the default map centre. Backlog item added for more cities. | ✅ Applied as assumption — owner may override |
| CR-03 | 2026-11-11 | **FR-26 (Eventbrite by organiser, Should)** moved to the maintenance backlog. | Agreed cut-off (grill session, decision 12): build only if ≥5 organiser IDs arrived by the end of Slice 3; none arrived. | FR-26 → ⏸ Deferred. Must requirements unaffected (curated source covers FR-24/FR-25). | Adapter + token handling designed and spike-proven; can be added later as one adapter file + registry line (NFR-14). | ✅ Applied per owner's prior decision |
