# Adapter contract

This repository is the source of truth for the workflow; an adapter is the thin layer that connects it to a model provider or agent runtime (including the Cursor `resume-story` skill).

## Request sequence (point-wise)

1. Read `spec/role-summary.schema.json` and `prompts/extract-role.md`; produce one compact role summary. Persist as `01-role-summary.json`.
2. Produce an ordered point index (`02-point-index.json`). Keep the original wording unchanged in `originalPoint`.
3. **For each point in order** (do not expand all points as independent one-shots with empty memory):
   - Load `roleSummary`, the current card, and all previously written expanded points as `priorPoints`.
   - Run `prompts/expand-point.md` → write `03-points/<id>.json`.
   - Continue to the next point automatically.
4. After all points exist, run `prompts/generate-answer.md` once for the general answer set (`04-answers.json`), anchoring on the strongest two or three points without repeating the same story.
5. Run `prompts/review-answer.md` as a separate pass. Repair only failed fields, assemble `06-preparation.json`, then validate.

Default Cursor behavior: the `resume-story` skill runs this loop without waiting for a human "next" between points. Checkpoint files are the handoff mechanism.

## Context packing

Send the full résumé and job description only during extraction and indexing. Later requests should carry a `roleSummary`, the selected point card, `priorPoints` summaries, and any previous answer under repair. Load `fullStory`, evidence, measurements, and technology details only for a deep walkthrough or final download.

## Provider-neutral pseudocode

```text
role = model(extract-role, resume, job_description, company_context)
cards = index(resume)  # originalPoint preserved
prior = []
for card in cards:
  expanded = model(expand-point, role, card, priorPoints=prior)
  prior.append(compact(expanded))
  write(expanded)
answers = model(generate-answer, role, prior, questions)
review = model(review-answer, role, answers, prior)
preparation = assemble(role, points, answers, review)
validate(preparation)
```

Use the provider's structured-output or JSON-Schema mode when available. Never let a model silently invent a measurement: a plausible reconstruction must be labeled in the record and reviewed before finalization.
