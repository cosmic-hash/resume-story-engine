# Pipeline file contract

Read this when creating, incrementally updating, or repairing a run under `data/private/<run-slug>/`.

## 01b-tech-landscape.json

Full object matching `spec/tech-landscape.schema.json`.

Must include:

- technologies with purpose, gaps, architectures, `typicalVersionsByEra`, alternatives summary, sources
- `adjacentTechnologies` supporting the named stack (why needed, where it shows up)
- `domainPatterns` with story hooks
- `collaborationNorms` (Product, UX, etc.)
- `aiAssistedWork` from 2024+ (tools, sharing norms, mention guidance)
- `timelineChecks` against résumé windows

## 02-point-index.json

```json
{
  "points": [
    {
      "id": "feature-dashboard",
      "originalPoint": "Designed responsive dashboard…",
      "experienceWindow": { "start": "2024-01", "end": "2025-06", "source": "Company Role" }
    }
  ]
}
```

## 03-points/<id>.json

Full object matching `spec/resume-point.schema.json`, including:

- `jdAlignment` with at least two concrete JD hooks (deep match — highest priority)
- `technologies[]` including relevant adjacent/supporting tools, each with an exact era-pinned `version` and `eraFit`
- `toolDecisions[]` explaining why chosen (`technical-tradeoff` | `existing-stack-continuity` | `hybrid`) and `alternativesConsidered[]`
- `architecture` on the **point only**: `summary`, `components[]`, `requestFlow[]`, and valid **`mermaid`** diagram (quoted node labels)
- `businessTerms[]` (`term`, `definition`, `howWeSolvedIt`)
- `challenges[]` (`challenge`, `rootCause`, `howWeSolvedIt`, `outcome`)
- `collaboration.partners` / `interactions`
- `aiTooling` when the window is 2024+ (or `applicable: false` with reason in `howUsed`)
- first-mention abbreviations expanded (`Full Phrase (SHORT)`) in prose fields
- `measurements[]` whenever a numeric claim appears — see `prompts/measurements.md` (`metric`, `before`, `after`, `calculation`, `scope`, `evidence`)
- `interviewerQA[]` (`question`, `answer`) rendered as expandable Q&A cards in the dashboard

**Prior-point packing:**

```text
priorPoints: [{ id, product, useCase, result }]
```

**Landscape packing:** pass compact tech + collab + aiAssistedWork + matching timelineChecks for this point’s window.

## 04-answers.json

Must include every `required[].id` from `evals/general-questions.json`.

```json
{
  "generalAnswers": [
    {
      "id": "intro",
      "question": "Tell me about yourself",
      "category": "intro",
      "targetSeconds": 40,
      "answer": "…",
      "anchorPointIds": ["feature-dashboard"]
    }
  ]
}
```

## 05-review.json

```json
{
  "status": "passed",
  "passes": ["product", "architecture", "tool-decisions"],
  "gaps": [],
  "repairFields": [],
  "checks": []
}
```

Align check ids with `evals/quality-cases.json`.

## 06-preparation.json & 07-study-guide.md

Run `node scripts/assemble.mjs <run-slug>` to assemble `06-preparation.json` (matching `spec/preparation.schema.json`), generate `07-study-guide.md`, update `_progress.json`, and run structural validation automatically.

## 08-interview-coach-prompt.md & optional round docs

- Generate `08-interview-coach-prompt.md` from `prompts/coach-prompt.md`.
- Any extra interview-round guides (`09-*.md`, custom `.html` pages) belong in the **same `data/private/<run-slug>/` folder** — `scripts/serve.mjs` automatically discovers and links them in that run's dashboard view.

## Incremental updates

When the candidate adds more detail to a project or round:
1. Edit the affected `03-points/<id>.json` (or `04-answers.json` / `01b-tech-landscape.json` / extra `.md` or `.html` doc) inside the same `data/private/<run-slug>/` folder.
2. Run `node scripts/assemble.mjs <run-slug>` to rebuild `06-preparation.json` + `07-study-guide.md` and validate.
3. Refresh `http://localhost:4173/dashboard/?run=<run-slug>` — no restart needed.

## Clear behavior

| Command | Deletes | Keeps |
|---|---|---|
| `clear` | `01`, `01b`, `02`–`05`, `03-points/`, `_progress.json` | `00-inputs/`, `06-preparation.json`, `07-study-guide.md`, `08-interview-coach-prompt.md`, and extra round guides |
| `clear all` | Entire run directory | Nothing |
