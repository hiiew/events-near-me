# Coding Standards — Happening

| Field | Value |
|---|---|
| Phase | 4 — Implementation |
| Version | 1.0 |
| Date | 2026-11-11 |

> **Why coding standards?** They make code consistent so it's easy to read, review and fix —
> by you in three months, by an assessor, or by a teammate. Most rules are enforced by tools
> (ESLint, TypeScript, tests) so you don't have to remember them.

## 1. Tools and versions (checked 2026-11-11)

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 22 LTS (or 24) | Runs JavaScript on your computer |
| Next.js | 16.4.x (installed by `create-next-app`) | Framework (ADR-01) |
| React | 19.3.x | UI library |
| TypeScript | 5.x | Types |
| Tailwind CSS | 4.x | Styling (ADR-02) |
| ESLint | 9.x + `eslint-config-next` | Linting — finds bugs and bad patterns |
| Zod | 4.x | Validation (ADR-09) |
| Vitest | 5.x | Unit tests (needs `@types/node@22`, see slice 1 guide) |

> Next.js 16 is newer than many tutorials. When something in a tutorial doesn't work, check the
> docs in `node_modules/next/dist/docs/` (the generated `AGENTS.md` tells AI assistants to do this too).

## 2. Code rules

| # | Rule | Why |
|---|---|---|
| 1 | TypeScript everywhere; **no `any`** (use `unknown` and validate with Zod) | Catch mistakes early |
| 2 | Put logic in **pure functions** in `src/lib/` (no React, no `fetch`) and test them | Easy to test (NFR-15) |
| 3 | Components in `src/components/`, one component per file, `PascalCase.tsx` | Easy to find |
| 4 | Files and folders `kebab-case.ts`; functions/variables `camelCase`; types `PascalCase`; constants `UPPER_SNAKE_CASE` | Consistency |
| 5 | Every **server input** validated with Zod before use | Security (NFR-08) |
| 6 | Secrets only via `process.env` in **server** code; never `NEXT_PUBLIC_` for secrets | NFR-06 |
| 7 | **Never** log coordinates, request bodies, or tokens | NFR-10 |
| 8 | Never use `dangerouslySetInnerHTML` | XSS (T-03) |
| 9 | External links: `target="_blank" rel="noopener noreferrer"` | T-04 |
| 10 | Dates: store ISO strings with offset; format only for display with `timeZone: "Asia/Kuala_Lumpur"` | NFR-18 |
| 11 | Each requirement implemented gets a comment at the top of the main function: `// FR-04, FR-10` | Traceability |
| 12 | Small functions (aim < 40 lines); early returns instead of deep nesting | Readability |
| 13 | Accessible markup: real `<button>`/`<a>`, labels on inputs, `alt` on images | NFR-05 |

## 3. Tests

- Test file sits next to the code: `geo.ts` → `geo.test.ts`.
- Test names describe behaviour: `it("hides events that already ended")`.
- Each test ID in Phase 5 will reference requirement IDs; for now, put the ID in the `describe`:
  `describe("FR-05 hide ended events", …)`.
- Run before every push: `npm run lint && npm test && npm run build`.

## 4. Git workflow (decided Phase 4)

| Step | Who | Command / action |
|---|---|---|
| 1. Branch per slice from latest `main` | You | `git switch main && git pull` then `git switch -c slice-1-location-list` |
| 2. Small commits that each work | You | `git add -A && git commit -m "feat(FR-04): curated adapter filters by radius"` |
| 3. Push the branch | You | `git push -u origin slice-1-location-list` |
| 4. Tell Claude the branch is ready | You | "slice 1 ready for review" |
| 5. Open the pull request, review, comment | Claude | PR description lists requirements done + test results |
| 6. Fix review comments, push again | You | same branch |
| 7. Merge to `main` when approved | Claude | squash-merge; branch deleted |

### Commit message format (Conventional Commits)
`type(scope): summary` — types: `feat` (new feature), `fix`, `test`, `docs`, `chore` (setup),
`refactor`, `style`. Put requirement IDs in the scope: `feat(FR-06,FR-17): event card`.

## 5. Definition of Done (per task)
- [ ] Code follows the rules above
- [ ] Unit tests written and passing
- [ ] `npm run lint`, `npm test`, `npm run build` all pass
- [ ] Requirement ID(s) in commit message and code comment
- [ ] No secrets, no coordinates in logs
- [ ] `dev-log.md` updated (one line is fine)

## 6. AI assistant skills (shared by the cloud session and your laptop)

Reviewed agent skills are committed in `.claude/skills/` (versions pinned in `skills-lock.json`),
so any Claude session working in this repo — the cloud session or the Claude extension in
Antigravity after `git pull` — loads them automatically:

| Skill | Source | Use it for |
|---|---|---|
| `vercel-react-best-practices` | vercel-labs/agent-skills | React / Next.js patterns and performance |
| `vitest` | antfu/skills | Writing Vitest tests |
| `accessibility` | addyosmani/web-quality-skills | WCAG checks (NFR-05) |
| `grill-me` → `grilling` | mattpocock/skills | Say **"grill me"** to have Claude stress-test a plan or design with rounds of numbered questions (each with a recommended answer) until nothing is left assumed |
| `ui-taste` | uizze.sh (Uizze) | Building or polishing screens. Free playbooks only; its paid add-on service is not used |
| `improve-codebase-architecture` (+ `codebase-design`, `domain-modeling`) | mattpocock/skills | Once there is code (after Slice 1+): scans for "shallow" modules, writes a visual HTML report, then grills you on the one you pick |

> **Project conventions win over skill defaults:** our ADRs live in `docs/03-design/architecture.md`
> (ADR-01 … ADR-09), not `docs/adr/`. If a skill wants to record a new ADR, add it there and log
> requirement changes in `docs/02-requirements/change-log.md`. The domain glossary is SRS §1.3.

They were reviewed on 2026-11-11: Markdown guidance only, except one script in `ui-taste` (`scripts/verify-visual-evidence.mjs`) — read in full; it only checks local screenshot hashes and makes no network calls, installs or writes. Don't run it without a reason. **Owner-writes-code rule still
applies** — use them for hints and reviews, not to generate whole files.
`.claude/CLAUDE.md` tells every Claude session to check these skills before each change.
Update later with `npx skills update -p` and review the diff before committing.
