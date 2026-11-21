---
name: resume-story
description: >-
  Runs the Resume Story Engine pipeline one résumé point at a time into
  checkpoint files, with web-researched tech landscape, collaboration, timeline
  checks, and post-2024 AI tooling norms, then assembles preparation JSON. Use
  when preparing interview stories from a résumé and job description, when the
  user invokes /resume-story, or asks to generate, continue, clear, or regenerate
  a run.
---

# Resume Story

Automated, file-backed interview preparation. Do **not** wait for the user to say "next" between stages. Keep going until `06-preparation.json` exists and validation passes, unless a hard blocker needs user input (missing résumé/JD, schema failure after one repair attempt).

## Hard rules

1. One active stage write at a time; always persist the stage file before starting the next stage.
2. Never invent the full preparation in a single chat blob without writing the checkpoint files below.
3. Full résumé + JD for stages 1–3. Later stages load `01-role-summary.json`, `01b-tech-landscape.json`, the current card, and prior expanded points.
4. After the role summary, **research** the tech/domain landscape with web search (or equivalent live sources) before expanding points.
5. Process points **sequentially**. When expanding point N, load every `03-points/*.json` already written for this run and avoid repeating the same product/use-case/action angle.
6. Personal inputs and run outputs live under `data/private/<run-slug>/` (gitignored). Never commit private résumé/JD content.
7. Match JSON to `spec/`. Use the matching file in `prompts/` for each LLM stage.

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
  _progress.json
```

`<run-slug>` = lowercase `company-role` from the JD (e.g. `instrumental-frontend`). If the user names a run, use that.

Details and JSON shapes: [pipeline.md](pipeline.md).

## Commands

| User says | Agent does |
|---|---|
| `/resume-story` or "generate / prepare" with résumé+JD | Create run folder; run stages 1→7 without pausing for "next" |
| "continue" | Resume from `_progress.json` next incomplete stage |
| "clear" / "clear intermediates" | Delete `01`–`05`, `01b`, `_progress.json`, and `03-points/`; keep `00-inputs/` and `06-preparation.json` if present |
| "clear all" | Delete the whole `data/private/<run-slug>/` run (ask once if unclear which slug) |

Edit/regenerate-one-point is **out of scope for this pass** — if asked, say generate-first is supported; point edit lands next.

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
- Use web search / live docs for frameworks, versions-by-era, domain architectures, Product/UX collaboration norms, and **post-2024 AI coding tools** (Claude, Cursor, Copilot, etc.).
- Cross-check résumé employment windows in `timelineChecks`.
- Write `01b-tech-landscape.json`.

### Stage 4 — Point index
- From the résumé, write `02-point-index.json`: ordered compact cards `{ id, originalPoint, experienceWindow? }`. Keep `originalPoint` verbatim.
- Choose a stable `id` per point (`^[a-z0-9-]+$`).

### Stage 5 — Expand points (sequential, anti-repeat, landscape-grounded)
For each card in order:
1. Read `01-role-summary.json`, `01b-tech-landscape.json`, the card, and **all** existing `03-points/*.json`.
2. Read `prompts/expand-point.md` + `spec/resume-point.schema.json`.
3. Expand this point only: versions + `eraFit`, collaboration, domain hooks, and light `aiTooling` when the window is 2024+.
4. Write `03-points/<id>.json` with `"status": "draft"`.
5. Update `_progress.json` (`lastCompletedPointId`, `nextPointId`).
6. Continue to the next point immediately — do not ask the user to click next.

### Stage 6 — Answers
- Read `prompts/generate-answer.md`.
- Using role summary + landscape + all expanded points, write `04-answers.json`. Prefer 2–3 strongest points as anchors; do not rehash the same story twice across answers.

### Stage 7 — Review + assemble + validate
- Read `prompts/review-answer.md` and `evals/quality-cases.json`.
- Write `05-review.json`. Repair failed fields only; rewrite the touched checkpoint files.
- Assemble `06-preparation.json` matching `spec/preparation.schema.json`, including `techLandscape` from `01b` when present.
- Structurally check required keys against the schemas. Run `npm run validate` only against the committed demo unless the user asks to validate a copied private file.

### Done
Reply with: run slug, point count, path to `06-preparation.json`, landscape highlights (versions, AI norms, collab), any review gaps, and that they can say `clear` to drop intermediates.

## Progress file

```json
{
  "runSlug": "company-role",
  "stage": "expand-points",
  "lastCompletedPointId": "walletgyde-dashboard",
  "nextPointId": "payments-api",
  "pointOrder": ["walletgyde-dashboard", "payments-api"],
  "updatedAt": "ISO-8601"
}
```

`stage` values: `inputs` | `role-summary` | `tech-landscape` | `point-index` | `expand-points` | `answers` | `review` | `done`.
