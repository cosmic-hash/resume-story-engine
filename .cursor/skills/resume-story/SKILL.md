---
name: resume-story
description: >-
  Runs the Resume Story Engine pipeline one résumé point at a time into
  checkpoint files, with web-researched tech landscape, exact era-pinned
  versions, Mermaid architecture flows, tool tradeoffs, business terms,
  challenges, clickable follow-up Q&A, study guide, coach prompt, and live
  dashboard preview. Also supports incremental updates inside the same run
  folder whenever new project context or interview-round guides are added.
---

# Resume Story

Automated, file-backed interview preparation. Do **not** wait for the user to say "next" between stages. Keep going until `06-preparation.json`, `07-study-guide.md`, and `08-interview-coach-prompt.md` exist and validation passes, unless a hard blocker needs user input (missing résumé/JD, schema failure after one repair attempt).

## Hard rules

1. One active stage write at a time; always persist the stage file before starting the next stage.
2. Never invent the full preparation in a single chat blob without writing the checkpoint files below.
3. Full résumé + JD for stages 1–3. Later stages load `01-role-summary.json`, `01b-tech-landscape.json`, the current card, and prior expanded points.
4. After the role summary, **research** the tech/domain landscape with web search (or equivalent live sources) before expanding points — verify exact release versions by era and real tool tradeoffs.
5. Process points **sequentially**. When expanding point N, load every `03-points/*.json` already written for this run and avoid repeating the same product/use-case/action angle.
6. Personal inputs, run outputs, and custom round guides **always live under `data/private/<run-slug>/`** (gitignored). Never commit private résumé/JD content or company-specific details into tracked repo files.
7. Match JSON to `spec/`. Use the matching file in `prompts/` for each stage.
8. **Always expand acronyms on first mention** (`Full Phrase (SHORT)`), and include a valid **Mermaid diagram** (`architecture.mermaid`) on every résumé point.

## Run folder

```text
data/private/<run-slug>/
  00-inputs/resume.md
  00-inputs/job.md
  01-role-summary.json
  01b-tech-landscape.json
  02-point-index.json
  03-points/<point-id>.json
  04-answers.json
  05-review.json
  06-preparation.json
  07-study-guide.md
  08-interview-coach-prompt.md
  09-*.md / *.html           # optional round guides, question banks, panel sheets
  _progress.json
```

`<run-slug>` = lowercase `company-role` from the JD (e.g. `acme-fullstack`). If the user names a run, use that.

Details and JSON shapes: [pipeline.md](pipeline.md).

## Commands

| User says | Agent does |
|---|---|
| `/resume-story` or "generate / prepare" with résumé+JD | Create `data/private/<run-slug>/`; run stages 1→8 automatically without pausing for "next" |
| "continue" | Resume from `_progress.json` next incomplete stage |
| Add new context, update a point, or add a round guide to an existing run | Edit the relevant `03-points/<id>.json` / `04-answers.json` / `01b-tech-landscape.json` or add a new `.md`/`.html` file **inside the same `data/private/<run-slug>/` folder**, then run `node scripts/assemble.mjs <run-slug>` to rebuild `06-preparation.json` + `07-study-guide.md` and validate automatically |
| "run dashboard" / "open dashboard" | Start `npm run dashboard` (`node scripts/serve.mjs`) and share `http://localhost:4173/dashboard/?run=<run-slug>` |
| "clear" / "clear intermediates" | Delete `01`–`05`, `01b`, `_progress.json`, and `03-points/`; keep `00-inputs/`, `06-preparation.json`, `07-study-guide.md`, `08-interview-coach-prompt.md`, and any extra round guides (`09-*.md`, `*.html`) |
| "clear all" | Delete the whole `data/private/<run-slug>/` run (ask once if unclear which slug) |

## Automated pipeline

Copy and update `_progress.json` after each stage.

### Stage 1 — Inputs
- Write `00-inputs/resume.md` and `00-inputs/job.md` from what the user provided (or paths they named).
- If either is missing, stop and ask only for the missing input.

### Stage 2 — Role summary
- Read `prompts/extract-role.md` + `spec/role-summary.schema.json`.
- Write `01-role-summary.json`.

### Stage 3 — Tech landscape research (required)
- Read `prompts/research-tech-landscape.md` + `spec/tech-landscape.schema.json`.
- Use web search / live docs for **named** JD/résumé frameworks, **exact release versions by era**, **tool tradeoffs/alternatives**, and **adjacent supporting tools** around them (auth, CI, testing, caching, queues, observability, etc.).
- Capture domain architectures, Product/UX norms, and **post-2024 AI coding tools**.
- Cross-check résumé employment windows in `timelineChecks`.
- Write `01b-tech-landscape.json`.

### Stage 4 — Point index
- From the résumé, write `02-point-index.json`: ordered compact cards `{ id, originalPoint, experienceWindow? }`. Keep `originalPoint` verbatim.
- Choose a stable `id` per point (`^[a-z0-9-]+$`).

### Stage 5 — Expand points (sequential, anti-repeat, landscape-grounded)
For each card in order:
1. Read `01-role-summary.json`, `01b-tech-landscape.json`, the card, and **all** existing `03-points/*.json`.
2. Read `prompts/expand-point.md` + `spec/resume-point.schema.json`.
3. Expand this point with **deep JD match first** (`jdAlignment`), then exact era-pinned versions + adjacent supporting tech, **`toolDecisions[]`** (why chosen vs. alternatives, including honest `existing-stack-continuity`), **point architecture** (components + request flow + valid **Mermaid diagram** in `architecture.mermaid`), **`businessTerms[]`**, **`challenges[]`** (`challenge`, `rootCause`, `howWeSolvedIt`, `outcome`), collaboration, light `aiTooling` for 2024+ windows, first-mention abbreviations (`Full Phrase (SHORT)`), **`measurements[]`** per `prompts/measurements.md` whenever a number is claimed, and **`interviewerQA[]`**.
4. Write `03-points/<id>.json` with `"status": "draft"`.
5. Update `_progress.json` (`lastCompletedPointId`, `nextPointId`).
6. Continue to the next point immediately — do not ask the user to click next.

### Stage 6 — Answers (separate from point architecture)
- Read `prompts/generate-answer.md` and `evals/general-questions.json`.
- Write `04-answers.json` covering **every** required bank question.
- Do **not** put architecture objects on general answers.
- Keep `intro` concise (~40–60s spoken). Distinct angles for intro / why-company / AI workflow / ask-for-help. STAR items may reuse points; include `ctar` when required.

### Stage 7 — Review + assemble + study guide + validate
- Read `prompts/review-answer.md` and `evals/quality-cases.json`.
- Write `05-review.json`. Repair failed fields only; rewrite the touched checkpoint files.
- Run `node scripts/assemble.mjs <run-slug>` to assemble `06-preparation.json`, generate `07-study-guide.md`, update `_progress.json` to `"done"`, and validate `06-preparation.json` via `scripts/validate.mjs`.

### Stage 8 — Interview coach prompt & dashboard handoff
- Read `prompts/coach-prompt.md` and write `data/private/<run-slug>/08-interview-coach-prompt.md`.
- Any follow-up round guides (HM questions, panel blueprints, HTML study pages) go inside the **same `data/private/<run-slug>/` folder** so the dashboard automatically surfaces them under that run.

### Done
Reply with: run slug, point count, paths to `06-preparation.json`, `07-study-guide.md`, and `08-interview-coach-prompt.md`, landscape highlights, any review gaps, the dashboard command/URL (`npm run dashboard` → `http://localhost:4173/dashboard/?run=<run-slug>`), and that they can add context incrementally anytime or say `clear` to drop intermediates.

## Progress file

```json
{
  "runSlug": "company-role",
  "stage": "expand-points",
  "lastCompletedPointId": "point-1",
  "nextPointId": "point-2",
  "pointOrder": ["point-1", "point-2"],
  "updatedAt": "ISO-8601"
}
```

`stage` values: `inputs` | `role-summary` | `tech-landscape` | `point-index` | `expand-points` | `answers` | `review` | `done`.
