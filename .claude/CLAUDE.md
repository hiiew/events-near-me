# Happening (repo: events-near-me) — instructions for Claude

These instructions load automatically in every Claude session for this repo: cloud sessions and
the Claude extension in Antigravity.

## Rule 1 — Check the skills folder before every change

Before you **write, edit, review or plan** anything in this repo, look in `.claude/skills/`, pick
every skill that matches the task (table below), load it with the Skill tool (or read its
`SKILL.md`), and follow it. In your reply, name the skill(s) you used in one line, e.g.
*"Skills used: vitest, vercel-react-best-practices"*. If no skill fits, say *"Skills used: none fit"*.

| When the change involves… | Use these skills |
|---|---|
| React components, Next.js pages/routes, data fetching, performance | `vercel-react-best-practices` |
| Writing or fixing tests, mocks, coverage | `vitest` |
| Any UI: markup, forms, colours, focus, screen readers (NFR-05) | `accessibility` |
| Building, polishing or reviewing how a screen looks (layout, hierarchy, visual detail) | `ui-taste` — free part only: no paid Uizze service is connected, and there's no image-generation tool, so work from `ui-ux.md` and say so. Never run its `scripts/` without the user's OK |
| Module structure, interfaces, adapters, where code should live | `codebase-design` |
| Reviewing existing code for structural problems (only once real code exists) | `improve-codebase-architecture` |
| Naming domain concepts, glossary terms, recording a design decision | `domain-modeling` |
| The user says "grill me" or wants a plan/decision stress-tested | `grill-me` → `grilling` |
| Reviewing a pull request or the whole repo for bugs, risk, bloat | **ponytail plugin**: `/ponytail-review`, `/ponytail-audit` (also `/ponytail-debt`, `/ponytail-gain`, `/ponytail-help`) |

The list of installed skills is in `skills-lock.json`; plugins are in `.claude/settings.json`. If a skill is added or removed, update this
table and `docs/04-implementation/coding-standards.md` §6 in the same commit.

## Rule 2 — Project conventions beat skill defaults

If a skill's advice conflicts with this project, the project wins:

- **Design decisions (ADRs)** live in `docs/03-design/architecture.md` (ADR-01 …), not `docs/adr/`.
- **Domain terms** live in the SRS glossary, `docs/02-requirements/srs.md` §1.3, not a new `GLOSSARY.md`.
- **UI style** is defined in `docs/03-design/ui-ux.md` (playful campus style, colour tokens, WCAG AA). It is this project's DESIGN.md for `ui-taste`: keep its style instead of redesigning.
- **Ponytail's "write the least code" mode** applies to code Claude writes or reviews. It must never
  replace teaching: when guiding the owner, still explain the why, and keep the slice guides,
  tests and traceability that this project requires.
- **Requirement changes** after Phase 2 go in `docs/02-requirements/change-log.md` *before* they are applied.

## Rule 3 — How this project works

- **SDLC, one phase at a time.** Phases 1–3 are approved; the project is in **Phase 4 — Implementation**.
  Check `README.md` for the current phase status. The master prompt is `PROMPT.md`.
- **The owner writes the application code** (decided in Phase 4). Claude guides, gives hints and
  reviews pull requests. Don't write whole feature files for the owner unless they ask for that task.
- **One branch + pull request per slice.** Claude reviews and merges. Follow
  `docs/04-implementation/coding-standards.md` (commit format, Definition of Done).
- **Traceability.** Every change names the requirement IDs it serves (`FR-xx`, `NFR-xx`) in the
  commit message and code comment; keep `docs/02-requirements/traceability-matrix.md` current.
- **Privacy and security.** Never commit secrets (`.env.local` is ignored; only `.env.example` is
  committed). Never log coordinates or request bodies. Location is rounded to 3 decimal places.
- **Official data sources only:** the curated JSON file and the Eventbrite API by organiser.
  No scraping.
- **Log your work** with a line in `docs/04-implementation/dev-log.md`.
