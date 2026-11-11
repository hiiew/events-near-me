# Timeline & Milestones — Events Near Me

| Field | Value |
|---|---|
| Phase | 1 — Planning |
| Version | 1.0 (draft for approval) |
| Date | 2026-11-11 |
| Duration | 8 weeks, ~10 h/week (~80 h) — `ASSUMPTION` A-2 |

> **What is a project timeline?** It breaks the work into phases with dates and **milestones**
> (points where something is finished and approved). A **Gantt chart** shows each phase as a bar
> over time so you can see overlaps and the critical path at a glance.

## 1. Milestones

| ID | Milestone | Target date | Exit criterion (definition of done) |
|---|---|---|---|
| M1 | Planning approved | Tue 2026-11-17 | Charter, feasibility, risks, timeline approved; data-source spike done |
| M2 | Requirements approved | Tue 2026-11-24 | SRS with FR/NFR IDs, user stories, MoSCoW, MVP defined; traceability matrix started |
| M3 | Design approved | Tue 2026-12-01 | Architecture, data model, API spec, UI/UX, security docs approved |
| M4a | Slice 1 working | Tue 2026-12-08 | Location → list of nearby events (deployed preview) |
| M4b | Slice 2 working | Tue 2026-12-15 | Map view + filters |
| M4c | Implementation complete | Tue 2026-12-22 | All Must-have requirements built; dev log up to date |
| M5 | Testing complete | Tue 2026-12-29 | Test cases executed; test report; all Must-haves have passing tests |
| M6 | Deployed + docs | Tue 2027-01-05 | Live on Vercel; deployment guide, user manual, maintenance plan; final sign-off |

*Week 4–6 fall over the holiday period — adjust if you plan time off (that's what the buffer is for).*

## 2. Weekly plan

| Week | Dates | Phase | Main activities | Hours |
|---|---|---|---|---|
| 1 | 11 – 17 Nov | 1 Planning | Charter, feasibility, risks, timeline, **data-source spike** | 10 |
| 2 | 18 – 24 Nov | 2 Requirements | SRS, user stories, MoSCoW, traceability matrix | 10 |
| 3 | 25 Nov – 1 Dec | 3 Design | Architecture, data model, API spec, wireframes, security/privacy | 10 |
| 4 | 2 – 8 Dec | 4 Implementation | Project setup, linting, CI, `.env.example`; **Slice 1**: location → event list | 10 |
| 5 | 9 – 15 Dec | 4 Implementation | **Slice 2**: map view, filters | 10 |
| 6 | 16 – 22 Dec | 4 Implementation | **Slice 3**: event detail, bookmarks, remaining Musts; unit tests alongside | 10 |
| 7 | 23 – 29 Dec | 5 Testing | Test plan execution, bug fixing, accessibility check, test report | 10 |
| 8 | 30 Dec – 5 Jan | 6 Deployment + 7 Maintenance | Production deploy, user manual, maintenance plan, final review | 10 |

The **buffer** (~6 h) is spread inside weeks 6–8; if Phase 4 overruns, "Should" items move to the
maintenance backlog rather than extending the deadline.

## 3. Gantt chart

```mermaid
gantt
    title Events Near Me — SDLC timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %d %b

    section 1 Planning
    Charter, feasibility, risks     :p1, 2026-11-11, 5d
    Data-source spike               :crit, spike, 2026-11-14, 3d
    M1 Planning approved            :milestone, m1, 2026-11-17, 0d

    section 2 Requirements
    SRS, user stories, MoSCoW       :p2, 2026-11-18, 7d
    M2 Requirements approved        :milestone, m2, 2026-11-24, 0d

    section 3 Design
    Architecture, data, API, UI     :p3, 2026-11-25, 7d
    M3 Design approved              :milestone, m3, 2026-12-01, 0d

    section 4 Implementation
    Setup + Slice 1 (list)          :crit, s1, 2026-12-02, 7d
    Slice 2 (map + filters)         :crit, s2, 2026-12-09, 7d
    Slice 3 (detail + bookmarks)    :crit, s3, 2026-12-16, 7d
    M4 Implementation complete      :milestone, m4, 2026-12-22, 0d

    section 5 Testing
    Execute tests, fix, report      :p5, 2026-12-23, 7d
    M5 Testing complete             :milestone, m5, 2026-12-29, 0d

    section 6-7 Deploy & Maintain
    Deploy, manual, maint. plan     :p6, 2026-12-30, 7d
    M6 Final sign-off               :milestone, m6, 2027-01-05, 0d
```

## 4. Critical path

Data-source spike → Requirements → Design → Slices 1–3 → Testing → Deployment.
Every phase depends on the previous one being approved, so a delay anywhere pushes the end date.
The spike is on the critical path because **if KL data is too thin, requirements must change.**
