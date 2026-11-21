---
name: resume-story
description: >-
  Runs the Resume Story Engine pipeline one résumé point at a time into
  checkpoint files, then assembles preparation JSON. Use when preparing
  interview stories from a résumé and job description, when the user invokes
  /resume-story, or asks to generate, continue, clear, or regenerate a run.
---

# Resume Story

Automated, file-backed interview preparation. Do **not** wait for the user to say "next" between stages. Keep going until `06-preparation.json` exists and validation passes, unless a hard blocker needs user input (missing résumé/JD, schema failure after one repair attempt).

## Hard rules

1. One active stage write at a time; always persist the stage file before starting the next stage.
2. Never invent the full preparation in a single chat blob without writing the checkpoint files below.
3. Full résumé + JD only for stages 1–2. Later stages load `01-role-summary.json`, the current card, and prior expanded points.
4. Process points **sequentially**. When expanding point N, load every `03-points/*.json` already written for this run and avoid repeating the same product/use-case/action angle.
5. Personal inputs and run outputs live under `data/private/<run-slug>/` (gitignored). Never commit private résumé/JD content.
6. Match JSON to `spec/`. Use the matching file in `prompts/` for each LLM stage.

## Run folder

```text
data/private/<run-slug>/
  00-inputs/resume.md
  00-inputs/job.md
  01-role-summary.json
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
| `/resume-story` or "generate / prepare" with résumé+JD | Create run folder; run stages 1→6 without pausing for "next" |
| "continue" | Resume from `_progress.json` next incomplete stage |
| "clear" / "clear intermediates" | Delete `01`–`05`, `_progress.json`, and `03-points/`; keep `00-inputs/` and `06-preparation.json` if present |
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

### Stage 3 — Point index
- From the résumé, write `02-point-index.json`: ordered compact cards `{ id, originalPoint }` (and optional short tags). Keep `originalPoint` verbatim.
- Choose a stable `id` per point (`^[a-z0-9-]+$`).

### Stage 4 — Expand points (sequential, anti-repeat)
For each card in order:
1. Read `01-role-summary.json`, the card, and **all** existing `03-points/*.json`.
2. Read `prompts/expand-point.md` + `spec/resume-point.schema.json`.
3. Expand this point only. Differ product angle, user workflow, and actions from prior points for the same target company/role.
4. Write `03-points/<id>.json` with `"status": "draft"`.
5. Update `_progress.json` (`lastCompletedPointId`, `nextPointId`).
6. Continue to the next point immediately — do not ask the user to click next.

### Stage 5 — Answers
- Read `prompts/generate-answer.md`.
- Using role summary + all expanded points, write `04-answers.json` (`generalAnswers` array per preparation schema). Prefer 2–3 strongest points as anchors; do not rehash the same story twice across answers.

### Stage 6 — Review + assemble + validate
- Read `prompts/review-answer.md` and `evals/quality-cases.json`.
- Write `05-review.json` (`status`, `passes`, `gaps`, `repairFields`). Repair failed fields only; rewrite the touched checkpoint files.
- Assemble `06-preparation.json` matching `spec/preparation.schema.json` (`roleSummary`, `points`, `generalAnswers`, `evaluation`).
- Copy or symlink-equivalent content into a path the dashboard can use if the user asks to preview (default: keep private; mention `npm run dashboard` needs a JSON under `data/` — only copy a **synthetic or user-approved** file; never force-commit private data).
- Run `npm run validate` only works on `data/instrumental-demo.json` today — for a private run, structurally check required keys yourself against `spec/preparation.schema.json` and report gaps. If the user wants CLI validate on their run, copy to a temp path only when they ask.

### Done
Reply with: run slug, point count, path to `06-preparation.json`, any review gaps, and that they can say `clear` to drop intermediates.

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

`stage` values: `inputs` | `role-summary` | `point-index` | `expand-points` | `answers` | `review` | `done`.
