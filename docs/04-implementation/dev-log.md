# Development Log — Happening

> **What is a dev log?** A short diary of what was built, decisions made while coding, problems hit
> and deviations from the design. It's evidence of your process (assessors love it) and a memory aid.
> Add a line every time you work on the project.

| Date | Who | Slice / task | What happened | Req IDs | Deviation from design? |
|---|---|---|---|---|---|
| 2026-11-11 | Claude | Phase 4 kick-off | Decided: **owner writes the code**, Claude guides and reviews; one branch + PR per slice, Claude merges; Vitest for unit tests, Playwright later; SAMPLE curated events until the owner adds ≥20 real ones. | — | No |
| 2026-11-11 | Claude | Setup trial | Trial-ran `create-next-app` in a copy of the repo. Found: (1) it refuses to run while `README.md`/`PROMPT.md` exist → move them aside temporarily; (2) its `.gitignore` ignores `.env*` incl. `.env.example` → add `!.env.example`; (3) `vitest@5` needs `@types/node@22` (template pins 20). Versions: Next 16.4.6, React 19.3.0, Tailwind 4.3.3, Zod 4.6, Vitest 5.1. Build, lint and a smoke test passed. | — | No — workarounds recorded in slice-1 guide |
| 2026-11-11 | Claude | Tooling | Ran find-skills; added 3 reviewed agent skills to `.claude/skills/` (react best practices, vitest, accessibility) + `skills-lock.json`, so cloud and laptop share them. Allowed `skills.sh`/`www.skills.sh` in the cloud environment; the skills CLI needs `NODE_USE_ENV_PROXY=1` in the cloud only. | — | No |
| 2026-11-11 | Claude | Tooling | Added `grill-me` and `grilling` skills from mattpocock/skills (reviewed: Markdown only). `grill-me` just hands off to `grilling`, which interviews the user in rounds until a plan has no open decisions. | — | No |
