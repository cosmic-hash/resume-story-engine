# Pipeline file contract

Read this when creating or repairing a run under `data/private/<run-slug>/`.

## 01b-tech-landscape.json

Full object matching `spec/tech-landscape.schema.json`.

Must include:

- technologies with purpose, gaps, architectures, `typicalVersionsByEra`, sources
- domainPatterns with story hooks
- collaborationNorms (Product, UX, etc.)
- aiAssistedWork from 2024+ (tools, sharing norms, mention guidance)
- timelineChecks against résumé windows

## 02-point-index.json

```json
{
  "points": [
    {
      "id": "walletgyde-dashboard",
      "originalPoint": "Designed responsive dashboard…",
      "experienceWindow": { "start": "2024-01", "end": "2025-06" }
    }
  ]
}
```

## 03-points/<id>.json

Full object matching `spec/resume-point.schema.json`, including:

- `technologies[].version` and `eraFit`
- `collaboration.partners` / `interactions`
- `aiTooling` when the window is 2024+ (or `applicable: false` with reason in `howUsed`)

**Prior-point packing:**

```text
priorPoints: [{ id, product, useCase, result }]
```

**Landscape packing:** pass compact tech + collab + aiAssistedWork + matching timelineChecks for this point’s window.

## 04-answers.json

```json
{
  "generalAnswers": [
    {
      "id": "intro",
      "question": "Tell me about yourself",
      "answer": "…",
      "anchorPointIds": ["walletgyde-dashboard"]
    }
  ]
}
```

## 05-review.json

```json
{
  "status": "needs-review",
  "passes": ["product", "collaboration"],
  "gaps": ["version-era-fit"],
  "repairFields": ["points[0].technologies"],
  "checks": []
}
```

Align check ids with `evals/quality-cases.json`.

## 06-preparation.json

Must satisfy `spec/preparation.schema.json`:

- `version` (e.g. `"0.2.0"`)
- `roleSummary`
- `techLandscape` (from `01b`)
- `points` in `pointOrder`
- `generalAnswers`
- `evaluation`

## Clear behavior

| Command | Deletes | Keeps |
|---|---|---|
| `clear` | `01`, `01b`, `02`–`05`, `03-points/`, `_progress.json` | `00-inputs/`, `06-preparation.json` |
| `clear all` | Entire run directory | Nothing |
