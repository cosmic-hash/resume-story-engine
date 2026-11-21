# Adapter contract

This repository is the source of truth for the workflow; an adapter is the thin layer that connects it to a model provider or agent runtime (including the Cursor `resume-story` skill).

## Request sequence (point-wise)

1. Read `spec/role-summary.schema.json` and `prompts/extract-role.md`; produce one compact role summary. Persist as `01-role-summary.json`.
2. Research the landscape with `prompts/research-tech-landscape.md` + live web sources → `01b-tech-landscape.json` (`spec/tech-landscape.schema.json`). Include framework purpose/gaps, versions-by-era, domain architectures, Product/UX collaboration norms, post-2024 AI coding-tool norms, and résumé timeline checks.
3. Produce an ordered point index (`02-point-index.json`). Keep the original wording unchanged in `originalPoint`.
4. **For each point in order**:
   - Load `roleSummary`, `techLandscape`, the current card, and all previously written expanded points as `priorPoints`.
   - Run `prompts/expand-point.md` → write `03-points/<id>.json` with versions, collaboration, and AI tooling when applicable.
   - Continue to the next point automatically.
5. After all points exist, run `prompts/generate-answer.md` once for the general answer set (`04-answers.json`).
6. Run `prompts/review-answer.md`, repair only failed fields, assemble `06-preparation.json` (include `techLandscape`), then validate.

Default Cursor behavior: the `resume-story` skill runs this loop without waiting for a human "next" between points. Checkpoint files are the handoff mechanism.

## Context packing

Send the full résumé and job description only during extraction, landscape research, and indexing. Later requests should carry a `roleSummary`, `techLandscape` (or a compact slice), the selected point card, `priorPoints` summaries, and any previous answer under repair.

## Provider-neutral pseudocode

```text
role = model(extract-role, resume, job_description, company_context)
landscape = model(research-tech-landscape, role, resume_windows, web_research)
cards = index(resume)  # originalPoint preserved
prior = []
for card in cards:
  expanded = model(expand-point, role, landscape, card, priorPoints=prior)
  prior.append(compact(expanded))
  write(expanded)
answers = model(generate-answer, role, landscape, prior, questions)
review = model(review-answer, role, landscape, answers, prior)
preparation = assemble(role, landscape, points, answers, review)
validate(preparation)
```

Use the provider's structured-output or JSON-Schema mode when available. Never let a model silently invent a measurement or an anachronistic framework version: label stretches and keep AI-tooling mentions honest to the résumé timeline.
