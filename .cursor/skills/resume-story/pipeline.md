# Pipeline file contract

Read this when creating or repairing a run under `data/private/<run-slug>/`.

## 02-point-index.json

```json
{
  "points": [
    { "id": "walletgyde-dashboard", "originalPoint": "Designed responsive dashboard…" }
  ]
}
```

## 03-points/<id>.json

Full object matching `spec/resume-point.schema.json`.

When expanding, include a short internal note only if needed for continuity — prefer encoding uniqueness in `product`, `useCase`, and `roleConnection` instead of meta fields outside the schema.

**Prior-point packing:** pass a compact list of already-written points:

```text
priorPoints: [{ id, product, useCase, result }]
```

Do not reuse the same product narrative, the same primary metric story, or the same “I built a dashboard” framing if a prior point already used it unless the résumé wording forces overlap — then differentiate user, workflow, and failure path.

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

Optional `ctar` object per answer when the question is a story prompt.

## 05-review.json

```json
{
  "status": "needs-review",
  "passes": ["product", "user"],
  "gaps": ["measurement"],
  "repairFields": ["points[0].measurements"],
  "checks": []
}
```

Align check ids with `evals/quality-cases.json` when possible.

## 06-preparation.json

Must satisfy `spec/preparation.schema.json`:

- `version` (e.g. `"0.1.0"`)
- `roleSummary` from stage 2
- `points` = all `03-points/*.json` in `pointOrder`
- `generalAnswers` from stage 5
- `evaluation` from review + structural checks (`draft` | `needs-review` | `passed` | `finalized`)

## Clear behavior

| Command | Deletes | Keeps |
|---|---|---|
| `clear` | `01`–`05`, `03-points/`, `_progress.json` | `00-inputs/`, `06-preparation.json` |
| `clear all` | Entire run directory | Nothing |

After `clear`, a new generate recreates intermediates from inputs.
