# Adapter contract

This repository is the source of truth for the workflow; an adapter is the thin layer that connects it to a model provider or agent runtime.

## Request sequence

1. Read `spec/role-summary.schema.json` and `prompts/extract-role.md`; produce one compact role summary.
2. Read `spec/resume-point.schema.json`; produce one card per résumé point. Keep the original wording unchanged in `originalPoint`.
3. For a selected point, run `prompts/expand-point.md` and generate five to ten plausible situations before ranking one. Store rejected and shortlisted situations in the application layer if the provider supports them.
4. Run `prompts/generate-answer.md` for the requested question and answer format.
5. Run `prompts/review-answer.md` as a separate pass. Repair only failed fields, then validate again.

## Context packing

Send the full résumé and job description only during extraction. Later requests should carry a `roleSummary`, the selected point card, the requested detail, and the previous answer. Load `fullStory`, evidence, measurements, and technology details only for a deep walkthrough or final download.

## Provider-neutral pseudocode

```text
role = model(extract-role, resume, job_description, company_context)
cards = model(point-card, resume, role)
for card in cards:
  possibilities = model(expand-point, role, card)
  card = model(select-and-expand, role, card, possibilities)
answers = model(generate-answer, role, cards[relevant_ids], question)
review = model(review-answer, role, answers, cards[relevant_ids])
validate(preparation)
```

Use the provider's structured-output or JSON-Schema mode when available. Never let a model silently invent a measurement: a plausible reconstruction must be labeled in the record and reviewed before finalization.
